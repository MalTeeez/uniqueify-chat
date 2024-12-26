<script lang="ts">
	let ani_speed = 5.0;
</script>

<div style="animation-duration: {ani_speed}s" class="bar-outer absolute rounded blur-3xl">
	<div style="animation-duration: {ani_speed}s" class="bar-inner rounded-lg"></div>
</div>

<style>
	.bar-inner {
        width: 70%;
        height: 100%;
        animation-iteration-count: infinite;
		animation-timing-function: linear;
		animation-name: color;
        /* background: rgb(128, 126, 126); */
	}

	.bar-outer {
		position: absolute;
		/* z-index: 100; */
		width: 2rem;
		height: 26rem;
        animation-iteration-count: infinite;
		animation-timing-function: linear;
		animation-name: slide;
		top: 40rem;
		left: 15rem;
	}

	@keyframes slide {
		from {
			transform: translate(1.5rem, -12.75rem) rotate(45deg);
		}
		to {   /*                                               */
			transform: translate(-18rem, -66.15rem) rotate(45deg);
		}
	}

    @keyframes color {
        from {
            background-color: rgb(234, 236, 238);
		}
		to {
            background-color: rgb(235, 232, 236);
		}
		
	}

</style>
