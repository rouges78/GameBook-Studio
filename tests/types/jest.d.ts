import { WebviewTag } from 'electron';

declare global {
  interface Document {
    createElement(tagName: 'webview'): WebviewTag;
    createElement(tagName: 'canvas'): HTMLCanvasElement;
    createElement(tagName: 'a'): HTMLAnchorElement;
    createElement(tagName: string): HTMLElement;
  }
}
