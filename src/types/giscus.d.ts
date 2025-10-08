import type { ISetConfigMessage } from 'giscus';

declare module 'react' {
  declare namespace JSX {
    interface IntrinsicElements {
      'giscus-widget': ISetConfigMessage.setConfig;
    }
  }
}
