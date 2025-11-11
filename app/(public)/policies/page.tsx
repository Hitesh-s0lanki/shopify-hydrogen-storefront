import Link from "next/link";
import { getPolicies } from "@/modules/policies/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, RotateCcw, FileText, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Policies",
  description: "Store policies and legal information",
};

const policyIcons = {
  privacy: Shield,
  refund: RotateCcw,
  terms: FileText,
  shipping: Truck,
};

export default async function PoliciesPage() {
  const policies = await getPolicies();

  const policyList = [
    {
      key: "privacy",
      policy: policies.privacyPolicy,
      icon: policyIcons.privacy,
      description: "How we collect and use your personal information",
    },
    {
      key: "refund",
      policy: policies.refundPolicy,
      icon: policyIcons.refund,
      description: "Our refund and return policy",
    },
    {
      key: "terms",
      policy: policies.termsOfService,
      icon: policyIcons.terms,
      description: "Terms and conditions of use",
    },
    {
      key: "shipping",
      policy: policies.shippingPolicy,
      icon: policyIcons.shipping,
      description: "Shipping information and policies",
    },
  ].filter((item) => item.policy);

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Page Header */}
      <div className="mb-8 md:mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                Policies
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground md:text-lg">
            Important information about our store policies
          </p>
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {policyList.map(({ key, policy, icon: Icon, description }) => (
          <Card key={key} className="group transition-all hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>{policy?.title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/policies/${policy?.handle}`}>
                  Read {policy?.title}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {policyList.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/50 py-16 text-center">
          <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <p className="text-lg font-medium text-muted-foreground">
            No policies available
          </p>
        </div>
      )}
    </div>
  );
}

