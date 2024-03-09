import {
    FetchCreateContextFnOptions,
} from "@trpc/server/adapters/fetch";
const createContext = async function (
    opts: FetchCreateContextFnOptions
): Promise<{
    req: FetchCreateContextFnOptions["req"],
}> {
    // midleware for requests , to add user to context
    try {
    
    } catch (e) {
    }
    // todo: find better approach
    return {
        req: opts.req,
    } as {
        req: FetchCreateContextFnOptions["req"],
    }

}
export default createContext;
export type Context = Awaited<ReturnType<typeof createContext>>;