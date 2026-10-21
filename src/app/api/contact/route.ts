import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, message, subject } = await request.json();

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' },
        { status: 400 }
      );
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json(
        { success: false, message: 'Chưa cấu hình email trên máy chủ. Thêm EMAIL_USER và EMAIL_PASS trong Environment Variables của Vercel.' },
        { status: 503 }
      );
    }

    // Create transporter (using Gmail SMTP)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Gmail address
        pass: process.env.EMAIL_PASS  // App password from Gmail
      }
    });

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'hoangminhtrung1902@gmail.com',
      subject: subject ? `[Liên hệ] ${subject} - ${name}` : `Liên hệ từ khách hàng: ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                      <h2 style="color: #041434; border-bottom: 2px solid #041434; padding-bottom: 10px;">
              ${subject ? `Thông Tin Liên Hệ: ${subject}` : 'Thông Tin Liên Hệ Từ Khách Hàng'}
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
              Email này được gửi tự động từ form liên hệ của website Stone Art
            </p>
            <p style="color: #666; font-size: 12px;">
              Thời gian: ${new Date().toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { success: true, message: 'Email đã được gửi thành công!' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
