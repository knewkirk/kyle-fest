import * as React from 'react';

import './index.less';

interface Props {
  className?: string;
  value: string;
}

export default ({ className, value }: Props) => (
  <p className={`gold-text ${className}`} data-text={value}>
    {value}
  </p>
);
