"use client";

import { useState, useEffect } from "react";
import { Globe, Lock, Globe2, Share2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { t, type Locale } from "@/i18n";

const OCR_LANGUAGES_LIST = [
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

const LANGUAGE_STORAGE_KEY = "fquotes-ocr-language";
const DEFAULT_PUBLIC_KEY = "fquotes-default-public";
const SHARE_INCLUDE_USERNAME_KEY = "fquotes-share-include-username";
const SHARE_INCLUDE_PHOTO_KEY = "fquotes-share-include-photo";

interface QuotesSettingsProps {
  locale?: Locale;
}

export function QuotesSettings({ locale = "en" }: QuotesSettingsProps) {
  const [ocrLanguage, setOcrLanguage] = useState("spa");
  const [defaultIsPublic, setDefaultIsPublic] = useState(false);
  const [shareIncludeUsername, setShareIncludeUsername] = useState(false);
  const [shareIncludePhoto, setShareIncludePhoto] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLang) {
      setOcrLanguage(savedLang);
    }

    const savedDefaultPublic = localStorage.getItem(DEFAULT_PUBLIC_KEY);
    if (savedDefaultPublic !== null) {
      setDefaultIsPublic(savedDefaultPublic === "true");
    }

    const savedShareUsername = localStorage.getItem(SHARE_INCLUDE_USERNAME_KEY);
    if (savedShareUsername !== null) {
      setShareIncludeUsername(savedShareUsername === "true");
    }

    const savedSharePhoto = localStorage.getItem(SHARE_INCLUDE_PHOTO_KEY);
    if (savedSharePhoto !== null) {
      setShareIncludePhoto(savedSharePhoto === "true");
    }
  }, []);

  const handleLanguageChange = (value: string) => {
    setOcrLanguage(value);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, value);
  };

  const handleDefaultVisibilityChange = (isPublic: boolean) => {
    setDefaultIsPublic(isPublic);
    localStorage.setItem(DEFAULT_PUBLIC_KEY, String(isPublic));
  };

  const handleShareUsernameChange = (checked: boolean) => {
    setShareIncludeUsername(checked);
    localStorage.setItem(SHARE_INCLUDE_USERNAME_KEY, String(checked));
  };

  const handleSharePhotoChange = (checked: boolean) => {
    setShareIncludePhoto(checked);
    localStorage.setItem(SHARE_INCLUDE_PHOTO_KEY, String(checked));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(locale, "settings.quotes.title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Default Language */}
        <div>
          <label className="text-sm font-medium flex items-center gap-2 mb-3">
            <Globe size={16} />
            {t(locale, "settings.quotes.defaultLanguage")}
          </label>
          <Select value={ocrLanguage} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-full md:w-64">
              <SelectValue
                placeholder={t(locale, "settings.quotes.selectLanguage")}
              />
            </SelectTrigger>
            <SelectContent>
              {OCR_LANGUAGES_LIST.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-foreground-muted mt-2">
            {t(locale, "settings.quotes.defaultLanguageHelp")}
          </p>
        </div>

        {/* Default Visibility */}
        <div>
          <label className="text-sm font-medium block mb-3">
            {t(locale, "settings.quotes.defaultVisibility")}
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => handleDefaultVisibilityChange(true)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors
                ${defaultIsPublic 
                  ? "border-primary bg-primary/10 text-primary" 
                  : "border-border hover:border-primary/50"
                }
              `}
            >
              <Globe2 size={18} />
              <span>{t(locale, "settings.quotes.public")}</span>
            </button>
            <button
              onClick={() => handleDefaultVisibilityChange(false)}
              className={`
                flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border transition-colors
                ${!defaultIsPublic 
                  ? "border-primary bg-primary/10 text-primary" 
                  : "border-border hover:border-primary/50"
                }
              `}
            >
              <Lock size={18} />
              <span>{t(locale, "settings.quotes.private")}</span>
            </button>
          </div>
          <p className="text-xs text-foreground-muted mt-2">
            {t(locale, "settings.quotes.defaultVisibilityHelp", {
              visibility: defaultIsPublic
                ? t(locale, "settings.quotes.public").toLowerCase()
                : t(locale, "settings.quotes.private").toLowerCase(),
            })}
          </p>
        </div>

        {/* Sharing Settings */}
        <div>
          <label className="text-sm font-medium flex items-center gap-2 mb-3">
            <Share2 size={16} />
            {t(locale, "settings.share.title")}
          </label>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="share-username" className="text-sm cursor-pointer flex-1 pr-4">
                {t(locale, "settings.share.includeUsername")}
              </Label>
              <Switch
                id="share-username"
                checked={shareIncludeUsername}
                onCheckedChange={handleShareUsernameChange}
              />
            </div>
            <p className="text-xs text-foreground-muted -mt-2">
              {t(locale, "settings.share.includeUsernameHelp")}
            </p>

            <div className="flex items-center justify-between">
              <Label htmlFor="share-photo" className="text-sm cursor-pointer flex-1 pr-4">
                {t(locale, "settings.share.includeProfilePhoto")}
              </Label>
              <Switch
                id="share-photo"
                checked={shareIncludePhoto}
                onCheckedChange={handleSharePhotoChange}
              />
            </div>
            <p className="text-xs text-foreground-muted -mt-2">
              {t(locale, "settings.share.includeProfilePhotoHelp")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
