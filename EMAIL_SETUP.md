# Cấu Hình Email - Form Liên Hệ

## Bước 1: Tạo App Password cho Gmail

1. Đăng nhập vào tài khoản Gmail của bạn
2. Vào **Google Account Settings** > **Security**
3. Bật **2-Step Verification** nếu chưa bật
4. Tạo **App Password**:
   - Chọn **App passwords**
   - Chọn **Mail** và **Other (Custom name)**
   - Đặt tên: "Stone Art Website"
   - Copy mật khẩu được tạo ra

## Bước 2: Cấu Hình Environment Variables

Thêm các biến môi trường vào file `.env.local`:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here
```

**Lưu ý:**
- `EMAIL_USER`: Địa chỉ Gmail của bạn
- `EMAIL_PASS`: App password đã tạo ở bước 1 (không phải mật khẩu Gmail thông thường)

## Bước 3: Kiểm Tra

1. Khởi động lại server: `npm run dev`
2. Mở form liên hệ và thử gửi email
3. Kiểm tra email `hoangminhtrung1902@gmail.com` để xem email đã được gửi

## Troubleshooting

### Lỗi "Invalid login"
- Kiểm tra lại App Password
- Đảm bảo 2-Step Verification đã được bật
- Thử tạo lại App Password

### Lỗi "Less secure app access"
- Gmail không còn hỗ trợ "Less secure apps"
- Bắt buộc phải sử dụng App Password

### Email không gửi được
- Kiểm tra kết nối internet
- Kiểm tra console log để xem lỗi chi tiết
- Đảm bảo các biến môi trường đã được cấu hình đúng

## Cấu Hình Production

Khi deploy lên production, đảm bảo:
1. Cấu hình các biến môi trường trên hosting platform
2. Sử dụng Gmail Business hoặc email service khác để tăng độ tin cậy
3. Cân nhắc sử dụng email service như SendGrid, Mailgun cho production
