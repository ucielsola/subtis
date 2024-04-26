import { redirect } from "@remix-run/node";

export const loader = async () => {
	const apiUrl = process.env.NODE_ENV === "production" ? "https://api.subt.is" : "http://localhost:8787";
	return redirect(`${apiUrl}/v1/cli`);
};
