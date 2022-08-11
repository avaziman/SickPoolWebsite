import * as React from "react";

const SvgStats = (props) => (
  <svg
    width={24}
    height={24}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path d="m17 9-3.044 4.566a1 1 0 0 1-1.727-.107l-.458-.918a1 1 0 0 0-1.727-.107L7 17" />
    <rect x={3} y={3} width={18} height={18} rx={2} />
  </svg>
);

export default SvgStats;
