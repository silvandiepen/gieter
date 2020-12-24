export interface Settings {
    output: string;
}
export interface Payload {
    input?: string;
    output?: string;
    files: MarkdownFile[];
    style?: string;
    settings?: Settings;
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
}
export interface Meta {
    [x: string]: string | string[] | any;
}
export interface MarkdownData {
    meta?: Meta;
    document?: string;
}
