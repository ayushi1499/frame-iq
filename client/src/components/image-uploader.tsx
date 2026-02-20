import { useState, useRef } from "react";
import { Upload, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageUploaderProps {
  onImageSelect: (file: File | null) => void;
  label?: string;
}

export function ImageUploader({ onImageSelect, label = "Upload or Take Photo" }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onImageSelect(file);
    }
  };

  const clearImage = () => {
    setPreview(null);
    if (inputRef.current) inputRef.current.value = "";
    onImageSelect(null);
  };

  return (
    <div className="w-full">
      <input
        type="file"
        accept="image/*"
        capture="user"
        className="hidden"
        ref={inputRef}
        onChange={handleFileChange}
        data-testid="input-file-upload"
      />

      {!preview ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="border border-dashed border-border rounded-md p-6 cursor-pointer transition-colors flex flex-col items-center justify-center text-center gap-3 min-h-[180px]"
          data-testid="upload-area"
        >
          <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center">
            <Camera className="w-6 h-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground text-sm">{label}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Tap to capture or upload an image</p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="rounded-md overflow-hidden">
            <img src={preview} alt="Preview" className="w-full h-48 object-cover" />
          </div>
          <Button
            size="icon"
            variant="destructive"
            className="absolute top-2 right-2 z-10"
            onClick={(e) => {
              e.stopPropagation();
              clearImage();
            }}
            data-testid="button-clear-image"
          >
            <X className="w-4 h-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="absolute bottom-2 right-2 z-10"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="w-3.5 h-3.5 mr-1" />
            Change
          </Button>
        </div>
      )}
    </div>
  );
}
