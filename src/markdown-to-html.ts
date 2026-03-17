import { marked } from 'marked';

marked.setOptions({
  gfm: true,
  breaks: true
});

export function markdownToHtml(markdownText: string): string {
  if (typeof markdownText !== 'string') {
    throw new TypeError('Markdown input must be a string.');
  }

  return marked.parse(markdownText) as string;
}
