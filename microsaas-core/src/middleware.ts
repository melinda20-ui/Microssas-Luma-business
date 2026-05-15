import { clerkMiddleware } from "@clerk/nextjs/server";

const ALLOWED_EMAIL = "lumabusinessa1.0@gmail.com";
const AUTH_REDIRECT = "/sign-in";

export default clerkMiddleware(async (auth, req) => {
  const host = req.headers.get("host") || "";
  const isStudio = host.startsWith("studio.");

  if (isStudio) {
    const { userId, sessionClaims } = auth();

    if (!userId) {
      return new Response(null, {
        status: 302,
        headers: { Location: AUTH_REDIRECT },
      });
    }

    const email = sessionClaims?.email as string | undefined;
    if (email !== ALLOWED_EMAIL) {
      return new Response(
        "<!DOCTYPE html><html lang='pt-BR'><head><meta charset='utf-8'><title>Acesso Restrito</title><style>body{background:#050507;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:system-ui,sans-serif;text-align:center;padding:1rem} h1{font-size:2rem;margin-bottom:.5rem;background:linear-gradient(135deg,#7A00FF,#00F0FF);-webkit-background-clip:text;-webkit-text-fill-color:transparent} p{color:#999;max-width:400px;line-height:1.6} .lock{font-size:3rem;margin-bottom:1rem}</style></head><body><div><div class='lock'>🔒</div><h1>Acesso Restrito</h1><p>Este ambiente &eacute; exclusivo para administradores autorizados. Se voc&ecirc; precisa de acesso, entre em contato com o suporte.</p></div></body></html>",
        { status: 403, headers: { "Content-Type": "text/html" } }
      );
    }
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
