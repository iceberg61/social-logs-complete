import dbConnect from '@/lib/dbConnect';
import User from '@/models/User';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await dbConnect();
    const { username: input, password } = await request.json();

    const user = await User.findOne({ $or: [{ username: input }, { email: input }] });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const res = NextResponse.json({
      success: true,
      token,
      user: { id: user._id, username: user.username, email: user.email, balance: user.balance },
    });

    res.cookies.set('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // important for HTTPS
  sameSite: 'lax', // allow requests from your same domain frontend
  path: '/',
  maxAge: 60 * 60, // 1 hour
});


    return res;
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
