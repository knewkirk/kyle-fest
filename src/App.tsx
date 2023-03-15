import * as React from 'react';
import { useEffect, useState } from 'react';
import throttle from 'lodash/throttle';
import Parallax from 'parallax-js';

import './App.less';

import clouds from './images/clouds.jpg';
import cloud from './images/cloud-transparent.png';
import Map from './Map';

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
  const [fb, setFb] = useState(0);
  const [lr, setLr] = useState(0);
  const [perc, setPerc] = useState('');
  const containerRef = React.useRef(null);

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
            setFb(event.beta);
            setLr(event.gamma);
          }, 100)
        );
      }
    });
  };

  useEffect(() => {
    const isLeft = lr > 0;
    const bothSidesDec = Math.min(Math.abs(lr) / SHINE.maxX, 1);
    const decFromLeft = isLeft
      ? 0.5 - bothSidesDec / 2
      : 0.5 + bothSidesDec / 2;
    const percentFromLeft = decFromLeft * 100;

    const dist = SHINE.maxY - SHINE.minY;
    const distFromMin = Math.min(Math.max(fb - SHINE.minY, 0), dist);
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
  }, [lr, containerRef]);

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
        <div className="permission-scrim">
          {!hasPermission && (
            <div className="btn-wrapper">
              <button className="permission-btn" onClick={requestPerms}>
                I'M READY
              </button>
              <button className="skip-btn" onClick={() => setDidSkip(true)}>
                skip
              </button>
            </div>
          )}
        </div>
      )}
      <div className="tilt-data">
        <p>{fb}</p>
        <p>{lr}</p>
        <p>{perc}</p>
      </div>
      <div className="container" ref={containerRef}>
        <div className="layer" data-depth="0.1">
          <img className="background" src={`${clouds}`} />
        </div>
        <div className="layer" data-depth="0.15">
          <img className="cloud cloud-0" src={`${cloud}`} />
        </div>
        <div className="layer" data-depth="0.2">
          <img className="cloud cloud-1" src={`${cloud}`} />
          <img className="cloud cloud-2" src={`${cloud}`} />
        </div>
        <div className="layer" data-depth="0.25">
          <img className="cloud cloud-3" src={`${cloud}`} />
        </div>
        <div className="layer" data-depth="0.3">
          <img
            className="rain"
            src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZmRmZDI2ZWI4ZDQxMGIxZDNlZWZjZTY1YWM2YTRlMWZmN2E3MTJkZiZjdD1z/3ohhwutQL0CDTq3kKA/giphy.gif"
          />
        </div>
        <div className="layer" data-depth="0.35">
          <img className="cloud cloud-4" src={`${cloud}`} />
        </div>
        <div className="layer" data-depth="0.4">
          <a
            className="map-container"
            href="https://goo.gl/maps/2MqEVKvGFkBZfKii7"
            target="_blank"
          >
            <Map className="map" />
          </a>
        </div>
        <div className="layer" data-depth="0.45">
          <div className="star-container">
            <p className="text star" data-text="★">
              ★
            </p>
          </div>
        </div>
        <div className="layer" data-depth="0.9">
          <p className="text subheadline" data-text="APRIL 8 &middot; 2PM">
            APRIL 8 &middot; 2PM
          </p>
        </div>
        <div className="layer" data-depth="1">
          <p className="text headline" data-text="KYLE FEST 2023">
            KYLE FEST 2023
          </p>
          <a
            href="https://www.southernpacificbrewing.com/"
            className="text location"
            data-text="SOUTHERN PACIFIC BREWING"
            target="_blank"
          >
            SOUTHERN PACIFIC BREWING
          </a>
        </div>
      </div>
    </>
  );
};
