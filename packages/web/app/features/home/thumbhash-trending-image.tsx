import { useState } from "react";

// lib
import { generatePlaceholderURL } from "~/lib/thumbhash";

// types
type Props = {
  alt: string;
  src: string | null;
  hashUrl: string | null;
};

export function ThumbHashTrendingImage({ src, hashUrl, alt }: Props) {
  // react hooks
  const [imgIsLoading, setImgIsLoading] = useState(true);

  // handlers
  function onLoaded(): void {
    setImgIsLoading(false);
  }

  if (!src || !hashUrl) {
    return null;
  }

  // constants
  const placeholderURL = generatePlaceholderURL(hashUrl);

  return (
    <div className="relative w-56 h-[336px] object-cover">
      <img src={placeholderURL} alt={`${alt} placeholder`} className="w-full h-full" />
      <img
        onLoad={onLoaded}
        className={`absolute inset-0 ${imgIsLoading ? "opacity-0" : "opacity-100"} transition-opacity ease-in-out duration-300`}
        src={src}
        width="100%"
        height="100%"
        alt={alt}
        loading="eager"
        fetchPriority="high"
      />
    </div>
  );
}
