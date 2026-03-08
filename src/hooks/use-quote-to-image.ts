import { useState, useCallback } from 'react';
import { toPng, toJpeg } from 'html-to-image';

export type ImageFormat = 'png' | 'jpeg';

interface UseQuoteToImageOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useQuoteToImage(options?: UseQuoteToImageOptions) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateImage = useCallback(
    async (
      element: HTMLElement,
      format: ImageFormat = 'png',
      filename: string = 'quote'
    ) => {
      setIsGenerating(true);
      setError(null);

      try {
        // Wait a bit for fonts to load
        await new Promise((resolve) => setTimeout(resolve, 100));

        const commonOptions = {
          pixelRatio: 1,
          cacheBust: true,
          skipFonts: true,
        };

        const dataUrl =
          format === 'png'
            ? await toPng(element, { ...commonOptions, quality: 1 })
            : await toJpeg(element, { ...commonOptions, quality: 0.95 });

        // Create download link
        const link = document.createElement('a');
        link.download = `${filename}.${format}`;
        link.href = dataUrl;
        link.click();

        options?.onSuccess?.();
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to generate image');
        setError(error);
        options?.onError?.(error);
      } finally {
        setIsGenerating(false);
      }
    },
    [options]
  );

  return {
    generateImage,
    isGenerating,
    error,
  };
}
