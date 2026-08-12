# Loop — Nhật ký chi tiêu

Loop là app cá nhân giúp bạn ghi lại chi tiêu/thu nhập hằng ngày, xem dashboard thống kê trực quan, đặt ngân sách theo danh mục, và xây thói quen ghi chép qua hệ thống streak + nhắc nhở. Tối ưu cho điện thoại và iPad, cài như một app thật (PWA) qua "Add to Home Screen" — không cần App Store.

Hướng dẫn dưới đây viết cho người **chưa từng dùng dòng lệnh (Terminal) hay GitHub**, làm theo từng bước là được — không cần hiểu code.

## Tính năng

- Ghi chi tiêu/thu nhập nhanh với bàn phím số, chọn danh mục bằng icon
- Dashboard: tổng chi/thu theo tháng, số dư, biểu đồ tròn theo danh mục, biểu đồ xu hướng 14 ngày
- Thống kê theo tháng và theo năm, so sánh với tháng trước
- Ngân sách theo từng danh mục, cảnh báo khi gần/vượt ngân sách
- Danh mục tuỳ chỉnh (thêm/sửa/xoá, chọn icon và màu)
- Streak — chuỗi ngày ghi chép liên tục, banner nhắc nhở nếu hôm nay chưa ghi
- Nhắc nhở cục bộ + push notification nâng cao (tuỳ chọn)
- Đồng bộ dữ liệu real-time giữa điện thoại và iPad qua Firebase
- Xuất dữ liệu CSV/JSON để sao lưu
- Chế độ sáng/tối, giao diện tối ưu cho di động và iPad, hỗ trợ tai thỏ/safe-area

## Tổng quan các bước

0. Cài công cụ cần thiết trên máy tính (một lần duy nhất)
1. Tạo dự án Firebase — nơi lưu dữ liệu của bạn
2. Chạy thử app trên máy tính
3. Đưa code lên GitHub
4. Bật GitHub Pages để có link app dùng được mọi lúc
5. Cài app lên điện thoại / iPad

---

## Bước 0: Cài công cụ cần thiết (chỉ làm 1 lần)

App này cần 2 công cụ để "dựng" lên: **Node.js** (chạy code) và **Terminal** (nơi gõ lệnh, máy Mac đã có sẵn).

### 0.1. Mở Terminal

Trên Mac: bấm **Cmd + Space** để mở Spotlight, gõ `Terminal`, nhấn Enter. Một cửa sổ màu đen/trắng có chữ hiện ra — đây là nơi bạn sẽ gõ các lệnh trong hướng dẫn này.

### 0.2. Cài Node.js

