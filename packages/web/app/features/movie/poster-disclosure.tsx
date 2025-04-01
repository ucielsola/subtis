import { StarIcon } from "lucide-react";
import { AnimatePresence, motion, useAnimation } from "motion/react";
import { useRef, useState, type RefObject } from "react";
import { useOnClickOutside } from "usehooks-ts";

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
  overview: string;
  rating: number;
};

export function PosterDisclosure({ src, alt, hashUrl, title, overview, rating }: Props) {
  // react hooks
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDivElement>(null);

  // motion hooks
  const controls = useAnimation();

  // handlers
  function handleClick(): void {
    setIsOpen((previousIsOpen) => !previousIsOpen);
  }

  function handleClickOutside(): void {
    setIsOpen(false);
  }

  // ts hooks
  useOnClickOutside(ref as RefObject<HTMLDivElement>, handleClickOutside);

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
        className={`absolute bottom-0 left-0 right-0 ${isOpen ? "bg-zinc-950/90" : "bg-zinc-950/40"}  backdrop-blur-md transition-all duration-300 ease-in-out px-2 pt-2 rounded-b-sm`}
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
              className={`text-left ${isOpen ? "text-zinc-50 text-2xl" : "text-zinc-300 text-sm"} transition-all duration-300 ease-in-out`}
            >
              {isOpen ? title : "Ver sinopsis"}
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
          <div className="flex flex-col pb-2 z-10">
            <div>
              {overview ? (
                <p className="text-zinc-50 text-sm leading-6 pt-2 pb-2 line-clamp-[14]">{overview}</p>
              ) : (
                <p className="text-zinc-300 text-sm leading-6 pt-2 pb-2 line-clamp-[14]">Sinopsis no disponible.</p>
              )}
              <div className="flex items-center gap-1 self-end justify-end">
                <StarIcon size={16} className="fill-yellow-400 stroke-none" />
                <span className="text-zinc-50 text-sm">{rating}/10</span>
              </div>
            </div>
          </div>
        </DisclosureContent>
      </Disclosure>
    </div>
  );
}
