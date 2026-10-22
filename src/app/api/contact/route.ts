import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

function unwrapEnv(value: string) {
  const trimmed = value.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
}

function readGmailAuth() {
  const rawPass = process.env.EMAIL_PASS || '';
  const user = unwrapEnv(process.env.EMAIL_USER || '').toLowerCase();
  const pass = unwrapEnv(rawPass).replace(/[^a-z]/gi, '').toLowerCase();
  return { user, pass, rawPassLength: rawPass.length };
}

function mailFingerprint(user: string, pass: string) {
  return createHash('sha256').update(`${user}\n${pass}`).digest('hex').slice(0, 12);
}

async function sendGmail(mail: nodemailer.SendMailOptions, user: string, pass: string) {
  const attempts = [
    { host: 'smtp.gmail.com', port: 465, secure: true },
    { host: 'smtp.gmail.com', port: 587, secure: false },
  ];
  let lastError: unknown;

  for (const attempt of attempts) {
    const transporter = nodemailer.createTransport({
      host: attempt.host,
      port: attempt.port,
      secure: attempt.secure,
      auth: { user, pass },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });
    try {
      await transporter.sendMail(mail);
      return;
    } catch (error) {
      lastError = error;
      const code = typeof error === 'object' && error !== null && 'code' in error ? error.code : '';
      if (code !== 'EAUTH') throw error;
    }
  }

  throw lastError;
}

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

    const { user: emailUser, pass: emailPass, rawPassLength } = readGmailAuth();

    if (!emailUser || emailPass.length !== 16) {
      return NextResponse.json(
        {
          success: false,
          message: 'EMAIL_PASS trên Vercel không phải App Password 16 ký tự.',
          passLength: emailPass.length,
          rawPassLength,
          userHash: createHash('sha256').update(emailUser).digest('hex').slice(0, 8),
        },
        { status: 503 }
      );
    }

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

    await sendGmail(mailOptions, emailUser, emailPass);

    return NextResponse.json(
      { success: true, message: 'Email đã được gửi thành công!' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error sending email:', error);
    const authFailed = typeof error === 'object' && error !== null && 'code' in error && error.code === 'EAUTH';
    const { user, pass, rawPassLength } = readGmailAuth();
    return NextResponse.json(
      {
        success: false,
        message: authFailed
          ? 'Gmail từ chối đăng nhập từ máy chủ Vercel.'
          : 'Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.',
        ...(authFailed
          ? {
              passLength: pass.length,
              rawPassLength,
              userHash: createHash('sha256').update(user).digest('hex').slice(0, 8),
              mailFingerprint: mailFingerprint(user, pass),
            }
          : {}),
      },
      { status: authFailed ? 502 : 500 }
    );
  }
}
