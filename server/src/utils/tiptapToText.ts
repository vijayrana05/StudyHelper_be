// utils/tiptapToText.ts
import { Schema, Node as ProseMirrorNode } from 'prosemirror-model';

const schema = new Schema({
  nodes: {
    doc: { content: 'block+' },
    paragraph: { content: 'inline*', group: 'block' },
    heading: { content: 'inline*', group: 'block', attrs: { level: { default: 1 } } },
    text: { group: 'inline' },
    bulletList: { content: 'listItem+', group: 'block' },
    orderedList: { content: 'listItem+', group: 'block' },
    listItem: { content: 'paragraph+', group: 'block' },
    horizontalRule: {
      group: 'block',
      parseDOM: [{ tag: 'hr' }],
      toDOM() {
        return ['hr'];
      },
    },
    // Add more node types as needed
  },
  marks: {
    bold: {
      toDOM: () => ['strong', 0],
      parseDOM: [{ tag: 'strong' }, { tag: 'b' }],
    },
    italic: {
      toDOM: () => ['em', 0],
      parseDOM: [{ tag: 'em' }, { tag: 'i' }],
    },
    underline: {
      toDOM: () => ['u', 0],
      parseDOM: [{ tag: 'u' }],
    },
    strike: {
      toDOM: () => ['s', 0],
      parseDOM: [{ tag: 's' }],
    },
    link: {
      attrs: { href: {}, title: { default: null } },
      inclusive: false,
      toDOM: (mark) => ['a', mark.attrs],
      parseDOM: [
        {
          tag: 'a',
          getAttrs(dom: any) {
            return {
              href: dom.getAttribute('href'),
              title: dom.getAttribute('title'),
            };
          },
        },
      ],
    },
  },
});

export function tiptapJsonToPlainText(json: any): string {
  try {
    const doc = ProseMirrorNode.fromJSON(schema, json);
    return doc.textContent.trim();
  } catch (error) {
    console.error("Error converting TipTap JSON to plain text:", error);
    // You might want to handle the error more gracefully,
    // e.g., return an empty string or re-throw a custom error.
    return '';
  }
}