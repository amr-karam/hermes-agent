import { defineConfig } from "vitest/config";
import babel from "@rolldown/plugin-babel";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";

/** Same component/hook-scoped compiler preset as vite.config.ts. */
function compilerPreset() {
  const preset = reactCompilerPreset();
  preset.rolldown.filter.code = /\/>|<\/|from\s*['"][^'"]*react/;
  return preset;
}
import path from "path";

export default defineConfig({
  plugins: [react(), babel({ presets: [compilerPreset()] })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    // The first test in a file pays env init + full module transform, and page
    // suites (SessionsPage) legitimately run 3.5-4.5s on green CI runners —
    // right against vitest's 5s default, so a loaded runner tips them into a
    // timeout (main run 34600757569: 5079ms). Same headroom rationale as
    // apps/desktop/vitest.config.ts; genuinely hung tests still fail.
    testTimeout: 15_000,
    // Vitest defaults to (cores - 1) workers, which oversubscribes this suite
    // badly: every worker re-transforms a large component graph, so extra forks
    // buy contention, not throughput. Measured on an 8-core box:
    // 7 workers -> 695s and 34 failures (pool could not even fork workers);
    // 4 workers ->  76s, 1 flaky file;
    // 2 workers ->  76s, 356/356 green.
    // 2 and 4 take the same wall clock, so the default only added thrash.
    // Override on a runner with cores to spare.
    maxWorkers: Number(process.env.VITEST_MAX_WORKERS ?? 2),
  },
});
