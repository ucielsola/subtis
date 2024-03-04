import type { Buffer } from "node:buffer";

export async function getIsLinkAlive(link: string): Promise<boolean> {
	const { ok } = await fetch(link, { method: "HEAD" });
	return ok;
}

export function getNumbersArray(length: number): number[] {
	return Array.from({ length }, (_, index) => index + 1);
}

export function getRandomDelay(
	min = 5,
	max = 15,
): {
	miliseconds: number;
	seconds: number;
} {
	const seconds = Math.floor(Math.random() * (max - min + 1) + min);
	return { miliseconds: seconds * 1000, seconds };
}

export function getSubtitleAuthor(subtitleFile: Buffer): null | string {
	let author: null | string = null;
	const subtitleString = subtitleFile.toString("utf8");

	const regex = /<i>([^<]*)<\/i>(?!.*<i>)/s;
	const lastItalicTagMatch = subtitleString.match(regex);

	if (lastItalicTagMatch) {
		const innerText = lastItalicTagMatch[1];
		const hasAuthor = innerText.includes("traducc");

		if (hasAuthor) {
			const innerTextSplitted = innerText.split(/\s\n/g);
			author = innerTextSplitted[innerTextSplitted.length - 1];
		}
	}

	return author;
}
