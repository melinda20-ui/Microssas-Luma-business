import { mkdir, writeFile } from "fs/promises";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return Response.json(
        { ok: false, error: "Nenhum arquivo enviado." },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "uploads");
    await mkdir(uploadDir, { recursive: true });

    const savedFiles = [];

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const fileName = `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;
      const filePath = path.join(uploadDir, fileName);

      await writeFile(filePath, buffer);

      savedFiles.push({
        name: file.name,
        path: filePath,
        size: file.size,
        type: file.type,
      });
    }

    return Response.json({
      ok: true,
      files: savedFiles,
    });
  } catch (error: any) {
    console.error("ERRO UPLOAD:", error);
    return Response.json(
      { ok: false, error: error?.message || "Erro no upload." },
      { status: 500 }
    );
  }
}
