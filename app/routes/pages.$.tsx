import {
  Form,
  useActionData,
  useNavigation,
  useParams,
  Link,
} from 'react-router';
import type {Route} from './+types/pages.$';
import type React from 'react';
import {Button} from '~/components/ui/button';
import {Input} from '~/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Info,
  Mail,
  FileText,
  BarChart3,
  BookOpen,
  Scale,
  HelpCircle,
  ArrowLeft,
} from 'lucide-react';
import {Alert, AlertDescription, AlertTitle} from '~/components/ui/alert';

export const meta: Route.MetaFunction = ({params}) => {
  const pageTitle = getPageTitle(params.page || '');
  return [{title: `${pageTitle} | Hydrogen`}];
};

function getPageTitle(page: string): string {
  const titleMap: Record<string, string> = {
    'data-sharing-opt-out': 'Data Sharing Opt Out',
    'privacy-policy': 'Privacy Policy',
    'terms-of-service': 'Terms of Service',
    about: 'About Us',
    faq: 'Frequently Asked Questions',
    shipping: 'Shipping Information',
    returns: 'Returns & Exchanges',
  };
  return titleMap[page] || formatPageTitle(page);
}

function formatPageTitle(page: string): string {
  return page
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getPageIcon(page: string) {
  const iconMap: Record<string, typeof Shield> = {
    'data-sharing-opt-out': Shield,
    'privacy-policy': Lock,
    'terms-of-service': Scale,
    about: Info,
    faq: HelpCircle,
    shipping: FileText,
    returns: FileText,
  };
  return iconMap[page] || BookOpen;
}

function getPageDescription(page: string): string {
  const descMap: Record<string, string> = {
    'data-sharing-opt-out':
      'Control how your personal data is shared with third parties. You have the right to opt out of data sharing at any time.',
    'privacy-policy':
      'Learn how we collect, use, and protect your personal information.',
    'terms-of-service':
      'Review our terms and conditions for using our services.',
    about: 'Learn more about our company, mission, and values.',
    faq: 'Find answers to commonly asked questions.',
    shipping: 'Information about shipping options, rates, and delivery times.',
    returns: 'Our return and exchange policy and how to process returns.',
  };
  return (
    descMap[page] || `Information about ${formatPageTitle(page).toLowerCase()}.`
  );
}

export async function loader(args: Route.LoaderArgs) {
  const page = args.params.page || '';

  // You could fetch page content from Shopify here
  // const {storefront} = args.context;
  // const pageData = await storefront.query(PAGE_QUERY, {variables: {handle: page}});

  return {page};
}

export async function action(args: Route.ActionArgs) {
  const formData = await args.request.formData();
  const email = formData.get('email') as string;
  const optOutType = formData.get('optOutType') as string;
  const confirmation = formData.get('confirmation') === 'true';

  // Validate email
  if (!email || !email.includes('@')) {
    return {
      success: false,
      error: 'Please enter a valid email address.',
    };
  }

  // Validate opt-out type
  if (!optOutType) {
    return {
      success: false,
      error: 'Please select an opt-out option.',
    };
  }

  // Validate confirmation
  if (!confirmation) {
    return {
      success: false,
      error: 'Please confirm that you understand the implications.',
    };
  }

  // Simulate API call to process opt-out
  // In a real app, you would send this to your backend/Shopify API
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    success: true,
    message:
      'Your data sharing opt-out request has been submitted successfully. You will receive a confirmation email shortly.',
  };
}

export default function DynamicPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const params = useParams();
  const isSubmitting = navigation.state === 'submitting';

  const page = params.page || '';
  const PageIcon = getPageIcon(page);
  const pageTitle = getPageTitle(page);
  const pageDescription = getPageDescription(page);
  const isDataSharingPage = page === 'data-sharing-opt-out';

  // Render data sharing opt-out page with form
  if (isDataSharingPage) {
    return (
      <DataSharingOptOutPage
        actionData={actionData}
        isSubmitting={isSubmitting}
      />
    );
  }

  // Render generic page template
  return (
    <GenericPageTemplate
      page={page}
      pageTitle={pageTitle}
      pageDescription={pageDescription}
      PageIcon={PageIcon}
    />
  );
}

