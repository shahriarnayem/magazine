import { api, parseJson, jsonOk, jsonError } from "@/lib/api";
import { staffSignIn } from "@/lib/auth";
export const POST = api(async (_ctx, req) => {
    const { email, password } = await parseJson(req);
    if (!email || !password)
        return jsonError("Email and password required", 400);
    const user = await staffSignIn(email, password);
    return jsonOk({ user });
});
