# An Lạc Stone - Đá Cảnh & Mỹ Nghệ

Website bán hàng đá cảnh và đồ chế tác từ đá mỹ nghệ được xây dựng bằng Next.js, TypeScript và Bootstrap 5. Đây là dự án chuyển đổi từ template HTML sang ứng dụng React hiện đại.

## Tính Năng

- 🛍️ **Thiết Kế eCommerce Hiện Đại** - Giao diện sạch sẽ và responsive
- ⚡ **Next.js 14** - Xây dựng với các tính năng Next.js mới nhất
- 🎨 **Bootstrap 5** - Framework CSS hiện đại cho styling
- 📱 **Thiết Kế Responsive** - Hoạt động hoàn hảo trên mọi thiết bị
- 🔍 **Tính Năng Tìm Kiếm** - Tìm kiếm và lọc sản phẩm
- 🛒 **Giỏ Hàng** - Thêm sản phẩm vào giỏ hàng (UI)
- 📄 **Trang Động** - Trang chi tiết sản phẩm với routing động
- 🎯 **TypeScript** - Đảm bảo type safety hoàn toàn
- 🚀 **Tối Ưu Hiệu Suất** - Tối ưu hình ảnh và code splitting

## Các Trang

- **Trang Chủ** (`/`) - Trang landing với carousel hero và sản phẩm nổi bật
- **Sản Phẩm** (`/shop`) - Danh sách sản phẩm với bộ lọc và tìm kiếm
- **Chi Tiết Sản Phẩm** (`/shop-single/[id]`) - Trang sản phẩm cá nhân
- **Giới Thiệu** (`/about`) - Thông tin công ty và đội ngũ
- **Liên Hệ** (`/contact`) - Form liên hệ và vị trí

## Bắt Đầu

### Yêu Cầu

- Node.js 18+ 
- npm hoặc yarn

### Cài Đặt

1. Clone repository:
```bash
git clone <repository-url>
cd zay-shop-nextjs
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Chạy development server:
```bash
npm run dev
```

4. Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt.

## Cấu Trúc Dự Án

```
zay-shop-nextjs/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── globals.css        # Global styles
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Trang chủ
│   │   ├── about/             # Trang giới thiệu
│   │   ├── contact/           # Trang liên hệ
│   │   ├── shop/              # Trang sản phẩm
│   │   └── shop-single/       # Trang chi tiết sản phẩm
│   ├── components/            # Components tái sử dụng
│   │   ├── Header.tsx         # Header navigation
│   │   ├── Footer.tsx         # Footer component
│   │   ├── HeroCarousel.tsx   # Carousel trang chủ
│   │   └── BootstrapScript.tsx # Bootstrap JS loader
│   └── lib/                   # Utility functions
├── public/
│   └── images/               # Hình ảnh tĩnh
├── package.json
├── next.config.js
├── tsconfig.json
└── README.md
```

## Công Nghệ Sử Dụng

- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Bootstrap 5** - CSS framework
- **Font Awesome** - Icons
- **React** - UI library

## Tùy Chỉnh

### Styling
- Global styles trong `src/app/globals.css`
- Sử dụng Bootstrap classes xuyên suốt
- CSS variables cho theming

### Components
- Tất cả components trong `src/components/`
- Thiết kế modular và tái sử dụng
- TypeScript interfaces cho props

### Hình Ảnh
- Tất cả hình ảnh trong `public/images/`
- Tối ưu với Next.js Image component
- Responsive và lazy loading

## Triển Khai

### Vercel (Khuyến Nghị)
1. Push code lên GitHub
2. Kết nối repository với Vercel
3. Triển khai tự động

### Các Nền Tảng Khác
```bash
npm run build
npm start
```

## Đóng Góp

1. Fork repository
2. Tạo feature branch
3. Thực hiện thay đổi
4. Submit pull request

## Giấy Phép

Dự án này dựa trên template Zay Shop từ TemplateMo. Vui lòng tôn trọng điều khoản giấy phép gốc.

## Ghi Nhận

- **Template**: [TemplateMo](https://templatemo.com)
- **Hình Ảnh**: Freepik Stories, Unsplash, Icons 8
- **Icons**: Font Awesome
- **Framework**: Next.js, Bootstrap 5

## Hỗ Trợ

Để được hỗ trợ, vui lòng mở issue trong repository hoặc liên hệ đội phát triển. 