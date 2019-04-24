declare module 'css-vars-ponyfill' {
    export default function cssVars(options?: {
        rootElement?: Document|HTMLElement;
        shadowDOM?: boolean;
        include?: string;
        exclude?: string;
        variables?: {[key: string]: string};
        onlyLegacy?: boolean;
        preserveStatic?: boolean;
        preserveVars?: boolean;
        silent?: boolean;
        updateDOM?: boolean;
        updateURLs?: boolean;
        watch?: null|boolean;
        onBeforeSend?(xhr: XMLHttpRequest, elm: HTMLLinkElement|HTMLStyleElement, url: string): void;
        onWarning?(message: string): void;
        onError?(message: string, elm: HTMLLinkElement|HTMLStyleElement, xhr: XMLHttpRequest, url: string): void;
        onSuccess?(cssText: string, elm: HTMLLinkElement|HTMLStyleElement, url: string): void;
        onComplete?(cssText: string, styleElms: HTMLStyleElement[], cssVariables: {[key: string]: string}, benchmark: number): void;
    }): void;
}