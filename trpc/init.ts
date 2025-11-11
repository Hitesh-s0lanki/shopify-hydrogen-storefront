import { Context } from "@/server/context";
import { initTRPC } from "@trpc/server";

const t = initTRPC.context<Context>().create();

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
