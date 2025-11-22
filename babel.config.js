
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
      "@babel/plugin-proposal-export-namespace-from",
      [
        "module-resolver",
        {
          root: ["./"],
          extensions: [
            ".native.ts",
            ".native.tsx",
            ".ios.ts",
            ".ios.tsx",
            ".android.ts",
            ".android.tsx",
            ".web.ts",
            ".web.tsx",
            ".ts",
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
      ...EDITABLE_COMPONENTS,
    ],
  };
};
