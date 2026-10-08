export type PageRecord = {
  slug: string;
  title: string;
  navLabel: string;
  seoTitle: string;
  description: string;
  order: number;
  published: boolean;
  markdown: string;
  updatedAt?: string;
};
