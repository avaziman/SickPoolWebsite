import * as React from "react";

const SvgSearch = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx={11} cy={11} r={6} />
    <path d="m20 20-3-3" strokeLinecap="round" />
  </svg>
);

export default SvgSearch;
