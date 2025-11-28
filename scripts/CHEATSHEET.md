# 🚀 Testing Cheatsheet

## Quick Commands

```bash
# Start dev server (Terminal 1)
npm run dev

# Quick test - Otomatis (Terminal 2)
npm run test:sad-alert

# Interactive test - Pilih sendiri (Terminal 2)
npm run test:alert
```

## Interactive Test - Pilihan

### Pilih Emosi:
- **1** = 😔 Sedih/Tertekan (Priority: TINGGI)
- **2** = 😴 Mengantuk/Lelah (Priority: SEDANG)
- **3** = 🙂 Biasa Saja/Normal (Priority: RENDAH)

### Konfirmasi:
- **y** = Lanjutkan testing
- **n** = Batalkan

## Expected Results

### ✅ Success
```
Status: ✅ SUCCESS
Alert Triggered: ✅ YA
Telegram Sent: ✅ YA
```

### ⚠️ Partial Success
```
Status: ✅ SUCCESS
Alert Triggered: ✅ YA
Telegram Sent: ❌ TIDAK
```
→ Check `.env.local` untuk `TELEGRAM_BOT_TOKEN` dan `TELEGRAM_CHAT_ID`

### ❌ Failed
```
Status: ❌ FAILED
```
→ Check dev server running: `npm run dev`

## Telegram Setup

```env
# .env.local
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=123456789
```

Get token: @BotFather di Telegram
Get chat ID: @userinfobot di Telegram

## Files

- `scripts/test-sad-alert.ts` - Quick test script
- `scripts/test-alert-interactive.ts` - Interactive test script
- `scripts/QUICK_START.md` - Quick start guide
- `scripts/README.md` - Full documentation
- `scripts/FINAL_TESTING_GUIDE.md` - Complete testing guide

## Docs

- `docs/TESTING_ALERT_PATTERNS.md` - Manual testing
- `docs/TELEGRAM_SETUP.md` - Telegram setup
- `docs/ENHANCED_ALERT_SYSTEM.md` - Alert system docs
