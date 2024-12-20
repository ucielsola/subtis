import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogImage,
  MorphingDialogContainer,
} from './morphing-dialog';

// icons
import { XIcon } from "lucide-react";

type MorphingDialogBasicImageProps = {
  src: string;
  alt: string;
  className?: string;
  containerClassName?: string;
};

export function MorphingDialogBasicImage({ src, alt, className, containerClassName }: MorphingDialogBasicImageProps) {
  return (
    <MorphingDialog
      transition={{
        duration: 0.3,
        ease: 'easeInOut',
      }}
    >
      <MorphingDialogTrigger className={containerClassName}>
        <MorphingDialogImage
          src={src}
          alt={alt}
          className={className}
        />
      </MorphingDialogTrigger>
      <MorphingDialogContainer>
        <MorphingDialogContent className='relative'>
          <MorphingDialogImage
            src={src}
            alt={alt}
            className='h-auto w-full max-w-[90vw] rounded-[4px] object-contain lg:h-[90vh]'
          />
        </MorphingDialogContent>
        <MorphingDialogClose
          className='fixed right-6 top-6 h-fit w-fit rounded-full bg-white p-1'
          variants={{
            initial: { opacity: 0 },
            animate: {
              opacity: 1,
              transition: { delay: 0.3, duration: 0.1 },
            },
            exit: { opacity: 0, transition: { duration: 0 } },
          }}
        >
          <XIcon className='h-5 w-5 text-zinc-500' />
        </MorphingDialogClose>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
}
