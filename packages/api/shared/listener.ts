import type { Server } from "bun";

export function listener(context: Server, displayListenLog: boolean) {
	if (!displayListenLog) {
		return;
	}

	const { development, hostname, port } = context;
	const message = `\n🟢 Subtis API is running at http${development ? "" : "s"}://${hostname}:${port}\n`;
	console.log(message); // eslint-disable-line no-console
}
