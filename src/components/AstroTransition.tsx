import { useEffect } from 'react';

export default function AstroTransition({ animationOld }: { animationOld: string }) {
  useEffect(() => {
    document.addEventListener('astro:before-preparation', () => {
      const aside = document.getElementById('aside-inner');
      const content = document.getElementById('content');
      aside?.classList.add(animationOld);
      content?.classList.add(animationOld);
    });
  }, []);

  return null;
}
