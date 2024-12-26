<script lang="ts">
	import BarAnimation from '$lib/components/BarAnimation.svelte';
	import Option from '$lib/components/Option.svelte';
  import { sendMessage } from '$lib/util';

	let hover_active = $state(false);

	let denylist = $state([
		{ channel: 'drewski', mode: 'GLOBAL' },
		{ channel: 'vedal987', mode: 'GLOBAL' },
		{ channel: 'lcolonq2', mode: 'GLOBAL' },
		{ channel: 'lcolonq3', mode: 'GLOBAL' },
		{ channel: 'lcolonq4', mode: 'GLOBAL' },
		{ channel: 'lcolonq5', mode: 'GLOBAL' },
		{ channel: 'lcolonq6', mode: 'GLOBAL' },
		{ channel: 'lcolonq7', mode: 'GLOBAL' },
		{ channel: 'lcolonq8', mode: 'GLOBAL' },
		{ channel: 'lcolonq9', mode: 'GLOBAL' },
		{ channel: 'lcolonq0', mode: 'GLOBAL' },
		{ channel: 'lcolonq11', mode: 'GLOBAL' },
		{ channel: 'lcolonq12', mode: 'GLOBAL' },
		{ channel: 'lcolonq13asdasdasdasdasdasdasdasd', mode: 'GLOBAL' },
	]);

	let allowlist = $state([
		{ channel: 'lcolonq13asdasdasdasdasdasdasdasd', mode: 'GLOBAL' },
		{ channel: 'drewski', mode: 'GLOBAL' },
		{ channel: 'vedal987', mode: 'GLOBAL' },
		{ channel: 'lcolonq', mode: 'GLOBAL' },
		{ channel: 'lcolonq0', mode: 'GLOBAL' },
		{ channel: 'lcolonq11', mode: 'GLOBAL' },
	]);

	let list_type_allow = $state(true);

	async function sendMessageToTabs(message: string) {
		sendMessage(message)
	}
</script>

