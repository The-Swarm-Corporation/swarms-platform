import { mergeRouters } from "@/app/api/trpc/trpc-router";
import mainRouter from "./main";
import panelRouter from "./panel";
import paymentRouter from "./payment";

export const appRouter = mergeRouters(mainRouter,panelRouter,paymentRouter)
export type AppRouter = typeof appRouter;
