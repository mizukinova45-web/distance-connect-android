import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.glowup.app",
  appName: "GlowUp",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;
