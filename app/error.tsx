"use client";

import { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const ErrorPage = ({ error, reset }: ErrorPageProps) => {
  useEffect(() => {
    // Log error to console for debugging
    console.error("Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="size-8 text-destructive" />
          </div>
          <CardTitle className="text-3xl font-bold">Coming Soon</CardTitle>
          <CardDescription className="mt-2 text-base">
            We are looking at the problem. Will be solved soon.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="error-details">
                <AccordionTrigger>View Error Details</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 rounded-md bg-muted p-4 font-mono text-sm">
                    <div>
                      <strong className="text-destructive">Error:</strong>{" "}
                      {error.message || "An unexpected error occurred"}
                    </div>
                    {error.name && (
                      <div>
                        <strong>Type:</strong> {error.name}
                      </div>
                    )}
                    {error.digest && (
                      <div>
                        <strong>Digest:</strong> {error.digest}
                      </div>
                    )}
                    {error.stack && (
                      <div className="mt-2">
                        <strong>Stack Trace:</strong>
                        <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap wrap-break-word text-xs">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
          <div className="flex justify-center gap-2 pt-2">
            <Button onClick={reset} variant="default">
              Try Again
            </Button>
            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
            >
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorPage;
