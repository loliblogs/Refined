import { useEffect } from 'preact/hooks';
import mediumZoom from 'medium-zoom-next';
import { decryptStore } from '@/stores/state';

export default function MediumZoom() {
  useEffect(() => {
    // 初始化 zoom 实例
    const zoom = mediumZoom('#content img');

    // 订阅内容解密状态，重新附加解密后的图片
    const unsubscribe = decryptStore.subscribe(
      state => state.isDecrypted,
      (isDecrypted) => {
        if (isDecrypted) {
          // 直接传递选择器字符串，zoom 会自动查找并附加新图片
          zoom.attach('#content img');
        }
      },
      { fireImmediately: true },
    );

    // 清理函数
    return () => {
      zoom.detach();
      unsubscribe();
    };
  }, []);

  return null;
}
