import { useViewerContext } from '../context'

export function useViewerEvent() {
  const { stateMachine } = useViewerContext()

  return (eventId: string, payload?: Record<string, unknown>) => {
    stateMachine.dispatchEvent(eventId, payload || {})
  }
}
