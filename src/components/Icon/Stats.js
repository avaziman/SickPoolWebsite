import * as React from "react";

const SvgStats = (props) => (
  <svg
    width={24}
    height={24}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M8 10L8 16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M12 12V16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M16 8V16" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" />
    <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" />
  </svg>
);

export default SvgStats;
