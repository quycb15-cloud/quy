import { httpBatchLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import superjson from "superjson";
import type { AppRouter } from "../../server/routers";
import { API_BASE_URL } from "./config";
import { getSessionToken } from "./auth";

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      transformer: superjson,
      url: `${API_BASE_URL}/api/trpc`,
      async headers() {
        const token = await getSessionToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});
