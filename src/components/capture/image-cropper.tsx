import { useState, useCallback, useRef } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { X, Check, RotateCw, ZoomIn, ZoomOut, Maximize2, Square, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

function ImageCropper({ image, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [aspect, setAspect] = useState<number | undefined>(undefined);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 16 / 9));
  }, []);

  const getCroppedImage = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) return;

    const image = imgRef.current;
    const canvas = canvasRef.current;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    const croppedImage = canvas.toDataURL("image/jpeg", 0.9);
    onCropComplete(croppedImage);
  }, [completedCrop, onCropComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-background/95 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="text-lg font-semibold">Crop Image</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (imgRef.current) {
                const { width, height } = imgRef.current;
                setCrop(centerAspectCrop(width, height, 1));
                setAspect(1);
              }
            }}
            className="p-2 rounded-lg hover:bg-background-muted transition-colors"
            title="Rotate"
          >
            <RotateCw size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={aspect}
        >
          <img
            ref={imgRef}
            src={image}
            onLoad={onImageLoad}
            alt="Crop"
            className="max-h-[70vh] object-contain"
          />
        </ReactCrop>
      </div>

      {/* Hidden canvas for cropping */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="p-4 border-t border-border space-y-4">
        {/* Aspect ratio selector */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground-muted mr-2">Aspect:</span>
          <button
            onClick={() => setAspect(undefined)}
            className={`p-2 rounded-lg transition-colors ${aspect === undefined ? 'bg-primary text-white' : 'bg-background-muted hover:bg-background-muted/80'}`}
            title="Free"
          >
            <Maximize2 size={18} />
          </button>
          <button
            onClick={() => {
              setAspect(1);
              if (imgRef.current) {
                const { width, height } = imgRef.current;
                setCrop(centerAspectCrop(width, height, 1));
              }
            }}
            className={`p-2 rounded-lg transition-colors ${aspect === 1 ? 'bg-primary text-white' : 'bg-background-muted hover:bg-background-muted/80'}`}
            title="1:1"
          >
            <Square size={18} />
          </button>
          <button
            onClick={() => {
              setAspect(4 / 3);
              if (imgRef.current) {
                const { width, height } = imgRef.current;
                setCrop(centerAspectCrop(width, height, 4 / 3));
              }
            }}
            className={`p-2 rounded-lg transition-colors ${aspect === 4 / 3 ? 'bg-primary text-white' : 'bg-background-muted hover:bg-background-muted/80'}`}
            title="4:3"
          >
            <ImageIcon size={18} />
          </button>
          <button
            onClick={() => {
              setAspect(16 / 9);
              if (imgRef.current) {
                const { width, height } = imgRef.current;
                setCrop(centerAspectCrop(width, height, 16 / 9));
              }
            }}
            className={`p-2 rounded-lg transition-colors ${aspect === 16 / 9 ? 'bg-primary text-white' : 'bg-background-muted hover:bg-background-muted/80'}`}
            title="16:9"
          >
            <ImageIcon size={18} className="w-6 h-4" />
          </button>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            <X size={18} className="mr-2" />
            Cancel
          </Button>
          <Button
            onClick={getCroppedImage}
            disabled={!completedCrop}
            className="flex-1"
          >
            <Check size={18} className="mr-2" />
            Apply Crop
          </Button>
        </div>
      </div>
    </div>
  );
}

export { ImageCropper };
