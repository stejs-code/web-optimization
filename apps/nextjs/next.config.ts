import type { NextConfig } from 'next';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    formats: ['image/webp', 'image/avif'],
  },

  webpack: (config, { isServer }) => {
    // Only analyze client-side bundle
    if (process.env.ANALYZE === 'true' && !isServer) {
      config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'json',
            openAnalyzer: false,
            reportFilename: process.env.ANALYZE_OUTPUT || './analyze/client.json',
            generateStatsFile: false,
          })
      );
    }
    return config;
  },
};

export default nextConfig;
