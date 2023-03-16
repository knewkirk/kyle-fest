import * as React from 'react';
import { useEffect, useState } from 'react';

import './App.less';

import Permissions from '@components/Permissions';
import useIsMobile from '@hooks/useIsMobile';
import Rainy from '@pages/Rainy';

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

  return (
    <>
      {isMobile && !hasPermission && !didSkip && (
        <Permissions
          onClickReady={requestPerms}
          onClickSkip={() => setDidSkip(true)}
        />
      )}
      <Rainy hasPermission={ hasPermission } isMobile={ isMobile }/>
    </>
  );
};
