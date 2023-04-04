import { useState, useCallback, RefCallback } from 'react';

export default (): [HTMLElement | null, RefCallback<HTMLElement>] => {
  const [element, setElement] = useState<HTMLElement>(null);
  const refFn = useCallback((el: HTMLElement) => {
    if (!el) {
      return;
    }
    setElement(el);
  }, []);

  return [element, refFn];
};
