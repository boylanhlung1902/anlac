import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, message } = await request.json();

    // Log để debug
    console.log('Email config check:', {
      user: process.env.EMAIL_USER,
      hasPass: !!process.env.EMAIL_PASS
    });

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Check if email config is set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email configuration not set. Please check EMAIL_USER and EMAIL_PASS in .env',
          debug: {
            hasUser: !!process.env.EMAIL_USER,
            hasPass: !!process.env.EMAIL_PASS
          }
        },
        { status: 500 }
      );
    }

    // Create transporter with more detailed error handling
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      debug: true, // Enable debug output
      logger: true  // Log to console
    });

    // Test connection first
    try {
      await transporter.verify();
      console.log('SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('SMTP verification failed:', verifyError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Không thể kết nối với Gmail SMTP. Vui lòng kiểm tra cấu hình email.',
          error: verifyError instanceof Error ? verifyError.message : 'SMTP verification failed'
        },
        { status: 500 }
      );
    }

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'hoangminhtrung1902@gmail.com',
      subject: `[TEST] Liên hệ từ khách hàng: ${name}`,
      text: `
        Thông tin liên hệ:
        - Họ và tên: ${name}
        - Email: ${email}
        - Số điện thoại: ${phone || 'Không có'}
        - Nội dung: ${message}
        
        Thời gian: ${new Date().toLocaleString('vi-VN')}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #041434; border-bottom: 2px solid #041434; padding-bottom: 10px;">
            [TEST] Thông Tin Liên Hệ Từ Khách Hàng
          </h2>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Chi Tiết Liên Hệ:</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555; width: 120px;">Họ và tên:</td>
                <td style="padding: 8px 0; color: #333;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Email:</td>
                <td style="padding: 8px 0; color: #333;">${email}</td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #555;">Số điện thoại:</td>
                <td style="padding: 8px 0; color: #333;">${phone}</td>
              </tr>
              ` : ''}
            </table>
          </div>
          
          <div style="background-color: #e9ecef; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Nội dung:</h3>
            <p style="color: #333; line-height: 1.6; margin: 0;">${message}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 14px;">
              [TEST] Email này được gửi tự động từ form liên hệ của website Stone Art
            </p>
            <p style="color: #666; font-size: 12px;">
              Thời gian: ${new Date().toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Email đã được gửi thành công!',
        messageId: info.messageId,
        response: info.response
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.',
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
