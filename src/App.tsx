import * as React from 'react';
import './App.css';

// @ts-ignore
import map from './images/map.png';

export default () => (
  <div className="container">
    <h1>KYLE FEST</h1>
    <h2>APRIL 8, 2023 &middot; 2PM</h2>
    <h3>SOUTHERN PACIFIC BREWING</h3>
    <img src={map} />
  </div>
);
