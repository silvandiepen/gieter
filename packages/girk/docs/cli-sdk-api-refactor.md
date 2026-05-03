# Girk CLI, SDK, API and UI refactor plan

## Goal

Girk should become usable in four forms:

1. **CLI**: the current command-line tool for local projects.
2. **SDK**: a reusable build engine that accepts data in memory and returns generated files in memory.
3. **API**: a service layer that exposes the SDK through HTTP endpoints for apps, previews, downloads and publishing.
4. **UI web components**: interactive components that can be loaded inside Girk-generated docs and act as a layer on top of the API.

The refactor must not break current usage. Existing CLI behaviour should remain the default.

```bash
npx girk
```

The command above should keep doing what it does today: scan the current working directory for Markdown files and generate a static site into `public/`.

> Note: if a published package or alias such as `girky` exists, it should continue to resolve to the same CLI behaviour as `girk`.

## Core principle

The SDK should become the single source of truth.

```txt
CLI ─┐
API ─┼── uses SDK
UI  ─┘
```

The build logic should not be duplicated between CLI, SDK, API and UI.

The docs should continue to be built by Girk. The UI should not replace the docs app. Instead, the docs can load one or more web components that call the Girk API and provide an interactive playground inside normal Girk-generated pages.

## Current problem

The current Girk entrypoint is CLI-oriented. It reads from the filesystem, uses `process.cwd()`, writes output files, reads templates from disk and logs CLI output as part of the build flow.

That makes it hard to use Girk in a hosted app where input comes from uploaded Markdown files or an editor, and output needs to become preview data, a ZIP file, R2 objects or another storage format.

## Target modes

### 1. CLI mode

CLI mode keeps the current behaviour.

```bash
girk
# or
npx girk
```

Expected behaviour:

- Read Markdown files from the current project folder.
- Read config files from the current project folder.
- Read assets/media from the current project folder.
- Build the static site.
- Write output into `public/`.
- Keep existing terminal output.

CLI mode should become a thin wrapper around the SDK:

```ts
const input = await readGirkInputFromFileSystem(process.cwd());
const result = await buildGirk(input);
await writeGirkOutputToFileSystem(result, "public");
```

### 2. SDK mode

SDK mode should not read or write files by itself. It receives input data and returns output data.

Example usage:

```ts
import { buildGirk } from "girk/sdk";

const result = await buildGirk({
  files: [
    {
      path: "/index.md",
      content: "# Hello world",
    },
    {
      path: "/about.md",
      content: "# About",
    },
  ],
  assets: [
    {
      path: "/assets/logo.svg",
      content: "<svg></svg>",
      contentType: "image/svg+xml",
    },
  ],
  config: {
    projectTitle: "My site",
  },
});
```

Example output:

```ts
{
  files: [
    {
      path: "/index.html",
      content: "<!doctype html>...",
      contentType: "text/html; charset=utf-8",
    },
    {
      path: "/about/index.html",
      content: "<!doctype html>...",
      contentType: "text/html; charset=utf-8",
    },
    {
      path: "/style/app.css",
      content: "...",
      contentType: "text/css; charset=utf-8",
    },
  ],
  pages: [
    {
      title: "Hello world",
      path: "/index.html",
      language: "en",
    },
  ],
  project: {},
  warnings: [],
}
```

The SDK should be pure build logic. It should not know about users, domains, HTTP, R2, Cloudflare, local folders or CLI commands.

### 3. API mode

API mode should expose the SDK over HTTP.

Initial endpoints:

```txt
POST /build
POST /zip
POST /publish
GET  /preview/:buildId/*
```

Possible endpoint responsibilities:

- `/build`: accept Markdown/config/assets and return generated output metadata or files.
- `/zip`: accept Markdown/config/assets and return a ZIP file.
- `/publish`: accept Markdown/config/assets, build the site and write generated files to the chosen storage layer.
- `/preview/:buildId/*`: serve a temporary preview build.

API mode should also be thin:

```ts
const input = await request.json();
const result = await buildGirk(input);
return createJsonResponse(result);
```

For ZIP downloads:

```ts
const result = await buildGirk(input);
const zip = await createGirkZip(result.files);
return createZipResponse(zip);
```

For publishing:

```ts
const result = await buildGirk(input);
await publishGirkOutput(result.files, target);
return createPublishResponse(target);
```

### 4. UI web component mode

