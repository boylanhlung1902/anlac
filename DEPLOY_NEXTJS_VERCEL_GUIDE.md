# Hướng dẫn Deploy Next.js 14 lên Vercel + Gắn Domain đã mua

**Mục tiêu:** Deploy web app Next.js 14 (có API routes) đang chạy local lên Vercel, sau đó gắn với domain đã mua sẵn.

**Lý do chọn Vercel:** Vercel là nền tảng do chính team Next.js phát triển → hỗ trợ tốt nhất cho SSR, API routes, serverless functions; auto SSL (HTTPS) miễn phí; CI/CD tự động khi push code; free tier đủ dùng cho dự án nhỏ/vừa không cần WebSocket hay server chạy liên tục (đúng với mô tả app của bạn).

---

## Bước 0: Checklist trước khi bắt đầu

- [ ] Code Next.js 14 chạy OK ở local (`npm run dev` hoặc `yarn dev`)
- [ ] Có tài khoản GitHub (hoặc GitLab/Bitbucket)
- [ ] Có tài khoản Vercel (đăng ký free tại https://vercel.com, nên dùng "Continue with GitHub" để liên kết luôn)
- [ ] Có quyền truy cập trang quản lý domain (DNS) ở nơi bạn mua domain
- [ ] Danh sách biến môi trường (API keys, DB URL, v.v.) app đang dùng trong file `.env.local`

---

## Bước 1: Chuẩn bị code trước khi deploy

1. Kiểm tra file `.gitignore` đã loại trừ:
   ```
   .env
   .env.local
   node_modules
   .next
   ```
2. Build thử ở local để chắc chắn không lỗi:
   ```bash
   npm run build
   ```
   Nếu `npm run build` fail, phải fix trước — Vercel build theo đúng lệnh này.
3. Ghi lại toàn bộ biến môi trường (`process.env.XXX`) mà project đang dùng — bạn sẽ cần khai báo lại trên Vercel (không tự copy file `.env.local` lên).

---

## Bước 2: Đẩy code lên Git repository

Nếu code chưa có trên GitHub:

```bash
cd duong-dan-toi-project-nextjs
git init
git add .
git commit -m "Initial commit"
```

Tạo repo mới trên https://github.com/new (để **Private** nếu code có thông tin nhạy cảm), sau đó:

```bash
git remote add origin https://github.com/<username>/<ten-repo>.git
git branch -M main
git push -u origin main
```

> Nếu bạn dùng GitLab thay vì GitHub, thao tác tương tự — Vercel hỗ trợ cả hai.

---

## Bước 3: Import project vào Vercel

1. Vào https://vercel.com/new
2. Chọn **Import Git Repository**, chọn đúng repo vừa push
3. Vercel tự nhận diện **Framework Preset = Next.js** (giữ nguyên, không cần sửa)
4. Mục **Build and Output Settings**: để mặc định (`next build`, output tự quản lý)
5. Mục **Environment Variables**: thêm từng biến môi trường đã ghi ở Bước 1
   - Key = tên biến (ví dụ `DATABASE_URL`)
   - Value = giá trị thật
   - Chọn áp dụng cho cả `Production`, `Preview`, `Development` (hoặc tùy chỉnh riêng cho production)
6. Nhấn **Deploy**

Vercel sẽ build và cấp cho bạn 1 domain tạm miễn phí dạng:
```
https://<ten-project>.vercel.app
```

7. Mở link đó, kiểm tra app chạy đúng — **đặc biệt test các API routes** (gọi thử các endpoint `/api/...`) để chắc backend hoạt động đúng trên môi trường production, không chỉ local.

---

## Bước 4: Gắn domain đã mua vào project Vercel

1. Trong project trên Vercel, vào tab **Settings → Domains**
2. Nhập domain của bạn (ví dụ `example.com`) → **Add**
3. Vercel sẽ hiện ra **1 trong 2 cách cấu hình DNS** (tùy bạn dùng domain gốc `example.com` hay subdomain `www.example.com`):

### Cách A — Domain gốc (`example.com`)
Vercel yêu cầu thêm bản ghi **A record**:
```
Type:  A
Name:  @ (hoặc để trống, tùy registrar)
Value: 76.76.21.21
```
*(Vercel sẽ hiển thị giá trị IP chính xác tại thời điểm bạn add domain — dùng đúng giá trị đó, có thể khác số trên)*

### Cách B — Subdomain (`www.example.com`)
Thêm bản ghi **CNAME**:
```
Type:  CNAME
Name:  www
Value: cname.vercel-dns.com
```

> **Khuyến nghị:** add cả 2 — domain gốc (A record) và `www` (CNAME) — rồi set 1 trong 2 làm "primary", Vercel tự redirect cái còn lại.

---

## Bước 5: Vào trang quản lý DNS của nhà cung cấp domain và trỏ bản ghi

Do bạn chưa xác định rõ nơi mua domain, dưới đây là vị trí cấu hình DNS ở các nhà cung cấp phổ biến — cách làm tương tự nhau (khác tên menu):

| Nhà cung cấp | Vị trí cấu hình DNS |
|---|---|
| GoDaddy | My Products → domain → **DNS** → Manage Zone File |
| Namecheap | Domain List → Manage → **Advanced DNS** |
| PA Vietnam / Tenten / Nhân Hòa | Quản lý Domain → **Quản lý DNS / DNS Zone** |
| Cloudflare (nếu domain trỏ qua CF) | Chọn domain → **DNS → Records** |
| Google Domains / Squarespace | Domain → **DNS settings** |

**Thao tác chung:**
1. Xóa bản ghi A/CNAME cũ đang trỏ về `@` hoặc `www` (nếu có, ví dụ bản ghi "parking page" mặc định của registrar)
2. Thêm bản ghi A và CNAME theo đúng giá trị Vercel cung cấp ở Bước 4
3. Lưu lại

> Nếu domain đang dùng **Cloudflare** làm DNS proxy: tắt proxy (chọn mây màu xám, không phải cam "Proxied") cho bản ghi trỏ tới Vercel, để tránh xung đột SSL.

---

## Bước 6: Chờ DNS propagate và xác minh

1. Quay lại Vercel → **Settings → Domains**, trạng thái sẽ chuyển từ "Invalid Configuration" → **"Valid Configuration"** (có thể mất **vài phút đến 24-48 giờ** để DNS lan truyền toàn cầu, thường là 15-30 phút)
2. Kiểm tra bằng lệnh:
   ```bash
   nslookup example.com
   ```
   hoặc dùng https://dnschecker.org để xem DNS đã cập nhật ở các vùng
3. Vercel tự động cấp **SSL certificate (HTTPS)** miễn phí qua Let's Encrypt ngay khi DNS đúng — không cần làm gì thêm

---

## Bước 7: Kiểm tra lần cuối

- [ ] Truy cập `https://example.com` → app load đúng, có khóa HTTPS
- [ ] Test các trang chính và toàn bộ API routes (`/api/...`) trên domain thật
- [ ] Kiểm tra redirect từ `http://` → `https://` tự động (Vercel làm sẵn)
- [ ] Kiểm tra redirect giữa `www` và non-`www` theo ý bạn chọn
- [ ] Nếu có form/login dùng cookie, kiểm tra cookie domain không bị lỗi do đổi domain

---

## Bước 8: Từ nay về sau — deploy tự động (CI/CD)

Vercel đã tự thiết lập: mỗi lần bạn `git push` lên nhánh `main`, Vercel **tự build và deploy lại production**, không cần làm lại các bước trên. Push lên nhánh khác sẽ tạo "Preview Deployment" riêng để test trước khi merge.

---

## Xử lý sự cố thường gặp

| Vấn đề | Nguyên nhân thường gặp |
|---|---|
| Domain báo "Invalid Configuration" lâu | DNS chưa propagate, hoặc còn bản ghi A/CNAME cũ chưa xóa |
| API routes lỗi 500 trên production nhưng chạy OK ở local | Thiếu biến môi trường trên Vercel (Bước 3.5), hoặc dùng `fs`/file system local không chạy được trên serverless |
| App chạy local OK nhưng build lỗi trên Vercel | Khác version Node — set **Node.js Version** trong Settings → General → Node.js Version cho khớp local |
| SSL không lên (vẫn "Not Secure") | Cloudflare proxy đang che DNS thật — tắt proxy (xem Bước 5) |
| Build timeout/API route timeout | Free tier Vercel giới hạn 10s/function — nếu API xử lý lâu cần nâng plan hoặc tối ưu logic |
