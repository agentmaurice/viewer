# AgentMaurice Viewer

`agent-maurice-viewer` is the frontend starter and integration monorepo for
applications that consume AgentMaurice viewer and mini-app surfaces.

Use it when you want to:
- ship a customer-facing or operator-facing frontend on top of AgentMaurice
- bootstrap a viewer by `slug` or `deploymentId`
- render AgentMaurice mini-apps in React
- embed the viewer in an existing website
- start from a runnable demo instead of building a client runtime from scratch

## What this repository contains

This repository is organized as npm workspaces under [`packages`](./packages):

- [`viewer-core`](./packages/viewer-core): shared runtime layer
  - viewer bootstrap
  - API client
  - state handling
  - auth adapter interfaces
  - payload normalization and runtime contracts
- [`viewer-web`](./packages/viewer-web): React renderer and web UI components for AgentMaurice viewer experiences
- [`viewer-embed`](./packages/viewer-embed): embeddable Web Component for integration in an existing site
- [`viewer-demo`](./packages/viewer-demo): runnable demonstration app and the best starting point for a publishable client application
- [`viewer-app`](./packages/viewer-app): minimal local app shell for viewer-web based development

## Which package to start from

Choose the package that matches your integration strategy:

- Start with [`viewer-demo`](./packages/viewer-demo) if you want a full app starter with routing, local preview flows, and a Supabase auth example.
- Start with [`viewer-web`](./packages/viewer-web) if you already have a React app and only need the viewer runtime and UI layer.
- Start with [`viewer-embed`](./packages/viewer-embed) if you need a Web Component that can be dropped into an existing website.
- Use [`viewer-core`](./packages/viewer-core) only if you need a custom client integration below the React or Web Component layers.

## Typical usage

This repo is designed for client applications that need to connect to an
AgentMaurice deployment and expose one or more of these surfaces:

- viewer bootstrap for a mini-app or interactive deployment
- OpenUI-backed rendering through the viewer runtime
- frontend auth flows such as Supabase, Firebase, OIDC, or an external token provider
- branded client delivery built on top of AgentMaurice backend capabilities

In practice, a common setup is:
1. build or deploy the backend application in AgentMaurice
2. choose the target deployment that the frontend should consume
3. start from `viewer-demo`, `viewer-web`, or `viewer-embed`
4. wire the frontend auth strategy and viewer entry mode
5. brand and publish the client app

## Getting started

Install dependencies from the repo root:

```bash
npm install
```

Run the demo application:

```bash
npm run dev --workspace @agent-maurice/viewer-demo
```

Build the main packages:

```bash
npm run build --workspace @agent-maurice/viewer-core
npm run build --workspace @agent-maurice/viewer-web
npm run build --workspace @agent-maurice/viewer-embed
```

Run the minimal app shell:

```bash
npm run dev --workspace @agent-maurice/viewer-app
```

## Demo application

[`viewer-demo`](./packages/viewer-demo) is the most useful entry point if you
want to understand the project quickly or fork it into a customer-facing app.

It currently includes:
- viewer bootstrap by `slug` or `deploymentId`
- a Supabase frontend auth example
- local mock preview scenarios
- OpenUI-oriented demo flows
- offline preview routes that do not require a live viewer backend

See [`packages/viewer-demo/README.md`](./packages/viewer-demo/README.md) for the
environment variables and routes.

## Authentication and runtime note

The viewer stack is well suited to bearer-token-based flows on viewer surfaces.
That said, compatibility still depends on the exact AgentMaurice backend surface
you are targeting.

In particular:
- viewer bootstrap aligns well with bearer-token flows
- some recipe backend checks can also align well
- some mini-app runtime endpoints may still require deployment API keys,
  depending on the current backend surface

So this repository should be treated as the recommended client starter for
viewer-centric integrations, with final auth validation done against the target
AgentMaurice deployment.

## Form submission contract

Mini-app forms are submitted through the app event endpoint, not through a
generic form endpoint.

The contract is:

- `POST /app/instances/{appInstanceId}/events/{eventId}`
- `eventId` must come from the UI contract
- for a `form_link`, use `submit_event` when it is present
- only fall back to `form_submit` when no explicit `submit_event` is provided
- send user-entered values in `form_data`
- keep UI context such as `form_id` in `payload`

Example:

```json
{
  "payload": {
    "form_id": "main_form"
  },
  "form_data": {
    "cahier_des_charges": "...",
    "document_reponse": "..."
  },
  "expected_state_version": 1
}
```

This matters because many recipes declare named events such as
`submit_main_form`. Hardcoding `form_submit` in the renderer can make the
backend reject the request with `404 app event not found`.

## Repository role

This repository is intended to serve as a base for a public or private client
application built on top of AgentMaurice.

Use it as:
- a runnable demo
- a frontend starter repository
- a React integration layer
- an embed layer for existing websites
