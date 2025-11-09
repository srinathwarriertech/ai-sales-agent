const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval' https://deciding-giraffe-15.clerk.accounts.dev https://challenges.cloudflare.com;
  connect-src 'self' https://deciding-giraffe-15.clerk.accounts.dev;
  img-src 'self' https://img.clerk.com;
  worker-src 'self' blob:;
  style-src 'self' 'unsafe-inline';
  frame-src 'self' https://challenges.cloudflare.com;
  form-action 'self';
`

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader.replace(/\n/g, ''),
          },
        ]
      },
    ]
  },
}

module.exports = nextConfig

