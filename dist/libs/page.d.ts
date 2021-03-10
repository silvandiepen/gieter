import { Payload, File } from "../types";
interface PageCss {
    data: string;
    file: string;
}
interface PageHtml {
    data: string;
    file: string;
}
interface Page {
    dir: string;
    css: PageCss;
    html: PageHtml;
    link: string;
    name: string;
}
export declare const buildPage: (payload: Payload, file: File) => Promise<Page>;
export declare const createPage: (payload: Payload, file: File) => Promise<void>;
export declare const createApiPage: (payload: Payload, file: File) => Promise<void>;
export {};
