const withBundleAnalyzer = require('@next/bundle-analyzer')({
      enabled: process.env.ANALYZE === 'true',
      openAnalyzer: false,
      analyzerMode: 'json',
      analyzerPort: 'auto',
      generateStatsFile: true,
      statsFilename: process.env.ANALYZE_OUTPUT || 'stats.json',
    });

module.exports = withBundleAnalyzer({
  output: 'standalone',
  images: {
    formats: ['image/webp', 'image/avif'],
  },
});
