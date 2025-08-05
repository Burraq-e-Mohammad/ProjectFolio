import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { projectsAPI } from '@/lib/api';

interface ImageUploadProps {
  onUploadSuccess: (imageUrl: string) => void;
  onUploadError?: (error: string) => void;
  onRemoveImage?: (index: number) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
  className?: string;
  existingImages?: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onUploadSuccess,
  onUploadError,
  onRemoveImage,
  maxFiles = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  maxSize = 5, // 5MB
  className,
  existingImages = [],
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Calculate total images
  const totalImages = existingImages.length;

  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported`;
    }
    
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`;
    }
    
    return null;
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    console.log('Uploading image:', file.name, 'Size:', file.size);
    const response = await projectsAPI.uploadImage(formData);
    console.log('Upload response:', response.data);
    return response.data.imageUrl;
  };

  const handleFileUpload = async (files: FileList) => {
    const fileArray = Array.from(files);
    
    if (existingImages.length + fileArray.length > maxFiles) {
      toast({
        title: 'Too many files',
        description: `You can only upload up to ${maxFiles} images total`,
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      for (const file of fileArray) {
        const validationError = validateFile(file);
        if (validationError) {
          toast({
            title: 'Invalid file',
            description: validationError,
            variant: 'destructive',
          });
          continue;
        }

        const imageUrl = await uploadImage(file);
        // Don't add to local state, let parent handle it
        onUploadSuccess(imageUrl);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Upload failed';
      toast({
        title: 'Upload failed',
        description: errorMsg,
        variant: 'destructive',
      });
      onUploadError?.(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };



  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Upload Images
        </CardTitle>
        <CardDescription>
          Upload up to {maxFiles} images total. Supported formats: JPEG, PNG, WebP, GIF (max {maxSize}MB each)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag and drop images here, or click to select files
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Choose Files'
            )}
          </Button>
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
          />
        </div>

        {/* All Images */}
        {existingImages.length > 0 && (
          <div className="space-y-2">
            <Label>Project Images ({existingImages.length})</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {existingImages.map((imageUrl, index) => (
                <div key={`image-${index}`} className="relative group aspect-video">
                  <img
                    src={imageUrl}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-contain rounded-md bg-muted"
                  />
                  {onRemoveImage && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onRemoveImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Total Images Count */}
        {totalImages > 0 && (
          <div className="text-sm text-muted-foreground">
            Total images: {totalImages}/{maxFiles}
          </div>
        )}

        {isUploading && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Uploading images... Please wait.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageUpload; 