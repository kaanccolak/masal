import React, { useState, useEffect, useRef } from 'react';
import LottieView from 'lottie-react-native';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Switch,
  StyleSheet,
  Alert,
  StatusBar,
  Modal,
  Animated,
  Easing,
} from 'react-native';
import Constants from 'expo-constants';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { supabase } from '../lib/supabase';
import * as Device from 'expo-device';

// API anahtarı: önce app.json extra'ya, yoksa .env'e düşer
const ANTHROPIC_API_KEY =
  Constants.expoConfig?.extra?.anthropicApiKey ||
  process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

// ─────────────────────────────────────────────────────────────────────────────
// RENK PALETİ
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  bg:           '#0A0E1A',
  card:         '#111827',
  card2:        '#1E2433',
  accent:       '#7C6AF7',
  accentDim:    '#2D2654',
  gold:         '#F5A623',
  white:        '#FFFFFF',
  muted:        '#8892A4',
  border:       '#1E2433',
  border2:      '#2D3748',
};

// ─────────────────────────────────────────────────────────────────────────────
// VERİLER
// ─────────────────────────────────────────────────────────────────────────────
const AGE_OPTIONS = [
  { key: '3-5', label: '3-5 Yaş' },
  { key: '6-8', label: '6-8 Yaş' },
  { key: '9+',  label: '9+ Yaş'  },
];

const LENGTH_OPTIONS = [
  { key: 'kisa',  label: 'Kısa',  sub: '~3 dk'  },
  { key: 'orta',  label: 'Orta',  sub: '~7 dk'  },
  { key: 'uzun',  label: 'Uzun',  sub: '~12 dk' },
];

