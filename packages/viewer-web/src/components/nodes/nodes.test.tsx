import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  TextNodeComponent,
  ButtonNodeComponent,
  StatNodeComponent,
  ListNodeComponent,
  CalloutNodeComponent,
  TableNodeComponent,
  SectionNodeComponent,
  CardNodeComponent,
  FormLinkNodeComponent
} from './index'
import { defaultWebRegistry } from './index'

describe('Node Components', () => {
  describe('TextNodeComponent', () => {
    it('renders text value', () => {
      render(<TextNodeComponent value="Hello World" />)
      expect(screen.getByText('Hello World')).toBeTruthy()
    })

    it('applies correct CSS class', () => {
      const { container } = render(<TextNodeComponent value="Test" />)
      const p = container.querySelector('p.am-text')
      expect(p).toBeTruthy()
    })
  })

  describe('ButtonNodeComponent', () => {
    it('renders button with label', () => {
      render(<ButtonNodeComponent label="Click Me" on_click="event_1" onEvent={() => {}} />)
      expect(screen.getByText('Click Me')).toBeTruthy()
    })

    it('calls onEvent when clicked', () => {
      const onEvent = vi.fn()
      render(<ButtonNodeComponent label="Click Me" on_click="event_1" onEvent={onEvent} />)
      const button = screen.getByText('Click Me')
      button.click()
      expect(onEvent).toHaveBeenCalledWith('event_1')
    })

    it('applies correct CSS class', () => {
      const { container } = render(
        <ButtonNodeComponent label="Test" on_click="evt" onEvent={() => {}} />
      )
      const btn = container.querySelector('button.am-button')
      expect(btn).toBeTruthy()
    })
  })

  describe('StatNodeComponent', () => {
    it('renders label and value', () => {
      render(<StatNodeComponent label="Count" value={42} />)
      expect(screen.getByText('Count')).toBeTruthy()
      expect(screen.getByText('42')).toBeTruthy()
    })

    it('converts number value to string', () => {
      render(<StatNodeComponent label="Price" value={99.99} />)
      expect(screen.getByText('99.99')).toBeTruthy()
    })

    it('applies correct CSS classes', () => {
      const { container } = render(<StatNodeComponent label="Test" value="value" />)
      expect(container.querySelector('.am-stat')).toBeTruthy()
      expect(container.querySelector('.am-stat-label')).toBeTruthy()
      expect(container.querySelector('.am-stat-value')).toBeTruthy()
    })
  })

  describe('ListNodeComponent', () => {
    it('renders list items', () => {
      render(<ListNodeComponent source={['Item 1', 'Item 2', 'Item 3']} />)
      expect(screen.getByText('Item 1')).toBeTruthy()
      expect(screen.getByText('Item 2')).toBeTruthy()
      expect(screen.getByText('Item 3')).toBeTruthy()
    })

    it('handles item clicks with event', () => {
      const onEvent = vi.fn()
      render(
        <ListNodeComponent
          source={['Item 1', 'Item 2']}
          on_item_click="item_clicked"
          onEvent={onEvent}
        />
      )
      const item = screen.getByText('Item 1')
      item.click()
      expect(onEvent).toHaveBeenCalledWith('item_clicked', {
        index: 0,
        item: 'Item 1'
      })
    })

    it('applies clickable class when on_item_click is set', () => {
      const { container } = render(
        <ListNodeComponent
          source={['Item 1']}
          on_item_click="event"
          onEvent={() => {}}
        />
      )
      const li = container.querySelector('li.am-list-item-clickable')
      expect(li).toBeTruthy()
    })
  })

  describe('CalloutNodeComponent', () => {
    it('renders title and value', () => {
      render(<CalloutNodeComponent title="Notice" value="This is important" tone="info" />)
      expect(screen.getByText('Notice')).toBeTruthy()
      expect(screen.getByText('This is important')).toBeTruthy()
    })

    it('applies tone class', () => {
      const { container } = render(
        <CalloutNodeComponent title="Error" value="Something went wrong" tone="error" />
      )
      expect(container.querySelector('.am-callout-error')).toBeTruthy()
    })

    it('defaults tone to info', () => {
      const { container } = render(<CalloutNodeComponent value="Test" />)
      expect(container.querySelector('.am-callout-info')).toBeTruthy()
    })

    it('renders without title', () => {
      render(<CalloutNodeComponent value="Just value" />)
      expect(screen.getByText('Just value')).toBeTruthy()
    })
  })

  describe('TableNodeComponent', () => {
    it('renders columns and rows', () => {
      render(
        <TableNodeComponent
          columns={['Name', 'Age']}
          rows={[['Alice', '30'], ['Bob', '25']]}
        />
      )
      expect(screen.getByText('Name')).toBeTruthy()
      expect(screen.getByText('Age')).toBeTruthy()
      expect(screen.getByText('Alice')).toBeTruthy()
      expect(screen.getByText('30')).toBeTruthy()
    })

    it('handles object row format', () => {
      render(
        <TableNodeComponent
          columns={['name', 'age']}
          rows={[
            { name: 'Charlie', age: 35 },
            { name: 'Diana', age: 28 }
          ]}
        />
      )
      expect(screen.getByText('Charlie')).toBeTruthy()
      expect(screen.getByText('35')).toBeTruthy()
    })
  })

  describe('SectionNodeComponent', () => {
    it('renders title and children', () => {
      render(
        <SectionNodeComponent title="Section 1">
          <p>Content</p>
        </SectionNodeComponent>
      )
      expect(screen.getByText('Section 1')).toBeTruthy()
      expect(screen.getByText('Content')).toBeTruthy()
    })

    it('applies layout class', () => {
      const { container } = render(
        <SectionNodeComponent layout="row">
          <p>Test</p>
        </SectionNodeComponent>
      )
      expect(container.querySelector('.am-layout-row')).toBeTruthy()
    })
  })

  describe('CardNodeComponent', () => {
    it('renders title and children', () => {
      render(
        <CardNodeComponent title="Card 1">
          <p>Card content</p>
        </CardNodeComponent>
      )
      expect(screen.getByText('Card 1')).toBeTruthy()
      expect(screen.getByText('Card content')).toBeTruthy()
    })

    it('applies correct CSS classes', () => {
      const { container } = render(
        <CardNodeComponent>
          <p>Test</p>
        </CardNodeComponent>
      )
      expect(container.querySelector('.am-card')).toBeTruthy()
      expect(container.querySelector('.am-card-content')).toBeTruthy()
    })
  })

  describe('FormLinkNodeComponent', () => {
    it('renders button with label', () => {
      render(
        <FormLinkNodeComponent
          label="Open Form"
          form_id="form_1"
          onOpenForm={() => {}}
        />
      )
      expect(screen.getByText('Open Form')).toBeTruthy()
    })

    it('calls onOpenForm with form_id and submit_event', () => {
      const onOpenForm = vi.fn()
      render(
        <FormLinkNodeComponent
          label="Open Form"
          form_id="form_1"
          submit_event="form_submitted"
          onOpenForm={onOpenForm}
        />
      )
      const button = screen.getByText('Open Form')
      button.click()
      expect(onOpenForm).toHaveBeenCalledWith('form_1', 'form_submitted')
    })
  })

  describe('defaultWebRegistry', () => {
    it('registers all 9 node types', () => {
      const types = [
        'text',
        'button',
        'stat',
        'list',
        'callout',
        'table',
        'section',
        'card',
        'form_link'
      ]

      types.forEach(type => {
        const component = defaultWebRegistry.get(type)
        expect(component).toBeTruthy()
      })
    })
  })
})