function DataSharingOptOutPage({
  actionData,
  isSubmitting,
}: {
  actionData: ReturnType<typeof action> | undefined;
  isSubmitting: boolean;
}) {
  return (
    <div className="min-h-full bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Data Sharing Opt Out
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Control how your personal data is shared with third parties. You
            have the right to opt out of data sharing at any time.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {actionData?.success ? (
              <Alert className="border-green-500/20 bg-green-50 dark:bg-green-950">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertTitle className="text-green-800 dark:text-green-200">
                  Request Submitted Successfully
                </AlertTitle>
                <AlertDescription className="text-green-700 dark:text-green-300">
                  {actionData.message}
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {actionData?.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{actionData.error}</AlertDescription>
                  </Alert>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle>Opt Out Request Form</CardTitle>
                    <CardDescription>
                      Please fill out the form below to opt out of data sharing.
                      We&apos;ll process your request within 30 days.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form method="post" className="space-y-6">
                      <div className="space-y-2">
                        <label
                          htmlFor="email"
                          className="text-sm font-medium text-foreground flex items-center gap-2"
                        >
                          <Mail className="w-4 h-4" />
                          Email Address
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="your.email@example.com"
                          required
                          className="w-full"
                        />
                        <p className="text-xs text-muted-foreground">
                          We&apos;ll send a confirmation to this email address.
                        </p>
                      </div>

                      <div className="space-y-3">
                        <label className="text-sm font-medium text-foreground">
                          Opt Out Options
                        </label>
                        <div className="space-y-3">
                          <label className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name="optOutType"
                              value="all"
                              className="mt-1"
                              required
                            />
                            <div className="flex-1">
                              <div className="font-medium flex items-center gap-2">
                                <EyeOff className="w-4 h-4 text-primary" />
                                Opt Out of All Data Sharing
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Stop sharing your data with all third-party
                                partners and analytics providers.
                              </p>
                            </div>
                          </label>

                          <label className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name="optOutType"
                              value="analytics"
                              className="mt-1"
                              required
                            />
                            <div className="flex-1">
                              <div className="font-medium flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-primary" />
                                Opt Out of Analytics Only
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Stop sharing data with analytics providers but
                                allow sharing with essential service partners.
                              </p>
                            </div>
                          </label>

                          <label className="flex items-start gap-3 p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name="optOutType"
                              value="marketing"
                              className="mt-1"
                              required
                            />
                            <div className="flex-1">
                              <div className="font-medium flex items-center gap-2">
                                <Mail className="w-4 h-4 text-primary" />
                                Opt Out of Marketing Data Sharing
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                Stop sharing data with marketing and advertising
                                partners only.
                              </p>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="flex items-start gap-3 p-4 rounded-lg border bg-card cursor-pointer">
                          <input
                            type="checkbox"
                            name="confirmation"
                            value="true"
                            className="mt-1"
                            required
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-foreground">
                              I understand and confirm
                            </span>
                            <p className="text-xs text-muted-foreground mt-1">
                              I understand that opting out may affect my
                              experience, including personalized content and
                              recommendations. I confirm that I want to proceed
                              with this request.
                            </p>
                          </div>
                        </label>
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full"
                        size="lg"
                      >
                        {isSubmitting ? (
                          'Processing...'
                        ) : (
                          <>
                            <Shield className="mr-2 h-4 w-4" />
                            Submit Opt Out Request
                          </>
                        )}
                      </Button>
                    </Form>
                  </CardContent>
                </Card>
              </>
            )}

            {/* Information Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  What Happens Next?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-semibold text-primary">
                        1
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Confirmation Email</h4>
                      <p className="text-sm text-muted-foreground">
                        You&apos;ll receive a confirmation email within 24 hours
                        acknowledging your request.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-semibold text-primary">
                        2
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Processing</h4>
                      <p className="text-sm text-muted-foreground">
                        We&apos;ll process your request within 30 days as
                        required by data protection regulations.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <span className="text-sm font-semibold text-primary">
                        3
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Completion</h4>
                      <p className="text-sm text-muted-foreground">
                        Once processed, you&apos;ll receive a final confirmation
                        email. Your preferences will be updated immediately.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Your Privacy Rights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Right to access your personal data
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Right to rectification of inaccurate data
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Right to erasure (&quot;right to be forgotten&quot;)
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Right to restrict processing
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Right to data portability
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">
                      Right to object to processing
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Related Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <a
                  href="/pages/privacy-policy"
                  className="block text-sm text-primary hover:underline"
                >
                  Privacy Policy
                </a>
                <a
                  href="/pages/terms-of-service"
                  className="block text-sm text-primary hover:underline"
                >
                  Terms of Service
                </a>
                <a
                  href="/pages/contact"
                  className="block text-sm text-primary hover:underline"
                >
                  Contact Us
                </a>
              </CardContent>
            </Card>

            <Alert>
              <Eye className="h-4 w-4" />
              <AlertTitle>Need Help?</AlertTitle>
              <AlertDescription className="text-sm">
                If you have questions about data sharing or need assistance with
                your opt-out request, please{' '}
                <a href="/pages/contact" className="underline text-primary">
                  contact our support team
                </a>
                .
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
}

function GenericPageTemplate({
  page,
  pageTitle,
  pageDescription,
  PageIcon,
}: {
  page: string;
  pageTitle: string;
  pageDescription: string;
  PageIcon: typeof Shield;
}) {
  const pageContent = getPageContent(page);

  return (
    <div className="min-h-full bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-8 ">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <PageIcon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{pageTitle}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {pageDescription}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="col-span-3 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{__html: pageContent}}
                />
              </CardContent>
            </Card>

            {/* Additional Information Cards */}
            {getAdditionalCards(page)}
          </div>

          {/* Sidebar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Quick Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                to="/pages/privacy-policy"
                className="block text-sm text-primary hover:underline"
              >
                Privacy Policy
              </Link>
              <Link
                to="/pages/terms-of-service"
                className="block text-sm text-primary hover:underline"
              >
                Terms of Service
              </Link>
              <Link
                to="/pages/data-sharing-opt-out"
                className="block text-sm text-primary hover:underline"
              >
                Data Sharing Opt Out
              </Link>
              <Link
                to="/pages/contact"
                className="block text-sm text-primary hover:underline"
              >
                Contact Us
              </Link>
            </CardContent>
          </Card>

          <Alert>
            <HelpCircle className="h-4 w-4" />
            <AlertTitle>Need Help?</AlertTitle>
            <AlertDescription className="text-sm">
              If you have questions, please{' '}
              <Link to="/pages/contact" className="underline text-primary">
                contact our support team
              </Link>
              .
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}

function getPageContent(page: string): string {
  const contentMap: Record<string, string> = {
    'privacy-policy': `
      <h2>Privacy Policy</h2>
      <p>Last updated: ${new Date().toLocaleDateString()}</p>
      
      <h3>Information We Collect</h3>
      <p>We collect information that you provide directly to us, including:</p>
      <ul>
        <li>Name and contact information</li>
        <li>Payment and billing information</li>
        <li>Shipping and delivery addresses</li>
        <li>Product preferences and purchase history</li>
      </ul>
      
      <h3>How We Use Your Information</h3>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Process and fulfill your orders</li>
        <li>Communicate with you about your orders and account</li>
        <li>Send you marketing communications (with your consent)</li>
        <li>Improve our services and customer experience</li>
        <li>Comply with legal obligations</li>
      </ul>
      
      <h3>Data Sharing</h3>
      <p>We may share your information with:</p>
      <ul>
        <li>Service providers who assist us in operating our business</li>
        <li>Payment processors to handle transactions</li>
        <li>Shipping carriers to deliver your orders</li>
        <li>Legal authorities when required by law</li>
      </ul>
      
      <h3>Your Rights</h3>
      <p>You have the right to:</p>
      <ul>
        <li>Access your personal data</li>
        <li>Correct inaccurate data</li>
        <li>Request deletion of your data</li>
        <li>Opt out of data sharing</li>
        <li>Data portability</li>
      </ul>
      
      <h3>Contact Us</h3>
      <p>If you have questions about this privacy policy, please contact us at <a href="/pages/contact">our contact page</a>.</p>
    `,
    'terms-of-service': `
      <h2>Terms of Service</h2>
      <p>Last updated: ${new Date().toLocaleDateString()}</p>
      
      <h3>Agreement to Terms</h3>
      <p>By accessing or using our website, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
      
      <h3>Use License</h3>
      <p>Permission is granted to temporarily download one copy of the materials on our website for personal, non-commercial transitory viewing only.</p>
      
      <h3>User Accounts</h3>
      <p>When you create an account, you are responsible for maintaining the security of your account and password.</p>
      
      <h3>Product Information</h3>
      <p>We strive to provide accurate product information, but we do not warrant that product descriptions or other content is accurate, complete, or error-free.</p>
      
      <h3>Pricing</h3>
      <p>All prices are subject to change without notice. We reserve the right to modify prices at any time.</p>
      
      <h3>Limitation of Liability</h3>
      <p>In no event shall our company be liable for any damages arising out of the use or inability to use our services.</p>
    `,
    about: `
      <h2>About Us</h2>
      <p>Welcome to our store! We are committed to providing you with the best shopping experience.</p>
      
      <h3>Our Mission</h3>
      <p>Our mission is to deliver high-quality products and exceptional customer service to our valued customers.</p>
      
      <h3>Our Values</h3>
      <ul>
        <li><strong>Quality:</strong> We source only the finest products</li>
        <li><strong>Customer Service:</strong> Your satisfaction is our priority</li>
        <li><strong>Innovation:</strong> We continuously improve our offerings</li>
        <li><strong>Integrity:</strong> We conduct business with honesty and transparency</li>
      </ul>
      
      <h3>Our Story</h3>
      <p>Founded with a passion for excellence, we have grown from a small startup to a trusted name in e-commerce.</p>
    `,
    faq: `
      <h2>Frequently Asked Questions</h2>
      
      <h3>Shipping & Delivery</h3>
      <p><strong>Q: How long does shipping take?</strong></p>
      <p>A: Standard shipping typically takes 5-7 business days. Express shipping options are available at checkout.</p>
      
      <p><strong>Q: Do you ship internationally?</strong></p>
      <p>A: Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location.</p>
      
      <h3>Returns & Exchanges</h3>
      <p><strong>Q: What is your return policy?</strong></p>
      <p>A: We offer a 30-day return policy on most items. Items must be in original condition with tags attached.</p>
      
      <p><strong>Q: How do I return an item?</strong></p>
      <p>A: You can initiate a return through your account dashboard or by contacting customer service.</p>
      
      <h3>Payment</h3>
      <p><strong>Q: What payment methods do you accept?</strong></p>
      <p>A: We accept all major credit cards, PayPal, and other secure payment methods.</p>
      
      <h3>Account</h3>
      <p><strong>Q: How do I create an account?</strong></p>
      <p>A: Click the "Sign In" button and select "Create Account" to get started.</p>
    `,
    shipping: `
      <h2>Shipping Information</h2>
      
      <h3>Shipping Options</h3>
      <ul>
        <li><strong>Standard Shipping:</strong> 5-7 business days - Free on orders over $50</li>
        <li><strong>Express Shipping:</strong> 2-3 business days - $15</li>
        <li><strong>Overnight Shipping:</strong> Next business day - $25</li>
      </ul>
      
      <h3>International Shipping</h3>
      <p>We ship to most countries worldwide. International shipping costs and delivery times vary by destination.</p>
      
      <h3>Order Tracking</h3>
      <p>Once your order ships, you'll receive a tracking number via email to monitor your package.</p>
      
      <h3>Shipping Restrictions</h3>
      <p>Some items may have shipping restrictions based on your location. Please check product pages for details.</p>
    `,
    returns: `
      <h2>Returns & Exchanges</h2>
      
      <h3>Return Policy</h3>
      <p>We offer a 30-day return policy on most items. Items must be:</p>
      <ul>
        <li>In original condition</li>
        <li>Unused and unworn</li>
        <li>With original tags attached</li>
        <li>In original packaging when possible</li>
      </ul>
      
      <h3>How to Return</h3>
      <ol>
        <li>Log into your account</li>
        <li>Go to "Orders" and select the item to return</li>
        <li>Print the return label</li>
        <li>Package the item securely</li>
        <li>Drop off at a shipping location</li>
      </ol>
      
      <h3>Refunds</h3>
      <p>Refunds will be processed to your original payment method within 5-10 business days of receiving your return.</p>
      
      <h3>Exchanges</h3>
      <p>We offer exchanges for different sizes or colors. Please contact customer service to initiate an exchange.</p>
    `,
  };

  return (
    contentMap[page] ||
    `
    <h2>${formatPageTitle(page)}</h2>
    <p>This page is currently under construction. Please check back soon for more information.</p>
    <p>If you need immediate assistance, please <a href="/pages/contact">contact us</a>.</p>
  `
  );
}

function getAdditionalCards(page: string): React.ReactNode {
  if (page === 'privacy-policy') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Your Privacy Rights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-muted-foreground">
                Right to access your personal data
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-muted-foreground">
                Right to rectification of inaccurate data
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-muted-foreground">
                Right to erasure ("right to be forgotten")
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-muted-foreground">
                Right to restrict processing
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-muted-foreground">
                Right to data portability
              </span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <span className="text-muted-foreground">
                Right to object to processing
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  return null;
}
