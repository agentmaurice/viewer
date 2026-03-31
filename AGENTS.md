# AGENTS.md

## Repository intent

This repository contains the AgentMaurice viewer client stack.

Important packages:

- `packages/viewer-core`: bootstrap, API client, runtime contracts, state machine
- `packages/viewer-web`: React renderer used by app integrations
- `packages/viewer-embed`: Web Component wrapper around the viewer

## Mini-app form event contract

When working on mini-app forms, do not assume that form submission always uses
an event named `form_submit`.

Required behavior:

- If a UI node such as `form_link` provides `submit_event`, preserve it through
  the UI flow and use it as the backend event id.
- Submit mini-app form actions to:
  `POST /app/instances/{appInstanceId}/events/{eventId}`
- Put user-entered fields in `form_data`.
- Put UI metadata such as `form_id` in `payload`.
- `form_submit` is only a fallback when the UI contract does not provide an
  explicit `submit_event`.

## Editing guidance

- If you touch `viewer-web` form submission behavior, add or update a component
  test that asserts the exact `dispatchEvent(eventId, payload, formData)` call.
- Treat `viewer-core` types and tests as the source of truth for runtime
  payloads and event request shapes.
