import {Link} from 'react-router';
import {Home, Clock, Sparkles, AlertCircle} from 'lucide-react';
import {Button} from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '~/components/ui/accordion';

interface ErrorPageProps {
  status?: number;
  message?: string;
  error?: Error | unknown;
}

export function ErrorPage({status = 500, message, error}: ErrorPageProps) {
  const errorMessage =
    message ||
    (error instanceof Error ? error.message : 'An unexpected error occurred');

  const statusText =
    status === 404
      ? 'Page Not Found'
      : status === 500
        ? 'Server Error'
        : status >= 400 && status < 500
          ? 'Client Error'
          : 'Error';

  return (
    <div className=" flex items-center justify-center px-4 py-16 from-background via-background to-muted/20">
      <div className="container mx-auto">
        <CardHeader className="text-center space-y-6 pb-8 pt-12">
          {/* Animated Icon Container */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative flex size-24 items-center justify-center rounded-full from-primary/20 to-primary/5 border-2 border-primary/30">
                <Clock className="size-12 text-primary animate-pulse" />
                <Sparkles className="absolute -top-1 -right-1 size-6 text-primary fill-primary animate-bounce" />
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <CardTitle className="text-3xl md:text-4xl font-bold text-black from-foreground to-foreground/70 bg-clip-text">
              Coming Soon
            </CardTitle>
            <CardDescription className="text-md md:text-lg text-muted-foreground">
              This feature is currently under development and will be available
              soon. <br /> We&apos;re working hard to bring you something
              amazing!
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pb-12">
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="default" size="sm" className="shadow-md">
              <Link to="/">
                <Home className="size-4 mr-2" />
                Return Home
              </Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="shadow-sm"
            >
              <Clock className="size-4 mr-2" />
              Check Again
            </Button>
          </div>

          {/* Error Details Accordion */}
          {(errorMessage || status) && (
            <div className="pt-4 border-t px-20">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="error-details" className="border-none">
                  <AccordionTrigger className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="size-4" />
                      <span>View Technical Details</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div className="space-y-3 rounded-lg bg-muted/50 p-4 border border-border/50">
                      {status && (
                        <div className="flex items-start gap-3">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide min-w-[80px]">
                            Status:
                          </span>
                          <div className="flex-1">
                            <div className="font-mono text-sm font-semibold">
                              {status}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {statusText}
                            </div>
                          </div>
                        </div>
                      )}
                      {errorMessage && (
                        <div className="flex items-start gap-3 pt-2 border-t border-border/50">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide min-w-[80px]">
                            Message:
                          </span>
                          <div className="flex-1">
                            <div className="text-sm font-mono break-words">
                              {errorMessage}
                            </div>
                          </div>
                        </div>
                      )}
                      {error instanceof Error && error.stack && (
                        <div className="flex items-start gap-3 pt-2 border-t border-border/50">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide min-w-[80px]">
                            Stack:
                          </span>
                          <div className="flex-1">
                            <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap wrap-break-word overflow-auto max-h-48 bg-background/50 p-2 rounded border">
                              {error.stack}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          )}

          {/* Additional Info */}
          <div className="text-center space-y-2 pt-4">
            <p className="text-sm text-muted-foreground">
              We appreciate your patience as we build something special for you.
            </p>
            <p className="text-xs text-muted-foreground/80">
              If you have any questions, please feel free to contact our support
              team.
            </p>
          </div>
        </CardContent>
      </div>
    </div>
  );
}
