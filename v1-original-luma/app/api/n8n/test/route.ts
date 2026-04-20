import { n8nRequest } from "@/lib/n8n";

export async function GET() {
  try {
    const data = await n8nRequest("/api/v1/workflows?limit=5", {
      method: "GET",
    });

    return Response.json({
      ok: true,
      data,
    });
  } catch (error: any) {
    console.error("ERRO TESTE N8N:", error);
    return Response.json(
      {
        ok: false,
        error: error?.message || "Erro ao conectar no n8n.",
      },
      { status: 500 }
    );
  }
}

