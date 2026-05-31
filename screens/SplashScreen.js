import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SplashScreen({ onFinish }) {
  const logoAnim = useRef(new Animated.Value(0)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const taglineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(textAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(taglineAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setTimeout(onFinish, 800);
    });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#0A0E1A', alignItems: 'center', justifyContent: 'center' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0E1A" />

      {/* Logo */}
      <Animated.View style={{
        opacity: logoAnim,
        transform: [{
          translateY: logoAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0],
          }),
        }],
      }}>
        <Image
          source={require('../assets/benimmasalim_logo.png')}
          style={{ width: 140, height: 140, borderRadius: 32 }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Uygulama adı */}
      <Animated.Text style={{
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
        marginTop: 24,
        opacity: textAnim,
        transform: [{
          translateY: textAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          }),
        }],
      }}>
        Benim Masalım
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={{
        color: '#8892A4',
        fontSize: 15,
        marginTop: 8,
        opacity: taglineAnim,
      }}>
        Her gece yeni bir macera ✨
      </Animated.Text>

    </View>
  );
}
