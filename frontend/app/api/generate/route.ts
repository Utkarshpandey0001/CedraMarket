import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // Random seed to ensure a new image every time you click
    const randomSeed = Math.floor(Math.random() * 1000000);
    
    // Construct the Free URL (Pollinations.ai)
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${randomSeed}&width=1024&height=1024&nologo=true`;

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate art" }, { status: 500 });
  }
}