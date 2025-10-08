import { useEffect } from 'react';
import mediumZoom from 'medium-zoom-next';

export default function MediumZoom() {
  useEffect(() => {
    // 初始化 zoom 实例
    const zoom = mediumZoom('#content img');

    // 监听内容解密事件，重新附加解密后的图片
    const handleContentDecrypted = () => {
      // 直接传递选择器字符串，zoom 会自动查找并附加新图片
      zoom.attach('#content img');
    };

    window.addEventListener('content-decrypted', handleContentDecrypted);

    // 清理函数
    return () => {
      zoom.detach();
      window.removeEventListener('content-decrypted', handleContentDecrypted);
    };
  }, []);

  return null;
}
