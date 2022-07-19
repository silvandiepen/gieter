export interface Settings {
  output: string;
  languages: Language[];
}

export interface Project {
  logo?: string;
  title?: string;
  description?: string;
  domain?:string;
  ignore?: string[];
  style?: string;
  styleOverrule?: string;
  language?: Language;
  script?: string | string[];
  groupTags?: boolean;
}

export interface Style {
  path?: string;
  sheet?: string;
  add?: string;
  page?: string;
  og?: string;
}

export interface Has {
  table: boolean;
  header: boolean;
  urlToken: boolean;
  colors: boolean;
  shop: boolean;
  paypal: boolean;
  menu: boolean;
  archive: boolean;
}

export enum Currency {
  EUR = "eur",
  USD = "usd",
  GBP = "gbp",
  RUB = "rub",
  JPY = "jpy",
}

export interface Payload extends Settings {
  input?: string;
  files: File[];
  media: File[];
  style?: Style;
  settings?: Settings;
  project?: Project;
  logo?: File;
  menu?: MenuItem[];
  // archives?: File[];
  tags?: Tag[];
  favicon?: string;
  currency?: Currency;
  has?: Partial<Has>;
  shop?: Shop;
}
export interface Tag {
  name: string;
  link?: string;
  parent?: Parent;
  type: string;
}

export enum FileType {
  CONTENT = "content",
  TAG = "tag",
  ARCHIVE = "archive",
}

export enum ArchiveType {
  BLOG = "blog",
  SECTIONS = "sections",
  ARTICLES = "articles",
  COLLECTION = "collection",
  SHOP = "shop",
  NONE = "none",
}
export interface Archive {
  name: string;
  type: ArchiveType;
  children: File[];
  sections: File[];
}

export enum Language {
  EN = "en",
  NL = "nl",
  RU = "ru",
  MT = "mt",
  AM = "am",
}

export interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  formattedPrice: string;
  currency: Currency;
}

export interface Parent {
  title: string;
  id: string;
  name: string;
  archive: ArchiveType;
}

export interface File {
  id: string;
  name: string;
  fileName: string;
  path: string;
  created: Date;
  language: Language;
  home?: boolean;
  title?: string;
  relativePath?: string;
  parent?: Parent;
  archive?: Archive;
  ext?: string;
  date?: Date;
  data?: string;
  html?: string;
  excerpt?: string;
  meta?: Meta;
  link?: string;
  type?: FileType;
  thumbnail?: string;
  thumbnailSvg?: string;
  product?: Product;
}
export interface MenuItem {
  id: string;
  name: string;
  link: string;
  active: boolean;
  language: Language;
  icon?: string;
  current?: boolean;
  isParent?: boolean;
  children?: MenuItem[];
  order?: number;
}

export interface LanguageMenuItem {
  name: string;
  link: string;
  active: boolean;
}

export interface Meta {
  [x: string]: any;
}
export interface MarkdownData {
  meta?: Meta;
  document?: string;
}
export interface Shop {
  currency: Currency;
  clientId: string;
}

export interface buildHtmlArgs {
  menu: MenuItem[];
  style: Style;
  project: Project;
  media: File[];
  logo: File;
  archive?: Archive;
  contentOnly: boolean;
  tags?: Tag[];
  subtitle: string;
  thumbnail?: string | null;
  meta?: Meta;
  showContentImage?: boolean;
  favicon: string;
  homeLink: string;
  langMenu: LanguageMenuItem[];
  language: Language;
  shop: Shop;
  has: Partial<Has>;
  background: {
    body: string | null,
    section: string | null
  }
}
interface PageCss {
  data: string;
  file: string;
}
interface PageHtml {
  data: string;
  file: string;
}

export interface Page {
  dir: string;
  css: PageCss;
  html: PageHtml;
  link: string;
  name: string;
}

export interface Dirent {
  name: string;
  [index: string]: any;
}
