@extends('layouts.app')

@section('title', 'stejs.cz')

@section('content')
<!-- Hero Section -->
<div class="relative w-full">
    <!-- Background Image with srcset -->
    <picture>
        <source
            type="image/avif"
            srcset="{{ asset('img/optimized/banner-640w.avif') }} 640w,
                    {{ asset('img/optimized/banner-1024w.avif') }} 1024w,
                    {{ asset('img/optimized/banner-1440w.avif') }} 1440w,
                    {{ asset('img/optimized/banner-1920w.avif') }} 1920w"
            sizes="100vw"
        />
        <source
            type="image/webp"
            srcset="{{ asset('img/optimized/banner-640w.webp') }} 640w,
                    {{ asset('img/optimized/banner-1024w.webp') }} 1024w,
                    {{ asset('img/optimized/banner-1440w.webp') }} 1440w,
                    {{ asset('img/optimized/banner-1920w.webp') }} 1920w"
            sizes="100vw"
        />
        <img
            src="{{ asset('img/optimized/banner-1440w.jpg') }}"
            srcset="{{ asset('img/optimized/banner-640w.jpg') }} 640w,
                    {{ asset('img/optimized/banner-1024w.jpg') }} 1024w,
                    {{ asset('img/optimized/banner-1440w.jpg') }} 1440w,
                    {{ asset('img/optimized/banner-1920w.jpg') }} 1920w"
            sizes="100vw"
            alt="Jellyfish underwater"
            fetchpriority="high"
            class="absolute inset-0 h-full w-full object-cover"
        />
    </picture>

    <!-- Content Overlay with Gradient -->
    <div class="relative grid min-h-screen w-full content-center bg-gradient-to-r from-black/50 from-30% to-black/0 max-md:from-100% px-4 pt-40 pb-30">
        <div class="mx-auto max-w-3xl">
            <h1 class="mb-4 text-3xl font-bold sm:text-5xl sm:leading-12">
                Discover the Mysteries of the Deep Ocean
            </h1>
            <p class="mb-8 leading-relaxed">
                Explore the wonders beneath the waves. Jellyfish, with their graceful
                movements and vibrant colors, are among the ocean's most mesmerizing creatures.
            </p>
            <button class="inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 bg-purple-600 text-white hover:bg-purple-700 active:bg-purple-800 px-6 py-2 rounded-lg">
                Learn More
            </button>
        </div>
    </div>
</div>

<!-- Two-Column Content Section -->
<div class="w-full py-14 sm:py-20">
    <div class="mx-auto flex max-w-3xl flex-col items-start gap-x-8 px-4 sm:flex-row">
        <!-- Image Column -->
        <div class="mb-4 h-28 w-28 overflow-hidden rounded-full sm:mb-0 sm:h-40 sm:w-40 rotate-90 shrink-0">
            <img
                src="{{ asset('img/jelly.svg') }}"
                alt="Jellyfish close-up"
                class="h-full w-full object-cover"
            />
        </div>

        <!-- Text Column -->
        <div>
            <h2 class="mb-4 text-2xl font-bold sm:text-3xl">The Grace of Jellyfish</h2>
            <p class="leading-relaxed">
                These creatures have existed for millions of years, drifting through
                the ocean currents with effortless elegance.
            </p>
        </div>
    </div>
</div>

<!-- Carousel / Gallery Section -->
<div class="w-full bg-blue-900/10 py-14 sm:py-20">
    <div class="mx-auto max-w-3xl px-4">
        <h2 class="mb-8 text-2xl font-bold sm:text-3xl">Gallery</h2>

        <!-- Carousel with Alpine.js -->
        <div x-data="{
            currentSlide: 1,
            totalSlides: 6,
            nextSlide() {
                this.currentSlide = this.currentSlide < this.totalSlides ? this.currentSlide + 1 : 1;
            },
            prevSlide() {
                this.currentSlide = this.currentSlide > 1 ? this.currentSlide - 1 : this.totalSlides;
            }
        }">
            <!-- Image Container -->
            <div class="mb-8 relative overflow-hidden">
                <div class="flex transition-transform duration-500 ease-in-out" :style="`transform: translateX(-${(currentSlide - 1) * 100}%)`">
                    @for ($i = 1; $i <= 6; $i++)
                    <div class="min-w-full">
                        <picture>
                            <source
                                type="image/avif"
                                srcset="{{ asset('img/optimized/' . $i . '-400w.avif') }} 400w,
                                        {{ asset('img/optimized/' . $i . '-760w.avif') }} 760w,
                       i                 {{ asset('img/optimized/' . $i . '-1050w.avif') }} 1050w"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 760px, 1050px"
                            />
                            <source
                                type="image/webp"
                                srcset="{{ asset('img/optimized/' . $i . '-400w.webp') }} 400w,
                                        {{ asset('img/optimized/' . $i . '-760w.webp') }} 760w,
                                        {{ asset('img/optimized/' . $i . '-1050w.webp') }} 1050w"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 760px, 1050px"
                            />
                            <img
                                src="{{ asset('img/optimized/' . $i . '-760w.jpg') }}"
                                srcset="{{ asset('img/optimized/' . $i . '-400w.jpg') }} 400w,
                                        {{ asset('img/optimized/' . $i . '-760w.jpg') }} 760w,
                                        {{ asset('img/optimized/' . $i . '-1050w.jpg') }} 1050w"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 760px, 1050px"
                                alt="Jelly fish"
                                @if($i > 1) loading="lazy" @endif
                                draggable="false"
                                class="select-none touch-none w-full h-[400px] object-cover"
                            />
                        </picture>
                    </div>
                    @endfor
                </div>
            </div>

            <!-- Controls -->
            <div class="flex gap-x-4">
                <button
                    @click="prevSlide()"
                    class="inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 border border-slate-800 hover:bg-blue-600/10 px-8 py-4 rounded-lg cursor-pointer"
                >
                    Previous
                </button>

                <div class="grow p-1 text-center flex items-center justify-center">
                    <span x-text="currentSlide + ' / ' + totalSlides"></span>
                </div>

                <button
                    @click="nextSlide()"
                    class="inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-50 border border-slate-800 hover:bg-blue-600/10 px-8 py-4 rounded-lg cursor-pointer"
                >
                    Next
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Text Content Section -->
<div class="w-full py-14 sm:py-20">
    <div class="mx-auto max-w-md px-4">
        <p class="mb-4 leading-relaxed">
            Lorem ipsum dolor sit amet, qui minim labore adipisicing minim sint
            cillum sint consectetur cupidatat.
        </p>
        <p class="mb-4 leading-relaxed">
            Lorem ipsum dolor sit amet, officia excepteur ex fugiat reprehenderit
            enim labore culpa sint ad nisi Lorem pariatur mollit ex esse
            exercitation amet. Nisi anim cupidatat excepteur officia.
        </p>
        <p class="leading-relaxed">
            Reprehenderit nostrud nostrud ipsum Lorem est aliquip amet voluptate
            voluptate dolor minim nulla est proident. Nostrud officia pariatur ut
            officia.
        </p>
    </div>
</div>
@endsection
