import { api, jsonOk } from "@/lib/api";
export const GET = api(async (ctx) => {
    return jsonOk({ user: ctx.user });
});
