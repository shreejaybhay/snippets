import { NextRequest, NextResponse } from "next/server";

export async function POST(_: NextRequest): Promise<NextResponse> {
    try {
        const response = NextResponse.json({ 
            message: "Logged Out!", 
            success: true 
        });

        // Clear the authToken cookie
        response.cookies.set("authToken", "", { 
            expires: new Date(0),
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        // Clear any other auth-related cookies if they exist
        response.cookies.delete("authToken");

        return response;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        console.error("Logout error:", errorMessage);
        
        return NextResponse.json(
            { message: "Error during logout", success: false },
            { status: 500 }
        );
    }
}
