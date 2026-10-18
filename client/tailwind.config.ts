import type { Config } from "tailwindcss";
import { createThemes } from "tw-colors";
import colors from "tailwindcss/colors";

const baseColors = [
  "gray",
  "red",
  "yellow",
  "green",
  "blue",
  "indigo",
  "purple",
  "pink",
];

// Standard light palette mapping
const lightMapping = {
  "50": "50",
  "100": "100",
  "200": "200",
  "300": "300",
  "400": "400",
  "500": "500",
  "600": "600",
  "700": "700",
  "800": "800",
  "900": "900",
  "950": "950",
};

// ZAPR Obsidian Dark Mapping (Neutral / Zinc based, eliminating blue slate tints)
const darkGrayMapping = {
  "50": "900",  // Cards and surface containers become deep matte surfaces
  "100": "800", // Badges & secondary pills
  "200": "700", // Subtle border strokes
  "300": "600", // Separators and dividers
  "400": "400", // Balanced secondary text
  "500": "400", // Muted icons
  "600": "300", // Clear secondary labels
  "700": "200", // High readability text
  "800": "100", // Prominent headings
  "900": "50",  // Pure high-contrast typography
  "950": "50",
};

// Accent colors in dark mode: preserves vibrancy against obsidian surfaces
const darkAccentMapping = {
  "50": "950",
  "100": "900",
  "200": "800",
  "300": "700",
  "400": "500",
  "500": "500",
  "600": "400",
  "700": "300",
  "800": "200",
  "900": "100",
  "950": "50",
};

const generateThemeObject = (isDark = false) => {
  const theme: Record<string, Record<string, string>> = {};

  baseColors.forEach((color) => {
    theme[color] = {};
    const mapping = isDark
      ? color === "gray"
        ? darkGrayMapping
        : darkAccentMapping
      : lightMapping;

    // Use neutral grays instead of slate to ensure obsidian fidelity
    const sourcePalette =
      color === "gray" ? (colors as any).neutral : (colors as any)[color];

    Object.entries(mapping).forEach(([targetShade, sourceShade]) => {
      theme[color][targetShade] = sourcePalette[sourceShade];
    });
  });

  return theme;
};

// ZAPR Brand Theme Definition
const themes = {
  light: {
    ...generateThemeObject(false),
    white: "#FFFFFF",
    black: "#141414",
    // ZAPR Core Tokens
    zapr: {
      lime: "#CDDC3C",
      obsidian: "#141414",
      surface: "#FFFFFF",
      canvas: "#F9FAFB",
      border: "#E5E7EB",
      text: "#141414",
      muted: "#71717A",
    },
  },
  dark: {
    ...generateThemeObject(true),
    // Replaced blue slate-900 with pure ZAPR Obsidian
    white: "#141414",
    black: "#FFFFFF",
    // ZAPR Core Tokens
    zapr: {
      lime: "#CDDC3C",
      obsidian: "#141414",
      surface: "#141414",
      canvas: "#0E0E0E",
      border: "#242424",
      text: "#FFFFFF",
      muted: "#A1A1AA",
    },
  },
};

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./(components)/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Direct Tailwind utility access (e.g. bg-zapr-lime, text-zapr-obsidian)
        "zapr-lime": "#CDDC3C",
        "zapr-obsidian": "#141414",
        "zapr-surface": "#1E1E1E",
        "zapr-border": "#282828",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [createThemes(themes)],
};

export default config;