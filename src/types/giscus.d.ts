import type { BooleanString, Mapping, Repo, Theme, AvailableLanguage, InputPosition, Loading } from 'giscus';

declare module 'solid-js' {
  namespace JSX {
    interface IntrinsicElements {
      'giscus-widget': {
        id?: string;
        host?: string;
        repo: Repo;
        repoId: string;
        category?: string;
        categoryId?: string;
        mapping: Mapping;
        term?: string;
        theme?: Theme;
        strict?: BooleanString;
        reactionsEnabled?: BooleanString;
        emitMetadata?: BooleanString;
        inputPosition?: InputPosition;
        lang?: AvailableLanguage;
        loading?: Loading;
      };
    }
  }
}
