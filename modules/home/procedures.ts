import { createTRPCRouter, publicProcedure } from "@/trpc/init";
import { getFeaturedCollection, getRecommendedProducts } from "./actions";
import { RecommendedProduct } from "./types";

export const homeRouter = createTRPCRouter({
  getFeaturedCollection: publicProcedure.query(async () => {
    const featuredCollection = await getFeaturedCollection();
    return featuredCollection;
  }),
  getRecommendedProducts: publicProcedure.query(
    async (): Promise<RecommendedProduct[]> => {
      const recommendedProducts = await getRecommendedProducts();
      return recommendedProducts;
    }
  ),
});
