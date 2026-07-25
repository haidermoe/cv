import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS || false;

const nextConfig: NextConfig = {
  output: "export",
  basePath: isGithubActions ? "/cv" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
