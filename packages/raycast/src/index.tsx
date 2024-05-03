import { Action, ActionPanel, Form, Toast, open, showToast } from "@raycast/api";
import delay from "delay";
import { readFile } from "fs/promises";
import { z } from "zod";

// api
import { subtitleSchema } from "@subtis/api/subtitles/schemas";

// shared
import { getFilenameFromPath, getMessageFromStatusCode, getVideoFileExtension } from "@subtis/shared";

// internals
import { apiClient } from "./api";

// types
type Values = {
	filePicker: string[];
};

export default function Command() {
	// handlers
	async function handleSubmit(values: Values) {
		const toast = await showToast({
			style: Toast.Style.Animated,
			title: "Buscando subtítulos",
		});

		try {
			const [file] = values.filePicker;

			const fileBuffer = await readFile(file);
			const fileName = getFilenameFromPath(file);

			const videoFileExtension = getVideoFileExtension(fileName);
			const videoFileExtensionParsed = z.string().safeParse(videoFileExtension);

			if (!videoFileExtensionParsed.success) {
				Object.assign(toast, {
					message: "Extension de video no soportada.",
					style: Toast.Style.Failure,
					title: "Error de extensión",
				});

				return;
			}

			const response = await apiClient.v1.subtitles.file.name[":bytes"][":fileName"].$get({
				param: {
					fileName,
					bytes: String(fileBuffer.length),
				},
			});
			const data = await response.json();

			const subtitleByFileName = subtitleSchema.safeParse(data);
			if (!subtitleByFileName.success) {
				const { description: message, title } = getMessageFromStatusCode(response.status);
				Object.assign(toast, { message, style: Toast.Style.Failure, title });
				return;
			}

			Object.assign(toast, {
				message: "Descargando subtitulo...",
				style: Toast.Style.Success,
				title: "Subtitulo encontrado!",
			});

			await delay(1000);
			open(subtitleByFileName.data.subtitle_link);
		} catch (error) {
			if (error instanceof Error) {
				Object.assign(toast, {
					message: error.message,
					style: Toast.Style.Failure,
					title: "Error interno",
				});
			}
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
			<Form.FilePicker allowMultipleSelection={false} id="filePicker" title="Buscar subtitulo para" />
		</Form>
	);
}
