import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Override webpack config for transformers.js WASM
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "sharp$": false,
      "onnxruntime-node$": false,
    }
    return config;
  },
};

export default nextConfig;
