import type {EntryContext} from 'react-router';
import {isbot} from 'isbot';
import {renderToPipeableStream} from 'react-dom/server';
import {ServerRouter} from 'react-router';
import {PassThrough, Readable} from 'stream';

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  entryContext: EntryContext,
) {
  return new Promise<Response>((resolve, reject) => {
    let didError = false;
    const isBotRequest = isbot(request.headers.get('user-agent') || '');

    // Create a PassThrough stream to convert Node stream to Web Stream
    const stream = new PassThrough();

    const {pipe, abort} = renderToPipeableStream(
      <ServerRouter context={entryContext} url={request.url} />,
      {
        onAllReady() {
          // For bots, wait for all content before resolving
          if (isBotRequest) {
            responseHeaders.set('Content-Type', 'text/html');
            const webStream = Readable.toWeb(stream) as ReadableStream;
            resolve(
              new Response(webStream, {
                headers: responseHeaders,
                status: didError ? 500 : responseStatusCode,
              }),
            );
          }
        },
        onShellReady() {
          // For non-bots, start streaming immediately
          if (!isBotRequest) {
            responseHeaders.set('Content-Type', 'text/html');
            const webStream = Readable.toWeb(stream) as ReadableStream;
            resolve(
              new Response(webStream, {
                headers: responseHeaders,
                status: didError ? 500 : responseStatusCode,
              }),
            );
          }
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          didError = true;
          console.error(error);
        },
      },
    );

    // Pipe the render output to our stream
    pipe(stream);

    // Handle request cancellation
    request.signal.addEventListener('abort', () => {
      abort();
    });
  });
}
