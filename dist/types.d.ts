export interface Payload {
    input?: string;
    output?: string;
    files: MarkdownFile[];
}
export interface MarkdownFile {
    name: string;
    path: string;
    ext?: string;
    data?: string;
    html?: string;
}
