"use client";

import { useState } from "react";
import { User, Edit2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { t, type Locale } from "@/i18n";

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
  const [nickname, setNickname] = useState(user.name);
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [isEditingPhoto, setIsEditingPhoto] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t(locale, "settings.profile.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center md:items-start gap-6">
          {/* Profile Photo */}
          <div className="relative">
            {user.image ? (
              <img
                src={user.image}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-primary"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold text-background border-4 border-primary">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <button
              onClick={() => setIsEditingPhoto(!isEditingPhoto)}
              className="absolute bottom-0 right-0 p-2 bg-primary rounded-full text-background hover:opacity-90 transition-opacity"
              title={t(locale, "settings.profile.editPhoto")}
            >
              <Camera size={16} />
            </button>
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
