# Database Setup với PostgreSQL và Prisma

## Cấu hình Database

### 1. Cài đặt PostgreSQL

**macOS (với Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**Windows:**
- Tải PostgreSQL từ [postgresql.org](https://www.postgresql.org/download/windows/)
- Cài đặt và khởi động service

### 2. Tạo Database

```bash
# Đăng nhập vào PostgreSQL
psql postgres

# Tạo database
CREATE DATABASE stoneart_db;

# Tạo user (optional)
CREATE USER stoneart_user WITH PASSWORD 'your_password';

# Cấp quyền
GRANT ALL PRIVILEGES ON DATABASE stoneart_db TO stoneart_user;

# Thoát
\q
```

### 3. Cấu hình Environment Variables

Tạo file `.env.local` trong thư mục gốc:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/stoneart_db"

# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=test

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Thay thế:**
- `username`: Tên user PostgreSQL
- `password`: Mật khẩu user
- `stoneart_db`: Tên database

### 4. Setup Prisma

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Hoặc tạo migration (recommended cho production)
npm run db:migrate
```

### 5. Seed Database

```bash
# Chạy seed script để thêm dữ liệu mẫu
npm run db:seed
```

### 6. Verify Setup

```bash
# Mở Prisma Studio để xem database
npm run db:studio
```

## Database Schema

### Models

#### Category
- `id`: Primary key
- `name`: Tên danh mục
- `description`: Mô tả
- `image`: Hình ảnh
- `slug`: URL slug
- `products`: Relation với Product

#### Product
- `id`: Primary key
- `name`: Tên sản phẩm
- `description`: Mô tả
- `price`: Giá USD
- `priceVND`: Giá VND
- `image`: Hình ảnh chính
- `images`: Array hình ảnh
- `categoryId`: Foreign key to Category
- `stock`: Số lượng tồn kho
- `rating`: Đánh giá (0-5)
- `reviewCount`: Số lượng đánh giá
- `isFeatured`: Sản phẩm nổi bật
- `isActive`: Trạng thái hoạt động
- `slug`: URL slug
- `weight`: Trọng lượng (kg)
- `dimensions`: Kích thước
- `material`: Chất liệu
- `origin`: Xuất xứ

#### User
- `id`: Primary key
- `email`: Email (unique)
- `name`: Tên
- `phone`: Số điện thoại
- `address`: Địa chỉ
- `role`: Vai trò (ADMIN/CUSTOMER)
- `isActive`: Trạng thái hoạt động

#### Order
- `id`: Primary key
- `userId`: Foreign key to User
- `orderNumber`: Mã đơn hàng
- `status`: Trạng thái đơn hàng
- `totalAmount`: Tổng tiền USD
- `totalAmountVND`: Tổng tiền VND
- `paymentMethod`: Phương thức thanh toán
- `paymentStatus`: Trạng thái thanh toán
- `shippingAddress`: Địa chỉ giao hàng
- `shippingPhone`: SĐT giao hàng
- `shippingName`: Tên người nhận
- `notes`: Ghi chú
- `paypalOrderId`: PayPal Order ID
- `paypalTransactionId`: PayPal Transaction ID

#### OrderItem
- `id`: Primary key
- `orderId`: Foreign key to Order
- `productId`: Foreign key to Product
- `quantity`: Số lượng
- `price`: Giá USD
- `priceVND`: Giá VND

#### CartItem
- `id`: Primary key
- `userId`: Foreign key to User
- `productId`: Foreign key to Product
- `quantity`: Số lượng
- Unique constraint: `[userId, productId]`

## API Endpoints

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/[id]` - Lấy chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm mới
- `PUT /api/products/[id]` - Cập nhật sản phẩm
- `DELETE /api/products/[id]` - Xóa sản phẩm

### Categories
- `GET /api/categories` - Lấy danh sách danh mục
- `POST /api/categories` - Tạo danh mục mới

## Query Parameters

### Products API
- `page`: Số trang (default: 1)
- `limit`: Số lượng per page (default: 12)
- `category`: Slug của category
- `search`: Tìm kiếm theo tên/mô tả
- `featured`: Lọc sản phẩm nổi bật
- `sortBy`: Sắp xếp theo field
- `sortOrder`: asc/desc

### Categories API
- `includeProducts`: true/false để include products

## Development Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Create migration
npm run db:migrate

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio

# Reset database (careful!)
npx prisma migrate reset
```

## Production Setup

1. **Database URL**: Sử dụng production database URL
2. **Migrations**: Luôn sử dụng migrations thay vì db:push
3. **Environment**: Đặt NODE_ENV=production
4. **Connection Pooling**: Cấu hình connection pooling cho production

## Troubleshooting

### Lỗi thường gặp:

1. **Connection refused**
   - Kiểm tra PostgreSQL service đang chạy
   - Kiểm tra DATABASE_URL

2. **Schema validation failed**
   - Chạy `npm run db:generate`
   - Chạy `npm run db:push`

3. **Permission denied**
   - Kiểm tra user permissions
   - Kiểm tra database exists

4. **Migration conflicts**
   - Reset database: `npx prisma migrate reset`
   - Hoặc resolve conflicts manually

### Debug Commands:

```bash
# Kiểm tra connection
npx prisma db pull

# Validate schema
npx prisma validate

# Format schema
npx prisma format

# Check database status
npx prisma migrate status
``` 