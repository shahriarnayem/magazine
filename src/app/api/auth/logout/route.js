import { api, jsonOk } from "@/lib/api";
import { destroySession } from "@/lib/auth";
export const POST = api(async () => {
    await destroySession();
    return jsonOk({ ok: true });
});
