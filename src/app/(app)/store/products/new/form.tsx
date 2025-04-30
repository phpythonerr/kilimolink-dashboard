"use client";

import React, { useState, useRef, useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Upload } from "lucide-react";
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { createProduct } from "./actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Helper function to generate cropped image (you might want to move this to a utils file)
async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  fileName: string
): Promise<File | null> {
  const image = new Image();
  image.src = imageSrc;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  const scaleX = image.naturalWidth / image.width;
  const scaleY = image.naturalHeight / image.height;

  ctx.drawImage(
    image,
    pixelCrop.x * scaleX,
    pixelCrop.y * scaleY,
    pixelCrop.width * scaleX,
    pixelCrop.height * scaleY,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          console.error("Canvas is empty");
          resolve(null);
          return;
        }
        // Ensure the blob has a type, default if necessary
        const fileType = blob.type || "image/jpeg"; // Default type if blob.type is empty
        const croppedFile = new File([blob], fileName, { type: fileType });
        resolve(croppedFile);
      },
      "image/jpeg",
      0.9
    ); // Adjust type and quality as needed
  });
}

// Type for categories passed from the server
type Category = {
  id: string;
  name: string;
};

// Type for price lists passed from the server
type PriceList = {
  id: string;
  name: string;
};

// Define UOM options
const uomOptions = [
  { id: "g", label: "Grams (g)" },
  { id: "kg", label: "Kilograms (kg)" },
  { id: "piece", label: "Piece" },
  { id: "punnet", label: "Punnet" },
  { id: "packet", label: "Packet" },
  { id: "litre", label: "Litres (L)" },
  { id: "bale", label: "Bale" },
  { id: "bunch", label: "Bunch" },
  { id: "tray", label: "Tray" },
] as const; // Use 'as const' for stricter typing

// Helper function to get UOM label by id
const getUomLabel = (uomId: string): string => {
  const uom = uomOptions.find((u) => u.id === uomId);
  return uom ? uom.label : uomId;
};

// We need to create a safer approach to handle the File type in the form
// Add this type near your other types at the top of the file
type EmptyFileValue = { _type: "empty_file" };
const EMPTY_FILE_VALUE: EmptyFileValue = { _type: "empty_file" };

// Update Zod schema to allow undefined/null for image during form validation
const productSchema = z
  .object({
    name: z.string().min(1, "Product name is required"),
    categoryId: z.string().min(1, "Category is required"),
    image: z
      .union([
        z
          .instanceof(File)
          .refine((file) => file.size > 0, "Product image is required.")
          .refine(
            (file) => file.type.startsWith("image/"),
            "Only image files are allowed."
          )
          .refine(
            (file) => file.size <= 5 * 1024 * 1024,
            `Max file size is 5MB.`
          ),
        z.custom<EmptyFileValue>(
          (val) => val && (val as any)._type === "empty_file",
          { message: "Image is required" }
        ),
      ])
      .refine((val) => val instanceof File, {
        message: "Product image is required.",
      }),
    uoms: z.array(z.string()).refine((value) => value.some((item) => item), {
      message: "You have to select at least one UOM.",
    }),
    defaultUom: z.string().optional(), // Add optional defaultUom
    // Add default price field
    defaultPrice: z.preprocess(
      (val) => (val === "" ? undefined : Number(val)),
      z.number().min(0, "Default price must be positive").optional()
    ),
    // Add prices field - a nested record structure
    prices: z
      .record(
        z.record(
          z.preprocess(
            // Preprocess string inputs to numbers or undefined
            (val) => (val === "" ? undefined : Number(val)),
            z.number().min(0, "Price must be positive").optional()
          )
        )
      )
      .optional(),
    // Add the new sourcedFromFarmers field
    sourcedFromFarmers: z.boolean().default(false),
  })
  .refine(
    (data) => {
      // If UOMs are selected, defaultUom must also be selected
      if (data.uoms.length > 0 && !data.defaultUom) {
        return false;
      }
      return true;
    },
    {
      message: "Please select a default UOM from the chosen units.",
      path: ["defaultUom"], // Specify the path for the error message
    }
  )
  .refine(
    (data) => {
      // If defaultUom is set, it must be one of the selected uoms
      if (
        data.defaultUom &&
        data.uoms.length > 0 &&
        !data.uoms.includes(data.defaultUom)
      ) {
        // Reset defaultUom if it's no longer valid (optional, but good UX)
        // This refine check primarily ensures validation on submit.
        // Handling the reset directly might be better done via useEffect watching uoms.
        return false;
      }
      return true;
    },
    {
      message: "Default UOM must be one of the selected UOMs.",
      path: ["defaultUom"],
    }
  );

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  categories: Category[];
  pricelists: PriceList[];
}

