import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  console.log('Forgot password API called');
  try {
    const { email } = await request.json();
    console.log('Email received:', email);

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    // Check if admin with this email exists
    const adminResult = await query('SELECT id, username FROM admin WHERE email = ?', [email]);
    const admin = adminResult[0];
    console.log('Admin lookup result:', admin);

    if (!admin) {
      // For security reasons, always return a generic success message
      return NextResponse.json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' });
    }

    // Generate a unique token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now
    console.log('Generated reset token and expiry');

    // Store the token and expiry in the database
    await query(
      'UPDATE admin SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
      [resetToken, resetTokenExpiry, admin.id]
    );
    console.log('Database updated with reset token');

    // Send password reset email
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can use other services or SMTP
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log('Nodemailer transporter created');

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`;
    console.log('Reset link:', resetLink);

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>You requested a password reset for your admin account.</p>
        <p>Please click on the following link to reset your password:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>This link is valid for 1 hour.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');

    return NextResponse.json({ success: true, message: 'If an account with that email exists, a password reset link has been sent.' });

  } catch (error) {
    console.error('Forgot password API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}