import * as React from 'react';
import './App.css';

import Map from './Map';

// import map from './images/map.png';
import clouds from './images/clouds.jpg';
import map from './images/map.svg';

const bgStyle = {
  background: `url(${clouds})`,
};

const textStyle = {
  ...bgStyle,
  'background-clip': 'text',
  '-webkit-background-clip': 'text',
};

export default () => (
  <div className="container" style={bgStyle}>
    <p className="headline" style={textStyle}>
      KYLE FEST
    </p>
    <p className="subheadline" style={textStyle}>
      APRIL 8, 2023 &middot; 2PM
    </p>
    <p className="location" style={textStyle}>
      SOUTHERN PACIFIC BREWING
    </p>
    <i style={{
      ...bgStyle,
      mask: `url(${map})`,
      // @ts-ignore
      '-webkit-mask': `url(${map})`,
      '-webkit-mask-size': '100%'
    }} />
  </div>
);
