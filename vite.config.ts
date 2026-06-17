import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";
import { defineConfig } from "vitest/config";

const basePath = process.env.BASE_PATH ?? "";

export default defineConfig({
  plugins: [
    tailwindcss(),
    sveltekit(),
    SvelteKitPWA({
      registerType: "autoUpdate",
      kit: {
        base: basePath || "/",
        adapterFallback: basePath ? `${basePath}/` : "/",
        trailingSlash: "always",
      },
      manifest: {
        name: "Hulk",
        short_name: "Hulk",
        description: "Track daily protein intake",
        theme_color: "#09090b",
        background_color: "#09090b",
        display: "standalone",
        start_url: basePath ? `${basePath}/` : "/",
      },
    }),
  ],
  define: {
    global: "globalThis",
  },
  test: {
    expect: { requireAssertions: true },
    projects: [
      {
        extends: "./vite.config.ts",
        test: {
          name: "server",
          environment: "node",
          include: ["src/lib/**/*.{test,spec}.{js,ts}"],
          exclude: ["src/routes/**/*"],
        },
      },
      {
        extends: "./vite.config.ts",
        resolve: {
          conditions: ["browser"],
        },
        test: {
          name: "client",
          environment: "jsdom",
          include: ["src/routes/**/*.test.{js,ts}"],
          exclude: ["src/**/*.e2e.test.{js,ts}"],
          setupFiles: ["src/test-setup.ts"],
        },
      },
      {
        extends: "./vite.config.ts",
        resolve: {
          conditions: ["browser"],
        },
        test: {
          name: "e2e",
          environment: "jsdom",
          include: ["src/**/*.e2e.test.{js,ts}"],
          setupFiles: ["src/test-setup.ts"],
        },
      },
    ],
  },
});
