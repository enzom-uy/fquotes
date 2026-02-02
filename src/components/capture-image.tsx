import { useState, useRef } from "react";
import { Camera, Upload, X, Check, Trash2, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { createWorker, createScheduler } from "tesseract.js";
import { EditableQuoteCard } from "./editable-quote-card";

interface CapturedImage {
  id: string;
  data: string;
}

export const CaptureImage = () => {
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({
    current: 0,
    total: 0,
  });
  const [texts, setTexts] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageData = event.target?.result as string;
          setCapturedImages((prev) => [
            ...prev,
            { id: crypto.randomUUID(), data: imageData },
          ]);
        };
        reader.readAsDataURL(file);
      });
      e.target.value = "";
    }
  };

  const handleRemoveImage = (id: string) => {
    setCapturedImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleProcess = async () => {
    setIsProcessing(true);
    setProcessingProgress({ current: 0, total: capturedImages.length });

    const imageCount = capturedImages.length;

    try {
      if (imageCount <= 4) {
        const worker = await createWorker("eng");

        for (let i = 0; i < capturedImages.length; i++) {
          setProcessingProgress({
            current: i + 1,
            total: capturedImages.length,
          });
          const ret = await worker.recognize(capturedImages[i].data);
          console.log(`Image ${i + 1} text:`, ret.data.text);
          setTexts((prevTexts) => [...prevTexts, ret.data.text]);
        }

        await worker.terminate();
      } else {
        const scheduler = createScheduler();
        const workerN = Math.min(4, imageCount); // Max 4 workers

        // Create and add workers to scheduler
        const workerPromises = [];
        for (let i = 0; i < workerN; i++) {
          workerPromises.push(
            createWorker("eng").then((worker) => {
              scheduler.addWorker(worker);
            }),
          );
        }
        await Promise.all(workerPromises);

        let completedCount = 0;
        const results = await Promise.all(
          capturedImages.map(async (image, index) => {
            const result = await scheduler.addJob("recognize", image.data);
            completedCount++;
            setProcessingProgress({
              current: completedCount,
              total: capturedImages.length,
            });
            console.log(`Image ${index + 1} text:`, result.data.text);
            return result.data.text;
          }),
        );

        setTexts(results);
        await scheduler.terminate();
      }

      setIsProcessing(false);
    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      alert(`Error processing images: ${error}`);
    }
  };

  const handleUpdateText = (index: number, newText: string) => {
    setTexts((prevTexts) =>
      prevTexts.map((text, i) => (i === index ? newText : text)),
    );
  };

  const handleClearAll = () => {
    setCapturedImages([]);
    setTexts([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleAddMore = () => {
    fileInputRef.current?.click();
  };

  if (capturedImages.length > 0) {
    return (
      <>
        {/* Hidden file inputs - always in DOM */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col gap-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Preview</h2>
              <p className="text-sm text-foreground-muted">
                {capturedImages.length} image
                {capturedImages.length !== 1 ? "s" : ""} selected
              </p>
            </div>
            <button
              onClick={handleClearAll}
              className="p-2 rounded-lg hover:bg-background-muted transition-colors"
              title="Clear all images"
            >
              <X size={20} />
            </button>
          </div>

          {/* Image Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {capturedImages.map((image) => (
              <div
                key={image.id}
                className="relative bg-background-elevated border border-background-muted rounded-lg overflow-hidden aspect-square group"
              >
                <img
                  src={image.data}
                  alt="Captured"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => handleRemoveImage(image.id)}
                  className="absolute top-2 right-2 p-1.5 bg-background/80 backdrop-blur-sm hover:bg-danger/90 text-danger hover:text-background border border-border hover:border-danger rounded-lg transition-all opacity-0 group-hover:opacity-100 shadow-lg"
                  title="Remove image"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}

            {/* Add More Button */}
            <button
              onClick={handleAddMore}
              className="aspect-square bg-background-elevated border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-background-muted transition-all group"
            >
              <Plus
                size={32}
                className="text-foreground-muted group-hover:text-primary transition-colors"
              />
              <span className="text-sm text-foreground-muted group-hover:text-primary transition-colors">
                Add More
              </span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              onClick={handleClearAll}
              variant="secondary"
              className="flex items-center justify-center gap-2"
            >
              <X size={20} />
              Clear All
            </Button>

            <Button
              onClick={handleProcess}
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent text-background font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-background/20 border-t-background rounded-full animate-spin" />
                  Processing {processingProgress.current}/
                  {processingProgress.total}...
                </>
              ) : (
                <>
                  <Check size={20} />
                  Extract Text
                </>
              )}
            </Button>
          </div>

          {texts.length > 0 && (
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-semibold">Extracted Text</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {texts.map((text, index) => (
                  <EditableQuoteCard
                    key={index}
                    text={text}
                    index={index}
                    onUpdate={handleUpdateText}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Next Steps Info */}
          {texts.length === 0 && (
            <div className="bg-background-elevated border border-background-muted rounded-lg p-4">
              <p className="text-sm text-foreground-muted">
                <span className="text-primary font-semibold">Next step:</span>{" "}
                Click "Extract Text" to process{" "}
                {capturedImages.length > 1 ? "all images" : "the image"} with
                OCR.
              </p>
            </div>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      {/* Hidden file inputs - always in DOM */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="flex flex-col gap-6">
        {/* Title */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-2">Capture a Quote</h2>
          <p className="text-foreground-muted">
            Take photos or upload images of text from books
          </p>
        </div>

        {/* Upload Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {/* Camera Option */}
          <button
            onClick={() => cameraInputRef.current?.click()}
            className="relative bg-background-elevated border-2 border-border rounded-2xl p-8 cursor-pointer transition-all hover:border-primary hover:scale-[1.02] flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 bg-background-muted rounded-full flex items-center justify-center">
              <Camera size={32} className="text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-1">Use Camera</h3>
              <p className="text-sm text-foreground-subtle">
                Take photos directly
              </p>
            </div>
          </button>

          {/* Upload Option */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="relative bg-background-elevated border-2 border-border rounded-2xl p-8 cursor-pointer transition-all hover:border-accent hover:scale-[1.02] flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 bg-background-muted rounded-full flex items-center justify-center">
              <Upload size={32} className="text-accent" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-1">Upload Images</h3>
              <p className="text-sm text-foreground-subtle">
                Choose from gallery
              </p>
            </div>
          </button>
        </div>

        {/* Tips */}
        <div className="mt-12 bg-background-elevated border border-background-muted rounded-lg p-6">
          <h3 className="text-sm font-semibold text-primary mb-3">
            💡 Tips for best results
          </h3>
          <ul className="flex flex-col gap-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">•</span>
              <span>Ensure good lighting and minimal shadows</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">•</span>
              <span>Keep the camera steady and focus on the text</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">•</span>
              <span>Capture text at a straight angle when possible</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">•</span>
              <span>You can upload multiple images at once</span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};
