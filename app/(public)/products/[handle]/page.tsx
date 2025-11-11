import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductByHandle } from "@/modules/products/actions";
import { ProductImage } from "@/components/products/ProductImage";
import { ProductPrice } from "@/components/products/ProductPrice";
import { ProductForm } from "@/components/products/ProductForm";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Check,
  Shield,
  Truck,
  Star,
  Package,
  Heart,
} from "lucide-react";

type Props = {
  params: Promise<{
    handle: string;
  }>;
  searchParams: Promise<{
    [key: string]: string | string[] | undefined;
  }>;
};

export async function generateMetadata({ params }: Props) {
  const { handle } = await params;
  const product = await getProductByHandle(handle);

  if (!product) {
    return {
      title: "Product Not Found",
    };
  }

  return {
    title: product.seo?.title || product.title,
    description: product.seo?.description || product.description || undefined,
  };
}

function getProductOptions(product: {
  options: Array<{
    name: string;
    optionValues: Array<{
      name: string;
      firstSelectableVariant?: {
        availableForSale: boolean;
      } | null;
    }>;
  }>;
  selectedOrFirstAvailableVariant?: {
    selectedOptions: Array<{ name: string; value: string }>;
  } | null;
}) {
  return product.options.map((option) => ({
    name: option.name,
    optionValues: option.optionValues.map((value) => ({
      name: value.name,
      available: value.firstSelectableVariant?.availableForSale ?? true,
      selected:
        product.selectedOrFirstAvailableVariant?.selectedOptions.find(
          (so) => so.name === option.name && so.value === value.name
        ) !== undefined,
    })),
  }));
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { handle } = await params;
  const searchParamsObj = await searchParams;

  // Extract selected options from URL params
  const selectedOptions = Object.entries(searchParamsObj)
    .filter(([_, value]) => typeof value === "string")
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value: value as string,
    }));

  const product = await getProductByHandle(handle, selectedOptions);

  if (!product) {
    notFound();
  }

  const selectedVariant = product.selectedOrFirstAvailableVariant;
  const productOptions = getProductOptions(product);
  const { title, descriptionHtml, vendor } = product;

  return (
    <div className="product min-h-full bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link href="/products">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        </div>

        {/* Main Product Section */}
        <div className="grid gap-8 lg:grid-cols-2 mb-12">
          {/* Product Image */}
          <div className="sticky top-8 self-start">
            <ProductImage
              image={selectedVariant?.image || product.featuredImage}
              alt={title}
              priority
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Vendor & Rating */}
            <div className="flex items-center gap-4">
              {vendor && (
                <Badge variant="secondary" className="text-xs">
                  {vendor}
                </Badge>
              )}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="size-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">4.8</span>
                <span>(127 reviews)</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              {title}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-4">
              <ProductPrice
                price={selectedVariant?.price}
                compareAtPrice={selectedVariant?.compareAtPrice}
              />
            </div>

            {/* Quick Features */}
            <div className="grid grid-cols-2 gap-4 py-4 border-y">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="size-5 text-primary" />
                <div>
                  <p className="font-medium">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">
                    On orders over $50
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="size-5 text-primary" />
                <div>
                  <p className="font-medium">2-Year Warranty</p>
                  <p className="text-xs text-muted-foreground">
                    Full coverage included
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Package className="size-5 text-primary" />
                <div>
                  <p className="font-medium">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">
                    30-day return policy
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="size-5 text-primary" />
                <div>
                  <p className="font-medium">
                    {selectedVariant?.availableForSale ? "In Stock" : "Out of Stock"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedVariant?.availableForSale
                      ? "Ships within 24 hours"
                      : "Currently unavailable"}
                  </p>
                </div>
              </div>
            </div>

            {/* Product Options */}
            {productOptions.length > 0 && (
              <div className="space-y-4">
                <ProductForm
                  productOptions={productOptions}
                  selectedVariant={selectedVariant}
                  hideAddToCart={true}
                />
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="space-y-3 pt-4">
              <AddToCartButton
                variantId={selectedVariant?.id}
                disabled={
                  !selectedVariant || !selectedVariant.availableForSale
                }
                variant="large"
              >
                {selectedVariant?.availableForSale
                  ? "Add to Cart"
                  : "Sold Out"}
              </AddToCartButton>

              <Button
                variant="outline"
                size="lg"
                className="w-full h-12 text-base gap-2 border-2 hover:bg-accent/50 transition-all"
              >
                <Heart className="size-5 transition-transform hover:scale-110" />
                Add to Wishlist
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-6 pt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Shield className="size-4" />
                <span>Secure Checkout</span>
              </div>
              <div className="flex items-center gap-1">
                <Check className="size-4" />
                <span>Authentic Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="warranty">Warranty</TabsTrigger>
            <TabsTrigger value="specifications">Specifications</TabsTrigger>
          </TabsList>

          <TabsContent value="description" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Description</CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-sm max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html:
                      descriptionHtml ||
                      product.description ||
                      "<p>No description available.</p>",
                  }}
                />
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold text-foreground">
                    Why Choose This Product?
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="size-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        Premium quality materials that stand the test of time
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        Designed with modern aesthetics and functionality in
                        mind
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        Eco-friendly and sustainable manufacturing process
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>
                        Trusted by thousands of satisfied customers worldwide
                      </span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Key Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Star className="size-5 text-primary" />
                      Premium Quality
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Crafted with the finest materials and attention to detail.
                      Each product undergoes rigorous quality control to ensure
                      excellence.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Package className="size-5 text-primary" />
                      Smart Design
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Thoughtfully designed for both aesthetics and
                      functionality. User-friendly interface with intuitive
                      controls.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Shield className="size-5 text-primary" />
                      Durable & Reliable
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Built to last with industry-leading durability standards.
                      Weather-resistant and long-lasting performance.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Truck className="size-5 text-primary" />
                      Easy Setup
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Simple installation process with comprehensive
                      instructions. No special tools required.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="warranty" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Warranty & Support</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Shield className="size-5 text-primary" />
                    2-Year Manufacturer Warranty
                  </h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    We stand behind the quality of our products. This item comes
                    with a comprehensive 2-year warranty covering manufacturing
                    defects and normal wear and tear.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="size-4 text-primary mt-1 flex-shrink-0" />
                      <span>
                        Full coverage for defects in materials and workmanship
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-4 text-primary mt-1 flex-shrink-0" />
                      <span>
                        Free replacement or repair within warranty period
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-4 text-primary mt-1 flex-shrink-0" />
                      <span>24/7 customer support available</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-4 text-primary mt-1 flex-shrink-0" />
                      <span>Easy warranty claim process</span>
                    </li>
                  </ul>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-foreground mb-2">
                    Extended Warranty Options
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Extend your protection with our optional extended warranty
                    plans. Available for purchase at checkout or within 30 days
                    of delivery.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="specifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Technical Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        Dimensions
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>Length: 10.5 inches</li>
                        <li>Width: 8.2 inches</li>
                        <li>Height: 2.1 inches</li>
                        <li>Weight: 1.2 lbs</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        Materials
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>Premium aluminum alloy frame</li>
                        <li>High-grade polymer components</li>
                        <li>Reinforced glass surface</li>
                        <li>Eco-friendly packaging</li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        Performance
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>Operating temperature: -10°C to 50°C</li>
                        <li>Power consumption: 15W (standby: 0.5W)</li>
                        <li>Response time: &lt; 1ms</li>
                        <li>Compatibility: Universal</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        What&apos;s Included
                      </h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>Main product unit</li>
                        <li>User manual & documentation</li>
                        <li>Quick start guide</li>
                        <li>Warranty card</li>
                        <li>All necessary accessories</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

