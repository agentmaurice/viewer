export type AppActionBinding = { event_id: string; payload_template?: Record<string, unknown> }
export type AppEffect = { type: 'navigate' | 'open_form' | 'toast' | string; payload?: Record<string, unknown> }
export type AppEventRequest = { payload?: Record<string, unknown>; form_data?: Record<string, unknown>; ui_context?: Record<string, unknown>; expected_state_version: number }
export type ViewerApiError = { status?: number; error?: { code?: string; message?: string; details?: Record<string, unknown> } }
