import { useCallback, useEffect, useState } from 'react';
import Three, { Theme } from '@three';

interface Args {
  theme: Theme;
  loadingEl: HTMLElement;
  threeContainerEl: HTMLElement;
}

export default ({ theme, loadingEl, threeContainerEl }: Args) => {
  const [didInit, setDidInit] = useState(false);
  const [shouldMountLoading, setShouldMountLoading] = useState(true);
  const [threeInstance, setThreeInstance] = useState<Three>(null);

  const onComplete = useCallback(() => {
    if (!loadingEl) {
      return;
    }

    loadingEl.classList.add('fade-out');
    loadingEl.addEventListener('transitionend', () => {
      setShouldMountLoading(false);
    });
  }, [loadingEl]);

  useEffect(() => {
    if (!threeContainerEl || didInit) {
      return;
    }
    const three = new Three(theme, threeContainerEl, onComplete);
    three.init();
    setDidInit(true);
    setThreeInstance(three);
  }, [threeContainerEl]);

  // TODO: Verify this actually helps -
  // seems like a hard page nav works perhaps better than a <Link>
  const cleanup = useCallback(() => {
    if (!threeInstance) {
      return;
    }
    threeInstance.cleanup();
    setDidInit(false);
    setThreeInstance(null);
  }, [threeInstance]);

  return {
    shouldMountLoading,
    cleanup,
  };
};
