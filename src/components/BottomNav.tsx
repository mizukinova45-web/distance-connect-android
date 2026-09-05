import { Heart, MessageCircle, Crown, Image as ImageIcon, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export type BottomNavTab = "discover" | "chat" | "games" | "memories" | "profile";

interface BottomNavProps {
  active: BottomNavTab;
  onChange: (tab: BottomNavTab) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  const { t } = useLanguage();
  const tabs: { id: BottomNavTab; icon: typeof Heart; label: string }[] = [
    { id: "discover", icon: Heart, label: t("discover") },
    { id: "chat", icon: MessageCircle, label: t("chat") },
    { id: "games", icon: Crown, label: t("games") },
    { id: "memories", icon: ImageIcon, label: t("memories") },
    { id: "profile", icon: User, label: t("profile") },
  ];
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 pointer-events-none">
      <div className="flex items-center justify-around bg-white/90 backdrop-blur-xl rounded-[1.75rem] px-4 py-2.5 shadow-[0_4px_30px_rgba(0,0,0,0.08)] border border-pink-100/60 pointer-events-auto">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-col items-center gap-1 px-3 py-1 transition-all duration-200"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isActive
                    ? "bg-[#e8568f] shadow-md shadow-pink-300/40 scale-110"
                    : "bg-transparent"
                }`}
              >
                <tab.icon
                  className={`w-5 h-5 transition-colors duration-200 ${
                    isActive ? "text-white fill-white" : "text-gray-300"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] font-semibold transition-colors duration-200 ${
                  isActive ? "text-[#e8568f]" : "text-gray-300"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
