import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Route,
  BrowserRouter as Router,
  Routes,
  Outlet,
  Link,
} from 'react-router-dom';
import loadable from '@loadable/component';

import './App.less';

import Permissions from '@components/Permissions';
import useIsMobile from '@hooks/useIsMobile';

const Rainy = loadable(() => import('@pages/Rainy'));
const Afters = loadable(() => import('@pages/Afters'));

export default () => {
  const isMobile = useIsMobile();
  const [hasPermission, setHasPermission] = useState(false);
  const [didLoad, setDidLoad] = useState(false);
  const [didSkip, setDidSkip] = useState(false);

  const requestPerms = () => {
    (DeviceMotionEvent as any).requestPermission().then((response: any) => {
      if (response == 'granted') {
        setHasPermission(true);
      }
    });
  };

  useEffect(() => {
    if (didSkip || (!isMobile && didLoad)) {
      setHasPermission(true);
    }
  }, [isMobile, didLoad, didSkip]);

  useEffect(() => {
    setDidLoad(typeof window !== undefined);
  }, []);

  const OldFrame = () => (
    <>
      {isMobile && !hasPermission && !didSkip && (
        <Permissions
          onClickReady={requestPerms}
          onClickSkip={() => setDidSkip(true)}
        />
      )}
      <Outlet />
    </>
  );

  return (
    <Router>
        <Routes>
          <Route path="/" element={<div>ROOT<Link to="/old">LINK</Link></div>} />
          <Route path="/old/*" element={<OldFrame />}>
            <Route
              index
              element={
                <Rainy hasPermission={hasPermission} isMobile={isMobile} />
              }
            />
            <Route path="after-dark" element={<Afters />} />
          </Route>
        </Routes>
    </Router>
  );
};
