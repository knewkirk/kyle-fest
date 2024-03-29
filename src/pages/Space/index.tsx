import * as React from 'react';

import Microphone from '@components/Microphone';
import useStateRef from '@hooks/useStateRef';
import useThree from '@hooks/useThree';
import { Theme } from '@three';

export default () => {
  const [loadingEl, setLoadingRef] = useStateRef();
  const [threeContainerEl, setThreeContainerRef] = useStateRef();

  const { shouldMountLoading } = useThree({
    theme: Theme.Space,
    loadingEl,
    threeContainerEl,
  });

  return (
    <>
      {shouldMountLoading && (
        <div className="loading-bg space" ref={setLoadingRef}>
          <p className="loading-icon">🪐</p>
        </div>
      )}
      <a href="/karaoke" className="bottom-link left">
        <Microphone className="link-icon" />
      </a>
      <div id="space-container" ref={setThreeContainerRef}></div>
    </>
  );
};
