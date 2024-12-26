<script lang="ts">
	import { fade } from "svelte/transition";

	let {
        name,
        desc,
		callback,
	}: {
        name: string;
        desc: string;
		callback: () => void;
	} = $props();

    let l_padding = $state(0)
	let hover_active = $state(false);

</script>

<div class="relative min-w-20 rounded-md overflow- m-[0.5px] 
            text-gray-200 hover:text-white text-left whitespace-nowrap transition-padding"
    style="padding-left: {l_padding}px;"
            >
	{@html !hover_active ? '&nbsp;&nbsp;' : '>'}
	<button
        title={desc}
		tabindex="-5"
		onmouseenter={() => {
			hover_active = true;
		}}
		onmouseleave={() => {
			hover_active = false;
		}}
        onclick={() => {
            callback()
            l_padding = 15;
            setTimeout(() => {
                l_padding = 0
            }, 250)
        }}
		class="antialiased drop-shadow-lg"
	>
		{name}&nbsp;&nbsp;
	</button> <br />
    {#if hover_active}
        <div 
            class="absolute size-full bg-gray-700 opacity-100 top-0 left-0 -z-10 blur-xl"
            transition:fade={{ delay: 0, duration: 300 }}
        ></div>
    {/if}
</div>

<style>
    .transition-padding {
        transition: padding 0.25s;
    }
</style>
