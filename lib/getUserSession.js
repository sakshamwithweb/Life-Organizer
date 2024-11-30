import { parse } from "cookie";
import { decrypt } from "./encryption";

export function getUserSession(req) {
    const cookies = req.headers.get("cookie") || "";
    
    const parsedCookies = parse(cookies);

    const encryptedSession = parsedCookies.userSession;

    if (!encryptedSession) {
        return null; 
    }

    try {
        const decryptedSession = decrypt(encryptedSession);

        return JSON.parse(decryptedSession);
    } catch (error) {
        console.error("Error decoding session:", error);
        return null;
    }
}
