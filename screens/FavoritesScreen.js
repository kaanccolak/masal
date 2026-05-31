import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../lib/supabase';

const COLORS = {
  bg: '#0A0E1A',
  card: '#111827',
  accent: '#7C6AF7',
  gold: '#F5A623',
  white: '#FFFFFF',
  muted: '#8892A4',
  cardBorder: '#1E2433',
};

export default function FavoritesScreen() {
  const navigation = useNavigation();
  const [stories, setStories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState({});

  const toggleExpand = (storyId) => {
    setExpandedCards(prev => ({
      ...prev,
      [storyId]: !prev[storyId]
    }));
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('is_favorite', true)
      .order('created_at', { ascending: false });

    if (error) {
      Alert.alert('Hata', 'Favoriler yüklenemedi.');
    } else {
      setStories(data || []);
    }
    setIsLoading(false);
  };

  const handleStoryPress = (story) => {
    const cleanContent = story.content
      .replace(/\[short pause\]/gi, '')
      .replace(/\[medium pause\]/gi, '')
      .replace(/\[long pause\]/gi, '')
      .replace(/\[whispering\]/gi, '')
      .replace(/\[shouting\]/gi, '')
      .replace(/\[laughing\]/gi, '')
      .replace(/\[sigh\]/gi, '')
      .replace(/\[uhm\]/gi, '')
      .replace(/\[extremely fast\]/gi, '')
      .replace(/[ \t]+/g, ' ')
      .trim();

    navigation.navigate('Story', {
      story: cleanContent,
      storyRaw: story.content,
      selectedVoice: story.voice || 'female',
      storyId: story.id,
      themes: story.themes || [],
      age_group: story.age_group || '',
    });
  };

  const handleRemoveFavorite = async (storyId) => {
    await supabase
      .from('stories')
      .update({ is_favorite: false })
      .eq('id', storyId);
    setStories(prev => prev.filter(s => s.id !== storyId));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.cardBorder,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: COLORS.accent, fontSize: 16 }}>← Geri</Text>
        </TouchableOpacity>
        <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: 'bold' }}>Favori Masallarım</Text>
        <View style={{ width: 50 }} />
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={COLORS.accent} size="large" />
        </View>
      ) : stories.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 16 }}>🌙</Text>
          <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: 'bold', textAlign: 'center' }}>
            Henüz favori masalın yok
          </Text>
          <Text style={{ color: COLORS.muted, fontSize: 14, textAlign: 'center', marginTop: 8 }}>
            Beğendiğin masalları favorilere ekle, burada görünsün.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {stories.map((story) => (
            <TouchableOpacity
              key={story.id}
              onPress={() => handleStoryPress(story)}
              style={{
                backgroundColor: COLORS.card,
                borderRadius: 16,
                padding: 16,
                marginBottom: 12,
                borderWidth: 1,
                borderColor: COLORS.cardBorder,
              }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: 'bold', marginBottom: 6 }}>
                    {story.title}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    {(() => {
                      const themes = story.themes || [];
                      const cleanThemes = themes.map(t => t.includes(':') ? t.split(':')[1] : t);
                      const isExpanded = expandedCards[story.id];
                      const visibleThemes = isExpanded ? cleanThemes : cleanThemes.slice(0, 3);
                      const hiddenCount = cleanThemes.length - 3;

                      return (
                        <>
                          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                            {story.age_group && (
                              <View style={{ backgroundColor: '#1E2433', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                                <Text style={{ color: COLORS.muted, fontSize: 12 }}>{story.age_group} Yaş</Text>
                              </View>
                            )}
                            {visibleThemes.map((theme, i) => (
                              <View key={i} style={{ backgroundColor: '#1E2433', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                                <Text style={{ color: COLORS.muted, fontSize: 12 }}>{theme}</Text>
                              </View>
                            ))}
                            {!isExpanded && hiddenCount > 0 && (
                              <TouchableOpacity
                                onPress={(e) => { e.stopPropagation(); toggleExpand(story.id); }}
                                style={{ backgroundColor: '#2D2654', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                                <Text style={{ color: '#7C6AF7', fontSize: 12 }}>+{hiddenCount} daha</Text>
                              </TouchableOpacity>
                            )}
                            {isExpanded && (
                              <TouchableOpacity
                                onPress={(e) => { e.stopPropagation(); toggleExpand(story.id); }}
                                style={{ backgroundColor: '#2D2654', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                                <Text style={{ color: '#7C6AF7', fontSize: 12 }}>Gizle</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </>
                      );
                    })()}
                  </View>
                  <Text style={{ color: COLORS.muted, fontSize: 12, marginTop: 8 }}>
                    {new Date(story.created_at).toLocaleDateString('tr-TR')}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveFavorite(story.id)}
                  style={{ padding: 4 }}>
                  <Text style={{ fontSize: 20 }}>★</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
