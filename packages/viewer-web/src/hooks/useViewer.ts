import { useState, useEffect } from 'react'
import { useViewerContext } from '../context'
import type { ViewerState } from '@agent-maurice/viewer-core'

export function useViewer(): ViewerState | null {
  const { stateMachine } = useViewerContext()
  const [state, setState] = useState<ViewerState | null>(null)

  useEffect(() => {
    const unsubscribe = stateMachine.subscribe(newState => {
      setState(newState)
    })

    return () => {
      unsubscribe()
    }
  }, [stateMachine])

  return state
}
