import { NextResponse } from "next/server";

function scriptUrl() {
  const url = process.env.GOOGLE_APPS_SCRIPT_URL;
  if (!url) throw new Error("GOOGLE_APPS_SCRIPT_URL não configurada");
  return url;
}

export async function GET() {
  try {
    const response = await fetch(`${scriptUrl()}?action=tournament`, { cache: "no-store" });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "Falha ao carregar");
    return NextResponse.json({ ok: true, data: result.data });
  } catch {
    return NextResponse.json({ error: "Chaveamento compartilhado indisponível." }, { status: 503 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    if (!payload.data) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
    const response = await fetch(scriptUrl(), {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action: "saveTournament", data: payload.data }),
      cache: "no-store",
    });
    const result = await response.json();
    if (!response.ok || !result.ok) throw new Error(result.error || "Falha ao salvar");
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Não foi possível sincronizar o chaveamento." }, { status: 502 });
  }
}
