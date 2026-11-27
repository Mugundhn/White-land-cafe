declare module "page-flip" {
  export type FlipCorner = "top" | "bottom";
  export interface FlipSetting {
    disableFlipByClick: boolean;
    [k: string]: unknown;
  }
  export class PageFlip {
    constructor(block: HTMLElement, setting: Record<string, unknown>);
    loadFromHTML(items: NodeListOf<HTMLElement> | HTMLElement[]): void;
    on(event: string, cb: (e: { data: number | string }) => void): PageFlip;
    flip(page: number, corner?: FlipCorner): void;
    flipNext(corner?: FlipCorner): void;
    flipPrev(corner?: FlipCorner): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
    getOrientation(): "portrait" | "landscape";
    getSettings(): FlipSetting;
    destroy(): void;
  }
}
