import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import throttle from 'lodash/throttle';
import Parallax from 'parallax-js';

import clouds from '@images/clouds.jpg';
import Cloud from '@components/Cloud';
import Map from '@components/Map';
import GoldText from '@components/GoldText';
import calcShinePosition from '@helpers/calcShinePosition';

import './index.less';

const SHINE = {
  maxX: 30,
  minY: 20,
  maxY: 60,
};

interface Props {
  hasPermission: boolean;
  isMobile: boolean;
}

export default ({ hasPermission, isMobile }: Props) => {
  const [frontBack, setFrontBack] = useState(0);
  const [leftRight, setLeftRight] = useState(0);
  const [didInit, setDidInit] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (hasPermission && !didInit && containerRef.current) {
      new Parallax(containerRef.current, {
        relativeInput: true,
      });
      setDidInit(true);

      if (isMobile) {
        // TODO: laggy - animating background uses cpu/not gpu
        window.addEventListener(
          'deviceorientation',
          throttle((event: DeviceOrientationEvent) => {
            setFrontBack(event.beta);
            setLeftRight(event.gamma);
          }, 130)
        );
      }
    }
  }, [hasPermission, didInit, isMobile]);

  useEffect(() => {
    const { percentFromLeft, percentFromTop } = calcShinePosition({
      leftRight,
      frontBack,
      limitX: SHINE.maxX,
      minY: SHINE.minY,
      maxY: SHINE.maxY,
    });
    containerRef.current.style.setProperty(
      '--percentFromLeft',
      `${percentFromLeft}%`
    );
    containerRef.current.style.setProperty(
      '--percentFromTop',
      `${percentFromTop}%`
    );
  }, [frontBack, leftRight, containerRef]);

  return (
    <div className="gold-container" ref={containerRef}>
      <div className="layer" data-depth="0.1">
        <img className="background" src={`${clouds}`} />
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
          <Map />
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
