import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

type TxType = 'buy' | 'sell' | 'dividend' | 'deposit'

interface Transaction {
  id: string
  month: string
  type: TxType
  title: string
  detail: string
  amount: string
  shares: string
  isPositive?: boolean
}

interface DateGroup {
  month: string
  items: Transaction[]
}

const TransactionsScreenComponent = () => {
  const [activeFilter, setActiveFilter] = useState('All')

  const filters = ['All', 'Buys', 'Dividends', 'Deposits']

  const transactions: Transaction[] = [
    {
      id: 'TX001',
      month: 'May 2026',
      type: 'buy',
      title: 'Bought VTI',
      detail: 'Vanguard Total Stock Market ETF',
      amount: '-$1,078.10',
      shares: '5 shares'
    },
    {
      id: 'TX002',
      month: 'May 2026',
      type: 'buy',
      title: 'Bought AAPL',
      detail: 'Apple Inc.',
      amount: '-$389.38',
      shares: '2 shares'
    },
    {
      id: 'TX003',
      month: 'May 2026',
      type: 'dividend',
      title: 'Dividend: VTI',
      detail: 'Quarterly payout',
      amount: '+$3.42',
      shares: 'Reinvested',
      isPositive: true
    },
    {
      id: 'TX004',
      month: 'April 2026',
      type: 'buy',
      title: 'Bought VTI',
      detail: 'Vanguard Total Stock Market ETF',
      amount: '-$1,617.15',
      shares: '7.483 shares'
    },
    {
      id: 'TX005',
      month: 'April 2026',
      type: 'buy',
      title: 'Bought AAPL',
      detail: 'Apple Inc.',
      amount: '-$1,207.04',
      shares: '6.2 shares'
    },
    {
      id: 'TX006',
      month: 'March 2026',
      type: 'dividend',
      title: 'Dividend: VTI',
      detail: 'Quarterly payout',
      amount: '+$2.98',
      shares: 'Reinvested',
      isPositive: true
    }
  ]

  const groupedByMonth: DateGroup[] = transactions.reduce<DateGroup[]>((acc, tx) => {
    const existing = acc.find(g => g.month === tx.month)
    if (existing) {
      existing.items.push(tx)
    } else {
      acc.push({ month: tx.month, items: [tx] })
    }
    return acc
  }, [])

  const getIconColor = (type: TxType): string => {
    switch (type) {
      case 'buy':
        return '#e2f6d5'
      case 'sell':
        return '#fde8e8'
      case 'dividend':
        return 'rgba(56, 200, 255, 0.12)'
      default:
        return '#f0f0f0'
    }
  }

  const getIconSymbol = (type: TxType): string => {
    switch (type) {
      case 'buy':
        return '↓'
      case 'sell':
        return '↑'
      case 'dividend':
        return '$'
      default:
        return '•'
    }
  }

  const renderTransaction = (tx: Transaction) => (
    <TouchableOpacity key={tx.id} style={styles.txItem}>
      <View style={[styles.txIcon, { backgroundColor: getIconColor(tx.type) }]}>
        <Text style={styles.txIconText}>{getIconSymbol(tx.type)}</Text>
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txTitle}>{tx.title}</Text>
        <Text style={styles.txDetail}>{tx.detail}</Text>
      </View>
      <View style={styles.txAmount}>
        <Text style={[styles.txPrice, tx.isPositive && styles.txPricePositive]}>
          {tx.amount}
        </Text>
        <Text style={styles.txShares}>{tx.shares}</Text>
      </View>
    </TouchableOpacity>
  )

  const renderDateGroup = (group: DateGroup) => (
    <View key={group.month} style={styles.dateGroup}>
      <Text style={styles.dateHeader}>{group.month}</Text>
      {group.items.map(renderTransaction)}
    </View>
  )

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>History</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map(filter => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterTab,
              activeFilter === filter && styles.filterTabActive
            ]}
            onPress={() => setActiveFilter(filter)}
          >
            <Text
              style={[
                styles.filterTabText,
                activeFilter === filter && styles.filterTabTextActive
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {groupedByMonth.map(renderDateGroup)}
        <View style={styles.spacer} />
      </ScrollView>
    </SafeAreaView>
  )
}

export const TransactionsScreen = TransactionsScreenComponent
export default TransactionsScreenComponent

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0e0f0c'
  },
  filterScroll: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexGrow: 0
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8
  },
  filterTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f5f5f5'
  },
  filterTabActive: {
    backgroundColor: '#0e0f0c'
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0e0f0c'
  },
  filterTabTextActive: {
    color: '#fff'
  },
  content: {
    flex: 1
  },
  dateGroup: {
    paddingVertical: 16
  },
  dateHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
    paddingHorizontal: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  txItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  txIconText: {
    fontSize: 18,
    fontWeight: '600'
  },
  txInfo: {
    flex: 1
  },
  txTitle: {
    fontWeight: '600',
    fontSize: 15,
    color: '#0e0f0c',
    marginBottom: 2
  },
  txDetail: {
    fontSize: 13,
    color: '#999'
  },
  txAmount: {
    alignItems: 'flex-end',
    flexShrink: 0
  },
  txPrice: {
    fontWeight: '600',
    fontSize: 15,
    color: '#0e0f0c',
    marginBottom: 2
  },
  txPricePositive: {
    color: '#34c759'
  },
  txShares: {
    fontSize: 13,
    color: '#999'
  },
  spacer: {
    height: 20
  }
})
