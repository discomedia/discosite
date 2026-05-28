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

export type PageInput = Omit<PageRecord, "updatedAt"> & {
  updatedAt?: string;
};

export type FormState = "idle" | "submitting" | "success" | "error";
