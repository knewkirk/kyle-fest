import * as React from 'react';
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

import useThree from '@hooks/useThree';
import Microphone from '@components/Microphone';
import { Theme } from '@three';

import './index.less';

export default () => {
  const [loadingEl, setLoadingEl] = useState<HTMLElement>(null);
  const [threeContainerEl, setThreeContainerEl] = useState<HTMLElement>(null);
  const loadingRef = useCallback((el: HTMLElement) => {
    if (!el) {
      return;
    }
    setLoadingEl(el);
  }, []);
  const threeContainerRef = useCallback((el: HTMLElement) => {
    if (!el) {
      return;
    }
    setThreeContainerEl(el);
  }, []);

  const { shouldMountLoading } = useThree({
    theme: Theme.SF,
    loadingEl,
    threeContainerEl,
  });

  return (
    <>
      {shouldMountLoading && (
        <div className="sf-loading-bg" ref={loadingRef}>
          <p>🌞</p>
        </div>
      )}
      <Link className="karaoke-link" to="/karaoke">
        <Microphone className="microphone" />
      </Link>
      <div id="sf-container" ref={threeContainerRef}></div>
    </>
  );
};
