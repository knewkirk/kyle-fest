import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import ThreeSF from '@three';

import './index.less';

export default () => {
  const threeContainerRef = useRef(null);
  const [didInit, setDidInit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const onComplete = () => setIsLoading(false);

  const initThree = React.useCallback(() => {
    if (!threeContainerRef.current || didInit) {
      return;
    }
    setDidInit(true);
    const SF = new ThreeSF(threeContainerRef.current, onComplete);
    SF.init();
  }, [threeContainerRef.current, didInit]);

  useEffect(() => {
    initThree();
  }, [initThree]);

  // for tokyo:
  //https://threejs.org/examples/?q=postpro#webgl_postprocessing_unreal_bloom

  return (
    <>
      {isLoading && (
        <div className="spinner-bg">
          <p>🌞</p>
        </div>
      )}
      <div id="three-container" ref={threeContainerRef}></div>
    </>
  );
};