const ASPECT_RATIO = 4 / 3;
const MIN_DIMENSION = 150;

export default function ProductForm({
  categories,
  pricelists,
}: ProductFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // Original image for cropper
  const [croppedImagePreview, setCroppedImagePreview] = useState<string | null>(
    null
  ); // Cropped image for display
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [originalFileName, setOriginalFileName] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue, // Need setValue to update image field
    formState: { errors, isSubmitting },
    reset,
    trigger, // To manually trigger validation after setting image value
    watch, // Watch uoms for debugging if needed
    getValues, // To get current values if needed
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      image: EMPTY_FILE_VALUE as any, // Use our placeholder instead of undefined
      uoms: [], // Initialize uoms as an empty array
      defaultUom: "", // Initialize defaultUom
      defaultPrice: undefined, // Add default price
      prices: {}, // Initialize empty prices object
      sourcedFromFarmers: false, // Add the default value for sourcedFromFarmers
    },
  });

  // Watch the selected UOMs
  const selectedUoms = watch("uoms");

  // Filter uomOptions based on selectedUoms
  const availableDefaultUoms = React.useMemo(() => {
    return uomOptions.filter((option) => selectedUoms?.includes(option.id));
  }, [selectedUoms]);

  // Effect to reset defaultUom if it's no longer in the selected UOMs list
  useEffect(() => {
    const currentDefaultUom = getValues("defaultUom");
    if (
      currentDefaultUom &&
      selectedUoms &&
      !selectedUoms.includes(currentDefaultUom)
    ) {
      setValue("defaultUom", "", { shouldValidate: true }); // Reset and validate
    }
    // Also trigger validation if the list becomes non-empty and default is empty
    if (selectedUoms?.length > 0 && !getValues("defaultUom")) {
      trigger("defaultUom");
    }
  }, [selectedUoms, setValue, getValues, trigger]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Basic client-side validation (optional, Zod handles final validation)
    if (!file.type.startsWith("image/")) {
      console.error("Selected file is not an image.");
      // Optionally show a user-friendly error message
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      console.error("File size exceeds 5MB limit.");
      // Optionally show a user-friendly error message
      return;
    }

    setOriginalFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setIsCropperOpen(true);
      // Reset crop state when new image is loaded
      setCrop(undefined);
      setCompletedCrop(undefined);
    };
    reader.readAsDataURL(file);

    // Reset the file input value so the same file can be selected again if needed
    if (event.target) {
      event.target.value = "";
    }
  };

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const cropWidthInPercent = (MIN_DIMENSION / width) * 100;

    const initialCrop = makeAspectCrop(
      {
        unit: "%",
        width: cropWidthInPercent,
      },
      ASPECT_RATIO,
      width,
      height
    );
    const centeredCrop = centerCrop(initialCrop, width, height);
    setCrop(centeredCrop);
  };

  const handleSaveCrop = async () => {
    if (
      imagePreview &&
      completedCrop &&
      completedCrop.width > 0 &&
      completedCrop.height > 0
    ) {
      const croppedFile = await getCroppedImg(
        imagePreview,
        completedCrop,
        originalFileName
      );
      if (croppedFile) {
        // Update the form state with the cropped file
        setValue("image", croppedFile as any, { shouldValidate: true });
        const previewUrl = URL.createObjectURL(croppedFile);
        setCroppedImagePreview(previewUrl);
      } else {
        console.error("Failed to crop image.");
        // Use our safe placeholder instead of null/undefined
        setValue("image", EMPTY_FILE_VALUE as any, { shouldValidate: true });
        setCroppedImagePreview(null);
      }
    } else {
      console.error(
        "Cannot save crop: Missing image preview or crop dimensions."
      );
      setValue("image", EMPTY_FILE_VALUE as any, { shouldValidate: true });
      setCroppedImagePreview(null);
    }
    setIsCropperOpen(false);
  };

  const handleCancelCrop = () => {
    setIsCropperOpen(false);
    setImagePreview(null); // Clear original preview if cancelled
    // Don't clear croppedImagePreview here, keep the last successful crop if any
    // Don't clear the form value either, unless explicitly desired
  };

  const onSubmit: SubmitHandler<ProductFormData> = async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("categoryId", data.categoryId);
    // Fix type error by checking if image exists before appending
    if (data.image instanceof File) {
      formData.append("image", data.image);
    } else {
      console.error("Invalid image file");
      return; // Return early to prevent submission with invalid image
    }
    // Append defaultUom if it exists
    formData.append("uoms", JSON.stringify(data.uoms));
    if (data.defaultUom) {
      formData.append("defaultUom", data.defaultUom);
    }
    // Add defaultPrice to formData if it exists
    if (data.defaultPrice !== undefined) {
      formData.append("defaultPrice", data.defaultPrice.toString());
    }
    // Add prices to formData if they exist
    if (data.prices && Object.keys(data.prices).length > 0) {
      formData.append("prices", JSON.stringify(data.prices));
    }
    // Add sourcedFromFarmers to formData
    formData.append("sourcedFromFarmers", String(data.sourcedFromFarmers));

    try {
      console.log("Submitting Data:", data);
      await createProduct(formData);
      console.log("Product created successfully");
      reset();
      setCroppedImagePreview(null);
      setImagePreview(null);
      setOriginalFileName("");
    } catch (error) {
      console.error("Failed to create product:", error);
    }
  };

  // Cleanup object URL
  useEffect(() => {
    const currentPreview = croppedImagePreview;
    return () => {
      if (currentPreview) {
        URL.revokeObjectURL(currentPreview);
      }
    };
  }, [croppedImagePreview]);

  // Optional: Watch UOMs for debugging
  // const selectedUoms = watch("uoms");
  // useEffect(() => {
  //   console.log("Selected UOMs:", selectedUoms);
  // }, [selectedUoms]);

  return (
    // Add a max-width container and center it
    <div className="p-4">
      {/* Main form container */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Top Row: 2 columns with different proportions */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Product Details Card - Takes 2/3 of width on large screens */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
              <CardDescription>
                Enter the name and category for the new product.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              {/* Product Name Section */}
              <div className="grid gap-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              {/* Category Section */}
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        trigger("categoryId");
                      }}
                      value={field.value}
                    >
                      <SelectTrigger id="category" className="w-full">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.categoryId && (
                  <p className="text-sm text-red-500">
                    {errors.categoryId.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          {/* Image Upload Card - Takes 1/3 of width and has a more compact design */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Product Image</CardTitle>
            </CardHeader>
            <CardContent className="">
              <div
                className="overflow-hidden cursor-pointer rounded-md border hover:border-primary"
                onClick={() => fileInputRef.current?.click()}
              >
                {/* Make the AspectRatio component smaller with a max width */}
                <div className="max-w-[220px] mx-auto">
                  <AspectRatio ratio={ASPECT_RATIO} className="bg-muted">
                    {croppedImagePreview ? (
                      <img
                        src={croppedImagePreview}
                        alt="Cropped product preview"
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Upload className="h-8 w-8" />
                        <span className="mt-1 text-xs">Click to upload</span>
                      </div>
                    )}
                  </AspectRatio>
                </div>
              </div>
              <Input
                ref={fileInputRef}
                id="image-upload"
                name="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              {errors.image && (
                <p className="mt-2 text-sm text-red-500">
                  {errors.image.message}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
        {/* UOMs Card */}
        <Card>
          <CardHeader>
            <CardTitle>Units of Measurement (UOMs)</CardTitle>
            <CardDescription>
              Select all applicable units for this product.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Controller
              name="uoms"
              control={control}
              render={({ field }) => (
                // Use gap for checkbox grid - border already provided by Card
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {uomOptions.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`uom-${item.id}`}
                        checked={field.value?.includes(item.id)}
                        onCheckedChange={(checked) => {
                          const newValue = checked
                            ? [...(field.value || []), item.id]
                            : (field.value || []).filter(
                                (value) => value !== item.id
                              );
                          field.onChange(newValue);
                          trigger("uoms"); // Trigger validation for uoms array itself
                          // Trigger defaultUom validation in case the list becomes empty/non-empty
                          trigger("defaultUom");
                        }}
                      />
                      <Label
                        htmlFor={`uom-${item.id}`}
                        className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            />
            {errors.uoms && (
              <p className="mt-2 text-sm text-red-500">{errors.uoms.message}</p> // Added margin-top
            )}
          </CardContent>
        </Card>
        {/* Default UOM Card - Conditionally Rendered */}
        {availableDefaultUoms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Default Unit</CardTitle>
              <CardDescription>
                Select the primary unit for displaying this product.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Label htmlFor="defaultUom">Default UOM</Label>
                <Controller
                  name="defaultUom"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        trigger("defaultUom"); // Validate on change
                      }}
                      value={field.value}
                    >
                      <SelectTrigger id="defaultUom" className="w-full">
                        <SelectValue placeholder="Select default UOM" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDefaultUoms.map((uom) => (
                          <SelectItem key={uom.id} value={uom.id}>
                            {uom.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.defaultUom && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.defaultUom.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        {/* Default Price Card - Only show if a default UOM is selected */}
        {getValues("defaultUom") && (
          <Card>
            <CardHeader>
              <CardTitle>Default Price</CardTitle>
              <CardDescription>
                Enter the default selling price for this product in your base
                currency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                <Label htmlFor="defaultPrice">
                  Default Price ({getUomLabel(getValues("defaultUom") || "")})
                </Label>
                <Input
                  id="defaultPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  {...register("defaultPrice")}
                />
                {errors.defaultPrice && (
                  <p className="text-sm text-red-500">
                    {errors.defaultPrice.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        {/* Pricing Card - Only show if we have both UOMs and price lists */}
        {selectedUoms.length > 0 && pricelists.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Product Pricing</CardTitle>
              <CardDescription>
                Enter pricing for each unit across different price lists.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {pricelists.map((pricelist) => (
                  <div key={pricelist.id} className="space-y-4">
                    <h3 className="font-medium text-lg">{pricelist.name}</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {selectedUoms.map((uomId) => (
                        <div
                          key={`${pricelist.id}-${uomId}`}
                          className="flex flex-col gap-2"
                        >
                          <Label htmlFor={`price-${pricelist.id}-${uomId}`}>
                            {getUomLabel(uomId)}
                          </Label>
                          <Input
                            id={`price-${pricelist.id}-${uomId}`}
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...register(`prices.${pricelist.id}.${uomId}`)}
                          />
                          {errors.prices?.[pricelist.id]?.[uomId] && (
                            <p className="text-sm text-red-500">
                              {errors.prices[pricelist.id][uomId]?.message}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        {/* Sourced from Farmers Card */}
        <Card>
          <CardHeader>
            <CardTitle>Sourcing</CardTitle>
            <CardDescription>
              Specify sourcing options for this product
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Controller
                name="sourcedFromFarmers"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="sourcedFromFarmers"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label
                htmlFor="sourcedFromFarmers"
                className="text-base font-medium"
              >
                Source this product from farmers
              </Label>
            </div>
          </CardContent>
        </Card>
        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? "Adding Product..." : "Add Product"}
          </Button>
        </div>
      </form>
      {/* Cropper Dialog */}
      <Dialog open={isCropperOpen} onOpenChange={setIsCropperOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Crop Image (4x3)</DialogTitle>
          </DialogHeader>
          <div className="my-4 max-h-[70vh] overflow-auto">
            {imagePreview && (
              <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={ASPECT_RATIO}
                minWidth={MIN_DIMENSION}
                keepSelection
              >
                <img
                  ref={imgRef}
                  alt="Crop preview"
                  src={imagePreview}
                  onLoad={onImageLoad}
                  style={{ maxHeight: "60vh" }}
                />
              </ReactCrop>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelCrop}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveCrop}
              disabled={!completedCrop || completedCrop.width === 0}
            >
              Save Crop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
