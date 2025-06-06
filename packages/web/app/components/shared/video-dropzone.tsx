import filesizeParser from "filesize-parser";
import { useAnimation } from "motion/react";
import Dropzone from "react-dropzone-esm";
import { useNavigate, useNavigation } from "react-router";
import { toast } from "sonner";

// shared external
import { getIsTvShow } from "@subtis/shared/files";

// ui
import { Button } from "~/components/ui/button";

// icons
import { AttachFileIcon } from "~/components/icons/attach-file";

// internals
import { Macbook } from "./macbook";

// constants
const MIN_BYTES = filesizeParser("500MB");

export function VideoDropzone() {
  // remix hooks
  const navigate = useNavigate();
  const navigation = useNavigation();

  // motion hooks
  const controls = useAnimation();

  // constants
  const isNavigating =
    navigation.state === "loading" && navigation.location.pathname.startsWith("/subtitle/file/name/");

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
          toast.error(`Formato de archivo no soportado (${format})`, {
            description: "Soportamos mp4, mkv y avi.",
          });

          return;
        }

        if (bytes < MIN_BYTES) {
          toast.error("Archivo demasiado chico", {
            description: "El archivo tiene que ser mayor a 500MB.",
          });

          return;
        }

        if (isTvShow) {
          toast.error("Series no soportadas", {
            description: "Por ahora no tenemos soporte para series.",
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
        <Macbook className="z-40 max-w-4xl">
          <section className="w-full h-full cursor-pointer relative bg-[#131313] scale-150 md:scale-110">
            <div {...getRootProps()} className="w-full h-full flex flex-col gap-2 items-center justify-center">
              <label htmlFor="video-upload" className="sr-only">
                Seleccionar archivo de video
              </label>
              <input id="video-upload" {...getInputProps()} />
              {isDragActive ? (
                <p className="text-sm text-zinc-400 z-10 bg-zinc-950 rounded-sm">Soltá acá para buscar el subtítulo</p>
              ) : isNavigating ? (
                <p className="text-sm text-zinc-400 z-10 bg-zinc-950 rounded-sm">Buscando subtítulo...</p>
              ) : (
                <div className="flex flex-col gap-3 items-center mt-6">
                  <Button
                    variant="outline"
                    className="hover:bg-zinc-950 hover:text-zinc-50 bg-zinc-950 border border-zinc-800 transition-all ease-in-out z-10 cursor-pointer"
                    onMouseEnter={() => controls.start("animate")}
                    onMouseLeave={() => controls.start("normal")}
                  >
                    <AttachFileIcon controls={controls} />
                    Seleccionar archivo
                  </Button>
                  <div className="flex flex-col gap-0 z-10 rounded-sm mt-3">
                    <p className="text-sm text-zinc-300 text-center w-fit container mx-auto">
                      Si tenés el archivo de tu película, arrastralo acá
                    </p>
                    <p className="text-[11px] text-zinc-400 text-center w-fit container mx-auto">
                      El procesamiento es local, tu archivo no se sube a internet
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </Macbook>
      )}
    </Dropzone>
  );
}
