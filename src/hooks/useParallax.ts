import { useCallback } from 'react';
import Parallax from 'parallax-js';

export default (containerEl: HTMLElement) => (
  useCallback(() => {
    new Parallax(containerEl, {
      relativeInput: true,
    });
  }, [containerEl])
)
