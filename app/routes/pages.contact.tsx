import {Form, useActionData, useNavigation} from 'react-router';
import type {Route} from './+types/pages.contact';
import {Button} from '~/components/ui/button';
import {Input} from '~/components/ui/input';
import {Textarea} from '~/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import {Mail, Phone, MapPin, Clock, Send} from 'lucide-react';

export const meta: Route.MetaFunction = () => {
  return [{title: 'Contact Us | Hydrogen'}];
};

export async function loader(args: Route.LoaderArgs) {
  return {};
}

export async function action(args: Route.ActionArgs) {
  const formData = await args.request.formData();
  const name = formData.get('name');
  const email = formData.get('email');
  const subject = formData.get('subject');
  const message = formData.get('message');

  // Simulate form submission
  // In a real app, you would send this to your backend/email service
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    message: 'Thank you for your message! We will get back to you soon.',
  };
}

export default function Contact() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting';

  const contactInfo = {
    email: 'contact@hydrogen-store.com',
    phone: '+1 (555) 123-4567',
    address: '123 Commerce Street, Suite 100, San Francisco, CA 94102',
    hours: 'Monday - Friday: 9:00 AM - 6:00 PM PST',
  };

  return (
    <div className="min-h-full bg-background py-8 md:py-12">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send us a Message</CardTitle>
              <CardDescription>
                Fill out the form below and we&apos;ll get back to you within 24
                hours.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {actionData?.success ? (
                <div className="rounded-lg border border-green-500/20 bg-green-50 p-4 text-green-800 dark:bg-green-950 dark:text-green-200">
                  <p className="font-medium">{actionData.message}</p>
                </div>
              ) : (
                <Form method="post" className="space-y-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-foreground"
                    >
                      Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-foreground"
                    >
                      Email
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="subject"
                      className="text-sm font-medium text-foreground"
                    >
                      Subject
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      type="text"
                      placeholder="How can we help?"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="text-sm font-medium text-foreground"
                    >
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      'Sending...'
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>
                </Form>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>
                  Reach out to us through any of these channels.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Email</h3>
                    <a
                      href={`mailto:${contactInfo.email}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Phone</h3>
                    <a
                      href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Address</h3>
                    <p className="text-muted-foreground">
                      {contactInfo.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Business Hours
                    </h3>
                    <p className="text-muted-foreground">{contactInfo.hours}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Why Contact Us?</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>Product inquiries and custom orders</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>Customer support and assistance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>Partnership and collaboration opportunities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>Feedback and suggestions</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
