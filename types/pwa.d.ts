/// <reference types="next-pwa" />

declare module "next-pwa" {
  import { NextConfig } from "next";

  type PWAConfig = {
    dest: string;
    register?: boolean;
    skipWaiting?: boolean;
    disable?: boolean;
    runtimeCaching?: Array<{
      urlPattern: RegExp | string;
      handler: string;
      options?: Record<string, unknown>;
    }>;
  };

  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;

  export default withPWA;
}