The UI should be a thin layer around the API. It should not contain build logic.

The first UI should be implemented as reusable web components, not as a separate full app. This fits Girk better because the docs are already built by Girk. The docs can include a component script and then use custom elements directly inside Markdown or generated pages.

Recommended first component:

```txt
<girk-playground>
```

Optional smaller components can be split out later:

```txt
<girk-file-input>
<girk-markdown-editor>
<girk-preview>
<girk-build-actions>
<girk-publish-form>
```

Responsibilities:

- paste Markdown
- upload Markdown files
- upload optional assets
- edit virtual file paths
- call the Girk API
- preview generated pages
- download generated ZIP
- publish to a generated subdomain
- show build warnings/errors

The default UI flow should be:

```txt
Girk-generated docs page → web component → Girk API → Girk SDK
```

This is the main product direction. The web component is a layer on top of the API and can be embedded wherever the docs need an interactive example.

An optional browser-only SDK path can be explored later, but it should not be the first target:

```txt
Girk-generated docs page → web component → Girk SDK → in-browser preview
```

The API-backed flow is safer for production because ZIP generation, publishing, storage and larger assets are server-side concerns.

## UI location

Keep the UI in the same repo.

Preferred first option:

```txt
packages/girk-ui/
```

This package should export framework-agnostic web components that can be used in:

- the Girk-generated docs
- a future standalone hosted app
- demos and examples
- external sites

A separate app is not needed for the first version. The docs are the first host.

Alternative future option:

```txt
apps/studio/
```

Use this only if the product grows into a full dashboard with auth, saved projects, history, billing or domain management.

Recommended path:

1. Start with `packages/girk-ui` as web components.
2. Load those components inside the Girk-generated docs for the first playground.
3. Use the components as a layer on top of the deployed Girk API.
4. Add `apps/studio` later only if the product needs a larger application shell.

## UI in Girk-generated docs

The docs should continue to be normal Girk content. A docs page can include a playground using either a Markdown-supported HTML block or a Girk component/partial.

Example:

```html
<script type="module" src="/assets/girk-ui/girk-playground.js"></script>

<girk-playground api-url="https://api.girk.dev"></girk-playground>
```

The docs build should copy or bundle the web component assets so the generated site can load them.

Suggested flow:

```txt
Markdown docs page
  ↓
Girk build
  ↓
Generated docs HTML
  ↓
Loads girk-ui web component
  ↓
Component calls deployed Girk API
  ↓
Preview / ZIP / publish
```

This keeps the documentation dogfooded: Girk builds the docs, and the docs demonstrate Girk through a component that calls the API.

## UI deployment

The docs can be deployed to Cloudflare and include the UI web components.

Suggested deployment shape:

```txt
Girk-generated docs
  ↓
Cloudflare Pages or Workers Static Assets
  ↓
loads <girk-playground>
  ↓
calls deployed Girk API Worker
```

The API can be deployed separately as a Cloudflare Worker:

```txt
apps/girk-api-worker
  ↓
Cloudflare Worker
  ↓
uses girk/sdk
  ↓
optionally writes published output to R2
```

Published generated sites should not require redeploying the docs. They should be stored separately, for example in R2, and served by a wildcard Worker route.

## Proposed package layout

Start inside the current package for SDK/CLI/API. Split into separate packages only when the boundaries are stable.

```txt
packages/girk/
  src/
    sdk/
      index.ts
      buildGirk.ts
      normalizeInput.ts
      renderSite.ts
      createZip.ts
      types.ts

    cli/
      index.ts
      readFromFileSystem.ts
      writeToFileSystem.ts

    api/
      index.ts
      worker.ts
      routes/
        build.ts
        zip.ts
        publish.ts
        preview.ts

    adapters/
      filesystem/
        readInput.ts
        writeOutput.ts

      cloudflare/
        writeToR2.ts
        serveFromR2.ts

    index.ts

packages/girk-ui/
  src/
    components/
      girk-playground.ts
      girk-file-input.ts
      girk-markdown-editor.ts
      girk-preview.ts
      girk-build-actions.ts
      girk-publish-form.ts
    index.ts
```

Long-term, this can become:

```txt
packages/girk-sdk/
packages/girk-cli/
packages/girk-api/
packages/girk-ui/
apps/studio/
```

But that should wait until the internal API is proven.

## Public exports

The package should expose stable entrypoints.

