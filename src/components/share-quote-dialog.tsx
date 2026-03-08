import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, Loader2 } from 'lucide-react';
import { QuoteCardShareable } from './quote-card-shareable';
import { useQuoteToImage } from '@/hooks/use-quote-to-image';
import { toPng } from 'html-to-image';

const SHARE_INCLUDE_USERNAME_KEY = "fquotes-share-include-username";
const SHARE_INCLUDE_PHOTO_KEY = "fquotes-share-include-photo";

interface ShareQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quote: string;
  bookTitle: string;
  authorName?: string | null;
  coverUrl?: string | null;
  quoteId: string;
  userName?: string | null;
  userImage?: string | null;
  t: (key: string) => string;
}

export function ShareQuoteDialog({
  open,
  onOpenChange,
  quote,
  bookTitle,
  authorName,
  coverUrl,
  quoteId,
  userName,
  userImage,
  t,
}: ShareQuoteDialogProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  // Toggles initialized from localStorage (defaults to false)
  const [includeUsername, setIncludeUsername] = useState(false);
  const [includePhoto, setIncludePhoto] = useState(false);

  // Read localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedUsername = localStorage.getItem(SHARE_INCLUDE_USERNAME_KEY);
    const savedPhoto = localStorage.getItem(SHARE_INCLUDE_PHOTO_KEY);
    if (savedUsername !== null) setIncludeUsername(savedUsername === 'true');
    if (savedPhoto !== null) setIncludePhoto(savedPhoto === 'true');
  }, []);

  const handleIncludeUsernameChange = (checked: boolean) => {
    setIncludeUsername(checked);
    localStorage.setItem(SHARE_INCLUDE_USERNAME_KEY, String(checked));
    // If disabling username, also disable photo
    if (!checked) {
      setIncludePhoto(false);
      localStorage.setItem(SHARE_INCLUDE_PHOTO_KEY, 'false');
    }
  };

  const handleIncludePhotoChange = (checked: boolean) => {
    setIncludePhoto(checked);
    localStorage.setItem(SHARE_INCLUDE_PHOTO_KEY, String(checked));
  };

  const resolvedUserName = includeUsername ? userName : null;
  const resolvedUserImage = includeUsername && includePhoto ? userImage : null;

  // Preload the cover image as soon as the URL is available
  useEffect(() => {
    if (!coverUrl) return;
    const img = new Image();
    img.src = coverUrl;
  }, [coverUrl]);

  // Preload user profile image when it will be included
  useEffect(() => {
    if (!resolvedUserImage) return;
    const img = new Image();
    img.src = resolvedUserImage;
  }, [resolvedUserImage]);

  // Generate preview from hidden node
  const generatePreview = useCallback(async (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return;
    setIsGeneratingPreview(true);
    setPreviewUrl(null);
    try {
      await new Promise((r) => setTimeout(r, 150));
      const dataUrl = await toPng(ref.current, {
        pixelRatio: 1,
        cacheBust: true,
        skipFonts: true,
      });
      setPreviewUrl(dataUrl);
    } catch {
      console.warn('Preview generation failed');
    } finally {
      setIsGeneratingPreview(false);
    }
  }, []);

  // Regenerate preview when dialog opens or toggles change
  useEffect(() => {
    if (open) {
      generatePreview(exportRef);
    }
  }, [open, includeUsername, includePhoto, generatePreview]);

  const { generateImage, isGenerating, error } = useQuoteToImage({
    onError: (err) => {
      console.error('Failed to generate image:', err);
    },
  });

  const handleDownload = async () => {
    if (!exportRef.current) return;
    await generateImage(exportRef.current, 'png', `quote-${quoteId}`);
  };

  const sharedProps = {
    quote,
    bookTitle,
    authorName,
    coverUrl,
    userName: resolvedUserName,
    userImage: resolvedUserImage,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* Hidden off-screen node used for image export */}
      <div style={{ position: 'fixed', left: '-9999px', top: 0, pointerEvents: 'none' }}>
        <QuoteCardShareable ref={exportRef} {...sharedProps} />
      </div>

      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>{t('shareQuote')}</DialogTitle>
        </DialogHeader>

        {/* Preview */}
        <div className="w-full rounded-lg overflow-hidden shadow-xl bg-[#1e1e2e]" style={{ aspectRatio: '800 / 420' }}>
          {previewUrl && !isGeneratingPreview ? (
            <img
              src={previewUrl}
              alt={t('shareQuote')}
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-[#585b70]" />
            </div>
          )}
        </div>

        {/* Identity toggles — only shown when the user has a name */}
        {userName && (
          <div className="flex flex-col gap-3 pt-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="dialog-include-username" className="text-sm cursor-pointer">
                {t('settings.shareDialog.includeUsername')}
              </Label>
              <Switch
                id="dialog-include-username"
                checked={includeUsername}
                onCheckedChange={handleIncludeUsernameChange}
              />
            </div>

            {includeUsername && userImage && (
              <div className="flex items-center justify-between">
                <Label htmlFor="dialog-include-photo" className="text-sm cursor-pointer">
                  {t('settings.shareDialog.includePhoto')}
                </Label>
                <Switch
                  id="dialog-include-photo"
                  checked={includePhoto}
                  onCheckedChange={handleIncludePhotoChange}
                />
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
            {t('errorGeneratingImage')}
          </div>
        )}

        <DialogFooter>
          <Button onClick={handleDownload} disabled={isGenerating || isGeneratingPreview}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('generating')}
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                {t('downloadImage')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
