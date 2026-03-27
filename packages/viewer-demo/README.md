# viewer-demo

Demo application for the AgentMaurice viewer, with:

- Supabase authentication on the frontend,
- viewer bootstrap by `slug` or `deploymentId`,
- a fully playable gallery without authentication thanks to local previews,
- an OpenUI scenario gallery aimed at demos,
- offline preview per scenario to showcase OpenUI without a live viewer backend,
- OpenUI mini-app rendering through `@agent-maurice/viewer-web`.

## Environment variables

Copy `.env.example` to `.env.local`, then define:

- `VITE_VIEWER_API_BASE_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Optional:

- `VITE_SUPABASE_OAUTH_PROVIDER`
- `VITE_SUPABASE_MAGIC_REDIRECT_URL`
- `VITE_VIEWER_DEMO_SLUGS`
- `VITE_VIEWER_DEMO_DEPLOYMENTS`
- `VITE_VIEWER_DEMO_SCENARIOS`

`VITE_VIEWER_DEMO_SCENARIOS` accepts JSON like this:

```json
[
  {
    "slug": "sales-cockpit",
    "title": "Sales cockpit",
    "summary": "KPI + reporting demo for OpenUI",
    "patterns": ["kpi_grid", "tabs", "chart"],
    "category": "Executive dashboard",
    "audience": "Sales leadership"
  }
]
```

Each gallery card then exposes:

- access to the real viewer via `slug` or `deploymentId` when a Supabase session is active,
- an offline preview powered by a locally mocked runtime.

If no Supabase configuration or slugs are provided, the app still exposes a default scenario gallery so the viewer can be tested immediately.

## Run

From `/Users/mikaelmorvan/code/kraftek/mcpchatui/agent-maurice-viewer`:

```bash
npm run dev --workspace @agent-maurice/viewer-demo
```

## Routes

- `/`: demo gallery
- `/preview/:scenarioId`: offline OpenUI preview
- `/:slug`: viewer bootstrap by slug
- `/d/:deploymentId`: viewer bootstrap by deployment ID
