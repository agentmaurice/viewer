import { AgentMauriceElement } from './AgentMauriceElement'

if (!customElements.get('agent-maurice-viewer')) {
  customElements.define('agent-maurice-viewer', AgentMauriceElement)
}

export { AgentMauriceElement, parseEmbedAttributes } from './AgentMauriceElement'
export type { EmbedConfig } from './AgentMauriceElement'
