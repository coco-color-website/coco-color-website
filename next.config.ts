import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // sql.js 是 UMD 模块，在 Next.js server bundle 中会出现
  // "Cannot set properties of undefined (setting 'exports')" 错误。
  // 标记为 external 后由 Node.js 直接 require，避免打包问题。
  serverExternalPackages: ["sql.js"],
};

export default nextConfig;
