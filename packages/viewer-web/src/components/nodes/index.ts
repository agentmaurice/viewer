import { ComponentRegistry } from '@agent-maurice/viewer-core'
import { TextNodeComponent, type TextNodeProps } from './TextNode'
import { ButtonNodeComponent, type ButtonNodeProps } from './ButtonNode'
import { StatNodeComponent, type StatNodeProps } from './StatNode'
import { ListNodeComponent, type ListNodeProps } from './ListNode'
import { CalloutNodeComponent, type CalloutNodeProps } from './CalloutNode'
import { TableNodeComponent, type TableNodeProps } from './TableNode'
import { SectionNodeComponent, type SectionNodeProps } from './SectionNode'
import { CardNodeComponent, type CardNodeProps } from './CardNode'
import { FormLinkNodeComponent, type FormLinkNodeProps } from './FormLinkNode'

export {
  TextNodeComponent,
  type TextNodeProps,
  ButtonNodeComponent,
  type ButtonNodeProps,
  StatNodeComponent,
  type StatNodeProps,
  ListNodeComponent,
  type ListNodeProps,
  CalloutNodeComponent,
  type CalloutNodeProps,
  TableNodeComponent,
  type TableNodeProps,
  SectionNodeComponent,
  type SectionNodeProps,
  CardNodeComponent,
  type CardNodeProps,
  FormLinkNodeComponent,
  type FormLinkNodeProps
}

export const defaultWebRegistry = new ComponentRegistry<React.ComponentType<any>>()
  .register('text', TextNodeComponent)
  .register('button', ButtonNodeComponent)
  .register('stat', StatNodeComponent)
  .register('list', ListNodeComponent)
  .register('callout', CalloutNodeComponent)
  .register('table', TableNodeComponent)
  .register('section', SectionNodeComponent)
  .register('card', CardNodeComponent)
  .register('form_link', FormLinkNodeComponent)
