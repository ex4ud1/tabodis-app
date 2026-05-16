/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "jifmdnjdlmlsdzfdnxwz.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    // CSP is shipped in Report-Only mode so we can observe violations before
    // enforcing. Switch the header name to `Content-Security-Policy` once the
    // report stream is clean. `'unsafe-inline'` is required by Next.js for
    // styled-jsx/runtime scripts.
    const csp = [
      "default-src 'self'",
      "img-src 'self' data: https://jifmdnjdlmlsdzfdnxwz.supabase.co",
      "font-src 'self' data: https://fonts.gstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com https://www.clarity.ms",
      "connect-src 'self' https://*.supabase.co https://vitals.vercel-insights.com https://www.clarity.ms",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          { key: "Content-Security-Policy-Report-Only", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
