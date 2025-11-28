import { NextResponse } from "next/server";

let latestData: any = null; // Penyimpanan sementara

export async function POST(req: Request) {
  const body = await req.json();
  latestData = body;

  console.log("Data IoT diterima:", body);

  return NextResponse.json({ status: "ok", received: body });
}

export async function GET() {
  return NextResponse.json(latestData || { error: "Belum ada data masuk" });
}
