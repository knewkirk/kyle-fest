import { useState, useEffect } from 'react';

export default () => {
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const isiPhone = !!navigator.userAgent.match(/iphone/i);
    const isAndroid = !!navigator.userAgent.match(/android/i);
    setIsMobile(isiPhone || isAndroid);
  });

  return isMobile;
};
