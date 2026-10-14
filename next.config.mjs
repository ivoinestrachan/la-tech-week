/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // We keep a package-lock.json in this dir; pin the tracing root to avoid
  // Next.js picking up an unrelated lockfile in the home directory.
  outputFileTracingRoot: import.meta.dirname,
};

export default nextConfig;
