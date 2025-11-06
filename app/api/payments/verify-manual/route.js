// app/api/payments/verify-manual/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Payment from '@/models/Payment';
import User from '@/models/User';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    await dbConnect();
    const { reference } = await req.json();
    const authHeader = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = jwt.verify(authHeader, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const payment = await Payment.findOne({ 
      transactionId: reference, 
      userId: user._id,
      status: 'pending' 
    });
    if (!payment) return NextResponse.json({ error: 'Payment not found or already completed' }, { status: 404 });

    // Mark as completed
    payment.status = 'completed';
    await payment.save();

    // Update balance
    user.balance += payment.amount;
    await user.save();

    return NextResponse.json({ 
      success: true, 
      newBalance: user.balance,
      message: 'Payment verified!'
    });
  } catch (error) {
    console.error('Manual verify error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}