const CATEGORIES = [
  {
    id: 'hayvanlar',
    label: 'Hayvanlar',
    emoji: '🐾',
    subs: ['Kedi','Köpek','Kurt','Ayı','Baykuş','Fil','Penguen','Tavşan','Aslan','Tilki','Kaplumbağa','Kuş','Kirpi','Yunus','Balina','Timsah','Koala','Panda','Sincap','Balık'],
  },
  {
    id: 'macera',
    label: 'Macera',
    emoji: '🚀',
    subs: ['Kayıp hazine','Büyük yolculuk','Gizli kapı','Dağ tırmanışı','Deniz altı','Zaman yolculuğu','Kayıp şehir','Uzay yolculuğu'],
  },
  {
    id: 'duygusal',
    label: 'Duygusal',
    emoji: '❤️',
    subs: ['Cesaret','Arkadaşlık','Empati','Hayal gücü','Merak','Sabır','Dürüstlük','Paylaşmak','Özgüven','Sevgi'],
  },
  {
    id: 'doga',
    label: 'Doğa',
    emoji: '🌿',
    subs: ['Orman','Deniz','Dağ','Çayır','Mağara','Şelale','Göl'],
  },
  {
    id: 'uzay',
    label: 'Uzay',
    emoji: '🌙',
    subs: ['Uzay gemisi','Gezegenler','Yıldızlar','Meteor','Uzaylı arkadaş','Ay'],
  },
  {
    id: 'sihir',
    label: 'Sihir',
    emoji: '✨',
    subs: ['Büyücü','Peri','Ejderha','Sihirli orman','Büyülü nesne','Gizli dünya','Unicorn','Deniz kızı','Dev','Cadı','Dinozor'],
  },
  {
    id: 'egitici',
    label: 'Eğitici',
    emoji: '🧠',
    subs: ['Sayılar','Renkler','Hayvanlar','Bitkiler','Meslekler','Duygular'],
  },
  {
    id: 'aile',
    label: 'Aile',
    emoji: '👨‍👩‍👧',
    subs: ['Anne','Baba','Abi','Abla','Kardeş','Büyükanne','Büyükbaba','Teyze','Amca','Hala','Dayı'],
  },
  {
    id: 'sanat',
    label: 'Sanat & Müzik',
    emoji: '🎨',
    subs: ['Ressam','Müzisyen','Dansçı','Şarkıcı','Heykeltraş'],
  },
  {
    id: 'kahraman',
    label: 'Süper Kahraman',
    emoji: '🦸',
    subs: ['Demir Kahraman','Yıldız Savaşçı','Örümcek Kahraman','Yeşil Dev','Yarasa Kahraman','Çelik Adam','Şimşek Adam','Buz Prensesi','Su Prensi'],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// ANA BILEŞEN
// ─────────────────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const navigation = useNavigation();

  // Yaş aralığı seçimi
  const [selectedAge, setSelectedAge] = useState(null);

  // Kategori accordion – açık olan kategori id'si
  const [openCategory, setOpenCategory] = useState(null);

  // Seçili alt öğeler – tüm kategorilerden birleşik dizi: "hayvanlar:Kedi" gibi
  const [selectedSubItems, setSelectedSubItems] = useState([]);

  // Masal uzunluğu
  const [selectedLength, setSelectedLength] = useState('orta');

  // Kişiler
  const [includeChild,  setIncludeChild]  = useState(false);
  const [childName,     setChildName]     = useState('');
  const [includeParent, setIncludeParent] = useState(false);
  const [parent1Name,   setParent1Name]   = useState('');
  const [parent2Name,   setParent2Name]   = useState('');

  // API yükleme durumu
  const [isLoading, setIsLoading] = useState(false);

  // Ses seçimi
  const [selectedVoice, setSelectedVoice] = useState('female');

  // Freemium
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [isPremium, setIsPremium] = useState(false);

  // Animasyon değerleri
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const star1Anim  = useRef(new Animated.Value(0)).current;
  const star2Anim  = useRef(new Animated.Value(0)).current;
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('monthly_count, is_premium')
        .eq('id', user.id)
        .single();

      if (profile) {
        setMonthlyCount(profile.monthly_count || 0);
        setIsPremium(profile.is_premium || false);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.15,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(star1Anim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(star1Anim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.delay(600),
          Animated.timing(star2Anim, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(star2Anim, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot1Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot1Opacity, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.delay(800),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.delay(400),
          Animated.timing(dot2Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot2Opacity, { toValue: 0.3, duration: 400, useNativeDriver: true }),
          Animated.delay(400),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.delay(800),
          Animated.timing(dot3Opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(dot3Opacity, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      ).start();
    } else {
      rotateAnim.setValue(0);
      scaleAnim.setValue(1);
      star1Anim.setValue(0);
      star2Anim.setValue(0);
    }
  }, [isLoading]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '15deg'],
  });

  // Örnek ses dinleme
  const playVoiceSample = async (voice) => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      const sampleFile = voice === 'female'
        ? require('../assets/kore.wav')
        : require('../assets/fenrir.wav');

      const { sound } = await Audio.Sound.createAsync(
        sampleFile,
        { shouldPlay: true }
      );

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) sound.unloadAsync();
      });

    } catch (error) {
      Alert.alert('Hata', 'Ses önizlemesi yüklenemedi: ' + error.message);
    }
  };

  // Çıkış yap
  const handleSignOut = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabından çıkmak istediğine emin misin?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
          },
        },
      ]
    );
  };

  // Buton aktif olma koşulu
  const isReady = selectedAge !== null && selectedSubItems.length > 0;

  // ── Masal oluşturma (Claude API) ─────────────────────────────────────────
  const generateStory = async () => {
    if (!selectedAge || selectedSubItems.length === 0) return;

    setIsLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    const { data: profile } = await supabase
      .from('profiles')
      .select('monthly_count, is_premium, subscription_start_date')
      .eq('id', user.id)
      .single();

    const now = new Date();
    const startDate = new Date(profile?.subscription_start_date || now);
    const daysSinceStart = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    const periodsPassed = Math.floor(daysSinceStart / 30);
    const currentPeriodStart = new Date(startDate);
    currentPeriodStart.setDate(currentPeriodStart.getDate() + (periodsPassed * 30));

    const shouldReset = daysSinceStart > 0 && daysSinceStart % 30 === 0;

    if (shouldReset) {
      await supabase
        .from('profiles')
        .update({ 
          monthly_count: 0,
          subscription_start_date: now.toISOString()
        })
        .eq('id', user.id);
      profile.monthly_count = 0;
    }

    if (!profile?.is_premium && (profile?.monthly_count || 0) >= 10) {
      Alert.alert(
        'Bu ayki masalların bitti 🌙',
        'Bu ay 10 ücretsiz masalını kullandın. Sınırsız masal için premium üyeliğe geç.',
        [
          { text: 'Belki sonra', style: 'cancel' },
          { 
            text: '✨ Premium Al', 
            onPress: () => Alert.alert('Yakında!', 'Premium üyelik çok yakında geliyor.') 
          },
        ]
      );
      setIsLoading(false);
      return;
    }

    // Sadece alt seçenek adlarını al ("hayvanlar:Kedi" → "Kedi")
    const themes = selectedSubItems.map(item => item.split(':')[1]).join(', ');

    // selectedLength key'i: 'kisa' | 'orta' | 'uzun'
    const lengthMap = { kisa: '150-200', orta: '350-400', uzun: '600-700' };
    const wordCount = lengthMap[selectedLength] || '350-400';

    let characterInfo = '';
    if (includeChild  && childName)   characterInfo += `Çocuğun adı: ${childName}. `;
    if (includeParent && parent1Name) {
      characterInfo += `Ebeveyn adı: ${parent1Name}${parent2Name ? ' ve ' + parent2Name : ''}. `;
    }

    const prompt = `Sen deneyimli bir Türk çocuk edebiyatı yazarısın.
${characterInfo}
Yaş grubu: ${selectedAge}
Temalar: ${themes}
Kelime sayısı: ${wordCount} kelime

Kurallar:
- Basit akıcı Türkçe, yaşa uygun
- Değeri ASLA doğrudan söyleme, karakterin eylemiyle göster
- Mantıksal tutarlılık
- Hikaye uykuya doğal geçişle bitsin
- Son cümle çocuğa iyi geceler hissi versin
- Emoji veya açıklama ekleme, sadece hikaye
- Bir başlık ver, sonra hikayeyi yaz`;

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 2048,
          system: `Sen deneyimli bir Türk çocuk edebiyatı yazarısın.
Görevin akıcı, sıcak ve sürükleyici bir uyku masalı yazmak.

ÖNEMLI: Masalın büyük çoğunluğu normal, sıcak bir sesle okunmalıdır.
Etiketler çok nadir kullanılmalıdır.

İzin verilen etiketler — tüm masalda TOPLAM en fazla 3 etiket:

[sigh] → Karakter derin bir nefes verdiğinde. Tüm masalda en fazla 1 kez.
[laughing] → Gerçekten komik bir anda. Tüm masalda en fazla 1 kez.
[whispering] → SADECE tek bir cümle için, gerçek bir sır anında. Tüm masalda en fazla 1 kez. Bir cümleden uzun ASLA kullanma.
[short pause] → Dramatik bir an öncesinde. Tüm masalda en fazla 2 kez.

YASAK:
- [shouting] kullanma
- [uhm] kullanma  
- Art arda 2 etiket kullanma
- Anlatıcı sesini [whispering] yapma — SADECE karakter diyalogunda 1 cümle
- [whispering] ile başlayan paragraf yazma

ÖRNEK DOĞRU KULLANIM:
"Orman sessizdi. Minik sincap kulağını dayadı. [whispering] 'Bunu kimseye söyleme,' dedi."

ÖRNEK YANLIŞ KULLANIM:
"[whispering] Orman sessizdi. Minik sincap yavaşça yürüdü. Ağaçlar ona baktı..."

GENEL KURALLAR:
- Normal anlatıcı sesi sıcak, sakin ve akıcı olsun
- Basit akıcı Türkçe, yaşa uygun
- Değeri ASLA doğrudan söyleme, karakterin eylemiyle göster
- Markdown formatı kullanma
- Emoji veya açıklama ekleme, sadece hikaye
- Hikaye uykuya doğal geçişle bitsin
- Son cümle çocuğa iyi geceler hissi versin`,
          messages: [{ 
            role: 'user', 
            content: prompt 
          }],
        }),
      });

      const data = await response.json();
      const story = data.content[0].text;
      const cleanStory = story
        .replace(/^#+\s*/gm, '')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .trim();

      const storyForDisplay = cleanStory
        .replace(/\[short pause\]/gi, '')
        .replace(/\[medium pause\]/gi, '')
        .replace(/\[long pause\]/gi, '')
        .replace(/\[whispering\]/gi, '')
        .replace(/\[shouting\]/gi, '')
        .replace(/\[laughing\]/gi, '')
        .replace(/\[sigh\]/gi, '')
        .replace(/\[uhm\]/gi, '')
        .replace(/\[extremely fast\]/gi, '')
        .replace(/\[scared\]/gi, '')
        .replace(/\[curious\]/gi, '')
        .replace(/\[bored\]/gi, '')
        .replace(/[ \t]+/g, ' ')
        .trim();

      // Masal ekranına geç
      // Masalı Supabase'e kaydet
      const { data: { user } } = await supabase.auth.getUser();
      let storyId = null;
      let insertedStory = null;
      if (user) {
        const titleLine = cleanStory.split('\n')[0];
        const { data: insertedStory_, error: insertError } = await supabase
          .from('stories')
          .insert({
            user_id: user.id,
            title: titleLine,
            content: cleanStory,
            age_group: selectedAge,
            themes: selectedSubItems,
            voice: selectedVoice,
            is_favorite: false,
          })
          .select()
          .single();
        insertedStory = insertedStory_;
        storyId = insertedStory?.id;
      }

      navigation.navigate('Story', { 
        story: storyForDisplay,
        storyRaw: cleanStory,
        selectedVoice,
        storyId: insertedStory?.id 
      });

      await supabase
        .from('profiles')
        .update({ monthly_count: (profile?.monthly_count || 0) + 1 })
        .eq('id', user.id);

    } catch (error) {
      console.log('Masal hatası:', error.message, error);
      Alert.alert('Hata', 'Masal oluşturulamadı: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Kategori chip tıklama (accordion) ───────────────────────────────────
  const handleCategoryPress = (catId) => {
    setOpenCategory(prev => (prev === catId ? null : catId));
  };

  // ── Alt öğe toggle ───────────────────────────────────────────────────────
  const handleSubToggle = (catId, sub) => {
    const key = `${catId}:${sub}`;
    setSelectedSubItems(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const isSubSelected = (catId, sub) => selectedSubItems.includes(`${catId}:${sub}`);

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* ══ LOADING MODAL ═══════════════════════════════════════════════════ */}
      <Modal visible={isLoading} transparent animationType="fade">
        <View style={{
          flex: 1,
          backgroundColor: '#0A0E1A',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <LottieView
            source={require('../assets/loading.json')}
            autoPlay
            loop
            style={{ width: 280, height: 280 }}
          />
          <Text style={{
            color: '#FFFFFF',
            fontSize: 22,
            fontWeight: 'bold',
            marginTop: 16,
            letterSpacing: 0.5,
          }}>Masal yazılıyor</Text>
          <View style={{ flexDirection: 'row', marginTop: 10, gap: 6 }}>
            <Animated.Text style={{ color: '#7C6AF7', fontSize: 28, opacity: dot1Opacity }}>·</Animated.Text>
            <Animated.Text style={{ color: '#7C6AF7', fontSize: 28, opacity: dot2Opacity }}>·</Animated.Text>
            <Animated.Text style={{ color: '#7C6AF7', fontSize: 28, opacity: dot3Opacity }}>·</Animated.Text>
          </View>
          <Text style={{
            color: '#8892A4',
            fontSize: 14,
            marginTop: 8,
          }}>Birazdan hazır</Text>
        </View>
      </Modal>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ══ 1. HEADER ═══════════════════════════════════════════════════ */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 8,
        }}>
          <View style={{ width: 40 }} />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 32 }}>🌙</Text>
            <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' }}>Benim Masalım</Text>
            <Text style={{ color: '#8892A4', fontSize: 14, marginTop: 4 }}>Her gece yeni bir macera ✨</Text>
          </View>
          <TouchableOpacity
            onPress={handleSignOut}
            style={{
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#1E2433',
              borderRadius: 20,
              borderWidth: 1,
              borderColor: '#2D3748',
            }}>
            <Text style={{ color: '#8892A4', fontSize: 13, fontWeight: 'bold' }}>Çıkış</Text>
          </TouchableOpacity>
        </View>

        {/* ══ 2. FAVORİLER BUTONU ════════════════════════════════════════ */}
        <TouchableOpacity
          style={s.favBtn}
          onPress={() => navigation.navigate('Favorites')}
          activeOpacity={0.75}
        >
          <Text style={s.favIcon}>🔖</Text>
          <Text style={s.favLabel}>Favori Masallarım</Text>
          <Text style={s.favArrow}>›</Text>
        </TouchableOpacity>

        {!isPremium && monthlyCount >= 7 && (
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: monthlyCount >= 9 ? '#2D1B4E' : '#1A1A2E',
            borderRadius: 12,
            padding: 10,
            marginHorizontal: 16,
            marginBottom: 8,
            borderWidth: 1,
            borderColor: monthlyCount >= 9 ? '#7C6AF7' : '#F5A623',
            gap: 6,
          }}>
            <Text style={{ fontSize: 16 }}>
              {monthlyCount >= 9 ? '⭐' : '🌙'}
            </Text>
            <Text style={{ 
              color: monthlyCount >= 9 ? '#7C6AF7' : '#F5A623', 
              fontSize: 13,
              fontWeight: monthlyCount >= 9 ? 'bold' : 'normal',
            }}>
              {monthlyCount === 9 
                ? 'Son masalın! Sınırsız için premium\'a geç' 
                : `Bu ay ${10 - monthlyCount} masal hakkın kaldı`}
            </Text>
          </View>
        )}

        {/* ══ 3. MASAL OLUŞTURMA KARTI ════════════════════════════════════ */}
        <View style={s.card}>

          {/* ── A) YAŞ ARALIĞI ─────────────────────────────────────────── */}
          <Text style={s.sectionTitle}>Yaş Aralığı</Text>
          <View style={s.row}>
            {AGE_OPTIONS.map(opt => {
              const active = selectedAge === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[s.optChip, active && s.optChipActive]}
                  onPress={() => setSelectedAge(opt.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.optChipText, active && s.optChipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={s.divider} />

          {/* ── B) KATEGORİLER & TEMALAR ───────────────────────────────── */}
          <Text style={s.sectionTitle}>Karakterler & Temalar</Text>
          <Text style={s.sectionHint}>Birden fazla seçebilirsiniz</Text>

          {/* Yatay kaydırılabilir kategori chip'leri */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={s.catScroll}
            contentContainerStyle={s.catScrollContent}
          >
            {CATEGORIES.map(cat => {
              const isOpen = openCategory === cat.id;
              // Bu kategoriye ait seçili alt öğe sayısı
              const count = selectedSubItems.filter(k => k.startsWith(`${cat.id}:`)).length;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[s.catChip, isOpen && s.catChipActive]}
                  onPress={() => handleCategoryPress(cat.id)}
                  activeOpacity={0.8}
                >
                  <Text style={s.catEmoji}>{cat.emoji}</Text>
                  <Text style={[s.catLabel, isOpen && s.catLabelActive]}>
                    {cat.label}
                  </Text>
                  {/* Seçim sayacı rozeti */}
                  {count > 0 && (
                    <View style={s.badge}>
                      <Text style={s.badgeText}>{count}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Accordion – açık kategorinin alt öğeleri */}
          {openCategory && (() => {
            const cat = CATEGORIES.find(c => c.id === openCategory);
            return (
              <View style={s.subContainer}>
                <View style={s.subWrap}>
                  {cat.subs.map(sub => {
                    const sel = isSubSelected(cat.id, sub);
                    return (
                      <TouchableOpacity
                        key={sub}
                        style={[s.subChip, sel && s.subChipActive]}
                        onPress={() => handleSubToggle(cat.id, sub)}
                        activeOpacity={0.8}
                      >
                        <Text style={[s.subText, sel && s.subTextActive]}>{sub}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })()}

          <View style={s.divider} />

          {/* ── C) KİŞİLER ─────────────────────────────────────────────── */}
          <Text style={s.sectionTitle}>Kişiler</Text>

          {/* Switch: Çocuk */}
          <View style={s.switchRow}>
            <Text style={s.switchLabel}>Çocuğun adını masala ekle</Text>
            <Switch
              value={includeChild}
              onValueChange={setIncludeChild}
              trackColor={{ false: '#2D3748', true: '#7C6AF7' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#2D3748"
            />
          </View>
          {includeChild && (
            <TextInput
              style={s.input}
              placeholder="Çocuğun adı..."
              placeholderTextColor={C.muted}
              value={childName}
              onChangeText={setChildName}
            />
          )}

          {/* Switch: Ebeveyn */}
          <View style={[s.switchRow, { marginTop: 14 }]}>
            <Text style={s.switchLabel}>Ebeveyn de masala dahil olsun</Text>
            <Switch
              value={includeParent}
              onValueChange={setIncludeParent}
              trackColor={{ false: '#2D3748', true: '#7C6AF7' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#2D3748"
            />
          </View>
          {includeParent && (
            <>
              <TextInput
                style={s.input}
                placeholder="Annenin adı..."
                placeholderTextColor={C.muted}
                value={parent1Name}
                onChangeText={setParent1Name}
              />
              <TextInput
                style={[s.input, { marginTop: 8 }]}
                placeholder="Babanın adı... (isteğe bağlı)"
                placeholderTextColor={C.muted}
                value={parent2Name}
                onChangeText={setParent2Name}
              />
            </>
          )}

          <View style={s.divider} />

          {/* ── D) MASAL UZUNLUĞU ───────────────────────────────────────── */}
          <Text style={s.sectionTitle}>Masal Uzunluğu</Text>
          <View style={s.row}>
            {LENGTH_OPTIONS.map(opt => {
              const active = selectedLength === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  style={[s.optChip, active && s.optChipActive]}
                  onPress={() => setSelectedLength(opt.key)}
                  activeOpacity={0.8}
                >
                  <Text style={[s.optChipText, active && s.optChipTextActive]}>
                    {opt.label}
                  </Text>
                  <Text style={[s.optChipSub, active && s.optChipTextActive]}>
                    {opt.sub}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

        </View>
        {/* ═══════════════════════════════════════════════════════════════ */}

        {/* ══ 4. SES SEÇİMİ ═══════════════════════════════════════════════ */}
        <View style={{ marginHorizontal: 16, marginBottom: 16 }}>
          <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginBottom: 12 }}>
            Seslendirme
          </Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => setSelectedVoice('female')}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: selectedVoice === 'female' ? '#7C6AF7' : '#2D3748',
                backgroundColor: selectedVoice === 'female' ? '#2D2654' : '#1E2433',
                alignItems: 'center',
              }}>
              <Text style={{ fontSize: 24, marginBottom: 4 }}>👩</Text>
              <Text style={{ color: selectedVoice === 'female' ? '#FFFFFF' : '#8892A4', fontSize: 13, fontWeight: 'bold' }}>Kadın sesi</Text>
              <Text style={{ color: '#8892A4', fontSize: 11, marginTop: 2 }}>Eda</Text>
              <TouchableOpacity
                onPress={() => playVoiceSample('female')}
                style={{ marginTop: 6 }}>
                <Text style={{ color: '#7C6AF7', fontSize: 11 }}>▶ Dinle</Text>
              </TouchableOpacity>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedVoice('male')}
              style={{
                flex: 1,
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: selectedVoice === 'male' ? '#7C6AF7' : '#2D3748',
                backgroundColor: selectedVoice === 'male' ? '#2D2654' : '#1E2433',
                alignItems: 'center',
              }}>
              <Text style={{ fontSize: 24, marginBottom: 4 }}>👨</Text>
              <Text style={{ color: selectedVoice === 'male' ? '#FFFFFF' : '#8892A4', fontSize: 13, fontWeight: 'bold' }}>Erkek sesi</Text>
              <Text style={{ color: '#8892A4', fontSize: 11, marginTop: 2 }}>Kaan</Text>
              <TouchableOpacity
                onPress={() => playVoiceSample('male')}
                style={{ marginTop: 6 }}>
                <Text style={{ color: '#7C6AF7', fontSize: 11 }}>▶ Dinle</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>

        {/* ══ 5. SEÇİMLER ÖZETİ ══════════════════════════════════════════ */}
        {selectedSubItems.length > 0 && (
          <View style={{marginTop:16, marginHorizontal:16, marginBottom:16}}>
            <View style={{flexDirection:'row', justifyContent:'space-between', marginBottom:8}}>
              <Text style={{color:'#FFFFFF', fontSize:14, fontWeight:'bold'}}>Seçimlerin</Text>
              <Text style={{color:'#7C6AF7', fontSize:13}}>{selectedSubItems.length} seçim</Text>
            </View>
            <View style={{flexDirection:'row', flexWrap:'wrap', gap:8}}>
              {selectedAge && (
                <View style={{flexDirection:'row', alignItems:'center', backgroundColor:'#1E2433', borderWidth:1, borderColor:'#7C6AF7', borderRadius:8, paddingHorizontal:10, paddingVertical:6}}>
                  <Text style={{color:'#FFFFFF', fontSize:13}}>
                    {AGE_OPTIONS.find(o => o.key === selectedAge)?.label}
                  </Text>
                  <TouchableOpacity onPress={() => setSelectedAge(null)} style={{marginLeft:6}}>
                    <Text style={{color:'#7C6AF7', fontSize:14}}>×</Text>
                  </TouchableOpacity>
                </View>
              )}
              {selectedSubItems.map((item, index) => (
                <View key={index} style={{flexDirection:'row', alignItems:'center', backgroundColor:'#1E2433', borderWidth:1, borderColor:'#7C6AF7', borderRadius:8, paddingHorizontal:10, paddingVertical:6}}>
                  <Text style={{color:'#FFFFFF', fontSize:13}}>{item.split(':')[1]}</Text>
                  <TouchableOpacity onPress={() => setSelectedSubItems(prev => prev.filter(i => i !== item))} style={{marginLeft:6}}>
                    <Text style={{color:'#7C6AF7', fontSize:14}}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ══ 5. OLUŞTUR BUTONU ═══════════════════════════════════════════ */}
        <TouchableOpacity
          style={[s.createBtn, (!isReady || isLoading) && s.createBtnDisabled]}
          onPress={isReady && !isLoading ? generateStory : null}
          activeOpacity={isReady && !isLoading ? 0.85 : 1}
        >
          <Text style={[s.createBtnText, (!isReady || isLoading) && s.createBtnTextDisabled]}>
            {isLoading ? 'Yazılıyor...' : '✨ Masalımı Oluştur'}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STİLLER
// ─────────────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // ── Header ──────────────────────────────────────────────────────────────
  header: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 28,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: C.white,
    letterSpacing: 0.4,
  },
  headerSub: {
    marginTop: 6,
    fontSize: 14,
    color: C.muted,
  },

  // ── Favoriler butonu ─────────────────────────────────────────────────────
  favBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.accentDim,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  favIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  favLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: C.white,
  },
  favArrow: {
    fontSize: 22,
    color: C.muted,
  },

  // ── Ana kart ─────────────────────────────────────────────────────────────
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: C.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: C.border,
  },

  // ── Bölüm başlıkları ──────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: C.white,
    marginBottom: 12,
  },
  sectionHint: {
    fontSize: 12,
    color: C.muted,
    marginTop: -8,
    marginBottom: 12,
  },

  // ── Seçenek chip'leri (yaş / uzunluk) ───────────────────────────────────
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  optChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: C.card2,
    alignItems: 'center',
  },
  optChipActive: {
    backgroundColor: C.accent,
  },
  optChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.muted,
  },
  optChipTextActive: {
    color: C.white,
  },
  optChipSub: {
    fontSize: 11,
    color: C.muted,
    marginTop: 2,
  },

  // ── Ayraç ────────────────────────────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 20,
  },

  // ── Kategori chip'leri (yatay scroll) ───────────────────────────────────
  catScroll: {
    marginBottom: 4,
  },
  catScrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 4,
  },
  catChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.card2,
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 5,
    borderWidth: 1,
    borderColor: C.border,
    flexShrink: 0,
  },
  catChipActive: {
    backgroundColor: C.accentDim,
    borderColor: C.accent,
  },
  catEmoji: {
    fontSize: 15,
  },
  catLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.muted,
  },
  catLabelActive: {
    color: C.white,
  },

  // Seçim sayacı rozeti
  badge: {
    backgroundColor: C.accent,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: C.white,
  },

  // ── Alt seçenekler (accordion) ───────────────────────────────────────────
  subContainer: {
    marginTop: 12,
    backgroundColor: C.bg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: C.border,
  },
  subWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: C.card2,
    borderWidth: 1,
    borderColor: C.border2,
  },
  subChipActive: {
    backgroundColor: C.accentDim,
    borderColor: C.accent,
  },
  subText: {
    fontSize: 12,
    color: C.muted,
    fontWeight: '500',
  },
  subTextActive: {
    color: C.white,
    fontWeight: '700',
  },

  // ── Switch satırı ────────────────────────────────────────────────────────
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchLabel: {
    flex: 1,
    fontSize: 14,
    color: C.white,
    paddingRight: 12,
    lineHeight: 20,
  },

  // ── Text input ───────────────────────────────────────────────────────────
  input: {
    marginTop: 10,
    backgroundColor: C.card2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.border2,
    padding: 12,
    fontSize: 14,
    color: C.white,
  },

  // ── Oluştur butonu ───────────────────────────────────────────────────────
  createBtn: {
    marginHorizontal: 16,
    marginBottom: 40,
    backgroundColor: C.accent,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
  },
  createBtnDisabled: {
    backgroundColor: C.accentDim,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: C.white,
  },
  createBtnTextDisabled: {
    color: C.muted,
  },
});
