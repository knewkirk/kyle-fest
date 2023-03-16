import * as React from 'react';

interface Props {
  className?: string;
  value: string;
}

export default ({ className, value }: Props) => (
  <p className={`text ${className}`} data-text={value}>
    {value}
  </p>
);
