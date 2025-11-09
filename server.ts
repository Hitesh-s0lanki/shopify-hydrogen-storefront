// Virtual entry point for the app
import {handleHydrogenRequest} from '~/lib/handle-hydrogen-request.server';

/**
 * Export a fetch handler in module format.
 */
export default {
  async fetch(
    request: Request,
    env: Env,
    executionContext: ExecutionContext,
  ): Promise<Response> {
    return handleHydrogenRequest({
      request,
      env,
      executionContext,
      // eslint-disable-next-line import/no-unresolved
      build: await import('virtual:react-router/server-build'),
      mode: typeof process !== 'undefined' ? process.env.NODE_ENV : undefined,
    });
  },
};
