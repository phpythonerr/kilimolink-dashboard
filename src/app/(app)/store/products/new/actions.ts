"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import slugify from "slugify";

// Simple helper for generating unique slugs
const generateSlug = (name: string): string => {
  const base = slugify(name, { lower: true, strict: true });
  const timestamp = Date.now().toString().slice(-6); // Use last 6 digits of timestamp
  return `${base}-${timestamp}`;
};

export async function createProduct(formData: FormData) {
  // Get and validate inputs
  const name = formData.get("name") as string;
  const categoryId = formData.get("categoryId") as string;
  const image = formData.get("image") as File;
  const uomsString = formData.get("uoms") as string;
  const defaultUom = formData.get("defaultUom") as string;
  const defaultPrice = formData.get("defaultPrice")
    ? parseFloat(formData.get("defaultPrice") as string)
    : null;
  const pricesString = formData.get("prices") as string;
  const sourcedFromFarmers = formData.get("sourcedFromFarmers") === "true";

  // Parse JSON strings
  const uoms = JSON.parse(uomsString) as string[];
  const prices = pricesString
    ? (JSON.parse(pricesString) as Record<string, Record<string, number>>)
    : {};

  try {
    const supabase = await createClient();

    // 1. Upload image to Supabase Storage
    const fileName = `${Date.now()}-${image.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("kilimolink")
      .upload(`products/${generateSlug(name)}/${fileName}`, image, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Error uploading image:", uploadError);
      throw new Error(`Image upload failed: ${uploadError.message}`);
    }

    // Get the public URL for the uploaded image
    const {
      data: { publicUrl },
    } = supabase.storage
      .from("kilimolink")
      .getPublicUrl(`products/${generateSlug(name)}/${fileName}`);

    // 2. Insert product data
    const { data: productData, error: productError } = await supabase
      .from("commodities_commodity")
      .insert({
        name: name,
        from_farmers: sourcedFromFarmers,
        quantity_unit: defaultUom,
        image: publicUrl,
        category_id: categoryId,
        selling_price: defaultPrice,
        slug: generateSlug(name),
        quantity_unit_options: uoms,
      })
      .select()
      .single();

    if (productError) {
      console.error("Error inserting product:", productError);
      throw new Error(`Product insertion failed: ${productError.message}`);
    }

    // 3. Insert price list prices
    if (Object.keys(prices).length > 0) {
      const priceListEntries = Object.entries(prices).map(
        ([pricelistId, uomPrices]: any) => {
          // Get the default UOM price for this pricelist
          const defaultUomPrice = uomPrices[defaultUom] || defaultPrice;

          // Format other UOM prices as array of objects
          const priceUom = Object.entries(uomPrices)
            .filter(
              ([uomId]) =>
                uomId !== defaultUom && uomPrices[uomId] !== undefined
            )
            .map(([uomId, price]: any) => ({
              uom: uomId,
              price: price.toString(),
            }));

          return {
            price: defaultUomPrice,
            commodity_id: productData.id,
            pricelist_id: pricelistId,
            price_uom: priceUom.length > 0 ? priceUom : null,
          };
        }
      );

      if (priceListEntries.length > 0) {
        const { error: priceListError } = await supabase
          .from("commodities_pricelistprice")
          .insert(priceListEntries);

        if (priceListError) {
          console.error("Error inserting price list prices:", priceListError);
          throw new Error(
            `Price list insertion failed: ${priceListError.message}`
          );
        }
      }
    }

    // 4. Revalidate and redirect
    revalidatePath("/store/products");
    return { success: true, productId: productData.id };
  } catch (error: any) {
    console.error("Error creating product:", error);
    return {
      success: false,
      error: error.message || "An unknown error occurred",
    };
  }
}
