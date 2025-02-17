import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";

export async function GET(_: NextRequest) {
    try {
        await connectDB();

        // Fetch all users but exclude passwords for security
        const users = await User.find().select("-password");

        return NextResponse.json({ success: true, users }, { status: 200 });
    } catch (error) {
        console.error("Error fetching users:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch users" }, { status: 500 });
    }
}
