import * as React from 'react';
import { useEffect, useState } from 'react';

import Parallax from 'parallax-js';

import './App.css';

import clouds from './images/clouds.jpg';
import Map from './Map';

export default () => {
  useEffect(() => {
    const containerEl = document.getElementsByClassName('container')[0];
    const parallaxInst = new Parallax(containerEl as HTMLElement, {
      relativeInput: true,
    });
  });

  return (
    <div className="container">
      <div className="layer" data-depth="0">
        <img className="background" src={`${clouds}`}/>
      </div>
      <div className="layer" data-depth="0.4">
        <Map className="map" />
      </div>
      <div className="layer" data-depth="0.6">
        <p className="subheadline">
          APRIL 8 &middot; 2PM
        </p>
      </div>
      <div className="layer" data-depth="0.8">
        <p className="location" data-depth="0.8">
          SOUTHERN PACIFIC BREWING
        </p>
      </div>
      <div className="layer" data-depth="1">
        <p className="headline">
          KYLE FEST 2023
        </p>
      </div>
    </div>
  );
};
