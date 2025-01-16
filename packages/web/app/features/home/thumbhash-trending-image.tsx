import { useEffect, useRef, useState } from "react";

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
  const imageReference = useRef<HTMLImageElement>(null);

  // effects
  useEffect(() => {
    if (imageReference.current?.complete) {
      setImgIsLoading(false);
    }
  }, []);

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
    <div className="relative w-56 h-[333.3px]">
      <img
        src={placeholderURL}
        alt={`${alt} placeholder`}
        className={`w-full h-full ${imgIsLoading ? "opacity-100" : "opacity-0"} transition-all duration-250 ease-in-out group-hover:opacity-100 object-cover`}
      />
      <img
        ref={imageReference}
        onLoad={onLoaded}
        className={`absolute inset-[2px] ${imgIsLoading ? "opacity-0" : "opacity-100"} transition-all ease-in-out duration-300 w-[220.2px] h-[329.3px] rounded-[2px] object-cover`}
        src={src}
        alt={alt}
        loading="eager"
        decoding="async"
      />
    </div>
  );
}
