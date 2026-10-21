# Báo cáo dự án An Lạc Stone

**Tên mã nguồn:** `zay-shop-nextjs`  
**Phiên bản:** 1.0.0  
**Ngày báo cáo:** 12/10/2026  
**Ngôn ngữ giao diện:** Tiếng Việt  

---

## 1. Tổng quan

An Lạc Stone là website thương mại điện tử giới thiệu và bán **đá cảnh, đồ mỹ nghệ đá tự nhiên**. Ứng dụng được xây dựng bằng **Next.js 14 (App Router)** + **TypeScript**, dùng **PostgreSQL** qua **Prisma**, giao diện Bootstrap 5 kết hợp CSS thương hiệu navy / mist.

Mục tiêu sản phẩm:

- Trưng bày bộ sưu tập đá cảnh và chế tác mỹ nghệ
- Cho khách xem danh mục, chi tiết sản phẩm, thêm giỏ hàng / yêu thích
- Thanh toán PayPal (kèm phương thức tiền mặt, chuyển khoản trong mô hình dữ liệu)
- Nhận liên hệ qua form email (Gmail SMTP)

---

## 2. Công nghệ sử dụng

| Nhóm | Công nghệ |
|---|---|
| Frontend | Next.js 14, React 18, TypeScript |
| UI | Bootstrap 5.3, Font Awesome 6, Google Fonts (Questrial, Roboto) |
| Backend | Next.js Route Handlers (`src/app/api`) |
| Cơ sở dữ liệu | PostgreSQL + Prisma 5 |
| Thanh toán | PayPal (`@paypal/react-paypal-js`) |
| Email | Nodemailer (Gmail SMTP) |
| Xuất PDF | jsPDF, pdfmake |
| Seed / script | tsx |

**Lệnh chính**

```bash
npm run dev              # chạy local
npm run build            # build production
npm run db:generate      # Prisma generate
npm run db:push          # đẩy schema
npm run db:seed          # seed mặc định
npm run db:seed:craft    # seed danh mục / sản phẩm mỹ nghệ
npm run db:fix-images    # sửa path ảnh hỏng
```

---

## 3. Kiến trúc hệ thống

```
Browser
  └── Next.js App Router (src/app)
        ├── Pages: Home, Shop, Shop-single, About, Contact, Wishlist
        ├── API: /api/products, /api/categories, /api/contact
        ├── Context: Cart, Wishlist (localStorage)
        └── PayPal Provider
              └── Prisma Client
                    └── PostgreSQL
```

**Cấu trúc thư mục chính**

- `src/app/` — trang và API
- `src/components/` — Header, Footer, carousel, giỏ hàng, PayPal, gallery
- `src/contexts/` — giỏ hàng, wishlist
- `src/services/api.ts` — gọi API sản phẩm / danh mục
- `prisma/` — schema + seed
- `public/images/` — ảnh sản phẩm, hero, section
- `backups/` — bản sao UI trước khi redesign

---

## 4. Mô hình dữ liệu (Prisma)

| Model | Vai trò |
|---|---|
| `Category` | Danh mục (tên, slug, ảnh) |
| `Product` | Sản phẩm: giá VND, tồn kho, ảnh, chất liệu, xuất xứ, kích thước, nổi bật |
| `User` | Khách / admin |
| `Order` | Đơn hàng, địa chỉ giao, PayPal ID |
| `OrderItem` | Chi tiết đơn |
| `CartItem` | Giỏ hàng phía DB (schema có; UI hiện dùng localStorage) |

**Trạng thái đơn:** PENDING → CONFIRMED → SHIPPED → DELIVERED / CANCELLED  
**Thanh toán:** PAYPAL, CASH, BANK_TRANSFER  
**Trạng thái thanh toán:** PENDING, COMPLETED, FAILED, REFUNDED  

---

## 5. Chức năng theo trang

### 5.1 Trang chủ (`/`)

- Hero welcome: chữ + slideshow ảnh (`WelcomeVisual`)
- Carousel sản phẩm / câu chuyện thương hiệu (`HeroCarousel`)
- Lưới danh mục dạng bento
- Sản phẩm nổi bật
- Dải thống kê (số sản phẩm, khách hàng, năm kinh nghiệm)
- Nền section ảnh mờ (`HomeSection`) + hiệu ứng hiện khi cuộn (`Reveal`)

### 5.2 Cửa hàng (`/shop`)

- Lọc theo danh mục
- Tìm kiếm, sắp xếp
- Phân trang
- Thêm giỏ / yêu thích ngay trên thẻ sản phẩm

### 5.3 Chi tiết sản phẩm (`/shop-single/[id]`)

- Gallery ảnh vuông, thumbnail cuộn ngang, phóng to
- Thông số: danh mục, chất liệu, xuất xứ, kích thước, trọng lượng
- Chọn số lượng, thêm giỏ, yêu thích
- Layout mobile-first (1 cột trên điện thoại, 2 cột từ ≥992px)

### 5.4 Giới thiệu (`/about`)

- Câu chuyện thương hiệu, hình ảnh chế tác / đá tự nhiên

### 5.5 Liên hệ (`/contact`)

- Form gửi email qua `/api/contact` (Nodemailer)

### 5.6 Yêu thích (`/wishlist`)

- Danh sách lưu localStorage, đồng bộ giữa các trang

### 5.7 Giỏ hàng & thanh toán

