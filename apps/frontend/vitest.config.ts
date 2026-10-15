import { getViteConfig } from "astro/config";

// Astro's Vite config, so tests can render the pages through the Container API.
// tests/ holds the Nomia block tests, which run on node:test (pnpm test:blocks).
export default getViteConfig({
  test: { exclude: ["**/node_modules/**", "**/.git/**", "tests/**"] },
});
