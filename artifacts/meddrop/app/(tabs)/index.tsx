import React from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import * as Haptics from 'expo-haptics';

const BANNERS = [
  {
    route: '/medicine-order' as const,
    image: require('@/assets/images/medicine-banner.jpg'),
    title: 'ঔষধ অর্ডার করুন',
    subtitle: 'ফার্মেসি থেকে ঘরে ডেলিভারি',
    gradient: ['#E0F7FA', '#B2EBF2'],
    accent: '#00BCD4',
    icon: '💊',
  },
  {
    route: '/cigarette-order' as const,
    image: require('@/assets/images/cigarette-banner.jpg'),
    title: 'সিগারেট অর্ডার করুন',
    subtitle: 'সব ব্র্যান্ড দ্রুত ডেলিভারি',
    gradient: ['#FFF3E0', '#FFE0B2'],
    accent: '#FF9800',
    icon: '🚬',
  },
  {
    route: '/drinks-order' as const,
    image: require('@/assets/images/drinks-banner.jpg'),
    title: 'পানি ও কোল্ড ড্রিংকস অর্ডার করুন',
    subtitle: 'ঠান্ডা পানীয় এখনই পান',
    gradient: ['#E8F5E9', '#C8E6C9'],
    accent: '#4CAF50',
    icon: '🥤',
  },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleBanner = async (route: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 12),
          },
        ]}
      >
        <View>
          <Text style={styles.greeting}>
            স্বাগতম, {user?.name ?? 'ব্যবহারকারী'} 👋
          </Text>
          <Text style={styles.headerSub}>আজকে কী অর্ডার করবেন?</Text>
        </View>
        <View style={styles.logoChip}>
          <Text style={styles.logoChipText}>Med</Text>
          <Text style={[styles.logoChipText, { color: '#00BCD4' }]}>Drop</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.sectionTitle}>আমাদের সেবা</Text>

        {BANNERS.map((banner, index) => (
          <TouchableOpacity
            key={index}
            style={styles.bannerCard}
            onPress={() => handleBanner(banner.route)}
            activeOpacity={0.9}
          >
            <Image
              source={banner.image}
              style={styles.bannerImage}
              resizeMode="cover"
            />
            <View style={styles.bannerOverlay}>
              <View style={[styles.bannerBadge, { backgroundColor: banner.accent }]}>
                <Text style={styles.bannerBadgeText}>{banner.icon} অর্ডার করুন</Text>
              </View>
              <Text style={styles.bannerTitle}>{banner.title}</Text>
              <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Quick info */}
        <View style={styles.infoRow}>
          {[
            { icon: '⚡', label: 'দ্রুত ডেলিভারি' },
            { icon: '🔒', label: '১০০% নিরাপদ' },
            { icon: '📞', label: '২৪/৭ সাপোর্ট' },
          ].map((item, i) => (
            <View key={i} style={styles.infoItem}>
              <Text style={styles.infoIcon}>{item.icon}</Text>
              <Text style={styles.infoLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#00BCD4',
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
  },
  headerSub: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  logoChip: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  logoChipText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A1A',
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    color: '#1A1A1A',
    marginBottom: 14,
    marginTop: 4,
  },
  bannerCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    height: 180,
    backgroundColor: '#F5F5F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  bannerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.42)',
    padding: 16,
    justifyContent: 'flex-end',
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 8,
  },
  bannerBadgeText: {
    color: '#fff',
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
  },
  bannerTitle: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#fff',
    lineHeight: 26,
  },
  bannerSubtitle: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  infoRow: {
    flexDirection: 'row',
    backgroundColor: '#F0FDFE',
    borderRadius: 14,
    padding: 16,
    marginTop: 4,
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#00838F',
  },
});
