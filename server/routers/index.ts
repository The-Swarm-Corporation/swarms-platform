import { mergeRouters } from "@/app/api/trpc/trpc-router";
import mainRouter from "./main";
import panelRouter from "./panel";

export const appRouter = mergeRouters(mainRouter,panelRouter)
export type AppRouter = typeof appRouter;
