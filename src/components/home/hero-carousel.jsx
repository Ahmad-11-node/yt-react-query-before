import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

const slides = [
  {
    image: "/banners/retail.jpg",
    alt: "Clothing rails in a bright retail store",
    eyebrow: "The catalogue",
    title: "Nearly 200 products, one search box",
    cta: "Browse products",
    to: "/products",
  },
  {
    image: "/banners/smartphones.jpg",
    alt: "Close-up of a smartphone camera array",
    eyebrow: "Tech",
    title: "Smartphones and tablets",
    cta: "Shop smartphones",
    to: "/products?category=smartphones",
  },
  {
    image: "/banners/watches.jpg",
    alt: "Two minimalist wristwatches on a pale background",
    eyebrow: "Accessories",
    title: "Watches for every wrist",
    cta: "Shop watches",
    to: "/products?category=mens-watches",
  },
];

export function HeroCarousel() {
  const [api, setApi] = useState(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => api.off("select", onSelect);
  }, [api]);

  return (
    <Carousel
      setApi={setApi}
      opts={{ loop: true }}
      // No autoplay: a banner that moves on its own steals focus and fails
      // WCAG 2.2.2. The user drives it.
      className="group/hero"
    >
      <CarouselContent>
        {slides.map((slide) => (
          <CarouselItem key={slide.to}>
            <div className="relative overflow-hidden rounded-lg border">
              <img
                src={slide.image}
                alt={slide.alt}
                className="aspect-4/3 w-full object-cover sm:aspect-21/9"
              />

              {/* Legibility scrim, not decoration — the slide images range from
                  near-white to near-black, and the copy has to hold up on both. */}
              <div
                aria-hidden="true"
                className="absolute inset-0 bg-linear-to-r from-black/75 via-black/45 to-transparent"
              />

              <div className="absolute inset-0 flex flex-col justify-center gap-3 p-6 pb-16 sm:p-10 sm:pb-16">
                <p className="text-xs font-medium uppercase tracking-widest text-white/70">
                  {slide.eyebrow}
                </p>
                <h2 className="max-w-sm text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {slide.title}
                </h2>
                <Button asChild variant="secondary" className="mt-1 w-fit">
                  <Link to={slide.to}>{slide.cta}</Link>
                </Button>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {/* Controls live bottom-left, inside the darkest part of the scrim.
          Centred arrows collided with the headline, and on the pale slides
          white dots on the right had almost no contrast. */}
      <div className="absolute bottom-5 left-6 flex items-center gap-3 sm:left-10">
        <div className="hidden items-center gap-1 sm:flex">
          <CarouselPrevious className="static size-8 translate-y-0 border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white" />
          <CarouselNext className="static size-8 translate-y-0 border-white/25 bg-white/10 text-white hover:bg-white/20 hover:text-white" />
        </div>

        <div className="flex gap-1.5">
          {slides.map((slide, index) => (
            <button
              key={slide.to}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === current}
              onClick={() => api?.scrollTo(index)}
              className={cn(
                "h-1.5 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none",
                index === current ? "w-5 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
              )}
            />
          ))}
        </div>
      </div>
    </Carousel>
  );
}
