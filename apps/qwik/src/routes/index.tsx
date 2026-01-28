import { component$, useSignal } from "@builder.io/qwik";
import { type DocumentHead } from "@builder.io/qwik-city";
import { Button } from "~/components/ui";
import { Carousel } from "@qwik-ui/headless";

import bannerImg from "~/img/banner.webp";
import JellyImg from "~/img/jelly.svg?h=700&format=webp&jsx";
import Img1 from "~/img/1.jpg?h=700&format=webp&jsx";
import Img2 from "~/img/2.jpg?h=700&format=webp&jsx";
import Img3 from "~/img/3.jpg?h=700&format=webp&jsx";
import Img4 from "~/img/4.jpg?h=700&format=webp&jsx";
import Img5 from "~/img/5.jpg?h=700&format=webp&jsx";
import Img6 from "~/img/6.jpg?h=700&format=webp&jsx";

export const carouselImages = [
    { description: "Sample description 1" },
    { description: "Sample description 2" },
    { description: "Sample description 3" },
    { description: "Sample description 4" },
    { description: "Sample description 5" },
    { description: "Sample description 6" },
];

export default component$(() => {
    const currentSlide = useSignal(0);

    return (
        <>
            {/* Hero Section */}
            <div
                class="w-full bg-cover"
                style={{ backgroundImage: `url(${bannerImg})` }}
            >
                <div class="bg-gradient-to-r from-black/50 from-30% to-black/0 px-4 pt-40 pb-30 max-md:from-100%">
                    <div class="mx-auto max-w-3xl text-white">
                        <h1 class="mb-8 text-3xl font-bold sm:text-5xl sm:leading-12">
                            Lorem ipsum,
                            <br/>
                            dolor sit amet
                        </h1>

                        <p class="max-w-md leading-relaxed">
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ad
                            consequatur dolorem doloremque dolores explicabo hic in iusto
                            molestias, nemo odio odit perferendis placeat quae quo ratione sit
                            tenetur velit! Corporis.
                        </p>

                        <Button size="lg" class="mt-8">
                            More than lorem
                        </Button>
                    </div>
                </div>
            </div>

            {/* Jelly Section */}
            <div class="w-full px-4 py-14 sm:py-20">
                <div class="mx-auto max-w-3xl items-center gap-x-8 sm:flex sm:px-4">
                    <div class="mb-14 flex w-full items-center justify-center sm:mb-0">
                        <div class="h-28 w-28 overflow-hidden rounded sm:h-40 sm:w-40">
                            <JellyImg
                                alt="Jelly"
                                class="h-full w-full rotate-12 object-contain"
                            />
                        </div>
                    </div>
                    <div class="mx-auto max-w-lg">
                        <h2 class="mb-4 text-2xl font-bold sm:text-3xl">
                            Lorem ipsum dolor
                        </h2>
                        <p class="leading-relaxed">
                            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ad
                            consequatur dolorem doloremque dolores explicabo hic in iusto
                            molestias, nemo odio odit perferendis placeat quae quo ratione sit
                            tenetur velit! Corporis.
                        </p>

                        <Button size="lg" class="mt-6">
                            More than lorem
                        </Button>
                    </div>
                </div>
            </div>
            {/* Carousel Section */}
            <div class="w-full bg-blue-900/10 px-4 py-14 sm:py-20">
                <div class="mx-auto max-w-3xl">
                    <Carousel.Root
                        // class="flex flex-col"
                        gap={30}
                        bind:selectedIndex={currentSlide}
                    >
                        <Carousel.Scroller class={"select-none"}>
                            <Carousel.Slide>
                                <Img1 alt={"Image 1"} class={"select-none touch-none"} draggable={false}/>
                            </Carousel.Slide>
                            <Carousel.Slide>
                                <Img2 alt={"Image 2"} class={"select-none touch-none"} draggable={false}/>
                            </Carousel.Slide>
                            <Carousel.Slide>
                                <Img3 alt={"Image 3"} class={"select-none touch-none"} draggable={false}/>
                            </Carousel.Slide>
                            <Carousel.Slide>
                                <Img4 alt={"Image 4"} class={"select-none touch-none"} draggable={false}/>
                            </Carousel.Slide>
                            <Carousel.Slide>
                                <Img5 alt={"Image 5"} class={"select-none touch-none"} draggable={false}/>
                            </Carousel.Slide>
                            <Carousel.Slide>
                                <Img6 alt={"Image 6"} class={"select-none touch-none"} draggable={false}/>
                            </Carousel.Slide>
                        </Carousel.Scroller>

                        <div class="flex border border-solid border-slate-800">
                            <Carousel.Previous
                                class="cursor-pointer border-r border-inherit px-8 py-4 hover:bg-blue-600/10"
                            >
                                &lt;
                            </Carousel.Previous>

                            <div class="grow p-1 text-center">
                                <p>{carouselImages[currentSlide.value].description}</p>
                                <p class="text-sm text-slate-400">
                                    {currentSlide.value + 1}/{carouselImages.length}
                                </p>
                            </div>

                            <Carousel.Next
                                class="cursor-pointer border-l border-inherit px-8 py-4 hover:bg-blue-600/10"
                            >
                                &gt;
                            </Carousel.Next>
                        </div>
                    </Carousel.Root>
                </div>
            </div>

            {/* Text Section */}
            <div class="w-full px-4 py-14 sm:py-20">
                <div class="mx-auto max-w-3xl">
                    <p class="mx-auto mb-4 max-w-lg leading-relaxed">
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ad
                        consequatur dolorem doloremque dolores explicabo hic in iusto
                        molestias, nemo odio odit perferendis placeat quae quo ratione sit
                        tenetur velit! Corporis consectetur adipisicing elit. Ad consequatur
                        dolorem doloremque dolores explicabo hic in iusto molestias, nemo
                        odio odit perferendis placeat quae quo ratione.
                    </p>

                    <p class="mx-auto max-w-lg leading-relaxed">
                        Lorem ipsum dolor sit amet, consectetur adipisicing elit. Ad
                        consequatur dolorem doloremque dolores explicabo hic in iusto
                        molestias, nemo odio odit perferendis placeat quae quo ratione sit
                        tenetur velit! Corporis.
                    </p>
                </div>
            </div>
        </>
    );
});

export const head: DocumentHead = {
    title: "Blank | Landing page",
    meta: [
        {
            name: "description",
            content: "Landing page for Blank",
        },
    ],
};
