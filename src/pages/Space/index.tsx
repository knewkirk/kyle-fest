import * as React from 'react';
import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

import Microphone from '@components/Microphone';
import useThree from '@hooks/useThree';
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
    theme: Theme.Space,
    loadingEl,
    threeContainerEl,
  });

  return (
    <>
      {shouldMountLoading && (
        <div className="space-loading-bg" ref={loadingRef}>
          <p>🪐</p>
        </div>
      )}
      <Link className="space-karaoke-link" to="/karaoke">
        <Microphone className="microphone" />
      </Link>
      <div id="space-container" ref={threeContainerRef}></div>
    </>
  );
};
