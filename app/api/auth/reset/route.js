// app/api/auth/reset/route.js
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import sendEmail from "@/lib/sendEmail";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await dbConnect();
    const { email: rawEmail, otp: rawOtp, newPassword: rawPassword } = await req.json();
    const email = (rawEmail || "").trim().toLowerCase();
    const otp = (rawOtp || "").toString().trim();
    const newPassword = (rawPassword || "").trim();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "Email, OTP and newPassword are required" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
    }

    const user = await User.findOne({ email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    if (!user.otp || user.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (!user.otpExpiry || user.otpExpiry < new Date()) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }

    if (!user.otpVerified) {
      return NextResponse.json({ error: "OTP not verified" }, { status: 400 });
    }

    // MANUALLY HASH the password here to guarantee it's hashed exactly once
    const hashed = await bcrypt.hash(newPassword, 12);
    user.password = hashed;

    // clear OTP fields
    user.otp = null;
    user.otpExpiry = null;
    user.otpVerified = false;

    await user.save();

    // optional confirmation email
    await sendEmail({
      to: user.email,
      subject: "Your password has been changed",
      html: `<p>Your password for ${user.email} was successfully updated. If this wasn't you, contact support immediately.</p>`,
    });

    console.log("Password reset for:", user.email);
    return NextResponse.json({ message: "Password reset successful" }, { status: 200 });

  } catch (err) {
    console.error("RESET ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
