import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ejs from 'ejs';

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectoryPath = path.dirname(currentFilePath);
const projectRootPath = path.resolve(currentDirectoryPath, '..');
const viewsDirectoryPath = path.join(projectRootPath, 'views');

type HtmlDocumentTemplateData = {
  bodyContent: string;
  documentTitle: string;
  sourceName: string;
};

type PreviewPageTemplateData = {
  bodyContent: string;
  documentTitle: string;
  sourceName: string;
  markdownText: string;
};

export function getProjectRootPath(): string {
  return projectRootPath;
}

export function getViewsDirectoryPath(): string {
  return viewsDirectoryPath;
}

export async function renderHtmlDocumentTemplate(templateData: HtmlDocumentTemplateData): Promise<string> {
  const stylesheetPath = path.join(projectRootPath, 'public', 'styles', 'html-document.css');
  const stylesheetContent = await fs.readFile(stylesheetPath, 'utf8');

  return ejs.renderFile(path.join(viewsDirectoryPath, 'html-document.ejs'), {
    ...templateData,
    stylesheetContent
  });
}

export async function renderPreviewPageTemplate(templateData: PreviewPageTemplateData): Promise<string> {
  return ejs.renderFile(path.join(viewsDirectoryPath, 'preview-page.ejs'), templateData);
}
