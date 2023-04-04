import * as React from 'react';
import { Link } from 'react-router-dom';

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
      <Link className="bottom-link left" to="/">
        <span className="link-icon">★</span>
      </Link>
      <Link className="bottom-link right" to="/afters">
        <span className="link-icon">🪐</span>
      </Link>
      <div id="tokyo-container" ref={setThreeContainerRef}></div>
    </>
  );
};
