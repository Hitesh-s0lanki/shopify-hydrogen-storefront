export async function loader() {
  // Throw a 404 response for any unmatched route
  throw new Response(null, {status: 404});
}

export default function CatchAll() {
  // This won't render since loader throws
  return null;
}

