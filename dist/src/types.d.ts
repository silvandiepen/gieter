export interface Settings {
    output: string;
}
export interface Project {
    logo?: string;
    title?: string;
}
export interface Payload {
    input?: string;
    output?: string;
    files: MarkdownFile[];
    style?: string;
    settings?: Settings;
    project?: Project;
    menu?: MenuItem[];
}
export interface MarkdownFile {
    name: string;
    path: string;
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
}
