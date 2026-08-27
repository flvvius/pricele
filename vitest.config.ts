import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    // Both extensions. The pattern was .ts only, so a component test written
    // as .tsx was collected by nothing and reported as neither passing nor
    // failing — the worst of the three outcomes.
    include: ["**/*.test.{ts,tsx}"],
  },
});
