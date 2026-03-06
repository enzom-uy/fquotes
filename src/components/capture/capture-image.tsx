import { useState, useRef, useEffect, useCallback } from "react";
import {
  Camera,
  Upload,
  X,
  Check,
  Trash2,
  Plus,
  Save,
  Loader2,
  Crop,
  Globe,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createWorker, createScheduler } from "tesseract.js";
import { EditableQuoteCard, type QuoteMetadata } from "./editable-quote-card";
import { BookSearch, type BookResult } from "./book-search";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "@/lib/auth-client";
import { QuoteSkeletons } from "./quote-skeleton";
import { useSaveQuotes, buildQuotePayloads } from "@/hooks/use-save-quotes";
import { QueryProvider } from "../query-provider";
import { ImageCropper } from "./image-cropper";
import { t, type Locale } from "@/i18n";

interface CapturedImage {
  id: string;
  originalData: string;
  croppedData: string | null;
}

const OCR_LANGUAGES = [
  { code: "ara", name: "Arabic" },
  { code: "ces", name: "Czech" },
  { code: "chi_sim", name: "Chinese (Simplified)" },
  { code: "dan", name: "Danish" },
  { code: "deu", name: "German" },
  { code: "ell", name: "Greek" },
  { code: "eng", name: "English" },
  { code: "fin", name: "Finnish" },
  { code: "fra", name: "French" },
  { code: "heb", name: "Hebrew" },
  { code: "hin", name: "Hindi" },
  { code: "hun", name: "Hungarian" },
  { code: "ita", name: "Italian" },
  { code: "jpn", name: "Japanese" },
  { code: "kor", name: "Korean" },
  { code: "nld", name: "Dutch" },
  { code: "nor", name: "Norwegian" },
  { code: "pol", name: "Polish" },
  { code: "por", name: "Portuguese" },
  { code: "rus", name: "Russian" },
  { code: "spa", name: "Spanish" },
  { code: "swe", name: "Swedish" },
  { code: "tha", name: "Thai" },
  { code: "tur", name: "Turkish" },
  { code: "ukr", name: "Ukrainian" },
  { code: "vie", name: "Vietnamese" },
];

const STORAGE_KEY = "fquotes-ocr-language";
const DEFAULT_PUBLIC_KEY = "fquotes-default-public";

export interface CaptureImageProps {
  locale?: Locale;
}

export const CaptureImage = ({ locale = "en" }: CaptureImageProps) => {
  return (
    <QueryProvider>
      <CaptureImageInner locale={locale} />
    </QueryProvider>
  );
};

