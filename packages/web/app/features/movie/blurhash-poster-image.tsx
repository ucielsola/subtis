import { motion } from "motion/react";
import { useState } from "react";
import { Blurhash } from "react-blurhash";

// types
type BlurhashImgProps = {
  alt: string;
  src: string | null;
  hashUrl: string | null;
};

export function BlurhashPosterImage({ src, hashUrl, alt }: BlurhashImgProps) {
  // react hooks
  const [imgIsLoading, setImgIsLoading] = useState(true);

  // handlers
  function onLoaded(): void {
    setImgIsLoading(false);
  }

  if (!src || !hashUrl) {
    return null;
  }

  return (
    <div className="relative w-[384px] h-[575px] object-cover rounded-md overflow-hidden">
      <Blurhash hash={hashUrl} width="100%" height="100%" />
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: imgIsLoading ? 0 : 1 }}
        transition={{ opacity: { delay: 0.5, duration: 0.4 } }}
        onLoad={onLoaded}
        className="absolute inset-0 border border-zinc-700/80"
        src={src}
        loading="lazy"
        width="100%"
        height="100%"
        alt={alt}
      />
    </div>
  );
}
