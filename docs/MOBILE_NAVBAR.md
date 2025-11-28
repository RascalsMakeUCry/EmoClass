# Mobile Navbar Implementation

## Overview
Mobile navbar yang sticky di bagian atas layar untuk meningkatkan UX di perangkat mobile.

## Layout Mobile Navbar

```
┌─────────────────────────────────────┐
│  ☰    [Logo EmoClass]    👨‍🏫      │
│ Menu                      Profile   │
└─────────────────────────────────────┘
```

### Komponen:
1. **Kiri**: Hamburger menu (☰) - toggle sidebar
2. **Tengah**: Logo EmoClass
3. **Kanan**: Avatar profile dengan dropdown menu

## Features

### 1. Sticky Positioning
- Navbar tetap di atas saat scroll
- `position: fixed` dengan `z-index: 50`
- Hanya tampil di mobile (`lg:hidden`)

### 2. Hamburger Menu
- Toggle sidebar on/off
- Animasi smooth transition
- Icon berubah dari Menu ke X saat sidebar terbuka

### 3. Logo
- Logo EmoClass di tengah
- Clickable - mengarah ke /dashboard
- Responsive sizing (h-8)
- Centered dengan flexbox
- Hover effect (opacity-80)
- Focus ring untuk accessibility

### 4. Profile Menu
- Avatar dengan gradient background
- Dropdown menu dengan:
  - Nama user
  - Role (Guru EmoClass)
  - Logout button
- Auto-close saat klik di luar

## File Structure

```
components/
├── MobileNavbar.tsx       # Mobile navbar component
├── Sidebar.tsx            # Updated untuk support external control
└── ConditionalLayout.tsx  # Orchestrator untuk navbar + sidebar
```

## Implementation Details

### MobileNavbar.tsx
- Fetch user data dari `/api/me`
- Handle profile dropdown state
- Logout functionality
- Spacer untuk prevent content overlap

### Sidebar.tsx Updates
- Support `isMobileOpen` prop untuk external control
- Support `onMobileClose` callback
- Removed internal mobile menu button (diganti dengan MobileNavbar)

### ConditionalLayout.tsx Updates
- State management untuk mobile sidebar
- Koordinasi antara MobileNavbar dan Sidebar
- Hanya tampil di halaman dengan sidebar (bukan /login atau /admin)

## Responsive Behavior

### Mobile (< 1024px)
- MobileNavbar tampil di atas (sticky)
- Sidebar slide dari kiri saat hamburger diklik
- Overlay backdrop saat sidebar terbuka

### Desktop (≥ 1024px)
- MobileNavbar hidden
- Sidebar always visible
- No overlay needed

## Usage

Tidak perlu setup tambahan! Fitur ini otomatis aktif di semua halaman yang menggunakan sidebar (dashboard, reports, notifications, dll).

## Testing

1. Buka aplikasi di mobile atau resize browser < 1024px
2. Navbar sticky harus tampil di atas
3. Klik hamburger menu → sidebar slide in
4. Klik profile → dropdown menu muncul
5. Klik logout → redirect ke /login

## Styling

- Menggunakan Tailwind CSS
- Gradient background untuk avatar
- Shadow dan border untuk depth
- Smooth transitions dan animations
- Consistent dengan design system yang ada

## Fixed Issues

### Overlap Prevention
1. **Main Content**: Tambah `pt-[57px]` di mobile untuk prevent overlap dengan navbar
2. **Sidebar**: 
   - Position `top-[57px]` saat terbuka di mobile
   - Height `h-[calc(100vh-57px)]` untuk fit dengan navbar
3. **Overlay**: Position `top-[57px]` agar tidak menutupi navbar

### Height Calculation
- Mobile navbar height: 57px (py-3 + border)
- Sidebar di mobile: `calc(100vh - 57px)`
- Main content padding top: 57px di mobile, 0 di desktop

### UI Improvements
1. **Profile Icon**: Menggunakan User icon dari lucide-react (bukan emoji)
2. **DashboardHeader**: Profile section disembunyikan di mobile (`hidden lg:flex`) karena sudah ada di navbar
3. **Consistency**: Avatar gradient sama di navbar dan desktop header

### Animation Improvements
1. **Sidebar Slide**: 
   - Slide dari kiri ke kanan saat dibuka (`translate-x-0`)
   - Slide dari kanan ke kiri saat ditutup (`-translate-x-full`)
   - Menggunakan `cubic-bezier(0.4, 0, 0.2, 1)` untuk smooth easing
   - Duration: 400ms untuk animasi yang terlihat jelas dan smooth
   - Explicit `transitionProperty: 'transform'` untuk avoid conflict dengan global CSS
2. **Overlay Fade**: Backdrop menggunakan `animate-fadeInFast` untuk fade in effect
3. **Transition**: Hanya transform yang di-animate untuk performa optimal

## Troubleshooting

### Animasi tidak terlihat smooth atau tidak ada
1. **Hard refresh browser**: Tekan Ctrl+Shift+R (Windows) atau Cmd+Shift+R (Mac)
2. **Restart dev server**: Stop dan start ulang `npm run dev`
3. **Clear browser cache**: Buka DevTools > Network > Disable cache
4. **Check responsive mode**: Pastikan browser dalam mode mobile (< 1024px width)
