import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/sendEmail'; // ✅ make sure this import is here at the top

export async function POST(req) {
  try {
    await dbConnect();
    const { email, otp, newPassword } = await req.json();

    // 🧩 Check user
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 🔐 Validate OTP and expiry
    if (
      !user.otpVerified ||
      user.otp !== otp ||
      !user.otpExpiry ||
      user.otpExpiry < new Date()
    ) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    // ✅ Validate password
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be 8+ characters' }, { status: 400 });
    }

    // 🔑 Hash and update password
    // const hashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = newPassword;
    user.otp = null;
    user.otpExpiry = null;
    user.otpVerified = false; // reset the flag
    await user.save();

    // 📧 Send confirmation email
    await sendEmail({
      to: user.email,
      subject: 'Your password has been successfully reset',
      html: `
        <div style="font-family: Arial, sans-serif; background: #f4f4f8; padding: 20px; border-radius: 8px;">
          <div style="background: white; padding: 25px; border-radius: 10px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
            <h2 style="color: #2563eb;">Password Reset Successful</h2>
            <p>Hello <strong>${user.username || 'there'}</strong>,</p>
            <p>Your password has been <strong>successfully reset</strong>. You can now log in using your new credentials.</p>
            <p>If this wasn’t you, please contact our support team immediately.</p>
            <br />
            <p style="font-size: 14px; color: #666;">— The Social-Logs Team</p>
          </div>
        </div>
      `,
    });

    console.log("✅ Password updated for:", user.email);
    return NextResponse.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('RESET ERROR:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

