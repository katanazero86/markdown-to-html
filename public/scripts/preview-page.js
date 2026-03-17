const markdownEditor = document.getElementById('markdown-editor');
const lineGutter = document.getElementById('line-gutter');
const previewBody = document.getElementById('preview-body');
const downloadMarkdownButton = document.getElementById('download-markdown');
const downloadHtmlButton = document.getElementById('download-html');
const { documentEndpoint, renderEndpoint } = window.previewPageConfig;

let renderTimer = 0;
let lineNumberFrame = 0;
let latestHtml = previewBody.innerHTML;

function getCurrentLineNumber() {
  const selectionStart = markdownEditor.selectionStart ?? 0;
  return markdownEditor.value.slice(0, selectionStart).split('\n').length;
}

function updateLineNumbers() {
  const lineCount = markdownEditor.value.split('\n').length;
  const currentLineNumber = getCurrentLineNumber();
  const visibleLineCount = Math.max(lineCount, currentLineNumber);

  lineGutter.innerHTML = Array.from({ length: visibleLineCount }, (_, index) => {
    const lineNumber = index + 1;
    const activeClassName = lineNumber === currentLineNumber ? 'line-number is-active' : 'line-number';
    return '<span class="' + activeClassName + '">' + lineNumber + '</span>';
  }).join('');
}

function scheduleLineNumberUpdate() {
  window.cancelAnimationFrame(lineNumberFrame);
  lineNumberFrame = window.requestAnimationFrame(updateLineNumbers);
}

async function renderMarkdown(markdownText) {
  const response = await fetch(renderEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain; charset=utf-8'
    },
    body: markdownText
  });

  if (!response.ok) {
    throw new Error('Failed to render Markdown.');
  }

  return response.text();
}

function downloadFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = objectUrl;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(objectUrl);
}

async function updatePreview() {
  try {
    latestHtml = await renderMarkdown(markdownEditor.value);
    previewBody.innerHTML = latestHtml;
  } catch (_error) {
    latestHtml = '<p>Preview render failed.</p>';
    previewBody.innerHTML = latestHtml;
  }
}

markdownEditor.addEventListener('input', () => {
  scheduleLineNumberUpdate();
  window.clearTimeout(renderTimer);
  renderTimer = window.setTimeout(updatePreview, 120);
});

markdownEditor.addEventListener('scroll', () => {
  lineGutter.scrollTop = markdownEditor.scrollTop;
});

markdownEditor.addEventListener('click', scheduleLineNumberUpdate);
markdownEditor.addEventListener('keyup', scheduleLineNumberUpdate);
markdownEditor.addEventListener('keydown', scheduleLineNumberUpdate);
markdownEditor.addEventListener('mouseup', scheduleLineNumberUpdate);
markdownEditor.addEventListener('select', scheduleLineNumberUpdate);
markdownEditor.addEventListener('focus', scheduleLineNumberUpdate);

document.addEventListener('selectionchange', () => {
  if (document.activeElement === markdownEditor) {
    scheduleLineNumberUpdate();
  }
});

downloadMarkdownButton.addEventListener('click', () => {
  downloadFile(markdownEditor.value, 'markdown-input.md', 'text/markdown;charset=utf-8');
});

downloadHtmlButton.addEventListener('click', async () => {
  if (latestHtml !== previewBody.innerHTML) {
    latestHtml = previewBody.innerHTML;
  }

  const htmlDocument = await fetch(documentEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify({
      markdown: markdownEditor.value,
      sourceName: 'markdown-input.md',
      documentTitle: 'markdown-preview'
    })
  }).then((response) => {
    if (!response.ok) {
      throw new Error('Failed to generate the HTML document.');
    }

    return response.text();
  });

  downloadFile(htmlDocument, 'markdown-preview.html', 'text/html;charset=utf-8');
});

scheduleLineNumberUpdate();
