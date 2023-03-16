import * as React from 'react';

import cloud from '@images/cloud-transparent.png';

import './index.less';

interface Props {
  depth: number;
}

export default ({ depth }: Props) => (
  <img className={`cloud cloud-${depth}`} src={`${cloud}`} />
);
