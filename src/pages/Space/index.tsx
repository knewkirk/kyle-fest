import * as React from 'react';
import { Link } from 'react-router-dom';

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
      <Link className="bottom-link left" to="/karaoke">
        <Microphone className="link-icon" />
      </Link>
      <div id="space-container" ref={setThreeContainerRef}></div>
    </>
  );
};
