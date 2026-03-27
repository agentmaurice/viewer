import { describe, expect, it } from 'vitest'
import { ViewerAPIClientError } from '../client/api-client'
import { parseViewerApiError } from './api-error'

describe('api-error', () => {
  it('parses ViewerAPIClientError', () => {
    const parsed = parseViewerApiError(
      new ViewerAPIClientError('STATE_VERSION_CONFLICT', 'conflict', 409, {
        current_state_version: 4,
      }),
    )

    expect(parsed).toEqual({
      status: 409,
      error: {
        code: 'STATE_VERSION_CONFLICT',
        message: 'conflict',
        details: { current_state_version: 4 },
      },
    })
  })

  it('parses legacy API Error messages with JSON body', () => {
    const parsed = parseViewerApiError(
      new Error(
        'API Error 409: {"error":{"code":"STATE_VERSION_CONFLICT","message":"conflict","details":{"current_state_version":4}}}',
      ),
    )

    expect(parsed).toEqual({
      status: 409,
      error: {
        code: 'STATE_VERSION_CONFLICT',
        message: 'conflict',
        details: { current_state_version: 4 },
      },
    })
  })

  it('parses legacy API Error messages with plain text body', () => {
    const parsed = parseViewerApiError(new Error('API Error 500: internal server error'))

    expect(parsed).toEqual({
      status: 500,
      error: {
        message: 'internal server error',
      },
    })
  })

  it('returns null for non API errors', () => {
    expect(parseViewerApiError(new Error('boom'))).toBeNull()
    expect(parseViewerApiError('boom')).toBeNull()
  })
})
