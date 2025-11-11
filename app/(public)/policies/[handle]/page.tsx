import { notFound } from "next/navigation";
import Link from "next/link";
import { getPolicies } from "@/modules/policies/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, FileText } from "lucide-react";

type Props = {
  params: Promise<{
    handle: string;
  }>;
};

export async function generateMetadata({ params }: Props) {
  const { handle } = await params;
  const policies = await getPolicies();

  const policy =
    policies.privacyPolicy?.handle === handle
      ? policies.privacyPolicy
      : policies.refundPolicy?.handle === handle
        ? policies.refundPolicy
        : policies.termsOfService?.handle === handle
          ? policies.termsOfService
          : policies.shippingPolicy?.handle === handle
            ? policies.shippingPolicy
            : null;

  if (!policy) {
    return {
      title: "Policy Not Found",
    };
  }

  return {
    title: policy.title,
    description: `Read our ${policy.title.toLowerCase()}`,
  };
}

export default async function PolicyPage({ params }: Props) {
  const { handle } = await params;
  const policies = await getPolicies();

  const policy =
    policies.privacyPolicy?.handle === handle
      ? policies.privacyPolicy
      : policies.refundPolicy?.handle === handle
        ? policies.refundPolicy
        : policies.termsOfService?.handle === handle
          ? policies.termsOfService
          : policies.shippingPolicy?.handle === handle
            ? policies.shippingPolicy
            : null;

  if (!policy) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-4xl">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/policies">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Policies
          </Link>
        </Button>
      </div>

      {/* Policy Content */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <CardTitle className="text-2xl md:text-3xl">{policy.title}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: policy.body }}
          />
        </CardContent>
      </Card>
    </div>
  );
}

