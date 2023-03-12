import * as React from 'react';

interface Props {
  className?: string;
}

export default ({ className }: Props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="800"
    height="800"
    viewBox="0 0 24 24"
    className={className}
  >
    <path
      d="M21.12 9.88a.74.74 0 0 0-.6-.51l-5.42-.79-2.43-4.91a.78.78 0 0 0-1.34 0L8.9 8.58l-5.42.79a.74.74 0 0 0-.6.51.75.75 0 0 0 .18.77L7 14.47l-.93 5.4a.76.76 0 0 0 .3.74.75.75 0 0 0 .79.05L12 18.11l4.85 2.55c.1.06.23.09.35.09a.8.8 0 0 0 .44-.14.76.76 0 0 0 .3-.74l-.94-5.4 3.93-3.82a.75.75 0 0 0 .19-.77Z"
    />
  </svg>
);
