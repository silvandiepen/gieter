import { Payload, File, Page } from "../types";
export declare const buildPage: (payload: Payload, file: File) => Promise<Page>;
export declare const createPage: (payload: Payload, file: File) => Promise<void>;
