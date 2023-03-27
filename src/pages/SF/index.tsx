import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { init } from '@three';

import spinner from '@images/spinner.gif';
import './index.less';

export default () => {
  const threeContainerRef = useRef(null);
  const [didInit, setDidInit] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const onComplete = () => {
    setIsLoading(false);
    console.log('done!');
  };

  const initThree = React.useCallback(() => {
    if (!threeContainerRef.current || didInit) {
      return;
    }
    setDidInit(true);
    init(threeContainerRef.current, onComplete);
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
