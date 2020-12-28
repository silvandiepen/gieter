export interface Settings {
  output: string;
}

export interface Project {
  logo?: string;
  title?: string;
  ignore?: string[];
}

export interface Payload {
  input?: string;
  output?: string;
  files: File[];
  media: File[];
  style?: string;
  settings?: Settings;
  project?: Project;
  menu?: MenuItem[];
}
export interface File {
  name: string;
  path: string;
  relativePath: string;
  ext?: string;
  data?: string;
  html?: MarkdownData;
}
export interface MenuItem {
  name: string;
  path: string;
  active: boolean;
}

export interface Meta {
  [x: string]: string | string[] | any;
}
export interface MarkdownData {
  meta?: Meta;
  document?: string;
}

export interface buildHtmlArgs {
  menu: MenuItem[];
  style: string;
  project: Project;
  media: File[];
}
