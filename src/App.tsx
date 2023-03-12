import * as React from 'react';
import { useEffect, useState } from 'react';

import Parallax from 'parallax-js';

import './App.css';

import clouds from './images/clouds.jpg';
import Map from './Map';
import Star from './Star';

export default () => {
  const [isMobile, setIsMobile] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [didLoad, setDidLoad] = useState(false);

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
        console.log('accelerometer permission granted');
        initParallax();
      }
    });
  };

  useEffect(() => {
    const isiPhone = !!navigator.userAgent.match(/iphone/i);
    const isAndroid = !!navigator.userAgent.match(/android/i);
    setIsMobile(isiPhone || isAndroid);
  });

  useEffect(() => {
    if (!isMobile && didLoad) {
      setHasPermission(true);
      initParallax();
    }
  }, [isMobile, didLoad]);

  useEffect(() => {
    setDidLoad(typeof window !== undefined);
  }, []);

  return (
    <>
      {isMobile && !hasPermission && (
        <div className="permission-scrim">
          {!hasPermission && (
            <button className="permission-btn" onClick={requestPerms}>
              I'M READY
            </button>
          )}
        </div>
      )}
      <div className={`container${isMobile ? ' mobile' : ''}`}>
        <div className="layer" data-depth="0">
          <img className="background" src={`${clouds}`} />
        </div>
        <div className="layer" data-depth="0.4">
          <Map className="map" />
        </div>
        <div className="layer" data-depth="0.45">
          <div className="star-container">
            <Star className="star" />
          </div>
        </div>
        <div className="layer" data-depth="0.7">
          <p className="location">SOUTHERN PACIFIC BREWING</p>
        </div>
        <div className="layer" data-depth="0.9">
          <p className="subheadline">APRIL 8 &middot; 2PM</p>
        </div>
        <div className="layer" data-depth="1">
          <p className="headline">KYLE FEST 2023</p>
        </div>
      </div>
    </>
  );
};