const CaptureImageInner = ({ locale = "en" }: CaptureImageProps) => {
  const [capturedImages, setCapturedImages] = useState<CapturedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState({
    current: 0,
    total: 0,
  });
  const [quotesMetadata, setQuotesMetadata] = useState<QuoteMetadata[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<(BookResult | null)[]>([]);
  const [bookErrors, setBookErrors] = useState<(string | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { data: session } = useSession();
  const saveQuotesMutation = useSaveQuotes();

  const [croppingImageId, setCroppingImageId] = useState<string | null>(null);
  const [ocrLanguage, setOcrLanguage] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) || "spa";
    }
    return "spa";
  });
  const [defaultIsPublic, setDefaultIsPublic] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(DEFAULT_PUBLIC_KEY);
      return saved === "true";
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, ocrLanguage);
  }, [ocrLanguage]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const imageData = event.target?.result as string;
          setCapturedImages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              originalData: imageData,
              croppedData: null,
            },
          ]);
        };
        reader.readAsDataURL(file);
      });
      e.target.value = "";
    }
  }, []);

  const handleRemoveImage = useCallback((id: string) => {
    setCapturedImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const handleCropComplete = useCallback((croppedImage: string) => {
    if (!croppingImageId) return;
    setCapturedImages((prev) =>
      prev.map((img) =>
        img.id === croppingImageId
          ? { ...img, croppedData: croppedImage }
          : img,
      ),
    );
    setCroppingImageId(null);
  }, [croppingImageId]);

  const handleProcess = async () => {
    setIsProcessing(true);
    setProcessingProgress({ current: 0, total: capturedImages.length });

    const imageCount = capturedImages.length;

    try {
      const imagesToProcess = capturedImages.map(
        (img) => img.croppedData || img.originalData,
      );

      let allTexts: string[];

      if (imageCount <= 4) {
        const worker = await createWorker(ocrLanguage);
        const texts: string[] = [];

        for (let i = 0; i < imagesToProcess.length; i++) {
          const ret = await worker.recognize(imagesToProcess[i]);
          texts.push(ret.data.text);
          setProcessingProgress({
            current: i + 1,
            total: capturedImages.length,
          });
        }

        await worker.terminate();
        allTexts = texts;
      } else {
        const scheduler = createScheduler();
        const workerN = Math.min(4, imageCount);

        const workerPromises = [];
        for (let i = 0; i < workerN; i++) {
          workerPromises.push(
            createWorker(ocrLanguage).then((worker) => {
              scheduler.addWorker(worker);
            }),
          );
        }
        await Promise.all(workerPromises);

        let completedCount = 0;
        allTexts = await Promise.all(
          imagesToProcess.map(async (imageData) => {
            const result = await scheduler.addJob("recognize", imageData);
            completedCount++;
            setProcessingProgress({
              current: completedCount,
              total: capturedImages.length,
            });
            return result.data.text;
          }),
        );

        await scheduler.terminate();
      }

      // Fix hyphenated line breaks (e.g., "continua-\nción" -> "continuación")
      const processedTexts = allTexts.map((text) => {
        return text.replace(
          /([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)-\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)/g,
          "$1$2",
        );
      });

      // Set all quotes at once when processing is complete
      setQuotesMetadata(
        processedTexts.map((text) => ({
          text,
          chapter: "",
          isPublic: defaultIsPublic,
          tags: [],
        })),
      );
      setIsProcessing(false);

      // Show success toast
      toast({
        title: t(locale, "capture.processingComplete"),
        description: t(locale, "capture.successfullyExtracted").replace(
          "{count}",
          capturedImages.length.toString(),
        ),
        variant: "success",
      });
    } catch (error) {
      setIsProcessing(false);

      // Show error toast
      toast({
        title: t(locale, "capture.processingFailed"),
        description: t(locale, "capture.errorProcessing").replace(
          "{error}",
          String(error),
        ),
        variant: "destructive",
      });
    }
  };

  const handleUpdateQuote = (index: number, metadata: QuoteMetadata) => {
    setQuotesMetadata((prev) =>
      prev.map((q, i) => (i === index ? metadata : q)),
    );
  };

  const handleClearAll = () => {
    setCapturedImages([]);
    setQuotesMetadata([]);
    setSelectedBooks([]);
    setBookErrors([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleAddMore = () => {
    fileInputRef.current?.click();
  };

  const handleSaveQuotes = async () => {
    if (!session?.user?.id) {
      toast({
        title: t(locale, "capture.notAuthenticated"),
        description: t(locale, "capture.signInRequired"),
        variant: "destructive",
      });
      return;
    }

    if (quotesMetadata.length === 0) return;

    // Validate that all quotes have text
    const emptyQuotes = quotesMetadata.filter((q) => !q.text.trim());
    if (emptyQuotes.length > 0) {
      toast({
        title: t(locale, "capture.emptyQuotes"),
        description: t(locale, "capture.emptyQuotesDesc"),
        variant: "destructive",
      });
      return;
    }

    // Validate that all quotes have a book selected
    const newBookErrors = quotesMetadata.map((_, index) =>
      selectedBooks[index] ? null : t(locale, "capture.missingBook"),
    );
    if (newBookErrors.some((e) => e !== null)) {
      setBookErrors(newBookErrors);
      toast({
        title: t(locale, "capture.missingBookSelection"),
        description: t(locale, "capture.missingBookDesc"),
        variant: "destructive",
      });
      return;
    }

    const payloads = buildQuotePayloads(
      quotesMetadata,
      selectedBooks,
      session.user.id,
    );

    saveQuotesMutation.mutate(payloads, {
      onSuccess: () => {
        toast({
          title: t(locale, "capture.quotesSaved"),
          description: t(locale, "capture.successfullySaved").replace(
            "{count}",
            quotesMetadata.length.toString(),
          ),
          variant: "success",
        });
        handleClearAll();
      },
      onError: (error) => {
        toast({
          title: t(locale, "capture.failedToSave"),
          description: t(locale, "capture.errorSaving").replace(
            "{error}",
            error.message,
          ),
          variant: "destructive",
        });
      },
    });
  };

  if (capturedImages.length > 0) {
    return (
      <div>
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
              <h2 className="text-2xl font-bold">
                {quotesMetadata.length > 0
                  ? t(locale, "capture.extractedQuotes")
                  : t(locale, "capture.preview")}
              </h2>
              <p className="text-sm text-foreground-muted">
                {capturedImages.length} image
                {capturedImages.length !== 1 ? "s" : ""} selected
              </p>
            </div>
            {quotesMetadata.length === 0 && (
              <button
                onClick={handleClearAll}
                className="p-2 rounded-lg hover:bg-background-muted transition-colors"
                title={t(locale, "capture.clearAll")}
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Before processing: Image Grid Preview */}
          {quotesMetadata.length === 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {capturedImages.map((image) => (
                <div
                  key={image.id}
                  className="relative bg-background-elevated border border-background-muted rounded-lg overflow-hidden aspect-square group"
                >
                  <img
                    src={image.croppedData || image.originalData}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                  {image.croppedData && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-primary/80 text-xs text-white rounded">
                      Cropped
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setCroppingImageId(image.id)}
                      className="p-1.5 bg-background/80 backdrop-blur-sm hover:bg-primary text-foreground hover:text-white rounded-lg transition-all"
                      title={t(locale, "capture.cropImage")}
                    >
                      <Crop size={14} />
                    </button>
                    <button
                      onClick={() => handleRemoveImage(image.id)}
                      className="p-1.5 bg-background/80 backdrop-blur-sm hover:bg-danger/90 text-danger hover:text-background border border-border hover:border-danger rounded-lg transition-all"
                      title={t(locale, "capture.removeImage")}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
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
          )}

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <Globe size={18} className="text-foreground-muted" />
            <Select value={ocrLanguage} onValueChange={setOcrLanguage}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder={t(locale, "capture.selectLanguage")} />
              </SelectTrigger>
              <SelectContent>
                {OCR_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quotesMetadata.length === 0 ? (
              <Button
                onClick={handleProcess}
                disabled={isProcessing}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent text-background font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-background/20 border-t-background rounded-full animate-spin" />
                    {t(locale, "capture.processingProgress")
                      .replace("{current}", processingProgress.current.toString())
                      .replace("{total}", processingProgress.total.toString())}
                  </>
                ) : (
                  <>
                    <Check size={20} />
                    {t(locale, "capture.extractText")}
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSaveQuotes}
                  disabled={saveQuotesMutation.isPending}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-accent text-background font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saveQuotesMutation.isPending ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      {t(locale, "capture.saving")}
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      {t(locale, "capture.saveQuotes")}
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleClearAll}
                  disabled={saveQuotesMutation.isPending}
                  className="flex items-center justify-center gap-2 bg-danger text-background font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X size={20} />
                  {t(locale, "capture.startOver")}
                </Button>
              </>
            )}
          </div>

          {/* Skeletons while processing */}
          {isProcessing && quotesMetadata.length === 0 && (
            <QuoteSkeletons
              count={capturedImages.length}
              processed={processingProgress.current}
            />
          )}

          {/* After processing: Images with book search and styled quote cards */}
          {quotesMetadata.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quotesMetadata.map((quoteData, index) => (
                <div key={index} className="flex flex-col gap-3">
                  {/* Image preview with Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="relative bg-background-elevated border border-background-muted rounded-lg overflow-hidden hover:border-primary transition-colors cursor-pointer group max-h-48">
                        <img
                          src={
                            capturedImages[index]?.croppedData ||
                            capturedImages[index]?.originalData
                          }
                          alt={`Quote ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium bg-black/50 px-3 py-1.5 rounded-lg">
                            Click to enlarge
                          </span>
                        </div>
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden">
                      <img
                        src={
                          capturedImages[index]?.croppedData ||
                          capturedImages[index]?.originalData
                        }
                        alt={`Quote ${index + 1} - Full size`}
                        className="w-full h-full object-contain"
                      />
                    </DialogContent>
                  </Dialog>
                  {/* Editable quote card — styled to preview the final result */}
                  <EditableQuoteCard
                    metadata={quoteData}
                    index={index}
                    onUpdate={handleUpdateQuote}
                    selectedBook={selectedBooks[index] ?? null}
                    onBookSelect={(book) => {
                      setSelectedBooks((prev) => {
                        const updated = [...prev];
                        updated[index] = book;
                        return updated;
                      });
                      setBookErrors((prev) => {
                        const updated = [...prev];
                        updated[index] = null;
                        return updated;
                      });
                    }}
                    onBookClear={() =>
                      setSelectedBooks((prev) => {
                        const updated = [...prev];
                        updated[index] = null;
                        return updated;
                      })
                    }
                    bookError={bookErrors[index] ?? undefined}
                    locale={locale}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Next Steps Info - Only show before processing */}
          {quotesMetadata.length === 0 && (
            <div className="bg-background-elevated border border-background-muted rounded-lg p-4">
              <p className="text-sm text-foreground-muted">
                <span className="text-primary font-semibold">Next step:</span>{" "}
                {t(locale, "capture.clickExtract")}{" "}
                {capturedImages.length > 1 ? "all images" : "the image"} with
                OCR.
              </p>
            </div>
          )}
        </div>

        {/* Cropping Modal - always rendered when active */}
        {croppingImageId && (
          <ImageCropper
            image={
              capturedImages.find((img) => img.id === croppingImageId)
                ?.originalData || ""
            }
            onCropComplete={handleCropComplete}
            onCancel={() => setCroppingImageId(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Hidden file inputs - always in DOM */}
      <input
        ref={fileInputRef}
        id="file-upload"
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        id="camera-capture"
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
          <h2 className="text-3xl font-bold mb-2">{t(locale, "capture.title")}</h2>
          <p className="text-foreground-muted">
            {t(locale, "capture.subtitle")}
          </p>
        </div>

        {/* Upload Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {/* Camera Option */}
          <label
            htmlFor="camera-capture"
            className="relative bg-background-elevated border-2 border-border rounded-2xl p-8 cursor-pointer transition-all hover:border-primary hover:scale-[1.02] flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 bg-background-muted rounded-full flex items-center justify-center">
              <Camera size={32} className="text-primary" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-1">{t(locale, "capture.useCameraTitle")}</h3>
              <p className="text-sm text-foreground-subtle">
                {t(locale, "capture.useCameraDescription")}
              </p>
            </div>
          </label>

          {/* Upload Option */}
          <label
            htmlFor="file-upload"
            className="relative bg-background-elevated border-2 border-border rounded-2xl p-8 cursor-pointer transition-all hover:border-accent hover:scale-[1.02] flex flex-col items-center gap-4"
          >
            <div className="w-16 h-16 bg-background-muted rounded-full flex items-center justify-center">
              <Upload size={32} className="text-accent" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-1">{t(locale, "capture.uploadImagesTitle")}</h3>
              <p className="text-sm text-foreground-subtle">
                {t(locale, "capture.uploadImagesDescription")}
              </p>
            </div>
          </label>
        </div>

        {/* Tips */}
        <div className="mt-12 bg-background-elevated border border-background-muted rounded-lg p-6">
          <h3 className="text-sm font-semibold text-primary mb-3">
            {t(locale, "capture.tipsTitle")}
          </h3>
          <ul className="flex flex-col gap-2 text-sm text-foreground-muted">
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">•</span>
              <span>{t(locale, "capture.tip1")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">•</span>
              <span>{t(locale, "capture.tip2")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">•</span>
              <span>{t(locale, "capture.tip3")}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-success mt-0.5">•</span>
              <span>{t(locale, "capture.tip4")}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