1. Vào [nodejs.org](https://nodejs.org).
2. Tải bản **LTS** (bản khuyến nghị, ổn định).
3. Mở file vừa tải (đuôi `.pkg`), bấm **Tiếp tục / Continue** liên tục cho đến khi cài xong, giống cài phần mềm bình thường.
4. Kiểm tra đã cài thành công: quay lại Terminal, gõ:
   ```bash
   node -v
   ```
   Nhấn Enter. Nếu hiện ra một dòng dạng `v20.x.x` là thành công. Nếu Terminal báo `command not found`, đóng Terminal lại, mở lại một cửa sổ mới rồi thử lại.

### 0.3. Kiểm tra Git (thường có sẵn trên Mac)

Gõ trong Terminal:
```bash
git -v
```
Nếu chưa có, macOS sẽ tự hiện hộp thoại hỏi cài **Xcode Command Line Tools** — bấm **Install** và đợi vài phút.

Sau bước này, bạn không cần cài thêm gì nữa.

---

## Bước 1: Tạo dự án Firebase (miễn phí, ~5 phút)

Firebase là dịch vụ của Google dùng để lưu trữ dữ liệu chi tiêu của bạn một cách an toàn và đồng bộ giữa các thiết bị.

1. Vào [console.firebase.google.com](https://console.firebase.google.com), đăng nhập bằng tài khoản Google.
2. Bấm **Add project** (hoặc **Tạo dự án**) → đặt tên, ví dụ `loop-expenses` → bấm tiếp cho đến khi tạo xong (có thể tắt Google Analytics nếu được hỏi, không bắt buộc).
3. Trong menu bên trái, vào **Build → Authentication** → bấm **Get started** → chọn tab **Sign-in method** → bấm **Email/Password** → bật công tắc ở dòng đầu tiên → **Save**. Đây là cách app dùng để đăng nhập: bạn tự đặt email + mật khẩu riêng, không cần tài khoản Google.
4. Vẫn trong menu bên trái, vào **Build → Firestore Database** → **Create database** → chọn **Start in production mode** → chọn khu vực gần bạn nhất, ví dụ `asia-southeast1 (Singapore)` → **Enable**.
5. Bấm biểu tượng **bánh răng ⚙️** ở góc trên bên trái → **Project settings**. Kéo xuống mục **Your apps**, bấm vào icon **`</>`** (Web). Đặt tên app (ví dụ `loop-web`) → **Register app**.
6. Firebase sẽ hiện ra một đoạn code như thế này — **giữ nguyên trang này**, bạn sẽ cần copy các giá trị ở bước 2:
   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "loop-expenses.firebaseapp.com",
     projectId: "loop-expenses",
     storageBucket: "loop-expenses.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef123456"
   };
   ```

---

## Bước 2: Chạy thử app trên máy tính

### 2.1. Mở đúng thư mục dự án trong Terminal

Mở Terminal (Cmd + Space → gõ `Terminal`), gõ chính xác dòng sau rồi nhấn Enter (lệnh `cd` = "vào thư mục"):

```bash
cd "/Users/lokipham/Downloads/Expenses Tracking/loop"
```

Terminal sẽ không hiện gì đặc biệt — nếu không có dòng báo lỗi màu đỏ là bạn đã "vào" đúng thư mục dự án.

### 2.2. Cài các thư viện cần thiết

Gõ:
```bash
npm install
```
Nhấn Enter. Lệnh này tải về các đoạn code có sẵn mà app cần dùng (giống như cài "phụ kiện"). Lần đầu sẽ mất khoảng 1–2 phút, bạn sẽ thấy chữ chạy liên tục — cứ để yên, đợi đến khi Terminal hiện lại dấu nhắc lệnh (con trỏ nhấp nháy) là xong. Không cần quan tâm các dòng chữ vàng "warning" (không phải lỗi).

### 2.3. Tạo file cấu hình `.env`

Đây là bước dán "chìa khoá" Firebase vào app. Gõ trong Terminal:
```bash
cp .env.example .env
```
Lệnh này tạo ra một file mới tên `.env` (sao chép từ file mẫu `.env.example`).

Bây giờ mở file đó lên để sửa. Cách dễ nhất — vẫn trong Terminal, gõ:
```bash
open -e .env
```
Lệnh này mở file `.env` bằng ứng dụng TextEdit có sẵn trên Mac. Bạn sẽ thấy nội dung như sau:

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_VAPID_KEY=
```

Quay lại tab Firebase ở **Bước 1.6**, copy từng giá trị và dán vào **ngay sau dấu `=`**, không có khoảng trắng, không có dấu ngoặc kép. Đối chiếu theo bảng sau:

| Trong file `.env`                    | Lấy giá trị nào trong `firebaseConfig` |
| ------------------------------------- | --------------------------------------- |
| `VITE_FIREBASE_API_KEY=`              | `apiKey`                                |
| `VITE_FIREBASE_AUTH_DOMAIN=`          | `authDomain`                            |
| `VITE_FIREBASE_PROJECT_ID=`           | `projectId`                             |
| `VITE_FIREBASE_STORAGE_BUCKET=`       | `storageBucket`                         |
| `VITE_FIREBASE_MESSAGING_SENDER_ID=`  | `messagingSenderId`                     |
| `VITE_FIREBASE_APP_ID=`               | `appId`                                 |

Dòng cuối `VITE_FIREBASE_VAPID_KEY=` để trống — chỉ cần nếu bạn muốn bật push notification nâng cao sau này (xem Bước 6).

Ví dụ sau khi điền xong, một dòng sẽ trông như:
```
VITE_FIREBASE_API_KEY=AIzaSyD1abc23XYZ456
```

Nhấn **Cmd + S** để lưu file, rồi đóng cửa sổ TextEdit lại.

### 2.4. Chạy app

Quay lại Terminal, gõ:
```bash
npm run dev
```
Sau vài giây, Terminal hiện một dòng dạng:
```
➜  Local:   http://localhost:5173/
```
Giữ phím **Cmd** và bấm chuột vào đường link đó (hoặc copy dán vào Chrome/Safari). Trang Loop sẽ hiện ra. Bấm tab **Tạo tài khoản**, nhập một email và mật khẩu bạn tự đặt (ít nhất 6 ký tự) rồi bấm **Tạo tài khoản** — nếu vào được tới màn hình chính là mọi thứ đã đúng. Đây cũng chính là email/mật khẩu bạn sẽ dùng để đăng nhập trên điện thoại/iPad sau này.

Để dừng app lại, quay vào Terminal và nhấn **Ctrl + C**.

> Mẹo: mỗi lần muốn mở lại app để thử, chỉ cần lặp lại bước 2.1 (`cd ...`) và 2.4 (`npm run dev`) — không cần làm lại 2.2/2.3.

### 2.5. Thiết lập quyền truy cập dữ liệu (Firestore Rules)

Quay lại [Firebase Console](https://console.firebase.google.com) → chọn project của bạn → **Build → Firestore Database → tab Rules**. Xoá hết nội dung đang có, mở file `firestore.rules` trong thư mục `loop` (double-click để mở bằng TextEdit), copy toàn bộ nội dung, dán vào ô Rules trên Firebase, rồi bấm **Publish**. Bước này đảm bảo chỉ bạn mới đọc/ghi được dữ liệu chi tiêu của mình.

---

## Bước 3: Đưa code lên GitHub

Có 2 cách — chọn 1 trong 2:

- **Cách A — GitHub Desktop (khuyên dùng, không cần gõ lệnh):** dễ hơn nhiều nếu bạn không quen Terminal.
- **Cách B — Terminal:** nhanh nếu bạn đã quen dòng lệnh.

### Cách A: Dùng GitHub Desktop (khuyên dùng)

1. Tạo tài khoản GitHub miễn phí tại [github.com/join](https://github.com/join) nếu chưa có.
2. Tải và cài **GitHub Desktop** tại [desktop.github.com](https://desktop.github.com).
3. Mở GitHub Desktop → đăng nhập bằng tài khoản GitHub vừa tạo.
4. Vào menu **File → Add local repository** → bấm **Choose...** → chọn thư mục `loop` (đường dẫn: `Downloads/Expenses Tracking/loop`).
5. GitHub Desktop sẽ báo "This directory does not appear to be a Git repository" → bấm **create a repository** (link màu xanh) → bấm **Create Repository**.
6. Ở góc dưới bên trái, ô "Summary" gõ `Khởi tạo Loop` → bấm **Commit to main**.
7. Bấm nút **Publish repository** ở thanh trên cùng. Đặt tên repo là `loop`, **bỏ tick** ô "Keep this code private" nếu bạn muốn dùng GitHub Pages miễn phí (repo public), rồi bấm **Publish Repository**.

Xong — code của bạn đã lên GitHub. Ghi nhớ tên tài khoản GitHub của bạn, sẽ dùng ở Bước 4.

### Cách B: Dùng Terminal

Trong Terminal (đã `cd` vào đúng thư mục `loop` như Bước 2.1), gõ lần lượt từng dòng, nhấn Enter sau mỗi dòng:

```bash
git config --global user.name "Tên của bạn"
git config --global user.email "email-cua-ban@gmail.com"
```
(2 dòng này chỉ cần làm 1 lần trên máy, để Git biết bạn là ai — có thể dùng email GitHub của bạn.)

```bash
git init
git add .
git commit -m "Khởi tạo Loop"
git branch -M main
```

Tiếp theo, vào [github.com/new](https://github.com/new) trên trình duyệt để tạo một repository trống: đặt **Repository name** là `loop`, để **Public**, **không tick** "Add a README file", bấm **Create repository**. GitHub sẽ hiện ra một trang có đoạn `https://github.com/<ten-tai-khoan>/loop.git` — copy đường dẫn đó.

Quay lại Terminal:
```bash
git remote add origin https://github.com/<ten-tai-khoan>/loop.git
git push -u origin main
```
(nhớ thay `<ten-tai-khoan>` bằng tên tài khoản GitHub thật của bạn). Lần đầu push, GitHub sẽ mở trình duyệt yêu cầu đăng nhập/xác nhận — làm theo hướng dẫn trên màn hình là được.

---

## Bước 4: Bật GitHub Pages (để có link app dùng mọi lúc)

1. Trên trang GitHub của repo `loop`, vào tab **Settings** → menu bên trái chọn **Pages**.
2. Ở mục **Build and deployment → Source**, chọn **GitHub Actions**.
3. Vẫn trong **Settings**, menu bên trái chọn **Secrets and variables → Actions** → bấm **New repository secret**. Thêm lần lượt **6 secret** sau — mỗi secret gõ đúng **Name** rồi dán **Value** lấy từ file `.env` bạn đã điền ở Bước 2.3 (mở lại bằng `open -e .env` nếu cần xem lại):

   | Name (gõ đúng như vậy) | Value |
   | --- | --- |
   | `VITE_FIREBASE_API_KEY` | giá trị `apiKey` |
   | `VITE_FIREBASE_AUTH_DOMAIN` | giá trị `authDomain` |
   | `VITE_FIREBASE_PROJECT_ID` | giá trị `projectId` |
   | `VITE_FIREBASE_STORAGE_BUCKET` | giá trị `storageBucket` |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | giá trị `messagingSenderId` |
   | `VITE_FIREBASE_APP_ID` | giá trị `appId` |

   Sau mỗi secret bấm **Add secret**, rồi lặp lại cho secret tiếp theo.

4. Vào tab **Actions** ở trên cùng của repo — bạn sẽ thấy một quy trình (workflow) đang chạy hoặc đã chạy xong (dấu tick xanh ✅). Đợi khoảng 1–2 phút để nó hoàn tất.
5. Link app của bạn sẽ có dạng: `https://<ten-tai-khoan>.github.io/loop/` — vào lại **Settings → Pages** để xem link chính xác.

Từ giờ, mỗi khi bạn sửa code và "push" (hoặc dùng GitHub Desktop bấm **Push origin**), trang web sẽ tự cập nhật sau 1–2 phút — không cần làm lại các bước trên.

---

## Bước 5: Cài app lên điện thoại / iPad như một app thật

**iPhone / iPad (Safari):**
Mở link app (từ Bước 4.5) trong **Safari** → bấm nút **Share** (hình vuông có mũi tên đi lên) → cuộn xuống chọn **Add to Home Screen** → **Add**. Icon Loop sẽ xuất hiện trên màn hình chính, mở lên sẽ chạy toàn màn hình như app thật.

**Android (Chrome):**
Mở link app → bấm menu (⋮) ở góc trên → **Add to Home screen** / **Install app**.

> Lưu ý quan trọng cho iOS: Safari chỉ cho phép gửi thông báo (notification) sau khi app đã được "Add to Home Screen" và bạn mở app **từ icon trên màn hình chính** (không phải mở lại từ Safari). Vì vậy hãy cài app trước, sau đó vào **Cài đặt → Nhắc trong app** để bật nhắc nhở.

---

## Bước 6: Về tính năng nhắc nhở (tuỳ chọn nâng cao)

Loop có 2 lớp nhắc nhở:

1. **Nhắc trong app (mặc định, luôn hoạt động, không cần làm gì thêm):** banner trong app + thông báo cục bộ tại giờ bạn chọn, miễn là app đang mở (kể cả chạy nền).
2. **Push nâng cao — nhắc kể cả khi đã đóng hẳn app (tuỳ chọn, cần thêm vài bước kỹ thuật):**
   - Trong **Firebase Console → Project settings (⚙️) → tab Cloud Messaging → mục Web configuration**, bấm **Generate key pair** để tạo **VAPID key**. Copy giá trị đó, dán vào dòng `VITE_FIREBASE_VAPID_KEY=` trong file `.env`, và thêm làm secret `VITE_FIREBASE_VAPID_KEY` trên GitHub (như Bước 4.3).
   - Bật gói **Blaze** (pay-as-you-go) cho project Firebase trong Console — vẫn miễn phí trong mức sử dụng cá nhân, nhưng Google yêu cầu liên kết thẻ để dùng tính năng gửi thông báo theo lịch. Sau đó trong Terminal (đã `cd` vào thư mục `loop`):
     ```bash
     npm install -g firebase-tools
     firebase login
     firebase use --add
     cd functions
     npm install
     cd ..
     firebase deploy --only functions
     ```
   Nếu bạn không muốn làm bước này, không sao cả — lớp nhắc nhở #1 vẫn đảm bảo bạn không quên ghi chép mỗi khi mở app.

---

## Cấu trúc dự án

```
src/
  components/     Các thành phần UI dùng chung (biểu đồ, thẻ, bottom nav, modal thêm giao dịch...)
  context/        AuthContext (đăng nhập) và DataContext (dữ liệu real-time từ Firestore)
  hooks/          useReminder (nhắc nhở), useTheme (sáng/tối)
  lib/            Kết nối Firebase, truy vấn Firestore, tính toán thống kê, định dạng số liệu
  pages/          Home, Transactions, Stats, Budgets, Categories, Settings, Login
functions/        Cloud Function tuỳ chọn để gửi push khi app đã đóng
```

## Công nghệ sử dụng

React + TypeScript + Vite, Tailwind CSS, Firebase (Authentication, Firestore, Cloud Messaging), Recharts, vite-plugin-pwa.

## Khắc phục sự cố thường gặp

- **`command not found: npm` hoặc `node`:** Node.js chưa được cài hoặc Terminal chưa nhận — làm lại Bước 0.2, sau đó **đóng hẳn Terminal và mở lại cửa sổ mới**.
- **Trang trắng / lỗi "Chưa cấu hình Firebase":** kiểm tra lại file `.env` (khi chạy local) hoặc Secrets trên GitHub (khi đã deploy) đã điền đủ 6 giá trị chưa, không có khoảng trắng thừa.
- **Không thấy dữ liệu đồng bộ giữa 2 thiết bị:** đảm bảo bạn đăng nhập **cùng một email/mật khẩu** trên cả điện thoại và iPad.
- **Quên mật khẩu:** ở màn hình đăng nhập, bấm **Quên mật khẩu?**, nhập email đã dùng để tạo tài khoản — Firebase sẽ gửi email đặt lại mật khẩu.
- **Không nhận được thông báo trên iPhone:** phải "Add to Home Screen" trước, mở app từ icon trên màn hình chính (không phải từ Safari), rồi mới bật nhắc nhở trong Cài đặt.
- **`npm install` báo lỗi đỏ (error):** thử xoá thư mục `node_modules` (nếu có) rồi chạy lại `npm install`; hoặc kiểm tra đã `cd` đúng vào thư mục `loop` chưa (gõ `pwd` trong Terminal để xem đường dẫn hiện tại).
