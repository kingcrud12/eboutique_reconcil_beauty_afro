// api/proxy.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import cookie from "cookie";

const RENDER_BASE = process.env.REACT_APP_BASE_URL;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const path = req.url?.replace("/api/proxy", "") || "";
    const url = `${RENDER_BASE}${path}`;

    console.log("➡️ Proxy request:");
    console.log("Method:", req.method);
    console.log("Original URL:", req.url);
    console.log("Forwarding to:", url);
    console.log("Request body:", req.body);

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

    console.log("⬅️ Response status:", apiRes.status);
    const setCookie = apiRes.headers.get("set-cookie");
    if (setCookie) {
      console.log("🍪 Set-Cookie from backend:", setCookie);
      const cookies = setCookie.split(", ").map((c) => cookie.parse(c));
      cookies.forEach((c) => {
        if (c.token) {
          console.log("Setting token cookie on Vercel domain:", c.token);
          res.setHeader(
            "Set-Cookie",
            cookie.serialize("token", c.token, {
              httpOnly: true,
              secure: true,
              sameSite: "none",
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
      console.log("✅ Parsed JSON response:", data);
    } catch {
      data = text;
      console.log("⚠️ Response is not JSON, returning text:", data);
    }

    res.status(apiRes.status).json(data);
  } catch (err) {
    console.error("proxy error:", err);
    res.status(500).json({ message: "Proxy error" });
  }
}
