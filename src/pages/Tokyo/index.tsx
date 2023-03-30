import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import Three from '@three';

import './index.less';

export default () => {
  const spinnerRef = useRef(null);
  const threeContainerRef = useRef(null);
  const [didInit, setDidInit] = useState(false);
  const [shouldMountLoading, setShouldMountLoading] = useState(true);
  const [threeInstance, setThreeInstance] = useState(null);

  const onComplete = useCallback(() => {
    if (!spinnerRef.current) {
      return;
    }
    spinnerRef.current.classList.add('fade-out');
    spinnerRef.current.addEventListener('transitionend', () => {
      setShouldMountLoading(false);
    });
  }, [spinnerRef.current]);

  const cleanupThree = useCallback(() => {
    if (!threeInstance) {
      return;
    }
    threeInstance.cleanup();
  }, [threeInstance]);

  const initThree = useCallback(() => {
    if (!threeContainerRef.current || didInit) {
      return;
    }
    setDidInit(true);
    const three = new Three(true, threeContainerRef.current, onComplete);
    three.init();
    setThreeInstance(three);
  }, [threeContainerRef.current, didInit]);

  useEffect(() => {
    initThree();
    return cleanupThree;
  }, [initThree]);

  return (
    <>
      {shouldMountLoading && (
        <div className="tokyo-spinner-bg" ref={spinnerRef}>
          <p>🌚</p>
        </div>
      )}
      <Link className="main-link" to="/">
        <span className="link-text">★</span>
        <span className="link-text-bg">★</span>
      </Link>
      <div id="three-container" ref={threeContainerRef}></div>
    </>
  );
};
