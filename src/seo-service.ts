import type { Request } from 'express';

type SeoMetadata = {
  canonicalUrl?: string;
  jsonLd: string;
  metaDescription: string;
  robotsContent: string;
  title: string;
};

type PreviewSeoInput = {
  pageUrl: string;
};

type DocumentSeoInput = {
  bodyContent: string;
  documentTitle: string;
  siteUrl: string;
};

const repositoryUrl = 'https://github.com/katanazero86/markdown-to-html';
const defaultSiteName = 'Markdown to HTML Preview';
const defaultDescription =
  'Convert Markdown into HTML instantly with a live side-by-side preview, downloadable output, and a browser-based editing workflow.';

/**
 * 현재 요청 정보를 기준으로 사이트의 기준 URL을 생성한다.
 *
 * 프록시 환경에서는 `x-forwarded-proto` 헤더를 우선 사용하고,
 * 없으면 Express가 해석한 프로토콜과 호스트를 조합한다.
 */
export function getSiteUrl(request: Request): string {
  const forwardedProtoHeader = request.get('x-forwarded-proto');
  const forwardedProto = forwardedProtoHeader?.split(',')[0]?.trim();
  const protocol = forwardedProto || request.protocol || 'http';
  const host = request.get('host') || `localhost:${process.env.PORT ?? '3000'}`;

  return `${protocol}://${host}`;
}

/**
 * 프리뷰 페이지용 SEO 메타데이터를 생성한다.
 *
 * 검색 엔진과 소셜 미리보기에 필요한 제목, 설명, canonical URL,
 * robots 정책, JSON-LD 구조화 데이터를 한 번에 반환한다.
 */
export function buildPreviewSeoMetadata(input: PreviewSeoInput): SeoMetadata {
  return {
    canonicalUrl: input.pageUrl,
    jsonLd: JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: defaultSiteName,
        description: defaultDescription,
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Windows, macOS, Linux',
        url: input.pageUrl,
        sameAs: repositoryUrl,
        publisher: {
          '@type': 'Person',
          name: 'katanazero86',
          url: repositoryUrl
        },
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'KRW'
        }
      },
      null,
      2
    ),
    metaDescription: defaultDescription,
    robotsContent: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    title: defaultSiteName
  };
}

/**
 * 다운로드용 HTML 문서에 적용할 SEO 메타데이터를 생성한다.
 *
 * 본문 HTML에서 설명 문구를 추출해 메타 설명과 구조화 데이터에 반영하고,
 * 문서 제목을 기준으로 검색 노출용 메타를 구성한다.
 */
export function buildDocumentSeoMetadata(input: DocumentSeoInput): SeoMetadata {
  const derivedDescription = createDescriptionFromHtml(input.bodyContent);

  return {
    jsonLd: JSON.stringify(
      {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: input.documentTitle,
        description: derivedDescription,
        about: ['Markdown', 'HTML', 'Preview'],
        author: {
          '@type': 'Person',
          name: 'katanazero86',
          url: repositoryUrl
        },
        publisher: {
          '@type': 'Person',
          name: 'katanazero86',
          url: repositoryUrl
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': input.siteUrl
        },
        isPartOf: {
          '@type': 'WebSite',
          name: defaultSiteName,
          url: input.siteUrl
        }
      },
      null,
      2
    ),
    metaDescription: derivedDescription,
    robotsContent: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    title: input.documentTitle
  };
}

/**
 * 검색 엔진 크롤러가 읽을 수 있는 robots.txt 내용을 생성한다.
 *
 * 현재 사이트의 sitemap 위치도 함께 포함해서 크롤러가 주요 페이지를
 * 더 쉽게 발견할 수 있도록 돕는다.
 */
export function getRobotsText(siteUrl: string): string {
  return [`User-agent: *`, `Allow: /`, `Sitemap: ${siteUrl}/sitemap.xml`].join('\n');
}

function createDescriptionFromHtml(htmlContent: string): string {
  const plainText = htmlContent
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!plainText) {
    return defaultDescription;
  }

  const trimmedText = plainText.slice(0, 157).trim();

  return plainText.length > 157 ? `${trimmedText}...` : trimmedText;
}
