export function LetterboxdLogo({
  size = 24,
  firstDotClassName,
  secondDotClassName,
  thirdDotClassName,
}: { size?: number; firstDotClassName?: string; secondDotClassName?: string; thirdDotClassName?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 378 142">
      <path
        className={firstDotClassName}
        d="M189 139.947c38.703 0 70.078-31.329 70.078-69.974S227.703 0 189 0c-38.704 0-70.079 31.328-70.079 69.973 0 38.645 31.375 69.974 70.079 69.974Z"
      />
      <mask
        id="a"
        width={130}
        height={142}
        x={248}
        y={0}
        maskUnits="userSpaceOnUse"
        style={{
          maskType: "luminance",
        }}
      >
        <path fill="#fff" d="M378 0H248.152v141.389H378V0Z" />
      </mask>
      <g mask="url(#a)">
        <path
          className={secondDotClassName}
          d="M307.921 139.947c38.704 0 70.079-31.329 70.079-69.974S346.625 0 307.921 0c-38.703 0-70.078 31.328-70.078 69.973 0 38.645 31.375 69.974 70.078 69.974Z"
        />
      </g>
      <mask
        id="b"
        width={130}
        height={142}
        x={0}
        y={0}
        maskUnits="userSpaceOnUse"
        style={{
          maskType: "luminance",
        }}
      >
        <path fill="#fff" d="M129.847 0H0v141.389h129.847V0Z" />
      </mask>
      <g mask="url(#b)">
        <path
          className={thirdDotClassName}
          d="M70.079 139.947c38.703 0 70.078-31.329 70.078-69.974S108.782 0 70.079 0C31.375 0 0 31.328 0 69.973c0 38.645 31.375 69.974 70.079 69.974Z"
        />
      </g>
      <path
        fill="#567"
        fillRule="evenodd"
        d="M129.539 107.022c-6.729-10.744-10.618-23.443-10.618-37.049 0-13.606 3.889-26.305 10.618-37.049 6.729 10.744 10.618 23.443 10.618 37.05 0 13.605-3.889 26.304-10.618 37.048ZM248.461 32.924c6.729 10.744 10.618 23.443 10.618 37.05 0 13.605-3.889 26.304-10.618 37.048-6.729-10.744-10.618-23.443-10.618-37.049 0-13.606 3.889-26.305 10.618-37.049Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
