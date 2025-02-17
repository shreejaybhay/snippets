import { NextRequest, NextResponse } from "next/server";

export async function POST(_: NextRequest): Promise<NextResponse> {
    const response = NextResponse.json({ message: "Logged Out!", success: true });

    // Clear the authToken cookie by setting an expired date
    response.cookies.set("authToken", "", { expires: new Date(0) });

    return response;
}
