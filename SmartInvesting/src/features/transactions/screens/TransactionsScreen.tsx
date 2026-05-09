import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../../../theme/colors";
import { spacing } from "../../../theme/spacing";
import { typography } from "../../../theme/typography";

interface Transaction {
  id: string;
  type: "buy" | "sell" | "deposit" | "withdraw";
  title: string;
  subtitle: string;
  amount: number;
  date: string;
  status: "completed" | "pending" | "failed";
}

const mockTransactions: Transaction[] = [
  { id: "1", type: "buy", title: "Bought Apple Inc.", subtitle: "AAPL • Stock", amount: -1785.0, date: "Today, 2:30 PM", status: "completed" },
  { id: "2", type: "deposit", title: "Added Funds", subtitle: "Bank Transfer", amount: 1000.0, date: "Today, 10:15 AM", status: "completed" },
  { id: "3", type: "buy", title: "Bought Gold", subtitle: "XAU • Gold", amount: -2320.0, date: "Yesterday, 4:45 PM", status: "completed" },
  { id: "4", type: "sell", title: "Sold S&P 500 ETF", subtitle: "SPY • ETF", amount: 478.2, date: "May 7, 11:20 AM", status: "completed" },
  { id: "5", type: "buy", title: "Bought Tesla Inc.", subtitle: "TSLA • Stock", amount: -496.0, date: "May 6, 3:10 PM", status: "completed" },
  { id: "6", type: "withdraw", title: "Withdrawal", subtitle: "To Bank Account", amount: -500.0, date: "May 5, 9:00 AM", status: "completed" },
  { id: "7", type: "deposit", title: "Added Funds", subtitle: "Credit Card", amount: 2500.0, date: "May 4, 5:30 PM", status: "completed" },
];

export const TransactionsScreen: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<"all" | "buy" | "sell" | "funds">("all");

  const filteredTransactions = activeFilter === "all"
    ? mockTransactions
    : activeFilter === "buy"
    ? mockTransactions.filter(t => t.type === "buy")
    : activeFilter === "sell"
    ? mockTransactions.filter(t => t.type === "sell")
    : mockTransactions.filter(t => t.type === "deposit" || t.type === "withdraw");

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getTypeIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "buy": return "arrow-down";
      case "sell": return "arrow-up";
      case "deposit": return "wallet";
      case "withdraw": return "card";
    }
  };

  const getTypeColor = (type: Transaction["type"]) => {
    switch (type) {
      case "buy": return "#DCFCE7";
      case "sell": return "#DBEAFE";
      case "deposit": return "#FEF3C7";
      case "withdraw": return "#F3E8FF";
    }
  };

  const getTypeIconColor = (type: Transaction["type"]) => {
    switch (type) {
      case "buy": return "#16A34A";
      case "sell": return "#2563EB";
      case "deposit": return "#D97706";
      case "withdraw": return "#9333EA";
    }
  };

  const renderFilter = (filter: "all" | "buy" | "sell" | "funds", label: string) => (
    <TouchableOpacity
      style={[styles.filterChip, activeFilter === filter && styles.filterChipActive]}
      onPress={() => setActiveFilter(filter)}
      activeOpacity={0.7}
    >
      <Text style={[styles.filterChipText, activeFilter === filter && styles.filterChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>John Doe</Text>
          </View>
          <TouchableOpacity style={styles.profileButton} activeOpacity={0.7}>
            <Ionicons name="person" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activity</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
              {renderFilter("all", "All")}
              {renderFilter("buy", "Buy")}
              {renderFilter("sell", "Sell")}
              {renderFilter("funds", "Funds")}
            </ScrollView>
          </View>

          {/* Transactions List */}
          <View style={styles.transactionsList}>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionLeft}>
                    <View style={[styles.transactionIcon, { backgroundColor: getTypeColor(transaction.type) }]}>
                      <Ionicons name={getTypeIcon(transaction.type) as any} size={18} color={getTypeIconColor(transaction.type)} />
                    </View>
                    <View>
                      <Text style={styles.transactionTitle}>{transaction.title}</Text>
                      <Text style={styles.transactionSubtitle}>{transaction.subtitle}</Text>
                    </View>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={[styles.transactionAmount, { color: transaction.amount >= 0 ? colors.success : colors.loss }]}>
                      {transaction.amount >= 0 ? "+" : ""}${Math.abs(transaction.amount).toLocaleString()}
                    </Text>
                    <Text style={styles.transactionDate}>{transaction.date}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="receipt-outline" size={48} color={colors.textMuted} />
                <Text style={styles.emptyStateText}>No transactions found</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing["2xl"] + spacing.xl,
    paddingBottom: spacing.lg,
    backgroundColor: colors.surfaceCard,
  },
  headerLeft: {},
  greeting: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  userName: {
    ...typography.title,
    color: colors.textPrimary,
    marginTop: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.figma.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    ...typography.sectionHeader,
    color: colors.textPrimary,
  },
  seeAllText: {
    ...typography.body,
    fontWeight: "500",
    color: colors.figma.primary,
  },
  filterContainer: {
    marginTop: spacing.base,
  },
  filterScroll: {
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surfaceCard,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.figma.primary,
    borderColor: colors.figma.primary,
  },
  filterChipText: {
    ...typography.caption,
    fontWeight: "500",
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: "#FFFFFF",
  },
  transactionsList: {
    marginTop: spacing.base,
    backgroundColor: colors.surfaceCard,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionTitle: {
    ...typography.body,
    fontWeight: "500",
    color: colors.textPrimary,
  },
  transactionSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    ...typography.body,
    fontWeight: "600",
  },
  transactionDate: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  emptyState: {
    padding: 40,
    alignItems: "center",
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.base,
  },
});
