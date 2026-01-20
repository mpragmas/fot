"use client";

import React, { useState, ChangeEvent } from "react";
import { useCloudinaryUpload } from "@/app/hooks/useCloudinaryUpload";

interface ImageUploadFieldProps {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
}

const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  label,
  value,
  onChange,
}) => {
  const { uploadImage, isUploading, error, reset } = useCloudinaryUpload();
  const [localPreview, setLocalPreview] = useState<string | null>(value);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    reset();

    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);

    const url = await uploadImage(file);
    if (url) {
      setLocalPreview(url);
      onChange(url);
    } else {
      // revert preview to previous value on failure
      setLocalPreview(value ?? null);
    }
  };

  return (
    <div className="space-y-2">
      <label className="mb-1 block text-sm font-medium">{label}</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-sky-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-sky-700 hover:file:bg-sky-100"
      />
      {isUploading && (
        <p className="text-xs text-gray-500">Uploading image...</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      {localPreview && (
        <div className="mt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={localPreview}
            alt={label}
            className="h-16 w-16 rounded-full object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default ImageUploadField;
