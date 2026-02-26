import { onMount, onCleanup, createEffect } from 'solid-js';
import mediumZoom from 'medium-zoom-next';
import { isDecrypted } from '@/stores/state';

export default function MediumZoom() {
  onMount(() => {
    // 初始化 zoom 实例
    const zoom = mediumZoom('[data-content] img');

    // 监听解密状态，重新附加解密后的图片
    createEffect(() => {
      if (isDecrypted()) {
        zoom.attach('[data-content] img');
      }
    });

    onCleanup(() => {
      zoom.detach();
    });
  });

  return null;
}
