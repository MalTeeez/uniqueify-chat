import { browser } from "$app/environment";
import { writable, type Writable } from "svelte/store";

const browser_obj: any | undefined = getBrowserObject()

export const channel_modes: Writable<Map<string, string>> = writable(
	new Map<string, string>(),
);

export async function propagateListFromStorage() {
	const stored = await getStoredChannels();
	if (stored) {
		channel_modes.update((channel_modes) => {
			for (let channel in stored) {
				channel_modes.set(channel, stored[channel]);
			}
			return channel_modes;
		})
	}
}

export async function sendMessage(type: string, mode: string, channel: string) {
	if (browser_obj) {
		const current_tab = await getCurrentTab();
		if (current_tab) {
			browser_obj.tabs.sendMessage(current_tab.id, { type: type, mode: mode, channel: channel });
		}
	}
}

export async function getCurrentChannel(): Promise<string | undefined> {
	const tab = await getCurrentTab();
	if (tab) {
		//@ts-ignore
		const url: string = tab.url;
		const match = url.match(/^.+:\/\/(?:(?:www|m)\.)?twitch\.tv\/(\w+)/m);
		if (match && match.length > 1) {
			return match[1];
		}
	}
	return undefined;
}

export async function getStoredChannels() {
	if (browser_obj) {
		return await browser_obj.storage.sync.get(undefined);
	}
}

export function getBrowserObject() {
	if (browser) {
		//@ts-ignore
		if (window && window.browser) {
			console.info("[Uniqueify-Chat]: Using standard browser backend.");
			//@ts-ignore
			return window.browser;
			//@ts-ignore
		} else if (window && window.chrome) {
			console.info("[Uniqueify-Chat]: Using chrome browser backend.");
			//@ts-ignore
			return window.chrome;
		} else {
			console.error("[Uniqueify-Chat]: Failed to get browser object, defaulting to GLOBAL setting for all channels.");
			return undefined;
		}
	}
}

/**
 * Get the currently active tab from the browser object.
 */
export async function getCurrentTab(): Promise<object | undefined> {
	if (browser_obj) {
		let tabs: Array<any> = await browser_obj.tabs.query({ active: true, currentWindow: true })
		if (tabs.length > 0) {
			return tabs[0];
		}
	}
	return undefined;
}

export enum HandlerType {
	NEWEST = "NEWEST",
	GLOBAL = "GLOBAL",
	STREAK = "STREAK"
}