import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  { ignores: [".next/**", "out/**", "src/fe-news/**", "next-env.d.ts"] }
];

export default config;
