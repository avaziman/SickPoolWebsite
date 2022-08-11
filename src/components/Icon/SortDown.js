import * as React from "react";

const SvgSortDown = (props) => (
  <svg
    width={24}
    height={24}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="M5 8h8m-8 4h6m-6 4h4" stroke="#fff" strokeLinecap="round" />
    <path d="m19 18 3-3m-3 3-3-3m3 3V6" stroke="#fff" />
  </svg>
);

export default SvgSortDown;
