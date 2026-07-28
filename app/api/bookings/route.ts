import { NextResponse } from "next/server";

const requiredFields = [
  "name",
  "phone",
  "age",
  "practiced",
  "date",
  "time",
] as const;

export async function POST(request: Request) {
  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;

  if (!scriptUrl) {
    return NextResponse.json(
      { error: "A agenda ainda não foi conectada. Tente novamente em breve." },
      { status: 503 },
    );
  }

  const booking = await request.json();
  const missingField = requiredFields.find((field) => !booking[field]);

  if (missingField) {
    return NextResponse.json(
      { error: "Preencha todos os dados para agendar." },
      { status: 400 },
    );
  }

  const response = await fetch(scriptUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(booking),
    cache: "no-store",
  });

  const result = await response.json();

  if (!response.ok || !result.ok) {
    return NextResponse.json(
      { error: result.error || "Não foi possível salvar o agendamento." },
      { status: result.error === "HORARIO_ESGOTADO" ? 409 : 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
