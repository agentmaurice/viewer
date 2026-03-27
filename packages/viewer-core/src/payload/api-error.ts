import { ViewerAPIClientError } from '../client/api-client'
import type { ViewerApiError } from '../types/events'

export function parseViewerApiError(error: unknown): ViewerApiError | null {
  if (error instanceof ViewerAPIClientError) {
    return {
      status: error.status,
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    }
  }

  if (!(error instanceof Error)) {
    return null
  }

  const match = error.message.match(/^API Error (\d+):\s*([\s\S]+)$/)
  if (!match) {
    return null
  }

  const status = Number(match[1])
  const rawPayload = match[2]?.trim()
  if (!rawPayload) {
    return { status }
  }

  try {
    const parsed = JSON.parse(rawPayload) as ViewerApiError
    return {
      status,
      ...parsed,
    }
  } catch {
    return {
      status,
      error: {
        message: rawPayload,
      },
    }
  }
}
