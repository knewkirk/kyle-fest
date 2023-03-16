import * as React from 'react';

import './index.less';

interface Props {
  frontBack: number;
  leftRight: number;
  data?: string;
}

export default ({ frontBack, leftRight, data }: Props) => (
  <div className="tilt-data">
    <p>{frontBack}</p>
    <p>{leftRight}</p>
    <p>{data}</p>
  </div>
);
