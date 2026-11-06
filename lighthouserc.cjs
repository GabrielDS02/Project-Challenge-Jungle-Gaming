module.exports = {
  ci: {
    collect: {
      startServerCommand: "pnpm preview --host 127.0.0.1",
      startServerReadyPattern: "Local",
      url: ["http://127.0.0.1:4173/", "http://127.0.0.1:4173/nfts/emerald-ape-442"],
      numberOfRuns: 3,
      settings: { chromeFlags: "--headless --no-sandbox", preset: "desktop" },
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.9 }],
        "categories:accessibility": ["error", { minScore: 0.95 }],
        "categories:best-practices": ["error", { minScore: 0.95 }],
        "categories:seo": ["error", { minScore: 0.9 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        "total-blocking-time": ["error", { maxNumericValue: 300 }],
      },
    },
    upload: { target: "filesystem", outputDir: "./reports/lighthouse" },
  },
};
