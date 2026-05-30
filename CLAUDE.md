# Benim Masalım — Proje Dokümantasyonu

## Proje Özeti
Türkçe AI destekli çocuk masalı uygulaması. Ebeveynler çocukları için 
kişiselleştirilmiş uyku masalları oluşturabilir, sesli dinleyebilir ve 
favorilerine kaydedebilir.

## Teknik Stack
- **Frontend:** React Native + Expo SDK 54
- **Backend:** Supabase (Auth + PostgreSQL)
- **AI Masal:** Anthropic Claude claude-sonnet-4-5
- **TTS:** Gemini 2.5 Flash TTS (eleven_multilingual_v2 kaldırıldı)
- **Navigation:** React Navigation v6
- **Animasyon:** Lottie (loading ekranı)

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
│   ├── sarah.mp3            # Kadın sesi örneği (ElevenLabs default)
│   └── adam.mp3             # Erkek sesi örneği (ElevenLabs default)
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

## Ses Mimarisi
- Gemini TTS ile ses üretimi (kadın: Kore, erkek: Charon)
- Üretilen sesler cihaza lokal olarak kaydediliyor (expo-file-system/legacy)
- Aynı masal ikinci kez seslendirilmiyor — kredi tasarrufu
- Ses dosyaları: {storyId}_{voice}.wav formatında documentDirectory'de

## Masal Üretim Sistemi
- Claude claude-sonnet-4-5 ile Türkçe masal üretimi
- Emotion Tags sistemi: [whispering], [sigh], [laughing], [short pause], 
  [medium pause], [long pause], [shouting]
- Etiketler ekranda gösterilmiyor, sadece TTS'e gönderiliyor
- storyForDisplay (etiket temizlenmiş) ekranda gösterilir
- storyRaw (etiketli) Gemini TTS'e gönderilir

## Gemini TTS Sesleri
- Kadın: Kore
- Erkek: Charon
- Model: gemini-2.5-flash-preview-tts
- Format: PCM → WAV dönüşümü yapılıyor (24000 Hz, 16-bit, mono)

## Renk Paleti
bg: '#0A0E1A'         // Koyu gece mavisi
card: '#111827'       // Kart arka planı
accent: '#7C6AF7'     // Mor vurgu
gold: '#F5A623'       // Altın sarısı
white: '#FFFFFF'      // Beyaz metin
muted: '#8892A4'      // Soluk metin
cardBorder: '#1E2433' // Kart border

## İş Modeli
- Ücretsiz: Günde 3 masal, ses yok
- Premium: Sınırsız masal + ayda 15 sesli masal
- Önerilen fiyat: 199 TL/ay
- Maliyet/kullanıcı: ~$4.50/ay (15 sesli masal)

## Yapılacaklar (TODO)
- [ ] Gemini TTS tam entegrasyonu (ElevenLabs kaldır)
- [ ] Erkek/kadın ses seçimini Gemini seslerine bağla
- [ ] Freemium model (günde 3 ücretsiz masal limiti)
- [ ] RevenueCat abonelik entegrasyonu
- [ ] App Store / Google Play yayını
- [ ] Google OAuth
- [ ] Push notification (uyku vakti hatırlatıcı)
- [ ] Türkçe ses kalitesi testi (Kore vs Charon)

## Önemli Notlar
- Expo SDK 54 kullanılıyor (Expo Go uyumlu)
- Node.js v24 ile uyumlu
- iOS test cihazı üzerinde geliştiriliyor
- Supabase RLS aktif
- .env dosyası .gitignore'da, GitHub'a gitmiyor
