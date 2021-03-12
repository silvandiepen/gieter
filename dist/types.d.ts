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
    page?: string;
    og?: string;
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
    favicon?: string;
}
export interface Tag {
    name: string;
    parent: string;
    type: string;
}
export declare enum FileType {
    CONTENT = "content",
    TAG = "tag",
    ARCHIVE = "archive"
}
export interface File {
    name: string;
    fileName: string;
    path: string;
    created: any;
    home?: boolean;
    title?: string;
    relativePath?: string;
    parent?: string;
    children?: File[];
    ext?: string;
    data?: string;
    html?: string;
    meta?: Meta;
    link?: string;
    type?: FileType;
}
export interface MenuItem {
    name: string;
    link: string;
    active: boolean;
    current?: boolean;
    isParent?: boolean;
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
    contentOnly: boolean;
}
