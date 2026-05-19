import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppStackParamList } from '../../../shared/navigation/types';
import { AssetHero, StatBox, BuyForm } from '../../../components/finance';
import { spacing } from '../../../theme/tokens';

type AssetDetailScreenProps = NativeStackScreenProps<AppStackParamList, 'AssetDetail'>;

const MOCK_ASSET = {
  ticker: 'VTI',
  name: 'Vanguard Total Stock Market ETF',
  price: 215.62,
  changePercent: 0.42,
  high52: 228.40,
  low52: 178.20,
  expenseRatio: '0.03%',
  holdings: '3,500+',
  description: 'Vanguard Total Stock Market ETF tracks the entire US stock market, giving you exposure to thousands of companies across all sectors. Perfect for long-term investors who want broad diversification with minimal fees.',
};

export const AssetDetailScreen: React.FC<AssetDetailScreenProps> = ({ route, navigation }) => {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleConfirm = (amount: number, shares: number) => {
    setShowSuccess(true);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    navigation.navigate('MainTabs');
  };

  const stats = [
    { label: '52-week high', value: `$${MOCK_ASSET.high52.toFixed(2)}` },
    { label: '52-week low', value: `$${MOCK_ASSET.low52.toFixed(2)}` },
    { label: 'Expense ratio', value: MOCK_ASSET.expenseRatio },
    { label: 'Holdings', value: MOCK_ASSET.holdings },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={navigation.goBack}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={20} color="#0e0f0c" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
          <Ionicons name="heart-outline" size={24} color="#0e0f0c" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <AssetHero
          ticker={MOCK_ASSET.ticker}
          name={MOCK_ASSET.name}
          price={MOCK_ASSET.price}
          changePercent={MOCK_ASSET.changePercent}
        />

        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <StatBox key={index} label={stat.label} value={stat.value} />
          ))}
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.aboutTitle}>About {MOCK_ASSET.ticker}</Text>
          <Text style={styles.aboutText}>{MOCK_ASSET.description}</Text>
        </View>

        <BuyForm
          assetPrice={MOCK_ASSET.price}
          assetTicker={MOCK_ASSET.ticker}
          onConfirm={handleConfirm}
          onCancel={() => navigation.goBack()}
        />
      </ScrollView>

      {showSuccess && (
        <View style={styles.successOverlay}>
          <View style={styles.successSheet}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark" size={40} color="#163300" />
            </View>
            <Text style={styles.successTitle}>Order placed!</Text>
            <Text style={styles.successCopy}>
              Your purchase of {MOCK_ASSET.ticker} is being processed. You'll see it in your portfolio within 1–2 business days.
            </Text>
            <TouchableOpacity
              style={styles.successButton}
              onPress={handleCloseSuccess}
              activeOpacity={0.8}
            >
              <Text style={styles.successButtonText}>Back to portfolio</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0e0f0c',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f5f6f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingBottom: spacing['2xl'],
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  aboutSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(14,15,12,0.12)',
  },
  aboutTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    color: '#0e0f0c',
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#454745',
  },
  successOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  successSheet: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 40,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#9fe870',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 1.05,
    marginBottom: 8,
    color: '#0e0f0c',
  },
  successCopy: {
    fontSize: 14,
    lineHeight: 21,
    color: '#454745',
    marginBottom: 24,
    textAlign: 'center',
  },
  successButton: {
    backgroundColor: '#9fe870',
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
  },
  successButtonText: {
    color: '#163300',
    fontWeight: '700',
    fontSize: 16,
  },
});
