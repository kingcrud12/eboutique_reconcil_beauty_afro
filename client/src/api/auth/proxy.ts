// api/proxy.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";

const RENDER_BASE = process.env.REACT_APP_BASE_URL;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const url = `${RENDER_BASE}${req.url?.replace("/api/proxy", "") || ""}`;

    const apiRes = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.authorization || "",
      },
      body: ["POST", "PUT", "PATCH"].includes(req.method || "")
        ? JSON.stringify(req.body)
        : undefined,
    });

    const data = await apiRes.json(); // ✅ parse JSON ici
    res.status(apiRes.status).json(data); // ✅ renvoie objet JSO
  } catch (err) {
    console.error("proxy error:", err);
    res.status(500).json({ message: "Proxy error" });
  }
}
