import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const flowStatePath = path.join(process.cwd(), "flow-state.json");

export async function GET() {
  try {
    const data = await fs.readFile(flowStatePath, "utf8");
    return NextResponse.json(JSON.parse(data));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return NextResponse.json({ nodes: [], viewport: null });
    }
    return NextResponse.json(
      { error: "Failed to read flow state" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "Not allowed in production" },
      { status: 403 }
    );
  }

  try {
    const data = await request.json();
    await fs.writeFile(flowStatePath, JSON.stringify(data, null, 2));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save flow state" },
      { status: 500 }
    );
  }
}
