import { initializeApp } from 'firebase/app';
import React from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';

const firebaseConfig = {
  apiKey: 'AIzaSyA9hhQYBtIrSqBDEL44k0ScVNhU-QsF2BA',
  authDomain: 'kyle-fest.firebaseapp.com',
  projectId: 'kyle-fest',
  storageBucket: 'kyle-fest.appspot.com',
  messagingSenderId: '854536390851',
  appId: '1:854536390851:web:1c9f19c926c6f0710efa76',
  measurementId: 'G-9XM8WSYN64',
};

const app = initializeApp(firebaseConfig);
const root = createRoot(document.getElementById('root'));
root.render(<App />);
