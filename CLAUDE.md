@AGENTS.md
# Benim Masalım — Proje Dokümantasyonu

## Proje Özeti
Türkçe AI destekli çocuk masalı uygulaması. Ebeveynler çocukları için kişiselleştirilmiş uyku masalları oluşturabilir, sesli dinleyebilir ve favorilerine kaydedebilir.

## Teknik Stack
- **Frontend:** React Native + Expo SDK 54
- **Backend:** Supabase (Auth + PostgreSQL + Storage)
- **AI Masal:** Anthropic Claude claude-sonnet-4-5
- **TTS:** ElevenLabs (eleven_multilingual_v2)
- **Navigation:** React Navigation v6

## Proje Yapısı
BenimMasalim/
├── App.js                    # Navigation container, auth state
├── lib/
│   └── supabase.js          # Supabase client
├── screens/
│   ├── AuthScreen.js        # Giriş/Kayıt ekranı
│   ├── HomeScreen.js        # Ana ekran, masal oluşturma
│   ├── StoryScreen.js       # Masal okuma + sesli dinleme
│   └── FavoritesScreen.js   # Favori masallar
├── assets/
│   ├── loading.json         # Lottie animasyonu
│   ├── sarah.mp3            # Kadın sesi örneği
│   └── adam.mp3             # Erkek sesi örneği
└── .env                     # API anahtarları (git'e eklenmez)

## Environment Variables (.env)
EXPO_PUBLIC_ANTHROPIC_API_KEY=
EXPO_PUBLIC_ELEVENLABS_API_KEY=
EXPO_PUBLIC_ELEVENLABS_VOICE_FEMALE=EXAVITQu4vr4xnSDxMaL
EXPO_PUBLIC_ELEVENLABS_VOICE_MALE=pNInz6obpgDQGcFmaJgB
EXPO_PUBLIC_SUPABASE_URL=https://nlltfdioclfqwbgffcep.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=

## Supabase Şeması
### profiles tablosu
- id (uuid, FK auth.users)
- email (text)
- created_at (timestamp)
- story_count (integer, default 0)
- is_premium (boolean, default false)

### stories tablosu
- id (uuid, primary key)
- user_id (uuid, FK auth.users)
- title (text)
- content (text)
- age_group (text)
- themes (text[])
- voice (text)
- is_favorite (boolean, default false)
- audio_url_female (text)
- audio_url_male (text)
- created_at (timestamp)

## Renk Paleti
bg: '#0A0E1A'        // Koyu gece mavisi
card: '#111827'      // Kart arka planı
accent: '#7C6AF7'    // Mor vurgu
gold: '#F5A623'      // Altın sarısı
white: '#FFFFFF'     // Beyaz metin
muted: '#8892A4'     // Soluk metin
cardBorder: '#1E2433' // Kart border

## Önemli Kararlar
- Expo SDK 54 kullanılıyor (Expo Go uyumlu)
- Ses dosyaları lokale kaydediliyor (expo-file-system/legacy)
- Supabase RLS aktif, kullanıcılar sadece kendi verilerini görebilir
- Claude sistem prompt'u ile masal kalitesi artırılmış
- Loading ekranı için Lottie animasyonu kullanılıyor

## Yapılacaklar (TODO)
- [ ] Freemium model (günde 3 ücretsiz masal)
- [ ] RevenueCat abonelik entegrasyonu
- [ ] App Store / Google Play yayını
- [ ] Google OAuth
- [ ] Push notification (uyku vakti hatırlatıcı)
- [ ] Türkçe ElevenLabs sesleri (Starter plan gerekiyor)