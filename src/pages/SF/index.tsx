import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import Microphone from '@components/Microphone';
import Three from '@three'

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
    const SF = new Three(false, threeContainerRef.current, onComplete);
    SF.init();
  }, [threeContainerRef.current, didInit]);

  useEffect(() => {
    initThree();
  }, [initThree]);

  return (
    <>
      {isLoading && (
        <div className="spinner-bg">
          <p>🌞</p>
        </div>
      )}
      <Link className="karaoke-link" to="/karaoke">
        <Microphone className='microphone'/>
      </Link>
      <div id="three-container" ref={threeContainerRef}></div>
    </>
  );
};
