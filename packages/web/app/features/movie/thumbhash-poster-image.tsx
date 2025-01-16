import { useEffect, useRef, useState } from "react";

// lib
import { generatePlaceholderURL } from "~/lib/thumbhash";

// types
type Props = {
  alt: string;
  src: string | null;
  hashUrl: string | null;
};

export function ThumbHashPosterImage({ src, hashUrl, alt }: Props) {
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
    <div className="relative w-[384px] h-[575px] rounded-sm overflow-hidden">
      <img src={placeholderURL} alt={`${alt} placeholder`} className="w-full h-full object-cover" />
      <img
        onLoad={onLoaded}
        className={`absolute inset-0 ${imgIsLoading ? "opacity-0" : "opacity-100"} transition-opacity ease-in-out duration-300 w-[380px] h-[571px] rounded-[2px] inset-[2px] object-cover`}
        src={src}
        alt={alt}
        loading="eager"
        decoding="async"
      />
    </div>
  );
}
