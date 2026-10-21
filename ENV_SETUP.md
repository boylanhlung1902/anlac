# Environment Setup

## Tạo file .env.local

Tạo file `.env.local` trong thư mục gốc của project với nội dung sau:

```env
# Database
DATABASE_URL="postgresql://trungminh@localhost:5432/stoneart_db"

# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=test

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Giải thích các biến môi trường

### DATABASE_URL
- **Format**: `postgresql://username@host:port/database`
- **username**: Tên user PostgreSQL (thường là tên user hiện tại)
- **host**: localhost (database chạy trên máy local)
- **port**: 5432 (port mặc định của PostgreSQL)
- **database**: stoneart_db (tên database đã tạo)

### NEXT_PUBLIC_PAYPAL_CLIENT_ID
- **Development**: `test` (cho testing)
- **Production**: Client ID thực từ PayPal Developer Dashboard

### NEXT_PUBLIC_SITE_URL
- **Development**: `http://localhost:3000`
- **Production**: URL thực của website

## Kiểm tra cấu hình

Sau khi tạo file `.env.local`, chạy các lệnh sau để kiểm tra:

```bash
# Kiểm tra PostgreSQL connection
psql -d stoneart_db -c "SELECT version();"

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed database
npm run db:seed
```

## Troubleshooting

### Lỗi connection refused
```bash
# Kiểm tra PostgreSQL service
brew services list | grep postgresql

# Restart service nếu cần
brew services restart postgresql@14
```

### Lỗi permission denied
```bash
# Tạo user PostgreSQL
createuser -s trungminh

# Hoặc sử dụng user hiện tại
psql -d stoneart_db -c "CREATE USER trungminh WITH SUPERUSER;"
```

### Lỗi database không tồn tại
```bash
# Tạo database
createdb stoneart_db

# Hoặc tạo bằng psql
psql -c "CREATE DATABASE stoneart_db;"
``` 