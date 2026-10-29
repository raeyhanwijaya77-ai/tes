# Toko Akun Rehan (final)

Stack: Next.js 15, React 19, Neon Postgres, Framer Motion, QRIS AriesPay. Deploy lewat GitHub dan Vercel.

Environment Variables di Vercel:
- DATABASE_URL (otomatis dari Neon)  WAJIB
- GMAIL_USER, GMAIL_APP_PASSWORD     WAJIB untuk OTP daftar dan lupa password
- JWT_SECRET                         disarankan (teks acak panjang)
- GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, SITE_URL   untuk login Google
- BLOB_READ_WRITE_TOKEN              opsional (foto tetap jalan tanpa Blob)

Diisi dari panel Admin: Merchant ID dan Secret Key AriesPay, biaya layanan, waktu bayar lelang, webhook Discord.
Webhook AriesPay: https://DOMAIN/api/webhook
Login owner: username admin_rehan atau Gmail owner (sang penguasa). Admin lain ditambah dari menu Admin.
