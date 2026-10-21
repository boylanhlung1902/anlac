import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    // Log environment variables (without exposing password)
    console.log('=== EMAIL CONFIG DEBUG ===');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS exists:', !!process.env.EMAIL_PASS);
    console.log('EMAIL_PASS length:', process.env.EMAIL_PASS?.length);
    console.log('========================');

    // Check if email config is set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json({
        success: false,
        message: 'Email configuration missing',
        debug: {
          hasUser: !!process.env.EMAIL_USER,
          hasPass: !!process.env.EMAIL_PASS,
          userLength: process.env.EMAIL_USER?.length,
          passLength: process.env.EMAIL_PASS?.length
        }
      }, { status: 500 });
    }

    // Create transporter with minimal config
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Simple test email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'hoangminhtrung1902@gmail.com',
      subject: '[SIMPLE TEST] Email Test',
      text: 'This is a simple test email from Stone Art website.',
      html: '<h1>Test Email</h1><p>This is a simple test email from Stone Art website.</p>'
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Simple test email sent successfully!',
      messageId: info.messageId,
      response: info.response
    }, { status: 200 });

  } catch (error) {
    console.error('Simple test error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to send test email',
      error: error instanceof Error ? error.message : 'Unknown error',
      code: error instanceof Error && 'code' in error ? (error as any).code : undefined
    }, { status: 500 });
  }
}
