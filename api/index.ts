import {handleHydrogenRequest} from '~/lib/handle-hydrogen-request.server';

type ServerBuildModule = typeof import('virtual:react-router/server-build');

type VercelEdgeContext = {
  env?: Env;
  waitUntil?(promise: Promise<unknown>): void;
};

const serverBuildPromise = import('../dist/server/index.js') as Promise<ServerBuildModule>;

export const config = {
  runtime: 'edge',
};

export default async function handleRequest(
  request: Request,
  context: VercelEdgeContext = {},
) {
  const env =
    context.env ??
    ((typeof process !== 'undefined' ? (process.env as unknown as Env) : undefined) ??
      ({} as Env));

  const executionContext: ExecutionContext = {
    waitUntil: context.waitUntil?.bind(context) ?? (() => {}),
    passThroughOnException: () => {},
  };

  const build = await serverBuildPromise;
  const mode = env.NODE_ENV ?? (typeof process !== 'undefined' ? process.env.NODE_ENV : undefined);

  return handleHydrogenRequest({
    request,
    env,
    executionContext,
    build,
    mode,
  });
}
