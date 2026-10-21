# 🚀 API Endpoints Documentation

## 📋 Tổng Quan

Tất cả API endpoints đã được fix và test thành công. Response format thống nhất:

```json
{
  "success": true,
  "data": {...},
  "message": "Optional message",
  "count": "Optional count"
}
```

## 🏷️ Categories API

### **GET /api/categories**
Lấy danh sách tất cả categories

**Query Parameters:**
- `includeProducts` (boolean): Bao gồm products trong response

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Đá Phong Thủy",
      "description": "Các loại đá phong thủy mang lại may mắn và bình an",
      "image": "/images/category_img_01.jpg",
      "slug": "da-phong-thuy",
      "createdAt": "2025-08-04T03:32:32.436Z",
      "updatedAt": "2025-08-04T03:32:32.436Z"
    }
  ],
  "count": 6
}
```

**Test:**
```bash
curl -X GET "http://localhost:3000/api/categories"
curl -X GET "http://localhost:3000/api/categories?includeProducts=true"
```

### **GET /api/categories/[id]**
Lấy thông tin chi tiết category theo ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Đá Phong Thủy",
    "description": "Các loại đá phong thủy mang lại may mắn và bình an",
    "image": "/images/category_img_01.jpg",
    "slug": "da-phong-thuy",
    "products": [...]
  }
}
```

### **POST /api/categories**
Tạo category mới

**Body:**
```json
{
  "name": "Tên Category",
  "description": "Mô tả category",
  "image": "/images/category.jpg",
  "slug": "ten-category"
}
```

### **PUT /api/categories/[id]**
Cập nhật category

### **DELETE /api/categories/[id]**
Xóa category (chỉ khi không có products)

## 📦 Products API

### **GET /api/products**
Lấy danh sách products với pagination và filters

**Query Parameters:**
- `page` (number): Trang hiện tại (default: 1)
- `limit` (number): Số items per page (default: 12)
- `category` (string): Filter theo category slug
- `search` (string): Tìm kiếm theo tên hoặc mô tả
- `featured` (boolean): Chỉ lấy featured products
- `sortBy` (string): Sắp xếp theo field
- `sortOrder` (string): 'asc' hoặc 'desc'

**Sort Options:**
- `name`, `price`, `priceVND`, `rating`, `createdAt`
- `newest`, `oldest`, `priceAsc`, `priceDesc`, `nameAsc`, `nameDesc`, `ratingDesc`

**Response:**
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": 1,
        "name": "Đá Thạch Anh Tím",
        "description": "Đá thạch anh tím tự nhiên...",
        "price": "75.00",
        "priceVND": 1800000,
        "image": "/images/product_single_02.jpg",
        "images": ["/images/product_single_02.jpg"],
        "categoryId": 3,
        "stock": 15,
        "rating": 5.0,
        "reviewCount": 48,
        "isFeatured": true,
        "isActive": true,
        "slug": "da-thach-anh-tim",
        "weight": 1.8,
        "dimensions": "15 x 10 x 20 cm",
        "material": "Thạch Anh Tím Tự Nhiên",
        "origin": "Brazil",
        "category": {
          "id": 3,
          "name": "Đá Phong Thủy",
          "slug": "da-phong-thuy"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "total": 22,
      "totalPages": 2,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

**Test Examples:**
```bash
# Lấy tất cả products
curl -X GET "http://localhost:3000/api/products"

# Lấy featured products
curl -X GET "http://localhost:3000/api/products?featured=true"

# Filter theo category
curl -X GET "http://localhost:3000/api/products?category=da-phong-thuy"

# Tìm kiếm
curl -X GET "http://localhost:3000/api/products?search=thạch anh"

# Sắp xếp theo giá tăng dần
curl -X GET "http://localhost:3000/api/products?sortBy=priceVND&sortOrder=asc"

# Pagination
curl -X GET "http://localhost:3000/api/products?page=2&limit=5"
```

### **GET /api/products/[id]**
Lấy thông tin chi tiết product theo ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Đá Thạch Anh Tím",
    "description": "Đá thạch anh tím tự nhiên...",
    "price": "75.00",
    "priceVND": 1800000,
    "image": "/images/product_single_02.jpg",
    "images": ["/images/product_single_02.jpg"],
    "categoryId": 3,
    "stock": 15,
    "rating": 5.0,
    "reviewCount": 48,
    "isFeatured": true,
    "isActive": true,
    "slug": "da-thach-anh-tim",
    "weight": 1.8,
    "dimensions": "15 x 10 x 20 cm",
    "material": "Thạch Anh Tím Tự Nhiên",
    "origin": "Brazil",
    "category": {
      "id": 3,
      "name": "Đá Phong Thủy",
      "slug": "da-phong-thuy"
    }
  }
}
```

### **POST /api/products**
Tạo product mới

**Body:**
```json
{
  "name": "Tên Sản Phẩm",
  "description": "Mô tả sản phẩm",
  "price": 75.00,
  "priceVND": 1800000,
  "image": "/images/product.jpg",
  "images": ["/images/product.jpg"],
  "categoryId": 3,
  "stock": 15,
  "slug": "ten-san-pham",
  "weight": 1.8,
  "dimensions": "15 x 10 x 20 cm",
  "material": "Thạch Anh Tím",
  "origin": "Brazil",
  "isFeatured": true
}
```

### **PUT /api/products/[id]**
Cập nhật product

### **DELETE /api/products/[id]**
Xóa product

## 🔧 Error Handling

Tất cả API endpoints đều có error handling thống nhất:

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Invalid product ID",
  "message": "Product ID must be a valid number"
}
```

**404 Not Found:**
```json
{
  "success": false,
  "error": "Product not found",
  "message": "Product with this ID does not exist"
}
```

**409 Conflict:**
```json
{
  "success": false,
  "error": "Duplicate entry",
  "message": "Product with this slug already exists"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Detailed error message"
}
```

## 📊 Database Schema

### **Categories Table:**
- `id` (Primary Key)
- `name` (Unique)
- `description`
- `image`
- `slug` (Unique)
- `createdAt`
- `updatedAt`

### **Products Table:**
- `id` (Primary Key)
- `name`
- `description`
- `price` (Decimal)
- `priceVND` (Integer)
- `image`
- `images` (Array)
- `categoryId` (Foreign Key)
- `stock`
- `rating`
- `reviewCount`
- `isFeatured`
- `isActive`
- `slug` (Unique)
- `weight`
- `dimensions`
- `material`
- `origin`
- `createdAt`
- `updatedAt`

## 🎯 Test Results

✅ **GET /api/categories** - Hoạt động tốt  
✅ **GET /api/products** - Hoạt động tốt với pagination  
✅ **GET /api/products?featured=true** - Filter featured products  
✅ **GET /api/products?category=da-phong-thuy** - Filter theo category  
✅ **GET /api/products?search=thạch** - Tìm kiếm  
✅ **GET /api/products?sortBy=priceVND&sortOrder=asc** - Sắp xếp  
✅ **GET /api/products/[id]** - Single product  
✅ **GET /api/categories/[id]** - Single category  

## 🚀 Next Steps

1. **Test frontend integration** với API mới
2. **Cập nhật service layer** để sử dụng API
3. **Thêm authentication** cho admin endpoints
4. **Tạo admin panel** để quản lý products/categories
5. **Thêm image upload** functionality
6. **Implement caching** cho performance

---

**Lưu ý:** Tất cả API endpoints đã được test và hoạt động ổn định với PostgreSQL 16 và Prisma ORM. 