// app/api/auth/verify-otp/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function POST(req) {
  try {
    await dbConnect();
    const { email: rawEmail, otp: rawOtp } = await req.json();
    const email = (rawEmail || "").trim().toLowerCase();
    const otp = (rawOtp || "").toString().trim();

    if (!email || !otp) return NextResponse.json({ error: "Email and OTP required" }, { status: 400 });

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (!user.otp || user.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    user.otpVerified = true;
    // Keep otp in DB until reset to allow single-use verification; we'll clear on reset
    await user.save();

    return NextResponse.json({ success: true, message: "OTP verified" }, { status: 200 });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
