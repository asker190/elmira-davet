"use client";

import React from "react";
import { ImageCropUpload, ImageCropUploadProps } from "./image-crop-upload";

export interface ImageUploadFieldProps {
  label: string;
  value?: string;
  onChange: (url: string) => void;
  recommendedDimensions?: string;
  helperText?: string;
  aspectRatio?: "square" | "video" | "wide" | "logo" | "16/9" | "4/3" | "1/1" | "free";
  category?: string;
}

export function ImageUploadField({
  label,
  value,
  onChange,
  recommendedDimensions,
  helperText,
  aspectRatio = "wide",
  category = "Genel",
}: ImageUploadFieldProps) {
  const mappedRatio: "16/9" | "4/3" | "1/1" | "logo" | "free" =
    aspectRatio === "square"
      ? "1/1"
      : aspectRatio === "video" || aspectRatio === "wide"
      ? "16/9"
      : aspectRatio;

  return (
    <ImageCropUpload
      label={label}
      value={value}
      onChange={onChange}
      aspectRatio={mappedRatio}
      recommendedDimensions={recommendedDimensions}
      helperText={helperText}
      category={category}
    />
  );
}
