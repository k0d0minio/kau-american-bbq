// Tailwind CSS v4 runs as a PostCSS plugin. Without this file Next uses its
// default CSS pipeline: `@import "tailwindcss"` in app/globals.css still
// resolves to the package's stylesheet (so the `@theme` variables and
// preflight land), but the engine never runs, so no utility classes are
// generated and every `class="flex bg-bone …"` in the app does nothing.
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
