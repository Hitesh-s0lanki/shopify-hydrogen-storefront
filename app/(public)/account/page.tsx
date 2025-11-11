import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, ShoppingBag, Heart, Settings, LogOut } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Account",
  description: "Manage your account settings and orders",
};

export default function AccountPage() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      {/* Page Header */}
      <div className="mb-8 md:mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                Account
              </h1>
            </div>
          </div>
          <p className="text-muted-foreground md:text-lg">
            Manage your account, orders, and preferences
          </p>
        </div>
      </div>

      {/* Account Sections */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Orders */}
        <Card className="group transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <ShoppingBag className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Orders</CardTitle>
                <CardDescription>View your order history</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Track your orders and view past purchases
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/account/orders">View Orders</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Wishlist */}
        <Card className="group transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Wishlist</CardTitle>
                <CardDescription>Your saved items</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Items you&apos;ve saved for later
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/account/wishlist">View Wishlist</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="group transition-all hover:shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Settings className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Account preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage your account settings
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/account/settings">Manage Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Sign Out Section */}
      <div className="mt-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Sign Out</h3>
                <p className="text-sm text-muted-foreground">
                  Sign out of your account
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/account/logout">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

