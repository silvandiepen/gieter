export interface Settings {
    output: string;
}
export interface Project {
    logo?: string;
    logoData?: string;
    title?: string;
    ignore?: string[];
    style?: string;
    styleOverrule?: string;
}
export interface Style {
    path?: string;
    sheet?: string;
    add?: string;
}
export interface Payload {
    input?: string;
    output?: string;
    files: File[];
    media: File[];
    style?: Style;
    settings?: Settings;
    project?: Project;
    menu?: MenuItem[];
    archives?: File[];
    tags?: Tag[];
}
export interface Tag {
    name: string;
    parent: string;
    type: string;
}
export interface File {
    name: string;
    fileName: string;
    path: string;
    created: any;
    title?: string;
    relativePath?: string;
    parent?: string;
    children?: File[];
    ext?: string;
    data?: string;
    html?: string;
    meta?: Meta;
    link?: string;
}
export interface MenuItem {
    name: string;
    link: string;
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
    style: Style;
    project: Project;
    media: File[];
    archives?: File[];
}
