# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Cross-agent instructions and scoped folder rules live in [AGENTS.md](./AGENTS.md) and per-folder `AGENTS.md` files. Read the nearest one before editing files in a subdirectory.

## Package Manager

This is a **Yarn** project (lockfile is `yarn.lock`). Use `yarn` rather than `npm`, even though CONTRIBUTING.md shows npm examples.

## Common Commands

- `yarn build` — Parcel production build (entry `src/index.ts` → `dist/zwave-card-set.js`)
- `yarn watch` — Parcel watch mode for development
- `yarn test` — Mocha test suite (uses `tsconfig.test.json` via `TS_NODE_PROJECT`)
- `yarn test:watch` — Mocha in watch mode
- `yarn test:coverage` — NYC/Istanbul coverage
- `yarn format` — Prettier (with import-sort plugins)
- `yarn update` — `npm-check-updates -u` then `yarn install`

Run a single test file:

```bash
TS_NODE_PROJECT='./tsconfig.test.json' npx mocha test/path/to/file.spec.ts
```

Mocha config ([.mocharc.json](.mocharc.json)) registers `ts-node`, `tsconfig-paths`, and `mocha.setup.ts`; the spec glob is `test/**/*.spec.ts`.

## What This Repo Is

A set of **Home Assistant custom dashboard cards for Z-Wave devices**, built with **Lit 3** + TypeScript and bundled as a single ES module via **Parcel 2**. Installed in HA via HACS or as a Lovelace resource (`/local/community/zwave-card-set/zwave-card-set.js`).

Four cards are registered as custom elements in [src/index.ts](src/index.ts):

- `zwave-device` — Z-Wave Device Info ([src/cards/node-info/](src/cards/node-info/))
- `zwave-controller` — Hub/Controller Info ([src/cards/controller-info/](src/cards/controller-info/))
- `zwave-device-center` — Device Center, all devices in one view ([src/cards/device-center/](src/cards/device-center/))
- `zwave-nodes-status` — Nodes status list ([src/cards/node-states/](src/cards/node-states/))

Plus shared elements `basic-editor` and `battery-indicator` from [src/common/](src/common/). Each card is also pushed onto `window.customCards` so HA's dashboard picker discovers it.

## Architecture

Source is organized by responsibility, not by feature:

- **[src/cards/](src/cards/)** — one folder per card, typically `card.ts` (Lit element), `styles.ts`, `types.ts`, and a `README.md` documenting card config. Editors live alongside their card.
- **[src/delegates/](src/delegates/)** — business logic kept out of Lit components so it's testable without DOM. Use these (or `src/common`, `src/util`) instead of putting logic in render code.
- **[src/hass/](src/hass/)** — Home Assistant types, API wrappers, registry helpers (area/entity/device).
- **[src/html/](src/html/)** — reusable template functions for rendering chunks of UI.
- **[src/common/](src/common/)** — cross-card UI primitives (e.g. `basic-editor`, `battery-indicator`).
- **[src/config/](src/config/)**, **[src/types/](src/types/)** — config and type definitions consumed by cards and editors.
- **[src/util/](src/util/)** — generic helpers.

There is no `src/theme/` in this repo — theming is handled by HA itself plus per-card `styles.ts`.

### TypeScript path aliases ([tsconfig.json](tsconfig.json))

```
@node/*            → src/cards/node-info/*
@center/*          → src/cards/device-center/*
@controller-info/* → src/cards/controller-info/*
@node-states/*     → src/cards/node-states/*
@base/*            → src/cards/base/*
@common/*          → src/common/*
@config/*          → src/config/*
@delegates/*       → src/delegates/*
@hass/*            → src/hass/*
@type/*            → src/types/*
@html/*            → src/html/*
@util/*            → src/util/*
@test/*            → test/*
@/*                → src/*
```

Tests resolve these via `tsconfig-paths/register` in `.mocharc.json`.

### TypeScript settings worth knowing

`strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `verbatimModuleSyntax`, and `experimentalDecorators` (for Lit). `useDefineForClassFields` is **false** — required by Lit's reactive property decorators.

### Adding a new card

1. Create `src/cards/<name>/{card.ts,styles.ts,types.ts,README.md}`.
2. Add a `@<name>/*` path alias in [tsconfig.json](tsconfig.json) if you want one.
3. Register the element and push a `CardConfig` entry in [src/index.ts](src/index.ts) so HA discovers it.
4. Add the card link to [README.md](README.md).
5. Mirror the folder under `test/cards/<name>/` with `*.spec.ts` files.

### Testing

Mocha + Chai + Sinon, JSDOM via [mocha.setup.ts](mocha.setup.ts). `@open-wc/testing` is available for Lit element tests. Some tests use `proxyquire` to stub module dependencies. The test tree under [test/](test/) mirrors `src/`.

### Build target

Parcel emits a single ESM bundle (`module` target with `includeNodeModules: true`) so the output is a self-contained file HA can load as a Lovelace resource. Don't introduce code that depends on Node APIs at runtime.

## Hub Label Convention

Some cards (notably `zwave-controller` and Device Center) discover the Z-Wave controller by looking for a device labeled **"Hub"** in HA. See [README.md](README.md) for the user-facing requirement.
