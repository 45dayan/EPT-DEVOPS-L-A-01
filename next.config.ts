import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for the production image in the assignment Dockerfile.
  // `node server.js` runs the traced standalone server — do not remove this.
  output: "standalone",
  // Keep the `pg` driver external so the Docker trace includes the real package.
  serverExternalPackages: ["pg"],
};

export default nextConfig;