```json
{
  "exports": {
    ".": "./dist/index.js",
    "./sdk": "./dist/sdk/index.js",
    "./api": "./dist/api/index.js",
    "./cli": "./dist/cli/index.js"
  },
  "bin": {
    "girk": "dist/cli/index.js",
    "gieter": "dist/cli/index.js"
  }
}
```

If `girky` is an intended executable name, add it here too:

```json
{
  "bin": {
    "girk": "dist/cli/index.js",
    "gieter": "dist/cli/index.js",
    "girky": "dist/cli/index.js"
  }
}
```

Only add this if `girky` is intentionally supported. Do not rename or remove existing CLI binaries.

## Types

Suggested SDK types:

```ts
export interface GirkInputFile {
  path: string;
  content: string;
  created?: Date;
}

export interface GirkInputAsset {
  path: string;
  content: string | Uint8Array | ArrayBuffer;
  contentType?: string;
}

export interface GirkBuildInput {
  files: GirkInputFile[];
  assets?: GirkInputAsset[];
  config?: Record<string, unknown>;
  args?: Record<string, unknown>;
}

export interface GirkOutputFile {
  path: string;
  content: string | Uint8Array | ArrayBuffer;
  contentType: string;
}

export interface GirkBuildResult {
  files: GirkOutputFile[];
  pages: GirkOutputPage[];
  project: Record<string, unknown>;
  warnings: string[];
}

export interface GirkOutputPage {
  title: string;
  path: string;
  language: string;
}
```

## Output strategy

The primary SDK output should be a file list or file map, not a ZIP.

Primary output:

```ts
const result = await buildGirk(input);
```

Optional ZIP output:

```ts
const zip = await createGirkZip(result.files);
```

This makes the result usable for multiple targets:

- local filesystem writes
- preview rendering
- ZIP downloads
- R2 publishing
- tests
- debugging
- generated file inspection

ZIP should be an adapter, not the core build format.

## Cloudflare direction

The API should be able to run on Cloudflare Workers, but the SDK should not be tied to Cloudflare.

Recommended hosted architecture:

```txt
User input
  ↓
Girk-generated docs with web component
  ↓
Girk API
  ↓
Girk SDK
  ↓
Generated output files
  ├─ ZIP download
  ├─ Preview storage
  └─ Published site storage, for example R2
```

A later studio app can use the same API and UI components, but the first interactive surface should be the docs.

The UI/top-layer should handle:

- user interface
- editing and uploading Markdown
- previews
- published sites
- custom or generated subdomains
- storage decisions through API calls

Girk should only handle:

- Markdown parsing
- metadata extraction
- menu/tag/archive generation
- HTML/CSS generation
- static output creation

## What must move out of the core SDK

The SDK should avoid direct imports of:

- `fs`
- `fs/promises`
- `fs-extra`
- `process.cwd()`
- terminal-only logging
- Cloudflare bindings
- R2 bindings
- HTTP request/response objects

Those belong in adapters.

## Template handling

Current template rendering should be adapted so the SDK can render without relying on runtime filesystem access.

Preferred options:

1. Bundle template source as a string.
2. Precompile Pug templates at build time.
3. Keep filesystem-based template loading only in the CLI adapter.

The SDK should be able to render pages in memory.

## Media handling

Media support should be split into levels.

### SDK v1

- Accept assets as input data.
- Copy assets to output data.
- Reference assets from generated pages.
- Avoid thumbnail generation in the SDK core.

### Node CLI adapter

- Can keep current media folder scanning.
- Can keep filesystem copying.
- Can keep image processing if needed.

### Cloudflare/API adapter

- Should avoid Node-native image processing.
- Can use uploaded assets directly.
- Can later integrate Cloudflare Images or another image service.

## Backward compatibility requirements

The refactor is only acceptable if these keep working:

```bash
npx girk
```

```bash
girk
```

```bash
gieter
```

Expected behaviour must remain:

- current folder is used as input
- Markdown files are discovered automatically
- config files are discovered automatically
- output goes to `public/` unless configured otherwise
- existing generated site structure remains compatible
- current examples and docs builds keep working

If `npx girky` is an existing or intended alias, add a compatibility test and preserve it as well.

## Testing plan

Add tests before or during the refactor so behaviour stays stable.

### CLI compatibility tests

