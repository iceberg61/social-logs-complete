import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import Payment from "@/models/Payment";
import User from "@/models/User";
import Order from "@/models/Order"; // 🆕 import order model
import sendEmail from "@/lib/sendEmail";

export async function POST(req) {
  try {
    await dbConnect();

    const body = await req.json();

    // ✅ Verify Paystack signature
    const signature = req.headers.get("x-paystack-signature");
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(body))
      .digest("hex");

    if (hash !== signature) {
      console.warn("⚠️ Invalid Paystack signature");
      return new Response(null, { status: 400 });
    }

    // ✅ Handle only successful payments
    if (body.event === "charge.success") {
      const { reference, amount } = body.data;

      const payment = await Payment.findOneAndUpdate(
        { transactionId: reference, status: "pending" },
        { status: "success" },
        { new: true }
      );

      if (payment) {
        // ✅ Find the user who made this payment
        const user = await User.findById(payment.userId);

        // ✅ Update user balance
        await User.findByIdAndUpdate(payment.userId, {
          $inc: { balance: amount / 100 },
        });

       
        // ✅ Create order record
        await Order.create({
          userId: user._id,
          email: user.email,
          product: "Deposit", // or actual product name if available
          qty: 1,
          amount: amount / 100,
          status: "Completed",
          reference,
        });


        // ✅ Send confirmation email
        if (user?.email) {
          await sendEmail({
            to: user.email,
            subject: "Deposit Successful",
            html: `
              <h2>Payment Successful ✅</h2>
              <p>Your payment of ₦${amount / 100} was successful!</p>
              <p>Reference: ${reference}</p>
              <p>Thank you for using Social-logs.</p>
            `,
          });
        } else {
          console.warn("⚠️ No email found for user:", payment.userId);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("❌ Paystack Webhook Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
