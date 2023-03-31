import * as React from 'react';
import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';

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
    theme: Theme.Tokyo,
    loadingEl,
    threeContainerEl,
  });

  return (
    <>
      {shouldMountLoading && (
        <div className="tokyo-loading-bg" ref={loadingRef}>
          <p>🌚</p>
        </div>
      )}
      <Link className="main-link" to="/">
        <span className="link-text">★</span>
        <span className="link-text-bg">★</span>
      </Link>
      <Link className="space-link" to="/space">
        <span className="link-text">🪐</span>
      </Link>
      <div id="tokyo-container" ref={threeContainerRef}></div>
    </>
  );
};
