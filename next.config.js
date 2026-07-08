const nextConfig = {
    output: "standalone",
    eslint: {
        ignoreDuringBuilds: true,
    },
    reactStrictMode: false,
    allowedDevOrigins: ["*.space-z.ai"],
};
export default nextConfig;
