<script lang="ts">
	import emblaCarouselSvelte from 'embla-carousel-svelte';
	import Button from './Button.svelte';

	interface Props {
		images: Array<{ srcset: string; alt: string }>;
	}

	let { images }: Props = $props();

	let emblaApi = $state<any>(null);
	let currentIndex = $state(0);
	let totalSlides = $derived(images.length);

	function onInit(event: CustomEvent) {
		emblaApi = event.detail;
		emblaApi.on('select', () => {
			currentIndex = emblaApi.selectedScrollSnap();
		});
	}

	function scrollPrev() {
		if (emblaApi) emblaApi.scrollPrev();
	}

	function scrollNext() {
		if (emblaApi) emblaApi.scrollNext();
	}
</script>

<div class="w-full bg-blue-900/10 py-14 sm:py-20">
	<div class="mx-auto max-w-3xl px-4">
		<h2 class="mb-8 text-2xl font-bold sm:text-3xl">Gallery</h2>

		<div class="overflow-hidden mb-8" use:emblaCarouselSvelte onemblaInit={onInit}>
			<div class="flex">
				{#each images as image}
					<div class="flex-[0_0_100%] min-w-0">
						<img
							srcset={image.srcset}
							alt={image.alt}
							draggable="false"
							class="select-none touch-none w-full h-[400px] object-cover"
						/>
					</div>
				{/each}
			</div>
		</div>

		<div class="flex gap-x-4">
			<Button variant="nav_action" size="xl" onclick={scrollPrev}>Previous</Button>
			<div class="grow p-1 text-center">{currentIndex + 1} / {totalSlides}</div>
			<Button variant="nav_action" size="xl" onclick={scrollNext}>Next</Button>
		</div>
	</div>
</div>
