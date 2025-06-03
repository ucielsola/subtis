// shared
import { VideoDropzone } from "~/components/shared/video-dropzone";

export function HomeDropzone() {
  return (
    <section className="pb-28 flex flex-col gap-8">
      <div className="w-full flex justify-center">
        <VideoDropzone />
      </div>
      <div className="flex flex-col mx-auto items-center gap-2">
        <p className="uppercase text-zinc-300 tracking-[3px] text-xs">Formatos soportados</p>
        <div className="flex flex-row gap-2">
          <div className="py-1 px-2 border border-zinc-700 rounded-sm uppercase text-zinc-400 text-xs">mp4</div>
          <div className="py-1 px-2 border border-zinc-700 rounded-sm uppercase text-zinc-400 text-xs">mkv</div>
          <div className="py-1 px-2 border border-zinc-700 rounded-sm uppercase text-zinc-400 text-xs">avi</div>
        </div>
      </div>
    </section>
  );
}
