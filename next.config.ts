import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 容器化部署:输出自包含 standalone(server.js + 最小 node_modules),镜像最小
  output: "standalone",
};

export default nextConfig;
