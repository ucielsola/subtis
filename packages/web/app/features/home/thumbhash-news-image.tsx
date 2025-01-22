import { useEffect, useRef, useState } from "react";
import { AspectRatio } from "~/components/ui/aspect-ratio";

// lib
import { generatePlaceholderURL } from "~/lib/thumbhash";

// types
type Props = {
  alt: string;
  src: string | null;
  hashUrl: string | null;
};

export function ThumbHashNewsImage({ src, hashUrl, alt }: Props) {
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
    <div className="w-[330px] h-[180px]">
      <AspectRatio ratio={11 / 6} className="relative">
        <img
          src={placeholderURL}
          alt={`${alt} placeholder`}
          className={`absolute inset-0 w-[330px] h-[180px] ${imgIsLoading ? "opacity-100" : "opacity-0"} transition-all duration-75 ease-linear lg:group-hover:opacity-100 object-cover`}
        />
        <img
          ref={imageReference}
          onLoad={onLoaded}
          className={`absolute inset-[2px] ${imgIsLoading ? "opacity-0" : "opacity-100"} transition-all ease-in-out duration-300 w-[326px] h-[176px] rounded-[2px] object-cover`}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
        />
      </AspectRatio>
    </div>
  );
}
