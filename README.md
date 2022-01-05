# Workshift - The all-in-one app for organisations (BETA)

Worshift is an application for organisations that provides realtime communications. It was built for a hackathon and is currently in beta.

Hosted demo: <https://workshift.gq>

> P.S.: The demo will be slow because the backend is hosted on a $6 [DigitalOcean droplet](https://m.do.co/c/371591aa3027)

## Host the app yourself

### Prerequisites

You will need:
- A server to host. Get $100 credit on digitalocean by signing up using [this link](https://m.do.co/c/371591aa3027).
- A [MongoDB Realm Application](https://realm.mongodb.com) connected to a [MongoDB Atlas Cluster](https://cloud.mongodb.com).
- A [Pusher](https://pusher.com) application for realtime support.
- A [Backblaze](https://backblaze.com) B2 Storage bucket, or any AWS S3 compatible bucket for file storage
- Optionally: A [Github OAuth App](https://github.com/settings/developers) and a [Discord app](https://discord.com/developers/applications) for OAuth.
- [NodeJS](https://nodejs.org) version 14 or higher, and `yarn` and `lerna` commands installed globally using `sudo npm i -g yarn lerna`.

### Host locally

> A [Docker Image](https://hub.docker.com/r/arnu515/workshift-backend) is provided for the backend. The frontend can be built and hosted with NGINX or a static website host like [Vercel](https://vercel.com) or [Netlify](https://netlify.com).

1. Copy the `.env.example` files in both the `packages/app` and `packages/backend` folders to `.env` in their respective folders and fill out the environment variables.

2. Next, install packages by running `lerna bootstrap` in the root folder.

3. Build the frontend by running `yarn build` in `packages/app`, and build the backend by running `yarn build` in `packages/backend`.

4. You should now have a `dist` folder in both directories. The frontend's `dist` folder can be hosted on its own using any static host or NGINX. The backend's `dist` folder requires `node_modules`, so you can run `yarn start:prod` in the `packages/backend` folder, or use the Docker image for a better experience.

## How it is hosted

The [frontend](https://app.workshift.gq) and the [landing page](https://workshift.gq) are hosted on [Vercel](https://vercel.com). The backend is hosted manually on a [$6 DigitalOcean Droplet](https://m.do.co/c/371591aa3027) with [Dokku](https://dokku.com).

The domain `workshift.gq` was provided for free by [Freenom](https://freenom.com).

## Tech stack

### `packages/app`

> The frontend (hosted at <https://app.workshift.gq>)

- **Framework**: [SvelteJS](https://svelte.dev) with [Vite](https://vitejs.dev) as the build tool and [Typescript](https://typescriptlang.org).
- **Styling**: [TailwindCSS](https://tailwindcss.com) with [PostCSS](https://postcss.org) with `autoprefixer` and `cssnano` plugins.
- **Icons**: [HeroIcons](https://heroicons.com).
- **DevTools**: `eslint` and `prettier`.
- **Dependencies**:
  - `axios` for requests
  - `class-validator` for validation
  - `dayjs` for date formatting
  - `pusherjs` for realtime
  - `qs` for parsing query strings
  - `svelte-navigator` for routing

### `packages/backend`

> The backend (hosted at <https://api.workshift.gq>)

- **Framework**: [NestJS](https://nestjs.com) with [Typescript](https://typescriptlang.org)
- **ORM**: [Prisma](https://prisma.io) for structured data and `mongodb` official connector for other queries.
- **DevTools**: `eslint` and `prettier`.
- **Dependencies**:
  - `aws-sdk` for interacting with B2.
  - `axios` for requests.
  - `bcryptjs` for hashing passwords.
  - `class-validator` and `class-transformer` for validation.
  - `express-session` and `connect-mongo` for sessions.
  - `nanoid` for generating unique IDs.
  - `pusher` for realtime.
  - `sanitize-html` for cleaning html.
  - `slugify` for cleaning file names.
  - Various dependencies provided by `@nestjs`.

### `packages/landing`

> The landing page (hosted at <https://workshift.gq>)

- **Framework**: HTML
- **Styling**: [TailwindCSS](https://tailwindcss.com) with [PostCSS](https://postcss.org)
- **DevTools**: Gulp with plugins

## LICENSE

This project is licensed under the `Apache-2.0` license. Please see [LICENSE](https://github.com/arnu515/workshift/blob/master/LICENSE).
