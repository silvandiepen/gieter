import { languageKeys } from "./data/language";

export type Language = languageKeys

export interface Arguments {
  [key: string]: any;
}

export interface Settings {
  output: string;
  languages: Language[];
  args: Arguments;
  config: Arguments;
}

export interface Project {
  logo?: string;
  title?: string;
  description?: string;
  ignore?: string[];
  style?: string;
  styleOverrule?: string;
  language?: Language;
  script?: string | string[];
  groupTags?: boolean;
  copyFiles?: string | string[];
}

export interface Style {
  path?: string;
  sheet?: string;
  add?: string;
  page?: string;
  og?: string;
}
interface Favicons {
  default: string;
  light: string;
  dark: string;
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
  archives?: File[];
  tags?: Tag[];
  favicons?: Favicons;
}
export interface Tag {
  name: string;
  link?: string;
  parent?: string;
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
}
export interface Archive {
  name: string;
  type: ArchiveType;
  children: File[];
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
  parent?: string;
  archives?: Archive[];
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
  code: string;
  name: string;
  title: string;
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

export interface buildHtmlArgs {
  menu: MenuItem[];
  style: Style;
  project: Project;
  media: File[];
  logo: File;
  archives?: File[];
  contentOnly: boolean;
  tags?: Tag[];
  subtitle: string;
  thumbnail?: string | null;
  meta?: Meta;
  showContentImage?: boolean;
  favicons: Favicons;
  homeLink: string;
  langMenu: LanguageMenuItem[];
  language: Language;
  components: string[],
  has: {
    table: boolean;
    header: boolean;
    urlToken: boolean;
    colors: boolean;
    languages: boolean;
  };
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
  title: string;
}

export interface Dirent {
  name: string;
  [index: string]: any;
}
