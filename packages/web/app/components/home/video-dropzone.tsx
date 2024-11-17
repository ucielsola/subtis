import { useAnimation } from "framer-motion";
import Dropzone from "react-dropzone-esm";

// ui
import { Button } from "~/components/ui/button";

// icons
import { UploadIcon } from "~/components/icons/upload";

export function VideoDropzone() {
  const controls = useAnimation();

  return (
    <Dropzone onDrop={(acceptedFiles) => console.log(acceptedFiles)}>
      {({ getRootProps, getInputProps }) => (
        <section className="w-full h-full cursor-pointer">
          <div {...getRootProps()} className="w-full h-full flex flex-col gap-2 items-center justify-center">
            <input {...getInputProps()} />
            <Button
              variant="outline"
              className="backdrop-blur-sm hover:bg-slate-50 transition-all ease-in-out"
              onMouseEnter={() => controls.start("animate")}
              onMouseLeave={() => controls.start("normal")}
            >
              <UploadIcon controls={controls} />
              Seleccionar archivo
            </Button>
            <p className="text-xs text-slate-600">.mp4, .mkv, .avi</p>
          </div>
        </section>
      )}
    </Dropzone>
  );
}
