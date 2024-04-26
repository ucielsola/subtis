import { Action, ActionPanel, Form, Toast, open, showToast } from "@raycast/api";
import delay from "delay";
import invariant from "tiny-invariant";

// shared
import { getFilenameFromPath, getMessageFromStatusCode, getVideoFileExtension } from "@subtis/shared";

// internals
import { apiClient } from "./api";
import { getIsInvariantError, getParsedInvariantMessage } from "./invariant";

// types
type Values = {
	filePicker: string[];
};

export default function Command() {
	// handlers
	async function handleSubmit(values: Values) {
		const toast = await showToast({
			style: Toast.Style.Animated,
			title: "Buscando subtitulos...",
		});

		try {
			// 1. Get file from file picker
			const [file] = values.filePicker;

			// 2. Sanitize filename
			const fileName = getFilenameFromPath(file);
			invariant(fileName, "El archivo no fue provisto.");

			// 3. Checks if file is a video
			const videoFileExtension = getVideoFileExtension(fileName);
			invariant(videoFileExtension, "Extension de video no soportada.");

			// 4. Get subtitle from API
			const response = await apiClient.v1.subtitles.file.name[":bytes"][":fileName"].$get({
				param: {
					bytes: "",
					fileName,
				},
			});
			const data = await response.json();

			// 5. Display failure toast message if subtitle is not found
			if (data === null || "message" in data) {
				const { description: message, title } = getMessageFromStatusCode(response.status);
				Object.assign(toast, { message, style: Toast.Style.Failure, title });

				throw new Error("data is null");
			}

			// 6. Update toast messages
			Object.assign(toast, {
				message: "Descargando subtitulo...",
				style: Toast.Style.Success,
				title: "Subtitulo encontrado!",
			});

			// 7. Add small delay to be able to read toast message
			await delay(800);

			// 8. Open in browser to automatically begin dowloading subtitle
			open(data.subtitleLink);
		} catch (error) {
			if (error instanceof Error) {
				const isInvariantError = getIsInvariantError(error);

				toast.style = Toast.Style.Failure;
				toast.title = "Ups! Nos encontramos con un error";

				if (!isInvariantError) Object.assign(toast, { message: error.message });

				toast.message = getParsedInvariantMessage(error);
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
