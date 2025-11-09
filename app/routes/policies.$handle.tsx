import {useLoaderData} from 'react-router';
import type {Route} from './+types/policies.$handle';
import {FileText, Scale, Shield, Lock, ArrowLeft} from 'lucide-react';
import {Link} from 'react-router';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {Button} from '~/components/ui/button';
import {Alert, AlertDescription, AlertTitle} from '~/components/ui/alert';
import {Info} from 'lucide-react';

const POLICY_QUERY = `#graphql
  query Policy($handle: String!) {
    shopPolicies(handle: $handle) {
      id
      title
      body
      handle
      type
    }
  }
` as const;

export const meta: Route.MetaFunction = ({data}) => {
  const policyTitle = data?.policy?.title || 'Policy';
  return [{title: `${policyTitle} | Hydrogen`}];
};

export async function loader(args: Route.LoaderArgs) {
  const {handle} = args.params;
  const {storefront} = args.context;

  if (!handle) {
    throw new Response(null, {status: 404});
  }

  const {shopPolicies} = await storefront.query(POLICY_QUERY, {
    variables: {handle},
  });

  const policy = shopPolicies?.[0];

  if (!policy) {
    throw new Response(null, {status: 404});
  }

  return {policy};
}

function getPolicyIcon(type: string) {
  const iconMap: Record<string, typeof FileText> = {
    PRIVACY_POLICY: Lock,
    REFUND_POLICY: Scale,
    TERMS_OF_SERVICE: FileText,
    TERMS_OF_SALE: FileText,
    SHIPPING_POLICY: FileText,
  };
  return iconMap[type] || FileText;
}

function getPolicyDescription(type: string): string {
  const descMap: Record<string, string> = {
    PRIVACY_POLICY: 'Learn how we collect, use, and protect your personal information.',
    REFUND_POLICY: 'Our refund and return policy for purchases.',
    TERMS_OF_SERVICE: 'Review our terms and conditions for using our services.',
    TERMS_OF_SALE: 'Terms and conditions for purchasing products from our store.',
    SHIPPING_POLICY: 'Information about shipping options, rates, and delivery times.',
  };
  return (
    descMap[type] ||
    `Information about ${type.toLowerCase().replace(/_/g, ' ')}.`
  );
}

export default function Policy() {
  const {policy} = useLoaderData<typeof loader>();
  const PolicyIcon = getPolicyIcon(policy.type);

  return (
    <div className="min-h-full bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <PolicyIcon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{policy.title}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {getPolicyDescription(policy.type)}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{__html: policy.body}}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
                  to="/pages/contact"
                  className="block text-sm text-primary hover:underline"
                >
                  Contact Us
                </Link>
              </CardContent>
            </Card>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Questions?</AlertTitle>
              <AlertDescription className="text-sm">
                If you have questions about this policy, please{' '}
                <Link to="/pages/contact" className="underline text-primary">
                  contact our support team
                </Link>
                .
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    </div>
  );
}

