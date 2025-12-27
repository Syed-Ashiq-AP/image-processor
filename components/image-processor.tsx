"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ImageProcessor() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  // Original image dimensions
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [aspectRatio, setAspectRatio] = useState<number>(1);
  const [selectedAspectRatio, setSelectedAspectRatio] =
    useState<string>("original");

  // Processing options
  const [backgroundColor, setBackgroundColor] = useState("transparent");
  const [customColor, setCustomColor] = useState("#ffffff");
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [activeTab, setActiveTab] = useState("upload");

  // Common aspect ratios
  const aspectRatios = [
    { label: "Original", value: "original", ratio: 0 },
    { label: "1:1 (Square)", value: "1:1", ratio: 1 },
    { label: "4:3", value: "4:3", ratio: 4 / 3 },
    { label: "3:2", value: "3:2", ratio: 3 / 2 },
    { label: "16:9", value: "16:9", ratio: 16 / 9 },
    { label: "9:16 (Portrait)", value: "9:16", ratio: 9 / 16 },
    { label: "21:9", value: "21:9", ratio: 21 / 9 },
  ];

  // Load image dimensions when preview changes
  useEffect(() => {
    if (previewUrl) {
      const img = new Image();
      img.onload = () => {
        setOriginalWidth(img.width);
        setOriginalHeight(img.height);
        setAspectRatio(img.width / img.height);
        setWidth(img.width);
        setHeight(img.height);
      };
      img.src = previewUrl;
    }
  }, [previewUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setProcessedImageUrl(null);
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    if (url) {
      setPreviewUrl(url);
      setProcessedImageUrl(null);
    }
  };

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (maintainAspectRatio && newWidth > 0 && aspectRatio > 0) {
      setHeight(Math.round(newWidth / aspectRatio));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (maintainAspectRatio && newHeight > 0 && aspectRatio > 0) {
      setWidth(Math.round(newHeight * aspectRatio));
    }
  };

  const handleAspectRatioChange = (value: string) => {
    setSelectedAspectRatio(value);
    const selected = aspectRatios.find((ar) => ar.value === value);

    if (selected) {
      if (value === "original") {
        // Use original image aspect ratio
        const originalRatio = originalWidth / originalHeight;
        setAspectRatio(originalRatio);
        if (width > 0) {
          setHeight(Math.round(width / originalRatio));
        } else if (height > 0) {
          setWidth(Math.round(height * originalRatio));
        }
      } else {
        // Use selected aspect ratio
        setAspectRatio(selected.ratio);
        if (width > 0) {
          setHeight(Math.round(width / selected.ratio));
        } else if (height > 0) {
          setWidth(Math.round(height * selected.ratio));
        }
      }
    }
  };

  const processImage = async () => {
    if (!imageFile && !imageUrl) {
      alert("Please provide an image file or URL");
      return;
    }

    setLoading(true);
    setProgress("Removing background...");

    try {
      // Step 1: Remove background using API
      const formData = new FormData();

      if (activeTab === "upload" && imageFile) {
        formData.append("image", imageFile);
      } else if (activeTab === "url" && imageUrl) {
        formData.append("imageUrl", imageUrl);
      }

      const response = await fetch("/api/remove-background", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove background");
      }

      const blob = await response.blob();

      // Step 2: Apply additional processing (background color, resize, format)
      setProgress("Processing image...");

      const img = new Image();
      const blobUrl = URL.createObjectURL(blob);

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = blobUrl;
      });

      // Create canvas for processing
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      // Set canvas size
      let targetWidth = width > 0 ? width : img.width;
      let targetHeight = height > 0 ? height : img.height;

      // Maintain aspect ratio if only one dimension is provided
      if (width > 0 && height === 0) {
        targetHeight = Math.round((img.height / img.width) * width);
      } else if (height > 0 && width === 0) {
        targetWidth = Math.round((img.width / img.height) * height);
      }

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Fill background if not transparent
      if (backgroundColor !== "transparent") {
        const color =
          backgroundColor === "custom" ? customColor : backgroundColor;

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Draw the image
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Convert to blob with selected format
      const processedBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => resolve(blob!),
          `image/${format}`,
          format === "jpeg" ? 0.95 : undefined
        );
      });

      const url = URL.createObjectURL(processedBlob);
      setProcessedImageUrl(url);
      setProgress("");

      // Clean up
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to process image. Please try again."
      );
      setProgress("");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (processedImageUrl) {
      const link = document.createElement("a");
      link.href = processedImageUrl;
      link.download = `processed-image.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Image Background Remover</h1>
        <p className="text-muted-foreground">
          Remove backgrounds, resize, and convert images with ease
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
            <CardDescription>
              Choose a file or provide an image URL
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload File</TabsTrigger>
                <TabsTrigger value="url">Image URL</TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="space-y-4">
                <div>
                  <Label htmlFor="image-upload">Select Image</Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-2"
                  />
                </div>
              </TabsContent>
              <TabsContent value="url" className="space-y-4">
                <div>
                  <Label htmlFor="image-url">Image URL</Label>
                  <Input
                    id="image-url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </TabsContent>
            </Tabs>

            {previewUrl && (
              <div className="mt-4">
                <Label>Preview</Label>
                <div className="mt-2 border rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-auto max-h-64 object-contain"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Options Section */}
        <Card>
          <CardHeader>
            <CardTitle>Processing Options</CardTitle>
            <CardDescription>
              Configure background and output settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Background Color */}
            <div className="space-y-2">
              <Label>Background Color</Label>
              <Select
                value={backgroundColor}
                onValueChange={setBackgroundColor}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="transparent">Transparent</SelectItem>
                  <SelectItem value="rgb(255, 255, 255)">White</SelectItem>
                  <SelectItem value="rgb(0, 0, 0)">Black</SelectItem>
                  <SelectItem value="custom">Custom Color</SelectItem>
                </SelectContent>
              </Select>
              {backgroundColor === "custom" && (
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="color"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    placeholder="#ffffff"
                  />
                </div>
              )}
            </div>

            {/* Image Resize */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Resize</Label>
                {originalWidth > 0 && (
                  <span className="text-xs text-muted-foreground">
                    Original: {originalWidth} × {originalHeight}
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {/* Aspect Ratio Selector */}
                <div className="space-y-2">
                  <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                  <Select
                    value={selectedAspectRatio}
                    onValueChange={handleAspectRatioChange}
                  >
                    <SelectTrigger id="aspect-ratio">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {aspectRatios.map((ar) => (
                        <SelectItem key={ar.value} value={ar.value}>
                          {ar.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {aspectRatio > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Current ratio: {aspectRatio.toFixed(2)}:1
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Label htmlFor="width" className="w-16">
                    Width:
                  </Label>
                  <Input
                    id="width"
                    type="number"
                    placeholder="Width"
                    value={width || ""}
                    onChange={(e) =>
                      handleWidthChange(parseInt(e.target.value) || 0)
                    }
                    min="1"
                  />
                  <span className="text-sm text-muted-foreground">px</span>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="height" className="w-16">
                    Height:
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    placeholder="Height"
                    value={height || ""}
                    onChange={(e) =>
                      handleHeightChange(parseInt(e.target.value) || 0)
                    }
                    min="1"
                  />
                  <span className="text-sm text-muted-foreground">px</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="maintain-ratio"
                    checked={maintainAspectRatio}
                    onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <Label
                    htmlFor="maintain-ratio"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Lock aspect ratio
                  </Label>
                </div>
              </div>
            </div>

            {/* Output Format */}
            <div className="space-y-2">
              <Label>Output Format</Label>
              <Select value={format} onValueChange={(v) => setFormat(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="webp">WebP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Process Button */}
            <Button
              onClick={processImage}
              disabled={loading || (!imageFile && !imageUrl)}
              className="w-full"
              size="lg"
            >
              {loading ? progress || "Processing..." : "Remove Background"}
            </Button>
            {loading && progress && (
              <p className="text-sm text-center text-muted-foreground">
                {progress}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Result Section */}
      {processedImageUrl && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Processed Image</CardTitle>
            <CardDescription>
              Your image with background removed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden bg-[linear-gradient(45deg,#ddd_25%,transparent_25%),linear-gradient(-45deg,#ddd_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ddd_75%),linear-gradient(-45deg,transparent_75%,#ddd_75%)] bg-[length:20px_20px] bg-[0_0,0_10px,10px_-10px,-10px_0px]">
                <img
                  src={processedImageUrl}
                  alt="Processed"
                  className="w-full h-auto max-h-96 object-contain mx-auto"
                />
              </div>
              <Button onClick={downloadImage} className="w-full" size="lg">
                Download Image
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
