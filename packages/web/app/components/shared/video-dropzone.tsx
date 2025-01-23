import { useNavigate } from "@remix-run/react";
import filesizeParser from "filesize-parser";
import { useAnimation } from "motion/react";
import Dropzone from "react-dropzone-esm";
import { Fragment } from "react/jsx-runtime";

// shared external
import { getIsTvShow } from "@subtis/shared/files";

// ui
import { Button } from "~/components/ui/button";

// icons
import { AttachFileIcon } from "~/components/icons/attach-file";

// hooks
import { useToast } from "~/hooks/use-toast";

// constants
const MIN_BYTES = filesizeParser("500MB");

export function VideoDropzone() {
  // remix hooks
  const navigate = useNavigate();

  // toast hooks
  const { toast } = useToast();

  // motion hooks
  const controls = useAnimation();

  return (
    <Dropzone
      onDrop={(acceptedFiles) => {
        const [firstFile] = acceptedFiles;
        const { size: bytes, name: fileName, type: fileType } = firstFile;

        const format = fileType.split("/")[1];
        const isTvShow = getIsTvShow(fileName);

        if (
          fileType !== "video/mp4" &&
          fileType !== "video/x-matroska" &&
          fileType !== "video/avi" &&
          fileType !== "video/x-msvideo"
        ) {
          toast({
            title: `Formato de archivo no soportado (${format})`,
            description: "Soportamos mp4, mkv, avi y mpeg.",
          });

          return;
        }

        if (bytes < MIN_BYTES) {
          toast({
            title: "Archivo demasiado pequeño",
            description: "El archivo debe ser mayor a 500MB.",
          });

          return;
        }

        if (isTvShow) {
          toast({
            title: "Series no soportadas",
            description: "No soportamos series por el momento.",
          });

          return;
        }

        // save video src to local storage to use on subtitle page
        const videoSrc = URL.createObjectURL(acceptedFiles[0]);
        localStorage.setItem(fileName, videoSrc);

        navigate(`/subtitle/file/name/${bytes}/${fileName}`);
      }}
    >
      {({ getRootProps, getInputProps, isDragActive }) => (
        <section className="w-full h-full cursor-pointer">
          <div {...getRootProps()} className="w-full h-full flex flex-col gap-2 items-center justify-center">
            <label htmlFor="video-upload" className="sr-only">
              Seleccionar archivo de video
            </label>
            <input id="video-upload" {...getInputProps()} />
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
