import { Project } from "../types";
declare global {
    interface String {
        removeBlankLines(): string;
        removeHtmlComments(): string;
        removeXmlDoctype(): string;
        removeAttributes(attributes: string | string[]): string;
    }
}
export declare const cleanupSvg: (file: string) => string;
export declare const getSVGLogo: (project: Project) => Promise<string>;
