/**
 * Schema.org JSON-LD Generator
 * ============================================================
 * Generates structured data for different page types to help
 * Google understand content structure and improve SERP display.
 */

export interface SchemaOptions {
  siteUrl: string;
  siteName: string;
  requestPath: string;
  title: string;
  description: string;
  imageUrl?: string;
  locale?: string;
}

/**
 * Generate Organization Schema
 * Used on all pages to establish site-level structured data
 */
export function generateOrganizationSchema(options: SchemaOptions): object {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: options.siteName,
    url: options.siteUrl,
    logo: `${options.siteUrl}/logo.png`,
    description: "Formula Universe - Free online calculators and decision-support tools",
    sameAs: [
      "https://twitter.com/formulauniverse",
      "https://www.linkedin.com/company/formula-universe",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: "support@formulauniverse.com",
    },
  };
}

/**
 * Generate BreadcrumbList Schema
 * Used on all pages to show navigation hierarchy
 */
export function generateBreadcrumbSchema(options: SchemaOptions): object {
  const pathParts = options.requestPath
    .split("/")
    .filter(Boolean)
    .slice(0, 3); // Limit to 3 levels

  const breadcrumbs = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: options.siteUrl,
    },
  ];

  let currentPath = "";
  pathParts.forEach((part, index) => {
    currentPath += `/${part}`;
    const name = part
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    breadcrumbs.push({
      "@type": "ListItem",
      position: index + 2,
      name,
      item: `${options.siteUrl}${currentPath}`,
    });
  });

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs,
  };
}

/**
 * Generate WebPage Schema
 * Used on all pages as the primary page schema
 */
export function generateWebPageSchema(options: SchemaOptions): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: options.title,
    description: options.description,
    url: `${options.siteUrl}${options.requestPath}`,
    image: options.imageUrl || `${options.siteUrl}/og-default.jpg`,
    inLanguage: options.locale || "zh-TW",
    isPartOf: {
      "@type": "WebSite",
      name: options.siteName,
      url: options.siteUrl,
    },
  };
}

/**
 * Generate Article Schema
 * Used on blog/knowledge article pages
 */
export function generateArticleSchema(options: SchemaOptions & {
  author?: string;
  datePublished?: string;
  dateModified?: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: options.title,
    description: options.description,
    image: options.imageUrl || `${options.siteUrl}/og-default.jpg`,
    url: `${options.siteUrl}${options.requestPath}`,
    author: {
      "@type": "Organization",
      name: options.author || options.siteName,
    },
    datePublished: options.datePublished || new Date().toISOString(),
    dateModified: options.dateModified || new Date().toISOString(),
    isPartOf: {
      "@type": "WebSite",
      name: options.siteName,
      url: options.siteUrl,
    },
  };
}

/**
 * Generate SoftwareApplication Schema
 * Used on tool pages to describe the calculator/tool
 */
export function generateToolSchema(options: SchemaOptions & {
  toolName?: string;
  category?: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: options.toolName || options.title,
    description: options.description,
    url: `${options.siteUrl}${options.requestPath}`,
    applicationCategory: "Productivity",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    image: options.imageUrl || `${options.siteUrl}/og-default.jpg`,
    inLanguage: options.locale || "zh-TW",
  };
}

/**
 * Generate CollectionPage Schema
 * Used on category/listing pages
 */
export function generateCollectionPageSchema(options: SchemaOptions & {
  itemCount?: number;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: options.title,
    description: options.description,
    url: `${options.siteUrl}${options.requestPath}`,
    image: options.imageUrl || `${options.siteUrl}/og-default.jpg`,
    inLanguage: options.locale || "zh-TW",
    numberOfItems: options.itemCount || 0,
  };
}

/**
 * Generate combined schema for a page
 * Returns array of all applicable schemas
 */
export function generatePageSchemas(options: SchemaOptions & {
  pageType?: "tool" | "article" | "category" | "home";
  toolName?: string;
  category?: string;
  author?: string;
  datePublished?: string;
  dateModified?: string;
  itemCount?: number;
}): object[] {
  const schemas: object[] = [
    generateOrganizationSchema(options),
    generateBreadcrumbSchema(options),
    generateWebPageSchema(options),
  ];

  // Add page-type-specific schemas
  if (options.pageType === "tool") {
    schemas.push(generateToolSchema(options));
  } else if (options.pageType === "article") {
    schemas.push(generateArticleSchema(options));
  } else if (options.pageType === "category") {
    schemas.push(generateCollectionPageSchema(options));
  }

  return schemas;
}

/**
 * Generate HTML script tags for JSON-LD schemas
 */
export function generateSchemaScriptTags(schemas: object[]): string {
  return schemas
    .map(
      (schema) =>
        `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
    )
    .join("\n    ");
}

/**
 * Inject schemas into HTML head
 */
export function injectSchemasIntoHtml(html: string, schemas: object[]): string {
  const scriptTags = generateSchemaScriptTags(schemas);
  return html.replace("</head>", `    ${scriptTags}\n  </head>`);
}
