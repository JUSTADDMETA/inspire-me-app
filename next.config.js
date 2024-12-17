const withPWA = require('next-pwa')({
    dest: 'public',
    register: true,
    skipWaiting: true,
  });

  /** @type {import('next').NextConfig} */
  const nextConfig = {
    // Weitere Next.js-Konfigurationen hier einfügen
  };

  module.exports = withPWA(nextConfig);