- Popup giỏ (`CartPopup`)
- Modal checkout (`CheckoutModal`)
- Nút PayPal + fallback khi SDK lỗi

---

## 6. API nội bộ

| Endpoint | Phương thức | Mô tả |
|---|---|---|
| `/api/products` | GET | Danh sách: page, limit, category, search, featured, sort |
| `/api/products/[id]` | GET | Chi tiết 1 sản phẩm |
| `/api/categories` | GET | Danh sách danh mục |
| `/api/categories/[id]` | GET | Chi tiết danh mục |
| `/api/contact` | POST | Gửi form liên hệ |

---

## 7. Nhóm sản phẩm (seed mỹ nghệ)

Dữ liệu craft gồm các nhóm điển hình:

- Bàn ghế đá
- Đài phun nước
- Bảng hiệu đá
- Bồn tắm đá
- Đèn đá
- Lavabo đá
- Tượng đá
- Thạch mỹ nghệ

Giá lưu `priceVND` (VND), có trường `price` / `netPrice` / `tax` phục vụ hóa đơn / xuất PDF.

---

## 8. Giao diện & thương hiệu

**Hệ màu (Cold Luxury navy)**

- Navy: `#041434`, `#0c2d6b`, `#1a56b0`
- Accent: `#3d7dd6`, `#6b9fe8`
- Mist / nền nhạt: `#D0D9E1`

**Đặc điểm UI**

- Home, Shop, Contact, About, PDP đã redesign (namespace CSS `.home-taste`, `.shop-taste`, `.pdp-taste`, `.about-taste`, `.contact-taste`)
- Hero carousel: overlay tối, chữ sáng (giống dark mode) trên cả light/dark; nền khối slide màu mist `#D0D9E1`
- Animation chữ slide: fade + trượt từ trái theo từng dòng
- Welcome slideshow: đổi ảnh ~2.8s, hiện trên mọi kích thước màn hình
- PDP mobile: chống tràn ngang, nút giỏ + wishlist khít màn hẹp

Có bản backup UI tại `backups/` (home, contact, shop, shop-single, about).

---

## 9. Thành phần client quan trọng

| Component | Vai trò |
|---|---|
| `Header` / `Footer` | Điều hướng, giỏ, wishlist |
| `WelcomeVisual` | Slideshow welcome |
| `HeroCarousel` | Slide thương hiệu + ảnh |
| `ImageSlider` | Gallery chi tiết sản phẩm |
| `CartPopup` / `CheckoutModal` | Giỏ và thanh toán |
| `PayPalButton` / `PayPalFallback` | Thanh toán |
| `Reveal` | Scroll-in |
| `HomeSection` | Section có ảnh nền |

---

## 10. Bảo mật & cấu hình môi trường

Cần biến môi trường (không commit secret):

- `DATABASE_URL` — PostgreSQL
- `EMAIL_USER` / `EMAIL_PASS` — Gmail App Password
- Client ID PayPal (qua PayPal Provider)

Lưu ý hiện tại:

- Giỏ hàng / wishlist lưu **localStorage** (chưa gắn user đăng nhập trên UI)
- Form liên hệ gửi tới địa chỉ cấu hình trong API
- Một số route test contact (`test`, `test-gmail`, `simple-test`) nên hạn chế trên production

---

## 11. Điểm mạnh

- Stack hiện đại, TypeScript, schema rõ ràng
- Catalog đá mỹ nghệ có seed theo từng nhóm ảnh
- UI thương hiệu thống nhất, đã tối ưu mobile cho PDP
- Thanh toán PayPal + liên hệ email đã tích hợp
- Có backup UI khi redesign

---

## 12. Hạn chế và hướng phát triển

| Hạn chế | Hướng xử lý gợi ý |
|---|---|
| Chưa có luồng đăng nhập / tài khoản khách trên UI | Auth (NextAuth hoặc tương đương), gắn User với giỏ & đơn |
| Giỏ hàng localStorage, chưa dùng model `CartItem` | Đồng bộ giỏ server khi đăng nhập |
| Đơn hàng trong schema chưa thấy trang quản trị / lịch sử đơn | Admin CRUD + trang “Đơn của tôi” |
| Route test email còn trong `api/contact` | Tắt hoặc bảo vệ bằng secret trên production |
| Bootstrap JS CDN + CSS custom có thể xung đột | Giữ component tự quản autoplay (đã áp dụng cho carousel) |

**Gợi ý tiếp theo**

1. Trang quản trị sản phẩm / đơn hàng  
2. Đăng nhập khách, lịch sử đơn  
3. SEO: metadata từng sản phẩm, sitemap  
4. Tối ưu ảnh Next/Image, CDN  
5. Kiểm thử E2E (Playwright) cho shop → giỏ → checkout  

---

## 13. Kết luận

Dự án **An Lạc Stone** là một cửa hàng Next.js hoàn chỉnh cho bán đá cảnh và mỹ nghệ: catalog, chi tiết sản phẩm, giỏ hàng, wishlist, liên hệ và PayPal. Phần giao diện đã được chỉnh theo identity navy/mist, slideshow trang chủ và trang chi tiết đã xử lý layout điện thoại. Phần dữ liệu (Prisma/PostgreSQL) sẵn sàng mở rộng sang tài khoản người dùng, quản trị đơn hàng và đồng bộ giỏ phía server.

---

*Tài liệu được lập từ mã nguồn `zay-shop-nextjs` tại thời điểm báo cáo.*
