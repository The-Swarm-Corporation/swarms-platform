module.exports = {
    async rewrites() {
      return [
        {
          source: '/api/dev-llm/v1/:path*',
          destination: 'http://199.204.135.66:8000/v1/:path*',
        },
      ]
    },
  }