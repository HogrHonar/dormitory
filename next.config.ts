import { withSentryConfig } from "@sentry/nextjs";
import withPWA from "next-pwa";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@react-pdf/renderer"],
  allowedDevOrigins: ["dorm.btvi.edu.iq"],
};

// Compose PWA first, then Sentry
const withPWAConfig = withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: "NetworkFirst",
      options: {
        cacheName: "offlineCache",
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
});

const sentryConfig = {
  org: "btvi",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  automaticVercelMonitors: true,
  removeDebugLogging: true,
};

// Export composed config: Sentry wraps PWA wraps NextConfig
export default withSentryConfig(withPWAConfig(nextConfig), sentryConfig);
