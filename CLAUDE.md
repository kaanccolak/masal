# Benim Masalım — Proje Dokümantasyonu

## Proje Özeti
Türkçe AI destekli çocuk masalı uygulaması. Ebeveynler çocukları için kişiselleştirilmiş uyku masalları oluşturabilir, sesli dinleyebilir ve favorilerine kaydedebilir.

## Teknik Stack
- **Frontend:** React Native + Expo SDK 54
- **Backend:** Supabase (Auth + PostgreSQL)
- **AI Masal:** Anthropic Claude claude-sonnet-4-5
- **TTS:** Google Gemini 2.5 Flash Preview TTS
- **Navigation:** React Navigation v6
- **Animasyon:** Lottie (loading ekranı)
- **Build:** EAS Build

## Proje Yapısı
BenimMasalim/
├── App.js                    # Navigation container, auth state, splash screen
├── lib/
│   └── supabase.js          # Supabase client
├── screens/
│   ├── SplashScreen.js      # Açılış ekranı animasyonu
│   ├── AuthScreen.js        # Giriş/Kayıt ekranı
│   ├── HomeScreen.js        # Ana ekran, masal oluşturma
│   ├── StoryScreen.js       # Masal okuma + sesli dinleme
│   ├── FavoritesScreen.js   # Favori masallar
│   └── ProfileScreen.js     # Profil, ayarlar, hesap işlemleri
├── assets/
│   ├── loading.json         # Lottie animasyonu
│   ├── benimmasalim_logo.png # Uygulama ikonu
│   ├── sulafat.wav          # Kadın sesi önizleme
│   └── enceladus.wav        # Erkek sesi önizleme
├── privacy-policy.html      # Gizlilik politikası
├── store-description.md     # Market açıklamaları
└── .env                     # API anahtarları (git'e eklenmez)

## Environment Variables (.env)
EXPO_PUBLIC_ANTHROPIC_API_KEY=
EXPO_PUBLIC_GEMINI_API_KEY=
EXPO_PUBLIC_SUPABASE_URL=https://nlltfdioclfqwbgffcep.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=

## Supabase Şeması
### profiles tablosu
- id (uuid, FK auth.users)
- email (text)
- created_at (timestamp)
- monthly_count (integer, default 0)
- is_premium (boolean, default false)
- device_id (text, unique)
- subscription_start_date (timestamp)

### stories tablosu
- id (uuid, primary key)
- user_id (uuid, FK auth.users)
- title (text)
- content (text)
- age_group (text)
- themes (text[])
- voice (text)
- is_favorite (boolean, default false)
- created_at (timestamp)

## Gemini TTS Sesleri
- Kadın: Sulafat
- Erkek: Enceladus
- Model: gemini-2.5-flash-preview-tts
- Format: PCM → WAV dönüşümü (24000 Hz, 16-bit, mono)
- Ses dosyaları lokale kaydediliyor (expo-file-system/legacy)

## Masal Üretim Sistemi
- Claude claude-sonnet-4-5 ile Türkçe masal üretimi
- Emotion Tags: [sigh], [laughing], [whispering], [short pause], [long pause]
- storyForDisplay (etiket temizlenmiş) ekranda gösterilir
- storyRaw (etiketli, başlık hariç) Gemini TTS'e gönderilir
- Masal uzunlukları: Kısa 350-400 kelime, Orta 550-600 kelime, Uzun 700-800 kelime

## Freemium Model
- Ücretsiz: Ayda 5 masal, sadece kısa boy
- Premium: Sınırsız masal, tüm uzunluklar
- Aylık plan: 149 TL/ay
- Yıllık plan: 999 TL/yıl
- Cihaz ID koruması (aynı cihazdan birden fazla hesap açılamaz)
- 30 günlük döngü (subscription_start_date bazlı)

## Renk Paleti
bg: '#0A0E1A'         // Koyu gece mavisi
card: '#111827'       // Kart arka planı
accent: '#7C6AF7'     // Mor vurgu
gold: '#F5A623'       // Altın sarısı
white: '#FFFFFF'      // Beyaz metin
muted: '#8892A4'      // Soluk metin
cardBorder: '#1E2433' // Kart border

## Store Bilgileri
- Bundle ID (iOS): com.benimmasalim.app
- Package (Android): com.benimmasalim.app
- Privacy Policy: https://kaanccolak.github.io/masal/privacy-policy.html
- Apple Developer: Pending (649 TL/yıl)
- Google Play Developer: Pending kimlik doğrulama

## Yapılacaklar (TODO)
- [ ] Apple Developer hesabı aktif olunca iOS build + App Store Connect
- [ ] Google Play onayı gelince uygulama + abonelik oluştur
- [ ] RevenueCat entegrasyonu (aylık 149 TL, yıllık 999 TL)
- [ ] Ekran görüntüleri (market için)
- [ ] Push notification (uyku vakti hatırlatıcı)
- [ ] Domain + custom email (benimmasalim.com.tr)

## Önemli Notlar
- Expo SDK 54, Node.js v24
- iOS test: Expo Go
- Android test: Preview APK (EAS Build)
- Supabase RLS aktif
- .env git'e gitmiyor
- Git geçmişi filter-branch ile temizlendi
