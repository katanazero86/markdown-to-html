import express from 'express';

import { defaultMarkdown } from './default-markdown.js';
import { markdownToHtml } from './markdown-to-html.js';
import {
  getProjectRootPath,
  getViewsDirectoryPath,
  renderHtmlDocumentTemplate,
  renderPreviewPageTemplate
} from './template-service.js';

const app = express();
const port = Number(process.env.PORT ?? '3000');
const projectRootPath = getProjectRootPath();
const initialDocument = {
  markdownText: defaultMarkdown,
  sourceName: 'built-in example'
};

app.set('views', getViewsDirectoryPath());
app.set('view engine', 'ejs');
app.use(express.text({ type: 'text/plain', limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));
app.use(express.static(`${projectRootPath}/public`));

/**
 * 브라우저에서 바로 편집할 수 있는 기본 프리뷰 페이지를 반환한다.
 */
app.get('/', async (_request, response) => {
  try {
    const bodyContent = markdownToHtml(initialDocument.markdownText);
    const pageHtml = await renderPreviewPageTemplate({
      bodyContent,
      documentTitle: 'Markdown Preview',
      sourceName: initialDocument.sourceName,
      markdownText: initialDocument.markdownText
    });

    response.type('html').send(pageHtml);
  } catch (error) {
    response.status(500).type('text').send(getErrorMessage(error));
  }
});

/**
 * 입력된 Markdown 문자열을 HTML 조각으로 변환해서 반환한다.
 */
app.post('/render', (request, response) => {
  try {
    const markdownText = typeof request.body === 'string' ? request.body : '';
    const htmlContent = markdownToHtml(markdownText);
    response.type('html').send(htmlContent);
  } catch (error) {
    response.status(400).type('text').send(getErrorMessage(error));
  }
});

/**
 * 현재 에디터 내용을 다운로드 가능한 완전한 HTML 문서로 생성한다.
 */
app.post('/document', async (request, response) => {
  try {
    const markdownText = typeof request.body?.markdown === 'string' ? request.body.markdown : '';
    const sourceName = typeof request.body?.sourceName === 'string' ? request.body.sourceName : 'markdown-input.md';
    const documentTitle = typeof request.body?.documentTitle === 'string' ? request.body.documentTitle : 'markdown-preview';
    const bodyContent = markdownToHtml(markdownText);
    const htmlDocument = await renderHtmlDocumentTemplate({
      bodyContent,
      documentTitle,
      sourceName
    });

    response.type('html').send(htmlDocument);
  } catch (error) {
    response.status(400).type('text').send(getErrorMessage(error));
  }
});

app.listen(port, () => {
  console.log(`Preview server running at http://localhost:${port}`);
  console.log(`Initial content source: ${initialDocument.sourceName}`);
});

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
}
