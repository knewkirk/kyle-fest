import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import Three from '@three';

import './index.less';

export default () => {
  const threeContainerRef = useRef(null);
  const [didInit, setDidInit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const onComplete = () => setIsLoading(false);

  const initThree = useCallback(() => {
    if (!threeContainerRef.current || didInit) {
      return;
    }
    setDidInit(true);
    const SF = new Three(true, threeContainerRef.current, onComplete);
    SF.init();
  }, [threeContainerRef.current, didInit]);

  useEffect(() => {
    initThree();
  }, [initThree]);

  return (
    <>
      {isLoading && (
        <div className="spinner-bg">
          <p>🌚</p>
        </div>
      )}
      <Link className="main-link" to="/" >
        <span className="link-text">K</span>
        <span className="link-text-bg">K</span>
      </Link>
      <div id="three-container" ref={threeContainerRef}></div>
    </>
  );
};
