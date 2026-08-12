import { ArrowRightIcon } from "lucide-react";
import { Link } from "react-router-dom";

import { AspectRatio } from "@/components/ui/aspect-ratio";

const tiles = [
  {
    image: "/banners/kitchen.jpg",
    alt: "Two people cooking at a kitchen range",
    title: "Kitchen accessories",
    description: "Cookware, tools and storage",
    to: "/products?category=kitchen-accessories",
  },
  {
    image: "/banners/mens.jpg",
    alt: "Person wearing a leather jacket over a shirt",
    title: "Men's shirts",
    description: "Everyday shirts and tops",
    to: "/products?category=mens-shirts",
  },
];

export function PromoTiles() {
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {tiles.map((tile) => (
        <Link
          key={tile.to}
          to={tile.to}
          className="group relative block overflow-hidden rounded-lg border focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          <AspectRatio ratio={16 / 7}>
            <img
              src={tile.image}
              alt={tile.alt}
              loading="lazy"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-t from-black/75 to-black/10"
            />
            <div className="absolute inset-x-0 bottom-0 p-5">
              <h3 className="flex items-center gap-1.5 text-base font-medium text-white">
                {tile.title}
                <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
              </h3>
              <p className="mt-0.5 text-sm text-white/75">{tile.description}</p>
            </div>
          </AspectRatio>
        </Link>
      ))}
    </div>
  );
}
