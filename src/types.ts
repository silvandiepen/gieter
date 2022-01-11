export interface Settings {
  output: string;
  languages: Language[];
}

export interface Project {
  logo?: string;
  logoData?: string;
  title?: string;
  description?: string;
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
export interface Payload extends Settings {
  input?: string;
  files: File[];
  media: File[];
  style?: Style;
  settings?: Settings;
  project?: Project;
  menu?: MenuItem[];
  archives?: File[];
  tags?: Tag[];
  favicon?: string;
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

export interface Archive {
  name: string;
  type: string;
  children: File[];
}

export enum Language {
  EN = "en",
  NL = "nl",
  RU = "ru",
  MT = "mt",
  AM = "am",
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
}
export interface MenuItem {
  name: string;
  link: string;
  active: boolean;
  language: Language;
  current?: boolean;
  isParent?: boolean;
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

export interface buildHtmlArgs {
  menu: MenuItem[];
  style: Style;
  project: Project;
  media: File[];
  archives?: File[];
  contentOnly: boolean;

  tags?: Tag[];
  thumbnail?: string | null;
  meta?: Meta;
  showContentImage?: boolean;
  favicon: string;
  homeLink: string;
  langMenu: LanguageMenuItem[];
  language: Language;
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
