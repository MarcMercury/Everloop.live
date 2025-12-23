import { Mark, mergeAttributes } from '@tiptap/core'

export interface EntityLinkOptions {
  HTMLAttributes: Record<string, unknown>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    entityLink: {
      /**
       * Set an entity link mark
       */
      setEntityLink: (attributes: { 
        entityId: string
        entityName: string
        entityType: string 
      }) => ReturnType
      /**
       * Toggle an entity link mark
       */
      toggleEntityLink: (attributes: { 
        entityId: string
        entityName: string
        entityType: string 
      }) => ReturnType
      /**
       * Unset entity link mark
       */
      unsetEntityLink: () => ReturnType
    }
  }
}

export const EntityLink = Mark.create<EntityLinkOptions>({
  name: 'entityLink',

  // Don't allow entity links to overlap
  excludes: '_',

  addOptions() {
    return {
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    return {
      entityId: {
        default: null,
        parseHTML: element => element.getAttribute('data-entity-id'),
        renderHTML: attributes => {
          if (!attributes.entityId) {
            return {}
          }
          return {
            'data-entity-id': attributes.entityId,
          }
        },
      },
      entityName: {
        default: null,
        parseHTML: element => element.getAttribute('data-entity-name'),
        renderHTML: attributes => {
          if (!attributes.entityName) {
            return {}
          }
          return {
            'data-entity-name': attributes.entityName,
          }
        },
      },
      entityType: {
        default: null,
        parseHTML: element => element.getAttribute('data-entity-type'),
        renderHTML: attributes => {
          if (!attributes.entityType) {
            return {}
          }
          return {
            'data-entity-type': attributes.entityType,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-entity-id]',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: 'entity-link',
      }),
      0,
    ]
  },

  addCommands() {
    return {
      setEntityLink:
        (attributes) =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes)
        },
      toggleEntityLink:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleMark(this.name, attributes)
        },
      unsetEntityLink:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },
})

export default EntityLink
