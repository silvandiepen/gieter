interface connectionConfig {
    timeout?: number;
    retries?: number;
    domain?: string;
}
export declare const checkConnection: (config?: connectionConfig) => Promise<void>;
export {};
