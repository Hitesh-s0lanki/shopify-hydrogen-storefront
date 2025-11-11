import { createTRPCRouter, publicProcedure } from "@/trpc/init";
import { getHeader } from "./actions";

export const rootRouter = createTRPCRouter({
  getHeader: publicProcedure.query(async () => {
    const header = await getHeader();
    return header;
  }),
});
