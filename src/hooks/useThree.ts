import { useCallback, useEffect, useState } from 'react';
import Three, { Theme } from '@three';

interface Args {
  theme: Theme;
  loadingEl: HTMLElement;
  threeContainerEl: HTMLElement;
}

export default ({ theme, loadingEl, threeContainerEl }: Args) => {
  console.log({ threeContainerEl, loadingEl });
  const [didInit, setDidInit] = useState(false);
  const [shouldMountLoading, setShouldMountLoading] = useState(true);
  const [threeInstance, setThreeInstance] = useState(null);

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
    console.log('mount?', { threeContainerEl, didInit });
    if (!threeContainerEl || didInit) {
      return;
    }
    const three = new Three(theme, threeContainerEl, onComplete);
    three.init();
    setDidInit(true);
    setThreeInstance(three);

    return () => {
      console.log('unmount?')
      if (!threeInstance) {
        return;
      }
      threeInstance.cleanup();
      setDidInit(false);
      setThreeInstance(null);
    }
  }, [threeContainerEl]);

  return {
    shouldMountLoading,
  };
};
