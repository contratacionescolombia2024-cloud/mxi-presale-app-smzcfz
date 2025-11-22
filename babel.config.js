
module.exports = function (api) {
  api.cache(true);

  const EDITABLE_COMPONENTS =
    process.env.EXPO_PUBLIC_ENABLE_EDIT_MODE === "TRUE" &&
    process.env.NODE_ENV === "development"
      ? [
          ["./babel-plugins/editable-elements.js", {}],
          ["./babel-plugins/inject-source-location.js", {}],
        ]
      : [];

  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // Module resolver should come first
      [
        "module-resolver",
        {
          root: ["./"],
          extensions: [
            ".web.ts",
            ".web.tsx",
            ".ios.ts",
            ".android.ts",
            ".native.ts",
            ".ts",
            ".ios.tsx",
            ".android.tsx",
            ".native.tsx",
            ".tsx",
            ".jsx",
            ".js",
            ".json",
          ],
          alias: {
            "@": "./",
            "@components": "./components",
            "@style": "./style",
            "@hooks": "./hooks",
            "@types": "./types",
            "@contexts": "./contexts",
          },
        },
      ],
      // Export namespace plugin
      "@babel/plugin-proposal-export-namespace-from",
      // Editable components (dev only)
      ...EDITABLE_COMPONENTS,
    ],
  };
};
