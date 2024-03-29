import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Route,
  BrowserRouter as Router,
  Routes,
  Outlet,
} from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

import './App.less';

import Permissions from '@components/Permissions';
import useIsMobile from '@hooks/useIsMobile';

import Rainy from '@pages/old/Rainy';
import Afters from '@pages/old/Afters';
import SF from '@pages/SF';
import Tokyo from '@pages/Tokyo';
import Space from '@pages/Space';
import Lineup from '@pages/Lineup';

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
    <div>
      {isMobile && !hasPermission && !didSkip && (
        <Permissions
          onClickReady={requestPerms}
          onClickSkip={() => setDidSkip(true)}
        />
      )}
      <Outlet />
    </div>
  );

  const Fallback = (props: any) => <pre>{JSON.stringify(props)}</pre>;

  return (
    <ErrorBoundary fallback={<Fallback />}>
      <Router>
        <Routes>
          <Route index element={<SF />} />
          <Route path="/edit-lineup" element={<Lineup />} />
          <Route path="/karaoke" element={<Tokyo />} />
          <Route path="/afters" element={<Space />} />
          <Route path="/old" element={<OldFrame />}>
            <Route index element={<Rainy hasPermission={hasPermission} />} />
            <Route path="after-dark" element={<Afters />} />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};
