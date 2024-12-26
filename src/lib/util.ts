import { browser } from "$app/environment";

export function sendMessage(message: string) {
	if (browser) {
		window.postMessage(message, "*")
	} else {
		console.log("Failed to get Browser element")
	}
}