import { useEffect } from 'react';

export default function AstroTransition({ animationOld, animationNew }: { animationOld: string; animationNew: string }) {
  useEffect(() => {
    document.addEventListener('astro:before-preparation', () => {
      const aside = document.getElementById('aside-inner');
      const content = document.getElementById('content');
      aside?.classList.remove(animationNew);
      content?.classList.remove(animationNew);
      aside?.classList.add(animationOld);
      content?.classList.add(animationOld);
    });

    document.addEventListener('astro:before-swap', (event) => {
      const aside = event.newDocument.getElementById('aside-inner');
      const content = event.newDocument.getElementById('content');
      aside?.classList.add(animationNew);
      content?.classList.add(animationNew);
    });
  }, []);

  return null;
}
