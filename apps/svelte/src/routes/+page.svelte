<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Carousel from '$lib/components/Carousel.svelte';

	// Import optimized images for carousel (400px height)
	import img1 from '$lib/assets/1.webp?w=600;800;1200&h=400&format=webp&as=srcset';
	import img2 from '$lib/assets/2.webp?w=600;800;1200&h=400&format=webp&as=srcset';
	import img3 from '$lib/assets/3.webp?w=600;800;1200&h=400&format=webp&as=srcset';
	import img4 from '$lib/assets/4.webp?w=600;800;1200&h=400&format=webp&as=srcset';
	import img5 from '$lib/assets/5.webp?w=600;800;1200&h=400&format=webp&as=srcset';
	import img6 from '$lib/assets/6.webp?w=600;800;1200&h=400&format=webp&as=srcset';

	// Import hero banner optimized
	import bannerSrc from '$lib/assets/banner.webp?w=1440;1920&format=webp&as=srcset';

	// Import circular jellyfish optimized
	import circularJellyfish from '$lib/assets/4.webp?w=400&format=webp';

	const carouselImages = [
		{ srcset: img1, alt: 'Jelly fish' },
		{ srcset: img2, alt: 'Jelly fish' },
		{ srcset: img3, alt: 'Jelly fish' },
		{ srcset: img4, alt: 'Jelly fish' },
		{ srcset: img5, alt: 'Jelly fish' },
		{ srcset: img6, alt: 'Jelly fish' }
	];
</script>

<svelte:head>
	<title>stejs.cz</title>
	<meta name="description" content="This is the stejs.cz website" />
</svelte:head>

<!-- Hero Section -->
<div class="relative w-full">
	<!-- Background Image -->
	<img
		srcset={bannerSrc}
		alt="Jellyfish underwater"
		fetchpriority="high"
		class="absolute inset-0 h-full w-full object-cover"
	/>

	<!-- Content Overlay with Gradient -->
	<div
		class="relative grid min-h-screen w-full content-center bg-gradient-to-r from-black/50 from-30% to-black/0 max-md:from-100% px-4 pt-40 pb-30"
	>
		<div class="mx-auto max-w-3xl">
			<h1 class="mb-4 text-3xl font-bold sm:text-5xl sm:leading-12">
				Discover the Mysteries of the Deep Ocean
			</h1>
			<p class="mb-8 leading-relaxed">
				Explore the wonders beneath the waves. Jellyfish, with their graceful movements and
				vibrant colors, are among the ocean's most mesmerizing creatures.
			</p>
			<Button variant="primary" size="lg">Learn More</Button>
		</div>
	</div>
</div>

<!-- Two-Column Content Section -->
<div class="w-full py-14 sm:py-20">
	<div class="mx-auto flex max-w-3xl flex-col items-start gap-x-8 px-4 sm:flex-row">
		<!-- Image Column -->
		<div class="mb-4 h-28 w-28 overflow-hidden rounded-full sm:mb-0 sm:h-40 sm:w-40 rotate-90">
			<img src={circularJellyfish} alt="Jellyfish close-up" class="h-full w-full object-cover" />
		</div>

		<!-- Text Column -->
		<div>
			<h2 class="mb-4 text-2xl font-bold sm:text-3xl">The Grace of Jellyfish</h2>
			<p class="leading-relaxed">
				These creatures have existed for millions of years, drifting through the ocean currents
				with effortless elegance.
			</p>
		</div>
	</div>
</div>

<!-- Carousel Section -->
<Carousel images={carouselImages} />

<!-- Text Content Section -->
<div class="w-full py-14 sm:py-20">
	<div class="mx-auto max-w-md px-4">
		<p class="mb-4 leading-relaxed">
			Lorem ipsum dolor sit amet, qui minim labore adipisicing minim sint cillum sint consectetur
			cupidatat.
		</p>
		<p class="mb-4 leading-relaxed">
			Lorem ipsum dolor sit amet, officia excepteur ex fugiat reprehenderit enim labore culpa
			sint ad nisi Lorem pariatur mollit ex esse exercitation amet. Nisi anim cupidatat excepteur
			officia.
		</p>
		<p class="leading-relaxed">
			Reprehenderit nostrud nostrud ipsum Lorem est aliquip amet voluptate voluptate dolor minim
			nulla est proident. Nostrud officia pariatur ut officia.
		</p>
	</div>
</div>
