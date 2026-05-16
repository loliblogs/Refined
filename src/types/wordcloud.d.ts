declare module 'wordcloud' {
  import type OriginalWordCloud from 'node_modules/@types/wordcloud';

  interface ListEntry {
    word: string;
    weight: number;
    attributes?: Record<string, string>;
  }

  function WordCloud(elements: HTMLElement | HTMLElement[], options: WordCloud.Options): void;

  namespace WordCloud {
    type EventCallback = (item: ListEntry, dimension: OriginalWordCloud.Dimension, event: MouseEvent) => void;

    interface Options extends Omit<OriginalWordCloud.Options, 'list' | 'click' | 'hover'> {
      list?: ListEntry[];
      click?: EventCallback;
      hover?: EventCallback;
    }

    const isSupported: boolean;
    const minFontSize: number;
    function stop(): void;
  }

  export = WordCloud;
}
