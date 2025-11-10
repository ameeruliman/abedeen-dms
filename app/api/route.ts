import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const title = formData.get("title") as string;
  const department = formData.get("department") as string;

  if (!file || !title || !department) {
    return NextResponse.json({ message: "Missing data" }, { status: 400 });
  }

  // Save file locally (for now)
  const filePath = path.join(process.cwd(), "public/uploads", file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  // Save record to DB (contoh)
  // await db.query("INSERT INTO forms (department, title, file_name) VALUES (?, ?, ?)", [department, title, file.name]);

  return NextResponse.json({ message: "Form uploaded successfully!" });
}
