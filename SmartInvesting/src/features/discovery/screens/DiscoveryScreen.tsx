import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

type AssetType = 'etf' | 'stock' | 'dividend'

interface Asset {
  id: string
  ticker: string
  name: string
  type: AssetType
  price: string
  change: string
  changePositive: boolean
  risk: string
  fee: string
  bestFor: string
  description: string
  iconColor: string
  textColor: string
}

const DiscoveryScreenComponent = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'etf', label: 'ETFs' },
    { id: 'stock', label: 'Stocks' },
    { id: 'dividend', label: 'Div' }
  ]

  const assets: Asset[] = [
    {
      id: 'VTI',
      ticker: 'VTI',
      name: 'Vanguard Total Stock Market ETF',
      type: 'etf',
      price: '$215.62',
      change: '+0.42%',
      changePositive: true,
      risk: 'Medium',
      fee: '0.03%',
      bestFor: 'Core',
      description: 'Broad US market',
      iconColor: '#e2f6d5',
      textColor: '#163300'
    },
    {
      id: 'VOO',
      ticker: 'VOO',
      name: 'Vanguard S&P 500 ETF',
      type: 'etf',
      price: '$498.22',
      change: '+0.36%',
      changePositive: true,
      risk: 'Medium',
      fee: '0.03%',
      bestFor: 'Long hold',
      description: '500 large companies',
      iconColor: 'rgba(56, 200, 255, 0.12)',
      textColor: '#0077B6'
    },
    {
      id: 'AAPL',
      ticker: 'AAPL',
      name: 'Apple Inc.',
      type: 'stock',
      price: '$194.69',
      change: '+1.12%',
      changePositive: true,
      risk: 'Higher',
      fee: '$0',
      bestFor: 'Satellite',
      description: 'Consumer technology',
      iconColor: '#fde8e8',
      textColor: '#d03238'
    },
    {
      id: 'SCHD',
      ticker: 'SCHD',
      name: 'Schwab US Dividend Equity ETF',
      type: 'dividend',
      price: '$78.41',
      change: '-0.11%',
      changePositive: false,
      risk: 'Medium',
      fee: '0.06%',
      bestFor: 'Income',
      description: 'Dividend ETF',
      iconColor: '#fff4cc',
      textColor: '#6b4e00'
    }
  ]

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = activeFilter === 'all' || asset.type === activeFilter
    return matchesSearch && matchesFilter
  })

  const renderAssetCard = (asset: Asset) => (
    <TouchableOpacity key={asset.id} style={styles.assetCard}>
      <View style={styles.assetCardHead}>
        <View style={[styles.assetIcon, { backgroundColor: asset.iconColor }]}>
          <Text style={[styles.assetIconText, { color: asset.textColor }]}>
            {asset.ticker}
          </Text>
        </View>
        <View style={styles.assetInfo}>
          <Text style={styles.assetName}>{asset.name}</Text>
          <Text style={styles.assetTicker}>{asset.ticker} · {asset.description}</Text>
        </View>
        <View style={styles.assetValue}>
          <Text style={styles.assetPrice}>{asset.price}</Text>
          <Text style={[styles.assetChange, asset.changePositive ? styles.assetChangePositive : styles.assetChangeNegative]}>
            {asset.change}
          </Text>
        </View>
      </View>
      <View style={styles.assetCardMeta}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Risk</Text>
          <Text style={styles.metaValue}>{asset.risk}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Fee</Text>
          <Text style={styles.metaValue}>{asset.fee}</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>Best for</Text>
          <Text style={styles.metaValue}>{asset.bestFor}</Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <TouchableOpacity style={styles.backButton}>
          <Ionicons name="home" size={22} color="#0e0f0c" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#868685" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search Apple, VOO, dividend ETF..."
            placeholderTextColor="#868685"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipContent}
        >
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.chip,
                activeFilter === filter.id && styles.chipActive
              ]}
              onPress={() => setActiveFilter(filter.id)}
            >
              <Text
                style={[
                  styles.chipText,
                  activeFilter === filter.id && styles.chipTextActive
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.lessonCard}>
          <View style={styles.riskPill}>
            <Text style={styles.riskPillText}>Lesson 1 · Long-term investing</Text>
          </View>
          <Text style={styles.lessonTitle}>Start broad. Hold long.</Text>
          <Text style={styles.lessonCopy}>
            A broad ETF spreads your money across many companies, so one bad stock matters less.
            SmartInvest is built for buying and holding — not day trading.
          </Text>
          <TouchableOpacity style={styles.learnButton}>
            <Text style={styles.learnButtonText}>Learn the 3 rules</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Beginner-friendly picks</Text>
        {filteredAssets.length > 0 ? (
          filteredAssets.map(renderAssetCard)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={48} color="rgba(14, 15, 12, 0.4)" />
            <Text style={styles.emptyTitle}>No result</Text>
            <Text style={styles.emptyText}>
              Try searching for a company name, ETF ticker, or theme like &quot;dividend&quot;.
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

export const DiscoveryScreen = DiscoveryScreenComponent
export default DiscoveryScreenComponent

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#fff'
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: 28,
    letterSpacing: -0.5,
    color: '#0e0f0c'
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f6f3'
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f5f6f3',
    borderRadius: 9999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#0e0f0c'
  },
  chipContent: {
    paddingVertical: 8,
    gap: 8,
    alignItems: 'center'
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#f5f5f5'
  },
  chipActive: {
    backgroundColor: '#0e0f0c'
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0e0f0c'
  },
  chipTextActive: {
    color: '#fff'
  },
  lessonCard: {
    backgroundColor: '#9fe870',
    borderRadius: 24,
    padding: 16,
    marginBottom: 12
  },
  riskPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    backgroundColor: 'rgba(22, 51, 0, 0.08)',
    marginBottom: 8
  },
  riskPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#163300'
  },
  lessonTitle: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 22,
    letterSpacing: -0.4,
    marginBottom: 6,
    color: '#163300'
  },
  lessonCopy: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 12,
    color: '#163300'
  },
  learnButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: 'rgba(22, 51, 0, 0.08)'
  },
  learnButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0e0f0c'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: -0.2,
    color: '#0e0f0c'
  },
  assetCard: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(14, 15, 12, 0.12)',
    borderRadius: 24,
    padding: 14,
    marginBottom: 10
  },
  assetCardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10
  },
  assetIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  assetIconText: {
    fontWeight: '800',
    fontSize: 14
  },
  assetInfo: {
    flex: 1,
    minWidth: 0
  },
  assetName: {
    fontWeight: '600',
    fontSize: 15,
    color: '#0e0f0c'
  },
  assetTicker: {
    fontSize: 12,
    color: '#868685',
    fontWeight: '500'
  },
  assetValue: {
    alignItems: 'flex-end',
    flexShrink: 0
  },
  assetPrice: {
    fontWeight: '600',
    fontSize: 15,
    color: '#0e0f0c'
  },
  assetChange: {
    fontSize: 12,
    fontWeight: '600'
  },
  assetChangePositive: {
    color: '#054d28'
  },
  assetChangeNegative: {
    color: '#d03238'
  },
  assetCardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(14, 15, 12, 0.12)'
  },
  metaItem: {
    flex: 1
  },
  metaLabel: {
    fontSize: 11,
    color: '#868685',
    fontWeight: '600'
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700'
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 16
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 8,
    color: '#0e0f0c'
  },
  emptyText: {
    fontSize: 15,
    color: '#868685',
    lineHeight: 22
  }
})
