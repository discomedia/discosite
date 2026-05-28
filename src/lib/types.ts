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

export type MenuArea = "primary" | "headerCta" | "footer";

export type MenuItemRecord = {
  id: string;
  label: string;
  url: string;
  area: MenuArea;
  order: number;
  published: boolean;
  updatedAt?: string;
};

export type MenuInput = Omit<MenuItemRecord, "updatedAt"> & {
  updatedAt?: string;
};

export type FormState = "idle" | "submitting" | "success" | "error";
