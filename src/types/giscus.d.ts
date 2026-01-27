import type { ISetConfigMessage } from 'giscus';

declare module 'preact' {
  namespace JSX {
    interface IntrinsicElements {
      'giscus-widget': ISetConfigMessage.setConfig;
    }
  }
}
