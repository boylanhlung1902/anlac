# Hướng Dẫn Fix Lỗi Email Authentication

## 🔍 Lỗi Hiện Tại
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

## 🛠️ Cách Fix Chi Tiết

### Bước 1: Tạo App Password cho Gmail

1. **Đăng nhập Gmail**: https://mail.google.com
2. **Vào Google Account**: https://myaccount.google.com/
3. **Security** → **2-Step Verification**
   - Nếu chưa bật: Bật 2-Step Verification
   - Nếu đã bật: Tiếp tục bước 4

4. **Tạo App Password**:
   - Vào: https://myaccount.google.com/apppasswords
   - Chọn "Mail"
   - Chọn "Other (Custom name)"
   - Đặt tên: "Stone Art Website"
   - Click "Generate"
   - **Copy App Password** (16 ký tự, không có dấu cách)

### Bước 2: Cập Nhật File .env

```env
# Thay thế EMAIL_PASS bằng App Password mới
EMAIL_USER=tangnhi0311@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop  # App Password 16 ký tự
```

### Bước 3: Test Lại

```bash
# Test API endpoint
curl -X POST http://localhost:3000/api/contact/test-gmail \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "Test message"
  }'
```

## 🔧 Troubleshooting

### Nếu vẫn lỗi "Invalid login":

1. **Kiểm tra 2-Step Verification**:
   - Đảm bảo đã bật 2-Step Verification
   - Không thể sử dụng App Password nếu chưa bật

2. **Kiểm tra App Password**:
   - App Password phải đúng 16 ký tự
   - Không có dấu cách thừa
   - Không phải password Gmail thông thường

3. **Tạo lại App Password**:
   - Xóa App Password cũ
   - Tạo App Password mới
   - Cập nhật .env

4. **Kiểm tra Gmail Account**:
   - Đảm bảo account không bị khóa
   - Kiểm tra security settings

### Test với Gmail khác (nếu cần):

```env
# Thử với Gmail khác
EMAIL_USER=your-other-gmail@gmail.com
EMAIL_PASS=your-app-password
```

## ✅ Kết Quả Mong Đợi

Khi thành công, bạn sẽ thấy:
```json
{
  "success": true,
  "message": "Email đã được gửi thành công!",
  "messageId": "...",
  "response": "250 2.0.0 OK ..."
}
```

## 📧 Kiểm Tra Email

Sau khi gửi thành công, kiểm tra:
- **Inbox** của `hoangminhtrung1902@gmail.com`
- **Spam folder** (nếu không thấy trong inbox)
