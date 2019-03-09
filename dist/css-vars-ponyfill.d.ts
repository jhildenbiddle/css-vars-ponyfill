declare module 'css-vars-ponyfill' {
    export default function cssVars(options?: {
        rootElement?: HTMLElement|Node;
        include?: string;
        exclude?: string;
        fixNestedCalc?: boolean;
        onlyLegacy?: boolean;
        onlyVars?: boolean;
        preserve?: boolean;
        shadowDOM?: boolean;
        silent?: boolean;
        updateDOM?: boolean;
        updateURLs?: boolean;
        variables?: {[key: string]: string};
        watch?: boolean;
        onBeforeSend?(xhr: XMLHttpRequest, node: HTMLLinkElement|HTMLStyleElement, url: string): void;
        onSuccess?(cssText: string, node: HTMLLinkElement|HTMLStyleElement, url: string): void;
        onError?(message: string, node: HTMLLinkElement|HTMLStyleElement, xhr: XMLHttpRequest, url: string): void;
        onWarning?(message: string): void;
        onComplete?(cssText: string, styleNode: HTMLStyleElement, cssVariables: {[key: string]: string}, benchmark: number): void;
    }): void;
}