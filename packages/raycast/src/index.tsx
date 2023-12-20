import delay from 'delay'
import invariant from 'tiny-invariant'
import { Action, ActionPanel, Form, Toast, open, showToast } from '@raycast/api'

// shared
import { getMessageFromStatusCode } from 'shared/error-messages'
import { getFilenameFromPath, getVideoFileExtension } from 'shared/movie'
import { getIsInvariantError, getParsedInvariantMessage } from 'shared/invariant'

// internals
import { apiClient } from './api'

// types
type Values = {
  filePicker: string[]
}

export default function Command() {
  // handlers
  async function handleSubmit(values: Values) {
    const toast = await showToast({
      style: Toast.Style.Animated,
      title: 'Buscando subtitulos...',
    })

    try {
      // 1. Get file from file picker
      const [file] = values.filePicker

      // 2. Sanitize filename
      const fileName = getFilenameFromPath(file)
      invariant(fileName, 'El archivo no fue provisto.')

      // 3. Checks if file is a video
      const videoFileExtension = getVideoFileExtension(fileName)
      invariant(videoFileExtension, 'Extension de video no soportada.')

      // 4. Get subtitle from API
      const { data, status } = await apiClient.v1.subtitle.post({ fileName })

      // 5. Display failure toast message if subtitle is not found
      if (data === null || 'message' in data) {
        const { title, description: message } = getMessageFromStatusCode(status)
        return Object.assign(toast, { style: Toast.Style.Failure, title, message })
      }

      // 6. Update toast messages
      Object.assign(toast, {
        style: Toast.Style.Success,
        title: 'Subtitulo encontrado!',
        message: 'Descargando subtitulo...',
      })

      // 7. Add small delay to be able to read toast message
      await delay(800)

      // 8. Open in browser to automatically begin dowloading subtitle
      return open(data.subtitleFullLink)
    }
    catch (error) {
      if (error instanceof Error) {
        const isInvariantError = getIsInvariantError(error)

        toast.style = Toast.Style.Failure
        toast.title = 'Ups! Nos encontramos con un error'

        if (!isInvariantError) {
          return Object.assign(toast, { message: error.message })
        }

        toast.message = getParsedInvariantMessage(error)
      }
    }
  }

  return (
    <Form
      actions={(
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      )}
    >
      <Form.FilePicker id="filePicker" title="Buscar subtitulo para" allowMultipleSelection={false} />
    </Form>
  )
}
