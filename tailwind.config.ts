import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#18212f",
        muted: "#667085",
        line: "#d8dee8",
        opsblue: "#255f9f",
        opsnavy: "#17212f",
        opsgreen: "#1f7a5b",
        opsamber: "#a35f00",
        opsred: "#b42318"
      },
      boxShadow: {
        ops: "0 16px 40px rgba(28, 39, 52, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
