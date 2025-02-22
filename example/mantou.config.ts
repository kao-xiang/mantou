import type { PartialServerOptions } from "mantou/types"

export default {
  swagger: {
    path: '/docs',
    documentation: {
      info: {
        title: 'Mantou Example',
        description: 'Mantou Example API',
        version: '1.0.0',
      },
      security: [{ JwtAuth: [] }],
      components: {
        securitySchemes: {
          JwtAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "Enter JWT Bearer token **_only_**",
          },
        },
      },
    }
  },
  plugins: []
} as PartialServerOptions