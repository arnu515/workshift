import { GrantConfig } from 'grant';

export const grantConfig: GrantConfig = {
  defaults: {
    origin: process.env.SELF_URL!,
    transport: 'session',
    callback: '/auth/callback',
  },
  github: {
    response: ['tokens', 'profile'],
    key: process.env.AUTH_GITHUB_ID!,
    secret: process.env.AUTH_GITHUB_SECRET!,
    scope: ['read:user', 'user:email'],
  },
  discord: {
    response: ['tokens', 'profile'],
    key: process.env.AUTH_DISCORD_ID!,
    secret: process.env.AUTH_DISCORD_SECRET!,
    scope: ['identify', 'email'],
  },
};
