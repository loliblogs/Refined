import type { ISetConfigMessage } from 'giscus';

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      'giscus-widget': ISetConfigMessage.setConfig;
    }
  }
}
