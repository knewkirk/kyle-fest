import Parallax from 'parallax-js';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';

import './index.less';

const LINEUP = [
  'MITSUØ',
  'MixMaster K',
  'DJ NOCAP',
  'Braden the Fantasmic',
  'BEEEECH',
  'JULEZ',
  'The Newkirk Brothers',
  'MAXXX',
];

export default () => {
  const containerRef = useRef(null);
  const [didInit, setDidInit] = useState(false);
  const [lineup, setLineup] = useState([]);

  useEffect(() => {
    if (!didInit && containerRef.current) {
      new Parallax(containerRef.current, {
        relativeInput: true,
      });
      setLineup(LINEUP.sort(() => Math.random() - 0.5));
      setDidInit(true);
    }
  }, [didInit, containerRef]);

  return (
    <div className="neon-container" ref={containerRef}>
      <div className="layer" data-depth="0.1">
        <img className="background" src={`/images/outrun-animated.gif`} />
      </div>
      <div className="layer" data-depth="0.7">
        <div className="lineup">
          {lineup.map((name) => (
            <span>{name}</span>
          ))}
        </div>
      </div>
      <div className="layer" data-depth="0.8">
        <p className="featuring neon-text">Featuring:</p>
      </div>
      <div className="layer" data-depth="0.9">
        <p className="apt neon-text">1963 McAllister #5</p>
      </div>
      <div className="layer" data-depth="1">
        <p className="afters neon-text">After Dark</p>
      </div>
    </div>
  );
};
