// api/proxy.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import cookie from "cookie";

const RENDER_BASE =
  process.env.REACT_APP_BASE_URL ||
  "https://eboutique-reconcil-beauty-afro.onrender.com/reconcil/api/shop";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const path = req.url?.replace("/api/proxy", "") || "";
    const url = `${RENDER_BASE}${path}`;

    const body = ["POST", "PUT", "PATCH"].includes(req.method || "")
      ? JSON.stringify(req.body)
      : undefined;
    const apiRes = await fetch(url, {
      method: req.method,
      headers: {
        "Content-Type": "application/json",
        Authorization: req.headers.authorization || "",
      },
      body,
      credentials: "include",
    });
    const setCookie = apiRes.headers.get("set-cookie");
    if (setCookie) {
      const cookies = setCookie.split(", ").map((c) => cookie.parse(c));
      cookies.forEach((c) => {
        if (c.token) {
          res.setHeader(
            "Set-Cookie",
            cookie.serialize("token", c.token, {
              httpOnly: true,
              secure: true,
              sameSite: "lax",
              path: "/",
              maxAge: 24 * 60 * 60,
            })
          );
        }
      });
    }
    const text = await apiRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }

    res.status(apiRes.status).json(data);
  } catch (err) {
    console.error("proxy error:", err);
    res.status(500).json({ message: "Proxy error" });
  }
}
