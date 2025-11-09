import {redirect, useLoaderData} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen';
import {ShoppingCart, Check, Shield, Truck, Star, Package, Heart} from 'lucide-react';
import {ProductPrice} from '~/components/ProductPrice';
import {ProductImage} from '~/components/ProductImage';
import {ProductForm} from '~/components/ProductForm';
import {AddToCartButton} from '~/components/AddToCartButton';
import {Button} from '~/components/ui/button';
import {Card, CardContent, CardHeader, CardTitle} from '~/components/ui/card';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '~/components/ui/tabs';
import {Badge} from '~/components/ui/badge';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {PRODUCT_QUERY} from '~/actions/products/queries';

export const meta: Route.MetaFunction = ({data}) => {
  return [
    {title: `Hydrogen | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ];
};

export async function loader(args: Route.LoaderArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args);

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args);

  return {...deferredData, ...criticalData};
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;

  if (!handle) {
    throw new Error('Expected product handle to be defined');
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ]);

  if (!product?.id) {
    throw new Response(null, {status: 404});
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product});

  return {
    product,
  };
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: Route.LoaderArgs) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {};
}

export default function Product() {
  const {product} = useLoaderData<typeof loader>();

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  });

  const {title, descriptionHtml, vendor} = product;

  return (
    <div className="product min-h-full bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-8 max-w-7xl">
        {/* Main Product Section */}
        <div className="grid gap-8 lg:grid-cols-2 mb-12">
          {/* Product Image */}
          <div className="sticky top-8 self-start">
            <ProductImage image={selectedVariant?.image} />
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Vendor & Rating */}
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-xs">
                {vendor}
              </Badge>
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
              {selectedVariant?.compareAtPrice && (
                <Badge variant="destructive" className="text-xs">
                  Save {Math.round(
                    ((parseFloat(selectedVariant.compareAtPrice.amount) - 
                      parseFloat(selectedVariant.price.amount)) / 
                     parseFloat(selectedVariant.compareAtPrice.amount)) * 100
                  )}%
                </Badge>
              )}
            </div>

            {/* Quick Features */}
            <div className="grid grid-cols-2 gap-4 py-4 border-y">
              <div className="flex items-center gap-2 text-sm">
                <Truck className="size-5 text-primary" />
                <div>
                  <p className="font-medium">Free Shipping</p>
                  <p className="text-xs text-muted-foreground">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Shield className="size-5 text-primary" />
                <div>
                  <p className="font-medium">2-Year Warranty</p>
                  <p className="text-xs text-muted-foreground">Full coverage included</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Package className="size-5 text-primary" />
                <div>
                  <p className="font-medium">Easy Returns</p>
                  <p className="text-xs text-muted-foreground">30-day return policy</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Check className="size-5 text-primary" />
                <div>
                  <p className="font-medium">In Stock</p>
                  <p className="text-xs text-muted-foreground">Ships within 24 hours</p>
                </div>
              </div>
            </div>

            {/* Product Options */}
            <div className="space-y-4">
              <ProductForm
                productOptions={productOptions}
                selectedVariant={selectedVariant}
                hideAddToCart={true}
              />
            </div>

            {/* Add to Cart Button */}
            <div className="space-y-3 pt-4">
              <AddToCartButton
                disabled={!selectedVariant || !selectedVariant.availableForSale}
                variant="large"
                lines={
                  selectedVariant
                    ? [
                        {
                          merchandiseId: selectedVariant.id,
                          quantity: 1,
                          selectedVariant,
                        },
                      ]
                    : []
                }
              >
                {selectedVariant?.availableForSale ? 'Add to Cart' : 'Sold Out'}
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
                  dangerouslySetInnerHTML={{__html: descriptionHtml || '<p>No description available.</p>'}}
                />
                <div className="mt-6 space-y-4">
                  <h3 className="font-semibold text-foreground">Why Choose This Product?</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="size-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Premium quality materials that stand the test of time</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Designed with modern aesthetics and functionality in mind</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Eco-friendly and sustainable manufacturing process</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-5 text-primary mt-0.5 flex-shrink-0" />
                      <span>Trusted by thousands of satisfied customers worldwide</span>
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
                      Crafted with the finest materials and attention to detail. Each product undergoes rigorous quality control to ensure excellence.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Package className="size-5 text-primary" />
                      Smart Design
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Thoughtfully designed for both aesthetics and functionality. User-friendly interface with intuitive controls.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Shield className="size-5 text-primary" />
                      Durable & Reliable
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Built to last with industry-leading durability standards. Weather-resistant and long-lasting performance.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground flex items-center gap-2">
                      <Truck className="size-5 text-primary" />
                      Easy Setup
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Simple installation process with comprehensive instructions. No special tools required.
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
                    We stand behind the quality of our products. This item comes with a comprehensive 2-year warranty covering manufacturing defects and normal wear and tear.
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="size-4 text-primary mt-1 flex-shrink-0" />
                      <span>Full coverage for defects in materials and workmanship</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="size-4 text-primary mt-1 flex-shrink-0" />
                      <span>Free replacement or repair within warranty period</span>
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
                  <h4 className="font-semibold text-foreground mb-2">Extended Warranty Options</h4>
                  <p className="text-sm text-muted-foreground">
                    Extend your protection with our optional extended warranty plans. Available for purchase at checkout or within 30 days of delivery.
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
                      <h4 className="font-semibold text-foreground mb-2">Dimensions</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>Length: 10.5 inches</li>
                        <li>Width: 8.2 inches</li>
                        <li>Height: 2.1 inches</li>
                        <li>Weight: 1.2 lbs</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Materials</h4>
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
                      <h4 className="font-semibold text-foreground mb-2">Performance</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>Operating temperature: -10°C to 50°C</li>
                        <li>Power consumption: 15W (standby: 0.5W)</li>
                        <li>Response time: &lt; 1ms</li>
                        <li>Compatibility: Universal</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">What's Included</h4>
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
      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  );
}

