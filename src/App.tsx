import * as React from 'react';
import { useEffect, useState } from 'react';
import throttle from 'lodash/throttle';
import Parallax from 'parallax-js';

import './App.less';

import clouds from '@images/clouds.jpg';
import Cloud from '@components/Cloud';
import Map from '@components/Map';
import Permissions from '@components/Permissions';
import Text from '@components/Text';
import TiltDebug from '@components/TiltDebug';

const SHINE = {
  maxX: 30,
  minY: 20,
  maxY: 60,
};

export default () => {
  const [isMobile, setIsMobile] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [didLoad, setDidLoad] = useState(false);
  const [didSkip, setDidSkip] = useState(false);
  const [frontBack, setFrontBack] = useState(0);
  const [leftRight, setLeftRight] = useState(0);
  const containerRef = React.useRef(null);
  const debug = false;

  const initParallax = () => {
    const containerEl = document.getElementsByClassName('container')[0];
    const parallaxInst = new Parallax(containerEl as HTMLElement, {
      relativeInput: true,
    });
  };

  const requestPerms = () => {
    (DeviceMotionEvent as any).requestPermission().then((response: any) => {
      if (response == 'granted') {
        setHasPermission(true);
        initParallax();

        window.addEventListener(
          'deviceorientation',
          throttle((event) => {
            setFrontBack(event.beta);
            setLeftRight(event.gamma);
          }, 100)
        );
      }
    });
  };

  useEffect(() => {
    const isLeft = leftRight > 0;
    const bothSidesDec = Math.min(Math.abs(leftRight) / SHINE.maxX, 1);
    const decFromLeft = isLeft
      ? 0.5 - bothSidesDec / 2
      : 0.5 + bothSidesDec / 2;
    const percentFromLeft = decFromLeft * 100;

    const dist = SHINE.maxY - SHINE.minY;
    const distFromMin = Math.min(Math.max(frontBack - SHINE.minY, 0), dist);
    const distFromTop = dist - distFromMin;
    const percentFromTop = (distFromTop / dist) * 100;

    containerRef.current.style.setProperty(
      '--percentFromLeft',
      `${percentFromLeft}%`
    );
    containerRef.current.style.setProperty(
      '--percentFromTop',
      `${percentFromTop}%`
    );
  }, [frontBack, leftRight, containerRef]);

  useEffect(() => {
    const isiPhone = !!navigator.userAgent.match(/iphone/i);
    const isAndroid = !!navigator.userAgent.match(/android/i);
    setIsMobile(isiPhone || isAndroid);
  });

  useEffect(() => {
    if (didSkip || (!isMobile && didLoad)) {
      setHasPermission(true);
      initParallax();
    }
  }, [isMobile, didLoad, didSkip]);

  useEffect(() => {
    setDidLoad(typeof window !== undefined);
  }, []);

  return (
    <>
      {isMobile && !hasPermission && !didSkip && (
        <Permissions
          onClickReady={requestPerms}
          onClickSkip={() => setDidSkip(true)}
        />
      )}
      {debug && <TiltDebug frontBack={frontBack} leftRight={leftRight} />}
      <div className="container" ref={containerRef}>
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
            <Text className="star" value="★"/>
          </div>
        </div>
        <div className="layer" data-depth="0.9">
          <Text className="subheadline" value="APRIL 8 &middot; 2PM"/>
        </div>
        <div className="layer" data-depth="1">
          <Text className="headline" value="KYLE FEST 2023"/>
          <a
            href="https://www.southernpacificbrewing.com/"
            target="_blank"
          >
            <Text className="location" value="SOUTHERN PACIFIC BREWING"/>
          </a>
        </div>
      </div>
    </>
  );
};
