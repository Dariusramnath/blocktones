declare module 'file-saver' {
    export function saveAs(data: Blob | string | ArrayBuffer | ArrayBufferView, filename?: string, options?: any): void;
  }
  