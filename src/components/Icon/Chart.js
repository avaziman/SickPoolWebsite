import * as React from "react";

const SvgChart = (props) => (
  <svg
    width={24}
    height={24}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M8 10v6m4-4v4m4-8v8"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <rect
      x={3}
      y={4}
      width={18}
      height={16}
      rx={2}
      stroke="currentColor"
      strokeWidth={2}
    />
  </svg>
);

export default SvgChart;