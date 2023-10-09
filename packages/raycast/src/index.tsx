import { z } from 'zod';
import delay from 'delay';
import fetch from 'node-fetch';
import invariant from 'tiny-invariant';
import { Form, ActionPanel, Action, Toast, showToast, open } from '@raycast/api';

// shared
import { getMessageFromStatusCode } from 'shared/error-messages';
import { getFilenameFromPath, getVideoFileExtension } from 'shared/movie';
import { getIsInvariantError, getParsedInvariantMessage } from 'shared/invariant';

// schemas
export const subtitleQuerySchema = z.object({
  id: z.number(),
  subtitleShortLink: z.string(),
  subtitleFullLink: z.string(),
  resolution: z.string(),
  fileName: z.string(),
  Movies: z
    .object({
      name: z.string(),
      year: z.number(),
    })
    .nullable(),
  ReleaseGroups: z
    .object({
      name: z.string(),
    })
    .nullable(),
  SubtitleGroups: z
    .object({
      name: z.string(),
    })
    .nullable(),
});

// types
type Values = {
  filePicker: string[];
};

export default function Command() {
  // handlers
  async function handleSubmit(values: Values) {
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: 'Buscando subtitulos...',
    });

    try {
      // 1. Get file from file picker
      const [file] = values.filePicker;

      // 2. Sanitize filename
      const fileName = getFilenameFromPath(file);
      invariant(fileName, 'El archivo no fue provisto.');

      // 3. Checks if file is a video
      const videoFileExtension = getVideoFileExtension(fileName);
      invariant(videoFileExtension, 'Extension de video no soportada.');

      // 4. Get subtitle from API
      const response = await fetch('http://localhost:8080/subtitles', {
        method: 'POST',
        body: JSON.stringify({ fileName }),
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (response.ok) {
        // 5. Parse subtitle data
        const subtitle = subtitleQuerySchema.parse(data);

        // 6. Update toast messages
        toast.style = Toast.Style.Success;
        toast.title = 'Subtitulo encontrado!';
        toast.message = `Descargando subtitulo...`;

        // 7. Add small delay to be able to read toast message
        await delay(800);

        // 8. Open in browser to automatically begin dowloading subtitle
        return open(subtitle.subtitleFullLink);
      }

      const message = getMessageFromStatusCode(response.status);

      toast.title = message.title;
      toast.message = message.subtitle;
      toast.style = Toast.Style.Failure;
    } catch (error) {
      const nativeError = error as Error;
      const isInvariantError = getIsInvariantError(nativeError);

      toast.style = Toast.Style.Failure;
      toast.title = 'Ups! Nos encontramos con un error';

      if (!isInvariantError) {
        toast.message = nativeError.message;
        return;
      }

      toast.message = getParsedInvariantMessage(nativeError);
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      <Form.FilePicker id='filePicker' title='Buscar subtitulo para' allowMultipleSelection={false} />
    </Form>
  );
}
