# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`pointvpn-api` is a NestJS 12 HTTP API (Express platform) backed by PostgreSQL via TypeORM 1.x. `src/main.ts` bootstraps the root `AppModule`, which wires the global `ConfigModule`, the TypeORM connection and the feature modules. `main.ts` also installs a global `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`, `transform`), so request DTOs are class-validator classes and unknown body fields are rejected with 400.

## Auth

- Email + password, no email verification. `POST /auth/sign-up` (201) and `POST /auth/sign-in` (200) both return `{ accessToken }`; `GET /auth/me` returns the current user.
- Access tokens are HS256 JWTs signed with `JWT_SECRET`, payload `{ sub: userId }`, valid for 365 days. There are no refresh tokens and no revocation.
- `JwtModule` is registered **globally** in `AuthModule`, so `JwtAuthGuard` (`src/common/guards/`) works in any module. Protect a route with `@UseGuards(JwtAuthGuard)` and read the id with `@CurrentUserId()` (`src/common/decorators/`).
- Passwords are hashed with `bcryptjs` (pure JS; native `bcrypt` would need install scripts, which npm blocks here). `User.password` is `select: false`: load it only through `UsersService.findByEmailWithPassword`.
- Emails are trimmed and lowercased in the DTOs before lookup and storage.

## Nodes

`Node` (`src/modules/nodes/`) is a VPN server. `host` is what clients connect to; `apiUrl` + `apiKey` are for server-to-node management calls and must never be returned to clients (`apiKey` is `select: false`). `GET /nodes` (JWT required) returns only `id`, `name`, `host`, `region`. There is no create/update API: nodes are inserted directly into the `nodes` table.

## VPN

`src/modules/vpn/` provisions peers on nodes. Routes (JWT required): `POST /connect/:nodeId` → 200 with the node's connect payload **re-returned unchanged**; `POST /disconnect/:nodeId` → 204.

- `NodeApiClient` calls the node's management API: `POST {apiUrl}/peers` (no body) creates a peer and `DELETE {apiUrl}/peers/:publicKey` (URL-encoded, since base64 keys contain `+`, `/`, `=`) removes it, both with the `x-api-key` header. The node also exposes `GET /peers`, which nothing uses yet. Network errors, timeouts (10s) and non-2xx responses become `502`; details are logged, never sent to the client.
- `VpnConnection` (`vpn_connections`) stores the peer `publicKey`/`address` per user per node (unique on `userId, nodeId`); it's the only way disconnect knows which peer to remove. Connecting again to the same node removes the old peer on the node first, then upserts the row.
- The node payload contains the client's WireGuard private key; it is passed through but never stored.

## Layout

- `src/common/` — cross-cutting Nest building blocks: `decorators/`, `guards/`, `pipes/`.
- `src/modules/` — feature modules (e.g. `users/`), each with its own `*.module.ts` and `entities/`. Register new modules in `AppModule.imports`.
- `src/shared/config/` — configuration. `database.config.ts` builds the TypeORM `DataSourceOptions` from env and creates the `DataSource`; `AppModule` feeds both into `TypeOrmModule.forRootAsync` (`useFactory` + `dataSourceFactory`).

## Database

- **Naming**: camelCase in code, snake_case in the DB, handled globally by the custom `SnakeNamingStrategy` (`src/shared/config/snake-naming.strategy.ts`). Don't hand-write `name:` options on columns just to get snake_case; table names default to the snake_cased class name unless given in `@Entity('...')` (e.g. `User` → `users`).
- **Schema**: `synchronize: true`, no migrations. The schema follows the entities automatically on startup, so renaming or removing a property drops that column's data.
- **Entities** are picked up via `autoLoadEntities`: an entity is only registered if some module includes it in `TypeOrmModule.forFeature([...])`.
- Required env (see `.env.example`): `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`.

## Commands

```bash
npm run start:dev      # watch mode (nest start --watch)
npm run build          # nest build -> dist/ (output dir is wiped first)
npm run start:prod     # node dist/main
npm run lint           # oxlint --type-aware over src/ and test/
npm run format         # prettier on src/ and test/
npm test               # vitest unit tests (**/*.spec.ts)
npm run test:e2e       # vitest e2e tests (**/*.e2e-spec.ts)
npm run test:cov       # unit tests with v8 coverage

npx vitest run src/path/to/file.spec.ts   # one test file
npx vitest run -t "test name"             # tests matching a name
```

No test files exist yet. Vitest runs with `globals: true`, so `describe`/`it`/`expect` need no import. The `vitest/globals` types are already in tsconfig.

## Conventions and gotchas

- **ESM with NodeNext resolution** (`"type": "module"`, `module: nodenext`): relative imports must use the `.js` extension even in `.ts` files (e.g. `import { AppModule } from './app.module.js'`). `main.ts` relies on top-level `await`.
- **Configuration**: `ConfigModule.forRoot({ isGlobal: true })` loads `.env`, so `ConfigService` can be injected anywhere without importing `ConfigModule`. `PORT`, `JWT_SECRET` and the `DB_*` vars are read with `getOrThrow`, so the app won't start if any are missing.
- **Lint** is oxlint, not ESLint. `no-explicit-any` is off. `no-floating-promises` is an error, so every promise must be awaited or handled.
- **Formatting**: Prettier with single quotes and trailing commas.
- `tsconfig.build.json` excludes `*spec.ts` and `test/` from the build. `strictPropertyInitialization` is off, so DI-injected class properties don't need initializers.
