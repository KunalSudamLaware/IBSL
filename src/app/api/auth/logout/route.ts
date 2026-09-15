import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  return NextResponse.json({ success: true, message: "Logged out" }, { status: 200 });
}