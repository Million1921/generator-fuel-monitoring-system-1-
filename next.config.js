/** @type {import('next').NextConfig} */
const nextConfig = {
  // Explicitly set the Turbopack root to the project directory (where package.json lives)
  turboPack: {
    root: __dirname,
  },
  // You can add other Next.js options here as needed
};

module.exports = nextConfig;
