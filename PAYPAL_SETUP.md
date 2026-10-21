# PayPal Integration Setup

## Cấu hình PayPal cho Development

### 1. Tạo file .env.local

Tạo file `.env.local` trong thư mục gốc của project với nội dung:

```env
# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=test

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. PayPal Sandbox Account

Để test thanh toán trong môi trường development:

1. Truy cập [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Tạo tài khoản developer
3. Tạo ứng dụng mới trong Sandbox
4. Lấy Client ID từ ứng dụng
5. Thay thế `test` bằng Client ID thực trong file `.env.local`

### 3. Development Mode (Fallback)

Nếu gặp lỗi với PayPal SDK, bạn có thể sử dụng chế độ Development:

1. Mở modal thanh toán
2. Bật toggle "Chế độ Development (Mô phỏng thanh toán)"
3. Click "Mô Phỏng Thanh Toán Thành Công"
4. Hệ thống sẽ mô phỏng thanh toán thành công

**Lưu ý:** Chế độ này chỉ dành cho development, không sử dụng trong production.

### 4. Test Accounts

Sử dụng các tài khoản test sau để test thanh toán:

**Buyer Account (Personal):**
- Email: sb-1234567890@personal.example.com
- Password: test123

**Seller Account (Business):**
- Email: sb-1234567890@business.example.com
- Password: test123

### 5. Tính năng đã tích hợp

✅ **PayPal Buttons** - Nút thanh toán PayPal  
✅ **Order Creation** - Tạo đơn hàng  
✅ **Payment Capture** - Xử lý thanh toán  
✅ **Success/Error Handling** - Xử lý thành công/lỗi  
✅ **Cart Integration** - Tích hợp với giỏ hàng  
✅ **Currency Conversion** - Chuyển đổi VND sang USD  
✅ **Order Summary** - Tóm tắt đơn hàng  
✅ **Transaction Details** - Chi tiết giao dịch  
✅ **Development Fallback** - Mô phỏng thanh toán  
✅ **Error Recovery** - Xử lý lỗi và retry  

### 6. Troubleshooting

**Lỗi thường gặp:**

1. **"InvalidCharacterError: Failed to execute 'atob'"**
   - Giải pháp: Sử dụng Development Mode (toggle trong modal thanh toán)
   - Hoặc cập nhật Client ID thực từ PayPal Developer Dashboard

2. **PayPal không load**
   - Kiểm tra Client ID trong .env.local
   - Kiểm tra kết nối internet
   - Sử dụng Development Mode

3. **Thanh toán thất bại**
   - Kiểm tra tài khoản test
   - Kiểm tra số tiền (phải > 0)
   - Sử dụng Development Mode để test

### 7. Production Setup

Khi deploy lên production:

1. Tạo ứng dụng PayPal Production
2. Cập nhật `NEXT_PUBLIC_PAYPAL_CLIENT_ID` với Client ID production
3. Cập nhật `NEXT_PUBLIC_SITE_URL` với domain thực
4. Cấu hình webhook để nhận thông báo thanh toán
5. **Tắt Development Mode** trong production

### 8. Security Notes

- Không commit file `.env.local` vào git
- Sử dụng HTTPS trong production
- Validate payment details server-side
- Implement proper error handling
- Log payment events for debugging
- **Không sử dụng Development Mode trong production**

### 9. Testing Workflow

1. **Development Mode (Khuyến nghị):**
   - Thêm sản phẩm vào giỏ hàng
   - Click "Thanh Toán với PayPal"
   - Bật "Chế độ Development"
   - Click "Mô Phỏng Thanh Toán Thành Công"

2. **PayPal Sandbox:**
   - Thêm sản phẩm vào giỏ hàng
   - Click "Thanh Toán với PayPal"
   - Sử dụng tài khoản test để thanh toán
   - Kiểm tra kết quả thanh toán

### 10. Debug

**Khi gặp lỗi:**
- Mở Developer Tools (F12)
- Kiểm tra Console logs
- Verify PayPal script loading
- Sử dụng Development Mode để bypass lỗi

**Console Commands:**
```javascript
// Kiểm tra PayPal script
window.paypal

// Kiểm tra environment variables
console.log(process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID)
``` 