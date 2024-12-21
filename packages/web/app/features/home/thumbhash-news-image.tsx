import { motion } from "motion/react";
import { useState } from "react";

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
    <div className="relative w-72 h-[162.05px] object-cover">
      <img src={placeholderURL} alt={`${alt} placeholder`} className="w-full h-full" />
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: imgIsLoading ? 0 : 1 }}
        transition={{ opacity: { delay: 0.5, duration: 0.4 } }}
        onLoad={onLoaded}
        className="absolute inset-0"
        src={src}
        width="100%"
        height="100%"
        alt={alt}
      />
    </div>
  );
}
