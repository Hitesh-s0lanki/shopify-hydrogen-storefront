"use client";

import EyeTracking from "@/components/eye-tracking";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col justify-center items-center gap-4 h-screen w-screen bg-primary/10">
      <EyeTracking />

      {/* Page Not Found Text */}
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-600 mb-2">
          Page Not Found
        </h2>
        <p className="text-gray-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>

      {/* Back to Home Button */}
      <Link href={"/"} passHref prefetch>
        <Button className="h-8 px-4 rounded-lg font-medium leading-tight">
          Go to Home
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
