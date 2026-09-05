import { motion } from "framer-motion";
import {
  Heart,
  MessageCircle,
  Crown,
  Sparkles,
  Image as ImageIcon,
  Film,
  Lock,
  Star,
  ChevronRight,
  Play,
} from "lucide-react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-[#fdf2f8] text-foreground overflow-hidden">
      {/* ========== NAV ========== */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 fill-pink-500 text-pink-500" />
          <span className="text-xl font-bold tracking-tight text-[#3f3043]">
            GlowUp
          </span>
        </div>
        <Button
          variant="ghost"
          className="text-sm text-pink-400 hover:text-pink-500 hover:bg-pink-50 rounded-full"
          onClick={() => navigate("/auth")}
        >
          {t("signIn")}
        </Button>
      </nav>

      {/* ========== HERO ========== */}
      <section className="relative px-6 pt-12 pb-20 max-w-6xl mx-auto">
        {/* Decorative blobs */}
        <div className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full bg-pink-200/30 blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] rounded-full bg-purple-200/30 blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left text */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ duration: 0.7 }}
            className="flex-1 text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="inline-flex items-center gap-2 bg-pink-50 border border-pink-100 rounded-full px-4 py-1.5 mb-6"
            >
              <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
              <span className="text-xs font-medium text-pink-500">
                {t("heroTagline")}
              </span>
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-[#3f3043]">
              {t("heroTitle1")}
              <br />
              <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-purple-400 bg-clip-text text-transparent">
                {t("heroTitle2")}
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-gray-400 max-w-md leading-relaxed mx-auto lg:mx-0">
              {t("heroDesc")}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button
                size="lg"
                className="px-8 h-13 text-sm font-semibold rounded-2xl glowup-gradient border-0 shadow-lg shadow-pink-200/40 hover:shadow-xl transition-shadow text-white"
                onClick={() => navigate("/auth")}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {t("heroCTA")}
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 h-13 text-sm font-medium rounded-2xl border-pink-200 text-pink-500 hover:bg-pink-50"
                onClick={() => {
                  document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {t("heroSecondary")}
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="mt-10 flex items-center gap-6 justify-center lg:justify-start">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-300 to-fuchsia-300 border-2 border-white shadow-sm"
                  />
                ))}
              </div>
              <p className="text-xs text-gray-400">
                <span className="font-semibold text-[#3f3043]">2,500+</span>{" "}
                {t("heroTrust")}
              </p>
            </div>
          </motion.div>

          {/* Right — Phone mockup */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex-shrink-0"
          >
            <div className="relative w-[260px] sm:w-[280px]">
              <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-pink-200/50 p-3 pt-6 border border-pink-50">
                {/* Status bar */}
                <div className="flex items-center justify-between px-5 mb-4">
                  <span className="text-[10px] font-semibold text-gray-800">9:41</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-2 bg-gray-800 rounded-sm" />
                    <div className="w-3 h-2 bg-gray-800 rounded-sm" />
                    <div className="w-4 h-2 bg-gray-800 rounded-sm" />
                  </div>
                </div>

                {/* Chat preview */}
                <div className="mx-1 rounded-2xl overflow-hidden bg-[#fdf2f8] p-3 space-y-2.5">
                  <div className="text-center mb-3">
                    <div className="w-12 h-12 rounded-full glowup-gradient mx-auto flex items-center justify-center">
                      <Heart className="w-5 h-5 text-white fill-white" />
                    </div>
                    <p className="mt-2 text-xs font-bold text-[#3f3043]">Mon amour ❤️</p>
                    <p className="text-[10px] text-green-400">● Online</p>
                  </div>

                  {/* Message bubbles */}
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-bl-md px-3 py-2 border border-pink-50 max-w-[80%]">
                      <p className="text-[11px] text-[#3f3043]">Tu me manques 💕</p>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-gradient-to-r from-pink-400 to-fuchsia-400 rounded-2xl rounded-br-md px-3 py-2 max-w-[80%] shadow-sm">
                      <p className="text-[11px] text-white">Moi aussi, toujours ❤️</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-bl-md px-3 py-2 border border-pink-50 max-w-[80%]">
                      <p className="text-[11px] text-[#3f3043]">📸 Photo</p>
                    </div>
                  </div>
                </div>

                {/* Bottom nav */}
                <div className="flex justify-around items-center py-3 mt-1">
                  <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                  <MessageCircle className="w-5 h-5 text-gray-300" />
                  <div className="w-9 h-9 rounded-full glowup-gradient flex items-center justify-center -mt-4 shadow-md shadow-pink-200/40">
                    <Heart className="w-4 h-4 text-white fill-white" />
                  </div>
                  <ImageIcon className="w-5 h-5 text-gray-300" />
                  <Star className="w-5 h-5 text-gray-300" />
                </div>
              </div>

              {/* Floating heart notification */}
              <motion.div
                animate={{ y: [-5, 5, -5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-6 bg-white rounded-2xl shadow-lg shadow-pink-200/40 px-4 py-2.5 flex items-center gap-2 border border-pink-50"
              >
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-800">{t("notifTitle")}</p>
                  <p className="text-[9px] text-gray-400">{t("notifDesc")}</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section id="features" className="px-6 py-20 max-w-5xl mx-auto">
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="text-xs uppercase tracking-[0.2em] text-pink-400 font-semibold mb-4 text-center"
        >
          {t("featuresTagline")}
        </motion.p>
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl sm:text-3xl font-extrabold text-[#3f3043] text-center mb-12"
        >
          {t("featuresTitle")}
        </motion.h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: MessageCircle,
              title: t("featMessages"),
              desc: t("featMessagesDesc"),
              color: "bg-pink-50 text-pink-500",
            },
            {
              icon: ImageIcon,
              title: t("featPhotos"),
              desc: t("featPhotosDesc"),
              color: "bg-purple-50 text-purple-500",
            },
            {
              icon: Film,
              title: t("featVideos"),
              desc: t("featVideosDesc"),
              color: "bg-fuchsia-50 text-fuchsia-500",
            },
            {
              icon: Crown,
              title: t("featGames"),
              desc: t("featGamesDesc"),
              color: "bg-amber-50 text-amber-500",
            },
            {
              icon: Lock,
              title: t("featPrivate"),
              desc: t("featPrivateDesc"),
              color: "bg-green-50 text-green-500",
            },
            {
              icon: Heart,
              title: t("featMemories"),
              desc: t("featMemoriesDesc"),
              color: "bg-rose-50 text-rose-500",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-pink-50 hover:shadow-md transition-shadow"
            >
              <div
                className={`w-11 h-11 rounded-2xl ${item.color} flex items-center justify-center mb-3`}
              >
                <item.icon className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-gray-800">{item.title}</p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========== MEMORIES PREVIEW ========== */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="text-xs uppercase tracking-[0.2em] text-pink-400 font-semibold mb-4 text-center"
        >
          {t("galleryTagline")}
        </motion.p>
        <motion.h2
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-2xl sm:text-3xl font-extrabold text-[#3f3043] text-center mb-10"
        >
          {t("galleryTitle")}
        </motion.h2>

        {/* Gallery grid mockup */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-3 gap-3 max-w-md mx-auto"
        >
          {[
            { gradient: "from-pink-300 to-fuchsia-300", icon: "📸", label: "Our trip" },
            { gradient: "from-purple-300 to-pink-300", icon: "🎥", label: "Sunset" },
            { gradient: "from-fuchsia-300 to-rose-300", icon: "📸", label: "Date night" },
            { gradient: "from-rose-300 to-pink-300", icon: "📸", label: "Beach" },
            { gradient: "from-pink-400 to-purple-400", icon: "❤️", label: "Anniversary" },
            { gradient: "from-purple-300 to-fuchsia-300", icon: "🎥", label: "First date" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className={`aspect-square rounded-2xl bg-gradient-to-br ${item.gradient} flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-[10px] text-white font-medium">{item.label}</span>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center text-sm text-gray-400 mt-8 max-w-sm mx-auto"
        >
          {t("galleryDesc")}
        </motion.p>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="px-6 py-20 max-w-5xl mx-auto">
        <motion.p
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.5 }}
          className="text-xs uppercase tracking-[0.2em] text-pink-400 font-semibold mb-10 text-center"
        >
          {t("howTagline")}
        </motion.p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: t("step1Title"),
              text: t("step1Desc"),
            },
            {
              step: "02",
              title: t("step2Title"),
              text: t("step2Desc"),
            },
            {
              step: "03",
              title: t("step3Title"),
              text: t("step3Desc"),
            },
          ].map((item, i) => (
            <motion.div
              key={item.step}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ duration: 0.4, delay: i * 0.12 }}
              className="text-center"
            >
              <div className="w-12 h-12 rounded-2xl glowup-gradient flex items-center justify-center mx-auto text-white text-sm font-bold shadow-md shadow-pink-200/40">
                {item.step}
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-800">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed max-w-[220px] mx-auto">
                {item.text}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="px-6 py-16 max-w-3xl mx-auto text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-br from-[#f472b6] via-[#ec4899] to-[#e879a6] rounded-3xl p-10 sm:p-14 text-white shadow-xl shadow-pink-200/40"
        >
          <Heart className="w-10 h-10 text-white/80 fill-white/80 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-extrabold">{t("ctaTitle")}</h2>
          <p className="mt-3 text-sm text-white/70 max-w-sm mx-auto">{t("ctaDesc")}</p>
          <div className="mt-8">
            <Button
              size="lg"
              className="px-8 h-13 text-sm font-semibold rounded-2xl bg-white text-pink-500 hover:bg-white/90 shadow-lg shadow-pink-600/20"
              onClick={() => navigate("/auth")}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {t("ctaButton")}
            </Button>
          </div>
        </motion.div>
      </section>

      {/* ========== FOOTER ========== */}
      <div className="max-w-5xl mx-auto px-6">
        <div className="border-t border-pink-200/50" />
      </div>
      <footer className="px-6 py-10 max-w-5xl mx-auto">
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
            <span className="text-base font-bold text-gray-700">GlowUp</span>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-400">
            <a href="#" className="hover:text-pink-500 transition-colors">
              {t("termsAndConditions")}
            </a>
            <a href="#" className="hover:text-pink-500 transition-colors">
              {t("privacyPolicy")}
            </a>
            <a href="#" className="hover:text-pink-500 transition-colors">
              {t("aboutUs")}
            </a>
          </div>

          {/* Copyright */}
          <p className="text-[11px] text-gray-300">
            © 2026 GlowUp. Made with 💕 for couples far apart.
          </p>
        </div>
      </footer>
    </div>
  );
}
