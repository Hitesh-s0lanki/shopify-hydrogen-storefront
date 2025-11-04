import {Link} from 'react-router';
import {Home} from 'lucide-react';
import {Button} from '~/components/ui/button';
import EyeTracking from './eye-tracking';

export function NotFoundPage() {
  return (
    <div className="flex flex-col justify-center items-center gap-4 h-full w-full">
      {/* Logo */}

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
      <Link to="/" prefetch="intent">
        <Button className="h-8 px-4 rounded-lg font-medium leading-tight">
          <Home className=" h-4 w-4" />
          Go to Home
        </Button>
      </Link>
    </div>
  );
}
