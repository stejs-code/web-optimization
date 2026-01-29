"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";

const carouselImages = [
  { src: "/img/1.webp", alt: "Jelly fish" },
  { src: "/img/2.webp", alt: "Jelly fish" },
  { src: "/img/3.webp", alt: "Jelly fish" },
  { src: "/img/4.webp", alt: "Jelly fish" },
  { src: "/img/5.webp", alt: "Jelly fish" },
  { src: "/img/6.webp", alt: "Jelly fish" },
];

export function Carousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [currentSlide, setCurrentSlide] = useState(1);
  const [totalSlides] = useState(carouselImages.length);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCurrentSlide(emblaApi.selectedScrollSnap() + 1);
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <section className="w-full bg-blue-900/10 py-14 sm:py-20">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="mb-8 text-2xl font-bold sm:text-3xl">Gallery</h2>

        <div className="mb-8 overflow-hidden h-[700px]" ref={emblaRef}>
          <div className="flex h-full">
            {carouselImages.map((image, index) => (
              <div key={index} className="min-w-0 flex-[0_0_100%] h-full">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={1200}
                  height={700}
                  draggable={false}
                  className="select-none touch-none w-full h-full object-cover"
                  priority={index === 0}
                  loading={index === 0 ? "eager" : "lazy"}
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-x-4">
          <Button
            variant="nav_action"
            size="xl"
            onClick={scrollPrev}
            className="cursor-pointer border px-8 py-4 hover:bg-blue-600/10"
          >
            Previous
          </Button>
          <div className="grow p-1 text-center flex items-center justify-center">
            {currentSlide} / {totalSlides}
          </div>
          <Button
            variant="nav_action"
            size="xl"
            onClick={scrollNext}
            className="cursor-pointer border px-8 py-4 hover:bg-blue-600/10"
          >
            Next
          </Button>
        </div>
      </div>
    </section>
  );
}
