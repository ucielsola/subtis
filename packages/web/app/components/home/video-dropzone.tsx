import { useNavigate } from "@remix-run/react";
import { useAnimation } from "motion/react";
import Dropzone from "react-dropzone-esm";

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
              <AttachFileIcon controls={controls} />
              Seleccionar archivo
            </Button>
            <p className="text-xs text-slate-600">.mp4, .mkv, .avi</p>
          </div>
        </section>
      )}
    </Dropzone>
  );
}
