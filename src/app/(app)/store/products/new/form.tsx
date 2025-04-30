"use client";

import React, { useState, useRef, useEffect } from "react";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
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
  DialogClose,
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
import { Separator } from "@/components/ui/separator";

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

// Update Zod schema to include UOMs
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  categoryId: z.string().min(1, "Category is required"),
  image: z
    .instanceof(File, { message: "Product image is required." })
    .refine((file) => file.size > 0, "Product image is required.")
    .refine(
      (file) => file.type.startsWith("image/"),
      "Only image files are allowed."
    )
    .refine((file) => file.size <= 5 * 1024 * 1024, `Max file size is 5MB.`), // Example: 5MB limit
  uoms: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one UOM.",
  }),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  categories: Category[];
}

const ASPECT_RATIO = 4 / 3;
const MIN_DIMENSION = 150;

export default function ProductForm({ categories }: ProductFormProps) {
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
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      categoryId: "",
      image: undefined, // Initialize image as undefined
      uoms: [], // Initialize uoms as an empty array
    },
  });

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
        originalFileName // Pass the original file name
      );
      if (croppedFile) {
        // Update the form state with the cropped file
        setValue("image", croppedFile, { shouldValidate: true }); // Set and validate
        // Generate a preview URL for the cropped image
        const previewUrl = URL.createObjectURL(croppedFile);
        setCroppedImagePreview(previewUrl);
      } else {
        // Handle error if cropping failed (e.g., show message)
        console.error("Failed to crop image.");
        // Clear potentially invalid image state
        setValue("image", undefined, { shouldValidate: true });
        setCroppedImagePreview(null);
      }
    } else {
      console.error(
        "Cannot save crop: Missing image preview or crop dimensions."
      );
      // Clear potentially invalid image state
      setValue("image", undefined, { shouldValidate: true });
      setCroppedImagePreview(null);
    }
    setIsCropperOpen(false); // Close dialog regardless of success/failure
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
    formData.append("image", data.image); // Append the validated File object
    // Append UOMs - Server action needs to handle receiving this array
    // Common ways: JSON stringify, or append each item individually
    formData.append("uoms", JSON.stringify(data.uoms)); // Example: sending as JSON string
    // OR append individually: data.uoms.forEach(uom => formData.append('uoms[]', uom));

    console.log("Submitting Data:", data); // Log the structured data
    // console.log("Submitting FormData:", formData); // Inspect FormData if needed

    try {
      await createProduct(formData);
      console.log("Product created successfully");
      reset();
      setCroppedImagePreview(null);
      setImagePreview(null);
      setOriginalFileName("");
    } catch (error) {
      console.error("Failed to create product:", error);
      // Handle submission error (e.g., show error message to user)
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
    <>
      {/* Main form container using flex and gap */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
        {/* Top Row: Use Flexbox for large screens, Grid for stacking */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-8 items-start">
          {/* Left Side: Name & Category (arranged in rows) */}
          {/* Allow this side to grow but set a max width if needed, or let flex handle it */}
          <div className="flex flex-col gap-6 w-full lg:w-auto lg:flex-grow lg:pr-8">
            {" "}
            {/* Added padding-right on lg */}
            {/* Product Name Section */}
            <div className="flex flex-col gap-2">
              {" "}
              {/* Use gap */}
              <Label htmlFor="name" className="text-base font-medium">
                Product Name
              </Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            {/* Category Section */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="category" className="text-base font-medium">
                Category
              </Label>
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
                    defaultValue={field.value}
                  >
                    {/* Ensure SelectTrigger takes full width */}
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
          </div>

          {/* Right Side: Image Selector */}
          {/* Define a width for the image selector section on large screens */}
          <div className="w-full lg:w-1/3 lg:max-w-sm flex flex-col gap-2 flex-shrink-0">
            {" "}
            {/* Adjusted width and added flex-shrink-0 */}
            <Label htmlFor="image-trigger" className="text-base font-medium">
              Product Image
            </Label>
            <p className="text-sm text-muted-foreground">
              Upload a 4x3 image (max 5MB).
            </p>
            <div
              className="overflow-hidden cursor-pointer rounded-md border hover:border-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <AspectRatio ratio={ASPECT_RATIO} className="bg-muted">
                {croppedImagePreview ? (
                  <img
                    src={croppedImagePreview}
                    alt="Cropped product preview"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Upload className="h-12 w-12" />
                    <span className="mt-2 text-sm">Click to upload</span>
                  </div>
                )}
              </AspectRatio>
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
              <p className="text-sm text-red-500">{errors.image.message}</p>
            )}
          </div>
        </div>

        {/* Separator */}
        <Separator />

        {/* Bottom Row: UOMs */}
        <div className="flex flex-col gap-3">
          {" "}
          {/* Use gap */}
          <Label className="text-base font-medium">
            Applicable Units of Measurement (UOMs)
          </Label>
          <Controller
            name="uoms"
            control={control}
            render={({ field }) => (
              // Use gap for checkbox grid
              <div className="grid grid-cols-2 gap-4 rounded-lg border p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {uomOptions.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-2" // Use gap
                  >
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
            <p className="text-sm text-red-500">{errors.uoms.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          {" "}
          {/* Keep alignment helper */}
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
    </>
  );
}
