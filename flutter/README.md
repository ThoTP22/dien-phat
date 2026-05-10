# KTV App - Ứng dụng Kỹ thuật viên Điện Phát

Ứng dụng Flutter dành cho kỹ thuật viên (KTV) của cửa hàng Điện Phát. Cho phép xem, quản lý phiếu sửa chữa được phân công và nhận thông báo qua Firebase Cloud Messaging.

---

## Tính năng

- Đăng nhập bằng tài khoản kỹ thuật viên
- Xem danh sách phiếu đang xử lý và đã hoàn thành
- Xem chi tiết phiếu: thông tin khách hàng, sản phẩm, mô tả lỗi, ghi chú
- Cập nhật trạng thái phiếu kèm ghi chú nội bộ
- Gọi điện trực tiếp cho khách hàng
- Nhận push notification khi có phiếu mới (FCM)
- Pull-to-refresh danh sách

---

## Yêu cầu

- Flutter SDK >= 3.19.0
- Dart >= 3.3.0
- Tài khoản Firebase (để nhận push notification)

---

## Cài đặt

### 1. Khởi tạo project Flutter

Nếu chưa có project Flutter, chạy lệnh sau trong thư mục gốc:

```bash
flutter create ktv_app --org com.dienphat --platforms android,ios
```

Sau đó copy toàn bộ thư mục `lib/`, `assets/` và file `pubspec.yaml` này vào project vừa tạo.

Hoặc nếu đã có project, chạy:

```bash
flutter pub get
```

### 2. Cấu hình API URL

Mở `lib/core/constants.dart` và sửa `apiBaseUrl` thành URL backend thực tế:

```dart
static const String apiBaseUrl = 'https://your-backend.onrender.com/api/v1';
```

### 3. Cấu hình Firebase

**Bước 1:** Tạo project Firebase tại https://console.firebase.google.com

**Bước 2:** Thêm app Android và iOS vào project Firebase

**Bước 3:** Tải file cấu hình và đặt vào đúng vị trí:
- Android: `android/app/google-services.json`
- iOS: `ios/Runner/GoogleService-Info.plist`

**Bước 4:** Cập nhật `android/app/build.gradle`:

```gradle
plugins {
    id 'com.android.application'
    id 'com.google.gms.google-services'  // Thêm dòng này
}
```

**Bước 5:** Cập nhật `android/build.gradle`:

```gradle
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.4.0'  // Thêm dòng này
    }
}
```

### 4. Quyền thông báo Android

Thêm vào `android/app/src/main/AndroidManifest.xml` trong thẻ `<manifest>`:

```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
<uses-permission android:name="android.permission.VIBRATE"/>
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
```

---

## Chạy ứng dụng

```bash
# Development
flutter run

# Build APK Android
flutter build apk --release

# Build iOS (cần macOS + Xcode)
flutter build ios --release
```

---

## Cấu trúc thư mục

```
lib/
├── main.dart                    # Entry point, routing
├── core/
│   ├── api_client.dart          # Dio HTTP client + auth interceptor
│   ├── constants.dart           # API URL, status labels, colors
│   └── theme.dart               # Material theme
├── models/
│   ├── repair_ticket.dart       # Model phiếu sửa chữa
│   └── user.dart                # Model người dùng
├── providers/
│   ├── auth_provider.dart       # State xác thực
│   └── ticket_provider.dart    # State danh sách phiếu
├── screens/
│   ├── splash_screen.dart       # Splash + kiểm tra auth
│   ├── login_screen.dart        # Đăng nhập
│   ├── ticket_list_screen.dart  # Danh sách phiếu (2 tab)
│   └── ticket_detail_screen.dart # Chi tiết + cập nhật trạng thái
└── services/
    ├── auth_service.dart        # API auth
    ├── ticket_service.dart      # API phiếu sửa chữa
    └── notification_service.dart # FCM + local notifications
```

---

## Lưu ý backend

Để backend gửi push notification cho KTV khi có phiếu mới:

1. Backend cần lưu FCM token của từng KTV (thêm trường `fcmToken` vào User model)
2. Khi tạo/phân công phiếu, backend gọi FCM API để gửi notification
3. FCM token được lấy bằng `NotificationService.getToken()` sau khi đăng nhập
4. Cần gửi token lên endpoint backend, ví dụ: `PUT /api/v1/users/me/fcm-token`

---

## Tài khoản test

Tạo tài khoản KTV bằng script backend:

```bash
cd backend
npm run seed:admin   # Tạo admin trước
```

Sau đó vào admin panel tạo tài khoản với role `technician`.
