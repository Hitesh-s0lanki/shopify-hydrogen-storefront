import FeaturedCollection from "@/components/home/featured-collection";
import RecommendedProducts from "@/components/home/recommended-products";

const Page = () => {
  return (
    <div className="home min-h-full bg-background py-8 md:py-10 space-y-10">
      {/* Hero/Featured Collection Section */}
      <FeaturedCollection />

      {/* Recommended Products Section */}
      <RecommendedProducts />
    </div>
  );
};

export default Page;
