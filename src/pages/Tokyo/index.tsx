import * as React from 'react';

import useStateRef from '@hooks/useStateRef';
import useThree from '@hooks/useThree';
import { Theme } from '@three';

export default () => {
  const [loadingEl, setLoadingRef] = useStateRef();
  const [threeContainerEl, setThreeContainerRef] = useStateRef();

  const { shouldMountLoading } = useThree({
    theme: Theme.Tokyo,
    loadingEl,
    threeContainerEl,
  });

  return (
    <>
      {shouldMountLoading && (
        <div className="loading-bg tokyo" ref={setLoadingRef}>
          <p className="loading-icon">🌚</p>
        </div>
      )}
      <a href="/" className="bottom-link left">
        <span className="link-icon">★</span>
      </a>
      <a href="/afters" className="bottom-link right">
        <span className="link-icon">🪐</span>
      </a>
      <div id="tokyo-container" ref={setThreeContainerRef}></div>
    </>
  );
};
