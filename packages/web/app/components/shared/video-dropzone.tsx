import { useNavigate } from "@remix-run/react";
import { useAnimation } from "motion/react";
import Dropzone from "react-dropzone-esm";
import { Fragment } from "react/jsx-runtime";

// ui
import { Button } from "~/components/ui/button";

// icons
import { AttachFileIcon } from "~/components/icons/attach-file";

export function VideoDropzone() {
  // remix hooks
  const navigate = useNavigate();

  // motion hooks
  const controls = useAnimation();

  return (
    <Dropzone
      onDrop={(acceptedFiles) => {
        const bytes = acceptedFiles[0].size;
        const fileName = acceptedFiles[0].name;

        navigate(`/subtitle/file/name/${bytes}/${fileName}`);
      }}
    >
      {({ getRootProps, getInputProps, isDragActive }) => (
        <section className="w-full h-full cursor-pointer">
          <div {...getRootProps()} className="w-full h-full flex flex-col gap-2 items-center justify-center">
            <input {...getInputProps()} />
            {isDragActive ? (
              <p className="text-sm text-zinc-400 z-10 bg-zinc-950 rounded-sm">Soltar para buscar subtítulo</p>
            ) : (
              <Fragment>
                <Button
                  variant="outline"
                  className="hover:bg-zinc-950 bg-zinc-950 border border-zinc-700 transition-all ease-in-out z-10"
                  onMouseEnter={() => controls.start("animate")}
                  onMouseLeave={() => controls.start("normal")}
                >
                  <AttachFileIcon controls={controls} />
                  Seleccionar archivo
                </Button>
                <p className="text-xs text-zinc-400 z-10 bg-zinc-950 rounded-sm">.mp4, .mkv, .avi</p>
              </Fragment>
            )}
          </div>
        </section>
      )}
    </Dropzone>
  );
}
