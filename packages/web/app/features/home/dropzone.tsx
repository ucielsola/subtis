// shared
import { VideoDropzone } from "~/components/shared/video-dropzone";

// ui
import { DotPattern } from "~/components/ui/dot-pattern";

// lib
import { cn } from "~/lib/utils";

export function HomeDropzone() {
  return (
    <section className="pb-28 flex flex-col gap-5">
      <div className="bg-zinc-950 border border-zinc-700 hover:border-zinc-600 transition-all ease-in-out duration-300 rounded-md group/video overflow-hidden h-96 max-w-[800px] w-full mx-auto relative">
        <VideoDropzone />
        <DotPattern
          className={cn(
            "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)] opacity-40 backdrop-blur-md group-hover/video:opacity-60 group-hover/video:scale-105 transition-all ease-in-out",
          )}
        />
      </div>
      <div className="flex flex-col mx-auto items-center gap-2">
        <p className="uppercase text-zinc-300 tracking-widest text-xs">Formatos soportados</p>
        <div className="flex flex-row gap-2">
          <div className="py-1 px-2 border border-zinc-700 rounded-sm uppercase text-zinc-400 text-xs">mp4</div>
          <div className="py-1 px-2 border border-zinc-700 rounded-sm uppercase text-zinc-400 text-xs">mkv</div>
          <div className="py-1 px-2 border border-zinc-700 rounded-sm uppercase text-zinc-400 text-xs">avi</div>
        </div>
      </div>
    </section>
  );
}