<main class="flex items-center flex-col subpixel-antialiased">
	<div class="relative overflow-hidden">
		<BarAnimation></BarAnimation>
		<div
			id="card"
			class="card-shadow flex mx-auto left-0 top-0 w-52 min-h-72 flex-col py-4 px-6 card-shadow text-center backdrop-blur-lg backdrop-saturate-[1.1] backdrop-brightness-110 font-['Outfit']"
		>
			<h1
				class="mb-1 text-xl text-center font-extrabold select-none pb-5 text-gray-200 tracking-tighter drop-shadow-xl heading"
			>
				uniqueify-chat
			</h1>

			<div class="pb-4 pl-6">
				<h3
					class="text-left font-['Pixelify_Sans'] leading-4 whitespace-nowrap"
				>
					{@html hover_active ? '&nbsp;&nbsp;' : '>'} quick mode
				</h3>
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					onmouseenter={() => {
						hover_active = true;
					}}
					onmouseleave={() => {
						hover_active = false;
					}}
					class="flex flex-col items-start pl-[1.15rem] gap-0 font-['Pixelify_Sans'] leading-5 pb-2"
				>
					<Option
						name="newest"
						desc="Deduplicate all messages, but only show the newest one, for each indidual message type (as in: new duplicate message comes, old message disappears)"
						callback={() => {
							console.log('pressed ');
							sendMessageToTabs("Hi content-script chan!")
						}}
					></Option>
					<Option
						name="global"
						desc="Deduplicate all messages, only keep oldest one"
						callback={() => {
							console.log('pressed ');
						}}
					></Option>
					<Option
						name="streak"
						desc="Only deduplicate messages that appear in a 'streak', so messages that dont get interrupted by different messages"
						callback={() => {
							console.log('pressed ');
						}}
					></Option>
				</div>
			</div>

			<div
				class="font-['Pixelify_Sans'] font-medium text-sm justify-center pb-2"
			>
				<div class="relative inline">
					<button
						class={list_type_allow ? 'text-gray-50 font-extrabold' : 'text-gray-200 font-normal'}
						onclick={() => {
							list_type_allow = !list_type_allow;
						}}
						>allowlist&nbsp;&nbsp;
						{#if list_type_allow}
							<div
								class="absolute bg-[rgba(61,61,61,0.25)] size-full m-auto top-0 blur-md"
								style="z-index: -5;"
							></div>
						{/if}
					</button>
				</div>
				{#if list_type_allow}
					<p class="inline">&lt;</p>
				{:else}
					<p class="inline">&gt;</p>
				{/if}
				<div class="relative inline">
					<button
						class={list_type_allow ? 'text-gray-200 font-normal' : 'text-gray-50 font-extrabold'}
						onclick={() => {
							list_type_allow = !list_type_allow;
						}}
						>&nbsp;&nbsp;denylist
						{#if !list_type_allow}
							<div
								class="absolute bg-[rgba(61,61,61,0.25)] size-full m-auto top-0 blur-md"
								style="z-index: -5;"
							></div>
						{/if}
					</button>
				</div>
			</div>

			<div
				class="font-['Pixelify_Sans'] leading-5 tracking-tight text-left overflow-x-hidden overflow-y-scroll max-h-[7.3rem] justify-center"
			>
				<table class="table-auto border-collapse h-1 pr-4 min-w-40">
					<thead class="border-b-[1px]"
						><tr class="font-semibold">
							<th class="max-w-[5.25rem]">channel</th>
							<th class="whitespace-nowrap">mode</th>
							<th class="pl-2"></th>
						</tr></thead
					>
					<tbody class="backdrop-brightness-90">
						{#if !list_type_allow}
							{#each denylist as entry (entry.channel)}
								<tr class="border-t-[1px] border-dotted hover:break-all">
									<td
										class="pl-1 min-w-16 max-w-[5.25rem] max-h-20 inline-block overflow-x-hidden hover:overflow-y-scroll"
										><a href="https://twitch.tv/{entry.channel}">{entry.channel}</a></td
									>
									<td class="pl-1 align-top">{entry.mode.toLowerCase()}</td>
									<td class="pr-0.5 align-top"
										><button
											onclick={() => {
												denylist = denylist.filter(
													(e) => e.channel != entry.channel,
												);
											}}>X</button
										></td
									>
								</tr>
							{/each}
						{:else}
							{#each allowlist as entry (entry.channel)}
								<tr class="border-t-[1px] border-dotted hover:break-all">
									<td
										class="pl-1 min-w-16 max-w-[5.25rem] max-h-20 inline-block overflow-x-hidden hover:overflow-y-scroll"
										><a href="https://twitch.tv/{entry.channel}">{entry.channel}</a></td
									>
									<td class="pl-1 align-top">{entry.mode.toLowerCase()}</td>
									<td class="pr-0.5 align-top"
										><button
											onclick={() => {
												allowlist = allowlist.filter(
													(e) => e.channel != entry.channel,
												);
											}}>X</button
										></td
									>
								</tr>
							{/each}
						{/if}
					</tbody>
				</table>
			</div>

			<div
				id="footer"
				class="z-10 bottom-3 justify-center flex flex-row items-end pt-4"
			>
				<div id="credits" class="self-end credit text-[rgba(139,139,139,0.9)]">
					by &nbsp;
				</div>
				<div
					id="credits"
					class="self-end credit font-bold relative text-[rgba(170,169,169,0.9)]"
				>
					@malteeez
					<div
						class="absolute bg-[rgba(180,180,180,0.4)] size-full m-auto top-0 blur-md"
						style="z-index: -5;"
					></div>
				</div>
			</div>
		</div>
	</div>
	<div
		class="absolute bg -z-10 size-full bg-cover bg-center"
		style="background-image: url(https://sxmaa.net/img/artemis-2-slow.gif);"
	></div>
</main>

<style>
	.heading {
		background: #f1f1f1;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	.credit {
		font-size: 12.5px;
		font-family: 'Outfit', sans-serif;
	}

	.card-shadow {
		--tw-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1),
			0 8px 10px -6px rgb(0 0 0 / 0.1);
		--tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color),
			0 8px 10px -6px var(--tw-shadow-color);
		box-shadow:
			rgba(255, 255, 255, 0.12) 0px 0px 1px 1px,
			rgba(0, 0, 0, 0.2) 1px 1px 4px 0.5px,
			var(--tw-ring-offset-shadow, 0 0 #0000),
			var(--tw-ring-shadow, 0 0 #0000),
			var(--tw-shadow);
	}
</style>
