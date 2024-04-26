import { type LoaderFunctionArgs, redirect } from "@remix-run/node";

export const loader = async ({ params }: LoaderFunctionArgs) => {
	const { subtitleId } = params;
	const apiUrl = process.env.NODE_ENV === "production" ? "https://api.subt.is" : "http://localhost:8787";

	return redirect(`${apiUrl}/v1/${subtitleId}`);
};
