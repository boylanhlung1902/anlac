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

    const emailUser = process.env.EMAIL_USER?.trim()
    const emailPass = process.env.EMAIL_PASS?.replace(/\s+/g, '')

    if (!emailUser || !emailPass) {
      return NextResponse.json(
        { success: false, message: 'Chưa cấu hình email trên máy chủ. Thêm EMAIL_USER và EMAIL_PASS trong Environment Variables của Vercel.' },
        { status: 503 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Email content
    const mailOptions = {
      from: emailUser,
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
    const authFailed = typeof error === 'object' && error !== null && 'code' in error && error.code === 'EAUTH';
    return NextResponse.json(
      {
        success: false,
        message: authFailed
          ? 'Gmail từ chối đăng nhập. Hãy tạo App Password mới và cập nhật EMAIL_PASS trên Vercel.'
          : 'Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.',
      },
      { status: authFailed ? 502 : 500 }
    );
  }
}
