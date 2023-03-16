import * as React from 'react';

import './index.less';

interface Props {
  onClickReady(): void;
  onClickSkip(): void;
}

export default ({ onClickReady, onClickSkip }: Props) => (
  <div className="permission-scrim">
    <div className="btn-wrapper">
      <button className="permission-btn" onClick={onClickReady}>
        I'M READY
      </button>
      <button className="skip-btn" onClick={onClickSkip}>
        skip
      </button>
    </div>
  </div>
);
