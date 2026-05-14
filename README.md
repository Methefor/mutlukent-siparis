# 📦 Mutlukent Sipariş Yönetimi v2

Mutlukent Esenlik Hizmetleri A.Ş. için çok şubeli sipariş yönetim uygulaması.

## Özellikler

- **9 Firma** — Öztürkler, Kadir Kasap, Atikler, Özgüllü, Manav, Şeref, Esenler, Altınbaşak, Depo
- **6 Şube** — Rumeli İskelesi, Vagon, Sahil, TunaBoyu 1-2, Millet Bahçesi
- **± Butonlar** — Mobil dostu, büyük dokunmatik kontroller
- **WhatsApp Hazır Mesaj** — Firma adı, tarih ve ürünler otomatik formatlanır
- **Sipariş Geçmişi** — Son 10 sipariş kaydedilir, tek tıkla yüklenir
- **Favori Siparişler** — Sık kullanılan siparişleri kaydedin (max 5)
- **Admin Paneli** — Tüm şubelerin siparişlerini filtreli görüntüleyin
- **Firebase Desteği** — Tüm şubeler arası gerçek zamanlı senkronizasyon (isteğe bağlı)
- **Offline Çalışır** — Firebase olmadan localStorage ile tam çalışma

## Hızlı Başlangıç

```bash
npm install
npm run dev
```

`http://localhost:5173` adresini açın.

## Firebase Kurulumu (Şubeler Arası Senkronizasyon)

1. [Firebase Console](https://console.firebase.google.com)'da yeni proje oluşturun
2. **Firestore Database** etkinleştirin
3. `.env.example` → `.env` kopyalayın ve Firebase bilgilerini doldurun
4. `firebase deploy --only firestore:rules` çalıştırın

Firebase yapılandırılmazsa uygulama cihaz hafızasıyla (localStorage) çalışır.

## Yayınlama

**Netlify (En Kolay):**
```bash
npm run build
# dist/ klasörünü https://app.netlify.com/drop adresine sürükleyip bırakın
```

**Firebase Hosting:**
```bash
npm run build
firebase deploy
```

## Admin Paneli

Header'daki **🔐 Admin** → PIN: `1234` (`.env` ile değiştirilebilir)

## WhatsApp Mesaj Formatı

```
*Rumeli İskelesi - Öztürkler*
📅 14 Mayıs 2026, Perşembe

🍟 Patates kızartması: 10 kg
🧀 Beyaz peynir: 2 kalıp
```

## Klasör Yapısı

```
src/
├── components/   # React bileşenleri
├── data/         # Firma ve şube verileri  
├── hooks/        # useOrders (Firebase/localStorage)
├── lib/          # Firebase + WhatsApp yardımcıları
├── store/        # Zustand durum yönetimi
└── types/        # TypeScript tipleri
```

## Stack

React 18 · TypeScript · Vite · Zustand · TailwindCSS · Firebase Firestore
