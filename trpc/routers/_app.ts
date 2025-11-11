import { createTRPCRouter } from "../init";

import { rootRouter } from "@/modules/root/procedures";
import { homeRouter } from "@/modules/home/procedures";

export const appRouter = createTRPCRouter({
  root: rootRouter,
  home: homeRouter,
});

export type AppRouter = typeof appRouter;
