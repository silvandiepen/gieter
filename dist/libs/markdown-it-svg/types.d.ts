export declare type MarkdownIt = any;
export interface MDISvgOptions {
    links: boolean;
    bem?: boolean;
    tag?: string;
    role?: boolean;
    types?: string[];
}
export interface MDIContainerOptions {
    marker?: string;
    validate?: any;
    render?: any;
}
export interface MDIContainerToken {
    markup: string;
    block: boolean;
    info: string;
    map: number[];
}
export interface MDIContainerSettings {
    startLine: number;
    endLine: number;
    silent: boolean;
    pos?: number;
    nextLine?: number;
    marker_count?: number;
    markup?: string;
    params?: string;
    token?: MDIContainerToken;
    old_parent?: string;
    old_line_max?: number;
    auto_closed: boolean;
    start: number;
    max: number;
}
