import { NextResponse } from "next/server";
import en from "../../../../messages/en.json";
import am from "../../../../messages/am.json";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") || "en";

  const messages = locale === "am" ? am : en;
  
  // Return the fetched translations JSON dynamically
  return NextResponse.json(messages);
}
