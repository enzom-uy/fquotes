"use client";

import { useState } from "react";
import { User, Edit2, Camera, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t, type Locale } from "@/i18n";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useUpdateProfile } from "@/hooks/use-update-profile";
import { ApiError } from "@/lib/api";
import { QueryProvider } from "@/components/query-provider";
import { dispatchToastEvent } from "@/components/global-toast-manager";

export interface ProfileSettingsProps {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
  locale?: Locale;
}

export function ProfileSettings({
  user,
  locale = "en",
}: ProfileSettingsProps) {
  return (
    <QueryProvider>
      <ProfileSettingsInner user={user} locale={locale} />
    </QueryProvider>
  );
}

function ProfileSettingsInner({
  user,
  locale = "en",
}: ProfileSettingsProps) {
  const [nickname, setNickname] = useState(user.name);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [markForDeletion, setMarkForDeletion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = useUpdateProfile();

  const handleSavePhoto = async () => {
    setError(null);
    
    try {
      await updateProfile.mutateAsync({
        email: user.email || "",
        name: user.name || "",
        imageFile: markForDeletion ? undefined : (imageFile || undefined),
        deleteCurrentImage: markForDeletion ? true : undefined,
      });
      
      dispatchToastEvent({
        titleKey: "settings.profile.photoUpdateSuccess",
        variant: "success",
      });
      
      setIsEditingPhoto(false);
      setImageFile(null);
      setImagePreview(null);
      setMarkForDeletion(false);
      
      window.location.reload();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError(t(locale, "createProfile.networkError"));
      }
    }
  };

  const handleCancelPhoto = () => {
    setIsEditingPhoto(false);
    setImageFile(null);
    setImagePreview(null);
    setMarkForDeletion(false);
    setError(null);
  };

  const handleMarkForDeletion = () => {
    setMarkForDeletion(true);
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(locale, "settings.profile.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center md:items-start gap-6">
          {/* Profile Photo */}
          <div className="relative">
            {isEditingPhoto ? (
              <div className="flex flex-col items-center gap-3">
                {imagePreview || user.image ? (
                  <UserAvatar 
                    src={imagePreview || user.image || undefined} 
                    name={user.name} 
                    size="xl" 
                    className="border-4 border-primary" 
                  />
                ) : (
                  <UserAvatar 
                    src={undefined} 
                    name={user.name} 
                    size="xl" 
                    className="border-4 border-primary" 
                  />
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setImageFile(file);
                      setImagePreview(URL.createObjectURL(file));
                    }
                  }}
                  className="hidden"
                  id="photo-upload"
                />
                
                <div className="flex gap-2">
                  <label
                    htmlFor="photo-upload"
                    className="flex items-center gap-2 px-3 py-2 bg-primary text-background rounded-lg cursor-pointer hover:opacity-90 transition-opacity text-sm"
                  >
                    <Camera size={16} />
                    {t(locale, "settings.profile.changePhoto")}
                  </label>
                  
                  {user.image && !markForDeletion && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMarkForDeletion}
                      disabled={updateProfile.isPending}
                      className="text-danger border-danger hover:bg-danger/10"
                    >
                      {t(locale, "settings.profile.removePhoto")}
                    </Button>
                  )}
                  
                  {markForDeletion && (
                    <span className="text-sm text-danger">
                      {t(locale, "settings.profile.photoMarkedForDeletion")}
                    </span>
                  )}
                </div>
                
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    onClick={handleSavePhoto}
                    disabled={updateProfile.isPending}
                  >
                    {updateProfile.isPending ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                    {t(locale, "common.save")}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancelPhoto}
                    disabled={updateProfile.isPending}
                  >
                    <X size={16} />
                    {t(locale, "common.cancel")}
                  </Button>
                </div>
                
                {error && (
                  <p className="text-sm text-danger">{error}</p>
                )}
              </div>
            ) : (
              <>
                <UserAvatar src={user.image} name={user.name} size="xl" className="border-4 border-primary" />
                <button
                  onClick={() => setIsEditingPhoto(true)}
                  className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-background hover:opacity-90 transition-opacity"
                  title={t(locale, "settings.profile.editPhoto")}
                >
                  <Camera size={16} />
                </button>
              </>
            )}
          </div>

          {/* Nickname */}
          <div className="w-full max-w-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">
                {t(locale, "settings.profile.nickname")}
              </label>
              <button
                onClick={() => setIsEditingNickname(!isEditingNickname)}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Edit2 size={14} />
                {t(locale, "common.edit")}
              </button>
            </div>
            
            {isEditingNickname ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button size="sm" onClick={() => setIsEditingNickname(false)}>
                  {t(locale, "common.save")}
                </Button>
              </div>
            ) : (
              <p className="text-lg font-semibold">{nickname}</p>
            )}
            
            <p className="text-xs text-foreground-muted mt-1">
              {t(locale, "settings.profile.nicknameWarning")}
            </p>
          </div>

          {/* Email (read-only) */}
          <div className="w-full max-w-sm">
            <label className="text-sm font-medium block mb-2">
              {t(locale, "settings.profile.email")}
            </label>
            <p className="text-foreground-muted">{user.email}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
