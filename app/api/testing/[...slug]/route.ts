import { NextResponse } from "next/server";

// This route was used for internal testing purposes only.
// It has been disabled in production for security reasons.
// It returned a full user object (including private fields) for any user ID without authentication.
export async function GET() {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
}