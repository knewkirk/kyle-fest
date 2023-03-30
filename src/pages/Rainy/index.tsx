import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Parallax from 'parallax-js';

import clouds from '@images/clouds.jpg';
import Cloud from '@components/Cloud';
import GoldText from '@components/GoldText';

import './index.less';

import map from '@images/map-colorized.png';

interface Props {
  hasPermission: boolean;
  isMobile: boolean;
}

export default ({ hasPermission, isMobile }: Props) => {
  const [didInit, setDidInit] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (hasPermission && !didInit && containerRef.current) {
      new Parallax(containerRef.current, {
        relativeInput: true,
      });
      setDidInit(true);
    }
  }, [hasPermission, didInit, isMobile]);

  return (
    <div className="gold-container" ref={containerRef}>
      <div className="layer" data-depth="0.1">
        <img className="background" src={`${clouds}`} />
      </div>
      <div className="layer" data-depth="0.12">
        <Link className="moon" to="/old/after-dark">🌙</Link>
      </div>
      <div className="layer" data-depth="0.15">
        <Cloud depth={0} />
      </div>
      <div className="layer" data-depth="0.2">
        <Cloud depth={1} />
        <Cloud depth={2} />
      </div>
      <div className="layer" data-depth="0.25">
        <Cloud depth={3} />
      </div>
      <div className="layer" data-depth="0.3">
        <img
          className="rain"
          src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmRmZDI2ZWI4ZDQxMGIxZDNlZWZjZTY1YWM2YTRlMWZmN2E3MTJkZiZjdD1z/3ohhwutQL0CDTq3kKA/giphy.gif"
        />
      </div>
      <div className="layer" data-depth="0.35">
        <Cloud depth={4} />
      </div>
      <div className="layer" data-depth="0.4">
        <a
          className="map-container"
          href="https://goo.gl/maps/2MqEVKvGFkBZfKii7"
          target="_blank"
        >
          <img src={ map } />
        </a>
      </div>
      <div className="layer" data-depth="0.45">
        <div className="star-container">
          <GoldText className="star" value="★" />
        </div>
      </div>
      <div className="layer" data-depth="0.9">
        <GoldText className="subheadline" value="APRIL 8 &middot; 2PM" />
      </div>
      <div className="layer" data-depth="1">
        <GoldText className="headline" value="KYLE FEST 2023" />
        <a href="https://www.southernpacificbrewing.com/" target="_blank">
          <GoldText className="location" value="SOUTHERN PACIFIC BREWING" />
        </a>
      </div>
    </div>
  );
};
