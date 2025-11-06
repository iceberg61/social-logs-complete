import User from '@/models/User';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';

export async function POST(req) {
  await connectDB();
  
  try {
    const { userId, password } = await req.json();
    
    if (!userId || !password) {
      return NextResponse.json({ error: 'User ID and password required' }, { status: 400 });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }
    
    user.password = password; // Will hash in pre-save hook
    await user.save();
    
    return NextResponse.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}