- Run CLI on a basic Markdown fixture.
- Assert `public/index.html` exists.
- Assert nested pages still generate the same paths.
- Assert config files are still read.
- Assert assets/media still copy where expected.

### SDK tests

- Build from an in-memory `index.md`.
- Build multiple pages from virtual paths.
- Build multiple languages from virtual paths.
- Return generated HTML and CSS as output files.
- Return warnings instead of throwing for recoverable issues.

### API tests

- `POST /build` returns generated files.
- `POST /zip` returns a ZIP response.
- `POST /publish` calls the configured output adapter.

### UI tests

- Web component renders with empty state.
- Markdown input triggers an API build request.
- Preview displays generated HTML.
- ZIP action calls the ZIP endpoint.
- Publish action calls the publish endpoint.
- Build warnings/errors are visible to users.
- Generated docs can load the component script and render `<girk-playground>`.

## Refactor steps

### Step 1: Extract build pipeline

Move the current build chain into a reusable function.

```ts
export async function buildGirk(input: GirkBuildInput): Promise<GirkBuildResult> {
  // build pipeline here
}
```

No CLI execution should happen when importing the SDK.

### Step 2: Create filesystem input adapter

Move current file discovery into:

```ts
readGirkInputFromFileSystem(root: string): Promise<GirkBuildInput>
```

This adapter can keep using `fs`, `process.cwd()`, `statSync`, config files and media folders.

### Step 3: Create filesystem output adapter

Move current write behaviour into:

```ts
writeGirkOutputToFileSystem(result: GirkBuildResult, output: string): Promise<void>
```

### Step 4: Rebuild CLI on top of SDK

The CLI should call:

```ts
const input = await readGirkInputFromFileSystem(root);
const result = await buildGirk(input);
await writeGirkOutputToFileSystem(result, output);
```

### Step 5: Add ZIP adapter

Add:

```ts
createGirkZip(files: GirkOutputFile[]): Promise<Uint8Array>
```

### Step 6: Add API handlers

Add API functions that can be used by Cloudflare Workers or another HTTP runtime.

```ts
createGirkApi(options)
```

Keep HTTP/runtime concerns outside the SDK.

### Step 7: Add UI web components

Add reusable web components in `packages/girk-ui`.

Start with a playground component that can be embedded in the Girk-generated docs:

```html
<girk-playground api-url="https://api.girk.dev"></girk-playground>
```

The component should be able to:

- accept pasted Markdown
- accept uploaded Markdown files
- call `/build`
- show a preview
- call `/zip`
- optionally call `/publish`

### Step 8: Load UI in generated docs

Add the playground to a docs Markdown page so users can try Girk without installing anything.

```txt
docs Markdown → Girk build → generated docs HTML → loads <girk-playground>
```

This is not a separate docs app replacing Girk. It is Girk building its own docs and loading a web component as an interactive layer.

### Step 9: Add Cloudflare publishing adapter

Add optional Cloudflare-specific helpers only after the SDK and API shape are stable.

```ts
writeGirkOutputToR2(result.files, bucket, sitePrefix)
serveGirkOutputFromR2(request, bucket)
```

## Non-goals for the first refactor

Do not include these in the first refactor unless needed:

- user accounts
- dashboards
- visual editor beyond a simple Markdown/file input playground
- custom domain management
- payment/subscription logic
- image optimization service
- database schema
- multi-tenant project management

Those belong in a later product layer if the playground grows into a full hosted studio.

## Definition of done

The refactor is done when:

- `npx girk` behaves the same as before.
- CLI build output is compatible with the current generated output.
- Girk can be imported as an SDK without running the CLI.
- The SDK can build a site from in-memory Markdown input.
- The SDK returns generated files in memory.
- A ZIP can be generated from SDK output.
- API handlers can call the SDK without filesystem access.
- A basic web component playground can call the API and show a preview.
- The Girk-generated docs can load the playground web component.
- Tests cover current CLI behaviour, new SDK behaviour, API behaviour and the basic UI flow.

## Summary

Girk should become a build engine with multiple faces:

```txt
Filesystem project → CLI adapter → SDK → filesystem output
Editor/upload data → API adapter → SDK → preview/ZIP/publish output
Girk docs          → web component → API → SDK → preview/ZIP/publish output
Other apps         → SDK directly → generated static files
```

This keeps current users safe while opening Girk up for API builds, previews, ZIP downloads, embeddable docs UI and Cloudflare publishing.
