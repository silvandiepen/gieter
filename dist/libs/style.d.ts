import { Payload } from "../types";
export declare const createCss: (content: string, css: string, options?: {}) => Promise<string>;
export declare const createBaseCss: (payload: Payload, css: string) => Promise<string>;
export declare const generateStyles: (payload: Payload) => Promise<Payload>;
