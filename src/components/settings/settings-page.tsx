"use client";

import { useState } from "react";
import { User, Quote } from "lucide-react";
import { ProfileSettings } from "./profile-settings";
import { QuotesSettings } from "./quotes-settings";
import { t, type Locale } from "@/i18n";

export interface SettingsPageProps {
  user: {
    name: string;
    email: string;
    image: string | null;
  };
  locale?: Locale;
}

type SettingsTab = "profile" | "quotes";

export function SettingsPage({ user, locale = "en" }: SettingsPageProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  const tabs = [
    {
      id: "profile" as const,
      label: t(locale, "settings.profile.title"),
      icon: User,
    },
    {
      id: "quotes" as const,
      label: t(locale, "settings.quotes.title"),
      icon: Quote,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">{t(locale, "settings.title")}</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <nav className="flex flex-row md:flex-col gap-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left
                    ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-foreground-muted hover:text-foreground hover:bg-background-muted"
                    }
                  `}
                >
                  <Icon size={20} />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-[400px]">
          {activeTab === "profile" && (
            <ProfileSettings user={user} locale={locale} />
          )}
          {activeTab === "quotes" && <QuotesSettings locale={locale} />}
        </div>
      </div>
    </div>
  );
}
