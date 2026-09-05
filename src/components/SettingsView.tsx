import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Globe,
  Bell,
  Moon,
  Volume2,
  Shield,
  Info,
  Check,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { useLanguage, type Language } from "@/contexts/LanguageContext";

interface SettingsViewProps {
  onBack: () => void;
  onSignOut: () => void;
}

export function SettingsView({ onBack, onSignOut }: SettingsViewProps) {
  const { language, setLanguage, t } = useLanguage();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sounds, setSounds] = useState(true);

  const languages: { id: Language; label: string; flag: string }[] = [
    { id: "fr", label: "Français", flag: "🇫🇷" },
    { id: "en", label: "English", flag: "🇬🇧" },
  ];

  return (
    <div className="min-h-screen bg-[#fdf2f8] pb-24">
      {/* Header */}
      <header className="flex items-center gap-4 px-5 py-3.5 bg-white border-b border-pink-100 shadow-sm sticky top-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-xl text-pink-400 hover:text-pink-500 hover:bg-pink-50"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <p className="text-sm font-semibold text-[#3f3043]">{t("settings")}</p>
      </header>

      <div className="max-w-lg mx-auto px-6 pt-6 space-y-6">
        {/* Language section */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-pink-400 font-semibold mb-3 px-1">
            {t("language")}
          </p>
          <div className="bg-white rounded-2xl border border-pink-50 shadow-sm overflow-hidden">
            {languages.map((lang) => (
              <button
                key={lang.id}
                onClick={() => setLanguage(lang.id)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-pink-50/50 transition-colors text-left border-b border-pink-50 last:border-0"
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#3f3043]">{lang.label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {lang.id === "fr" ? "Langue par défaut" : "Default language"}
                  </p>
                </div>
                {language === lang.id && (
                  <div className="w-6 h-6 rounded-full glowup-gradient flex items-center justify-center shadow-sm">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Preferences section */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-pink-400 font-semibold mb-3 px-1">
            {language === "fr" ? "Préférences" : "Preferences"}
          </p>
          <div className="bg-white rounded-2xl border border-pink-50 shadow-sm overflow-hidden divide-y divide-pink-50">
            {/* Notifications */}
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 rounded-2xl bg-pink-50 flex items-center justify-center shrink-0">
                <Bell className="w-4 h-4 text-pink-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#3f3043]">{t("notifications")}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t("notificationsDesc")}</p>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                  notifications ? "bg-gradient-to-r from-pink-400 to-fuchsia-400" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    notifications ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Dark Mode */}
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0">
                <Moon className="w-4 h-4 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#3f3043]">{t("darkMode")}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t("darkModeDesc")}</p>
              </div>
              <button
                onClick={() => {
                  setDarkMode(!darkMode);
                  document.documentElement.classList.toggle("dark");
                }}
                className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                  darkMode ? "bg-gradient-to-r from-pink-400 to-fuchsia-400" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    darkMode ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Sounds */}
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                <Volume2 className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-[#3f3043]">{t("soundEffects")}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t("soundEffectsDesc")}</p>
              </div>
              <button
                onClick={() => setSounds(!sounds)}
                className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
                  sounds ? "bg-gradient-to-r from-pink-400 to-fuchsia-400" : "bg-gray-200"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    sounds ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Info section */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-pink-400 font-semibold mb-3 px-1">
            {t("about")}
          </p>
          <div className="bg-white rounded-2xl border border-pink-50 shadow-sm overflow-hidden divide-y divide-pink-50">
            {[
              { icon: Shield, label: t("termsAndConditions"), color: "bg-blue-50 text-blue-400" },
              { icon: Shield, label: t("privacyPolicy"), color: "bg-green-50 text-green-400" },
              { icon: Info, label: t("aboutUs"), color: "bg-purple-50 text-purple-400" },
            ].map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-pink-50/50 transition-colors text-left"
              >
                <div className={`w-10 h-10 rounded-2xl ${item.color} flex items-center justify-center shrink-0`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[#3f3043]">{item.label}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Version */}
        <div className="text-center pb-4">
          <p className="text-xs text-gray-300">
            {t("version")} 1.0.0
          </p>
          <p className="text-[10px] text-gray-300 mt-1">GlowUp © 2026</p>
        </div>

        {/* Logout */}
        <button
          onClick={onSignOut}
          className="w-full h-12 rounded-2xl bg-white border border-pink-100 text-red-400 text-sm font-semibold hover:bg-red-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <LogOut className="w-4 h-4" />
          {t("logout")}
        </button>
      </div>
    </div>
  );
}
