/** @type {import('next').NextConfig} */

// Public host that serves uploaded images. In production this is your R2/S3 public
// domain (e.g. pub-xxxx.r2.dev). Set NEXT_PUBLIC_UPLOADS_HOST on Vercel to match S3_PUBLIC_URL.
const uploadsHost = process.env.NEXT_PUBLIC_UPLOADS_HOST;

const remotePatterns = [
  // Local backend during development
  { protocol: 'http', hostname: 'localhost', port: '5001' },
];

if (uploadsHost) {
  try {
    const { protocol, hostname } = new URL(uploadsHost);
    remotePatterns.push({
      protocol: protocol.replace(':', ''),
      hostname,
    });
  } catch {
    // Ignore malformed value — falls back to same-origin /uploads rewrite.
  }
}

const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns,
  },
  async rewrites() {
    // Default to the production Railway backend when NEXT_PUBLIC_API_URL isn't set.
    // Override via env for local dev (http://localhost:5001) or a different backend.
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || 'https://c2027-backend-production.up.railway.app';
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${apiUrl}/uploads/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
