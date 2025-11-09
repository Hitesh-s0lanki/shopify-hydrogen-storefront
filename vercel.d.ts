declare module '../dist/server/index.js' {
  const build: typeof import('virtual:react-router/server-build');
  export default build;
}
