import {storefrontRedirect} from '@shopify/hydrogen';
import {createRequestHandler} from '@shopify/hydrogen/oxygen';
import {createHydrogenRouterContext} from '~/lib/context';

type ServerBuildModule = typeof import('virtual:react-router/server-build');

type HandleRequestOptions = {
  request: Request;
  env: Env;
  executionContext: ExecutionContext;
  build: ServerBuildModule;
  mode?: string;
};

export async function handleHydrogenRequest({
  request,
  env,
  executionContext,
  build,
  mode,
}: HandleRequestOptions) {
  try {
    const hydrogenContext = await createHydrogenRouterContext(
      request,
      env,
      executionContext,
    );

    const handleRequest = createRequestHandler({
      build,
      mode,
      getLoadContext: () => hydrogenContext,
    });

    const response = await handleRequest(request);

    if (hydrogenContext.session.isPending) {
      response.headers.set(
        'Set-Cookie',
        await hydrogenContext.session.commit(),
      );
    }

    if (response.status === 404) {
      return storefrontRedirect({
        request,
        response,
        storefront: hydrogenContext.storefront,
      });
    }

    return response;
  } catch (error) {
    console.error(error);
    return new Response('An unexpected error occurred', {status: 500});
  }
}
