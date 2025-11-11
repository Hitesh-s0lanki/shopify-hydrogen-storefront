"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";

export default function FeaturedCollection() {
  const trpc = useTRPC();
  const { data: collection } = useQuery(
    trpc.home.getFeaturedCollection.queryOptions()
  );

  if (!collection) return null;

  return (
    <section className="relative w-full overflow-hidden from-primary/5 via-background to-primary/10 ">
      <div className="container mx-auto px-8">
        <div className="relative">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              <CarouselItem className="basis-full">
                <Link
                  href={`/collections/${collection?.handle}`}
                  className="group relative block overflow-hidden rounded-lg shadow-lg transition-all duration-300 hover:shadow-xl"
                >
                  <div className="relative aspect-3/1 w-full overflow-hidden">
                    {collection?.image?.url ? (
                      <Image
                        src={collection?.image?.url || ""}
                        alt={collection?.image?.altText || ""}
                        width={collection?.image?.width || 0}
                        height={collection?.image?.height || 0}
                        sizes="100vw"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <Button
                      variant="secondary"
                      className="group/btn mt-4"
                      onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.preventDefault();
                        window.location.href = `/collections/${collection?.handle}`;
                      }}
                    >
                      Shop Now
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                  </div>
                </Link>
              </CarouselItem>
            </CarouselContent>{" "}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
