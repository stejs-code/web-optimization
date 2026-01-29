import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Carousel } from "@/components/carousel";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <div className="relative w-full">
        <Image
          src="/img/banner.webp"
          alt="Jellyfish underwater"
          fill
          priority
          fetchPriority="high"
          className="object-cover"
          sizes="100vw"
        />

        <div className="relative grid min-h-screen w-full content-center bg-gradient-to-r from-black/50 from-30% to-black/0 max-md:from-100% px-4 pt-40 pb-30">
          <div className="mx-auto max-w-3xl">
            <h1 className="mb-4 text-3xl font-bold sm:text-5xl sm:leading-12">
              Discover the Mysteries of the Deep Ocean
            </h1>
            <p className="mb-8 leading-relaxed">
              Explore the wonders beneath the waves. Jellyfish, with their graceful
              movements and vibrant colors, are among the ocean's most mesmerizing creatures.
            </p>
            <Button size="lg">Learn More</Button>
          </div>
        </div>
      </div>

      {/* Two-Column Content Section */}
      <div className="w-full py-14 sm:py-20">
        <div className="mx-auto flex max-w-3xl flex-col items-start gap-x-8 px-4 sm:flex-row">
          <div className="mb-4 h-28 w-28 overflow-hidden rounded-full sm:mb-0 sm:h-40 sm:w-40 shrink-0">
            <Image
              src="/img/4.webp"
              alt="Jellyfish close-up"
              width={400}
              height={400}
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl">The Grace of Jellyfish</h2>
            <p>
              These creatures have existed for millions of years, drifting through
              the ocean currents with effortless elegance.
            </p>
          </div>
        </div>
      </div>

      {/* Carousel Section */}
      <Carousel />

      {/* Text Content Section */}
      <div className="w-full py-14 sm:py-20">
        <div className="mx-auto max-w-md px-4">
          <p className="mb-4">
            Lorem ipsum dolor sit amet, qui minim labore adipisicing minim sint
            cillum sint consectetur cupidatat.
          </p>
          <p className="mb-4">
            Lorem ipsum dolor sit amet, officia excepteur ex fugiat reprehenderit
            enim labore culpa sint ad nisi Lorem pariatur mollit ex esse
            exercitation amet. Nisi anim cupidatat excepteur officia.
          </p>
          <p>
            Reprehenderit nostrud nostrud ipsum Lorem est aliquip amet voluptate
            voluptate dolor minim nulla est proident. Nostrud officia pariatur ut
            officia.
          </p>
        </div>
      </div>
    </>
  );
}
