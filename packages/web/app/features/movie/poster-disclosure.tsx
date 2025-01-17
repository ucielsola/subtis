import { StarIcon } from "lucide-react";
import { AnimatePresence, motion, useAnimation } from "motion/react";
import { useRef, useState } from "react";
import { useOnClickOutside } from "usehooks-ts";

// lib
import { getImdbLink } from "@subtis/indexer/imdb";

// ui
import { Disclosure, DisclosureContent, DisclosureTrigger } from "~/components/ui/disclosure";

// icons
import { ChevronsDownUpIcon } from "~/components/icons/chevrons-down-up";
import { ChevronsUpDownIcon } from "~/components/icons/chevrons-up-down";

// internals
import { ThumbHashPosterImage } from "./thumbhash-poster-image";

// constants
const imageVariants = {
  collapsed: { scale: 1, filter: "blur(0px)" },
  expanded: { scale: 1.1, filter: "blur(3px)" },
};

const contentVariants = {
  collapsed: { opacity: 0, y: 0 },
  expanded: { opacity: 1, y: 0 },
};

const transition = {
  type: "spring",
  stiffness: 26.7,
  damping: 4.1,
  mass: 0.2,
};

// types
type Props = {
  alt: string;
  src: string | null;
  hashUrl: string | null;
  title: string;
  imdbId: string;
  year: number;
  overview: string;
  rating: number;
  runtime: number | null;
};

export function PosterDisclosure({ src, alt, hashUrl, title, imdbId, year, overview, rating, runtime }: Props) {
  // react hooks
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const ref = useRef(null);

  // motion hooks
  const controls = useAnimation();

  // handlers
  function handleClick(): void {
    setIsOpen((previousIsOpen) => !previousIsOpen);
  }

  function handleClickOutside(): void {
    setIsOpen(false);
  }

  // custom hooks
  useOnClickOutside(ref, handleClickOutside);

  return (
    <div className="relative w-[384px] h-[611px] overflow-hidden rounded-sm" ref={ref}>
      <div
        onClick={handleClick}
        className="cursor-pointer"
        onMouseEnter={() => controls.start("animate")}
        onMouseLeave={() => controls.start("normal")}
      >
        <motion.div animate={isOpen ? "expanded" : "collapsed"} variants={imageVariants} transition={transition}>
          <ThumbHashPosterImage src={src} alt={alt} hashUrl={hashUrl} />
        </motion.div>
      </div>
      <Disclosure
        onOpenChange={setIsOpen}
        open={isOpen}
        className={`absolute bottom-0 left-0 right-0 ${isOpen ? "bg-zinc-950/90" : "bg-zinc-950/50"}  backdrop-blur-md transition-all duration-300 ease-in-out px-4 pt-2 rounded-b-sm`}
        variants={contentVariants}
        transition={transition}
      >
        <DisclosureTrigger>
          <button
            className="w-full flex justify-between items-center pb-2"
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            onMouseEnter={() => controls.start("animate")}
            onMouseLeave={() => controls.start("normal")}
          >
            <span
              className={`text-left ${isOpen ? "text-zinc-50 text-base" : "text-zinc-300 text-sm"} transition-all duration-300 ease-in-out`}
            >
              {isOpen ? title : "Ver más"}
            </span>
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.div key="down-up" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ChevronsDownUpIcon controls={controls} size={16} className="stroke-zinc-50" />
                </motion.div>
              ) : (
                <motion.div key="up-down" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ChevronsUpDownIcon controls={controls} size={16} className="stroke-zinc-50" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </DisclosureTrigger>
        <DisclosureContent>
          <div className="flex flex-col pb-4 z-10">
            <div className="flex items-center gap-2 pb-2">
              <span className="text-sm">{year}</span>
              {runtime ? <span className="text-sm">{`${Math.floor(runtime / 60)}h ${runtime % 60}m`}</span> : null}
            </div>
            <div>
              {overview ? <p className="text-zinc-50 text-sm leading-6 pt-2 pb-6">{overview}</p> : null}
              <div className="flex items-center justify-between">
                <div className="flex flex-row gap-2">
                  <a
                    href={getImdbLink(imdbId)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-50 underline text-sm hover:text-zinc-300"
                  >
                    IMDb
                  </a>
                  <a
                    href={`https://www.rottentomatoes.com/m/${title.toLowerCase().replace(/\s+/g, "_").replaceAll("&", "and").replaceAll(":", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-50 underline text-sm hover:text-zinc-300"
                  >
                    Rotten Tomatoes
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <StarIcon size={16} className="fill-yellow-400 stroke-none" />
                  <span className="text-zinc-50 text-sm">{rating}/10</span>
                </div>
              </div>
            </div>
          </div>
        </DisclosureContent>
      </Disclosure>
    </div>
  );
}
