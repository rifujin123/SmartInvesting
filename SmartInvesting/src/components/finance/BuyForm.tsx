import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { spacing } from '../../theme/tokens';

interface BuyFormProps {
  assetPrice: number;
  assetTicker: string;
  onConfirm?: (amount: number, shares: number) => void;
  onCancel?: () => void;
}

export const BuyForm: React.FC<BuyFormProps> = ({ assetPrice, assetTicker, onConfirm, onCancel }) => {
  const [amount, setAmount] = useState('');

  const shares = amount ? parseFloat(amount) / assetPrice : 0;
  const fee = amount ? parseFloat(amount) * 0.001 : 0; // 0.1% fee
  const total = amount ? parseFloat(amount) + fee : 0;

  const handleConfirm = () => {
    if (amount && parseFloat(amount) > 0) {
      onConfirm?.(parseFloat(amount), shares);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How much to invest?</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Investment amount</Text>
        <View style={styles.inputWrapper}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor="#868685"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />
        </View>
        <Text style={styles.hint}>Minimum: $1 · No maximum</Text>
      </View>

      <View style={styles.summaryBox}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shares you'll get</Text>
          <Text style={styles.summaryValue}>{shares.toFixed(4)} shares</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Trading fee</Text>
          <Text style={styles.summaryValue}>${fee.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total cost</Text>
          <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          <Text style={styles.disclaimerBold}>Disclaimer: </Text>
          SmartInvest is not a bank. You cannot top up money or use your balance to pay bills. This is an investment-only platform for buying and holding stocks and ETFs.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.btnBuy}
        onPress={handleConfirm}
        disabled={!amount || parseFloat(amount) <= 0}
        activeOpacity={0.8}
      >
        <Text style={styles.btnBuyText}>Confirm purchase</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.btnCancel}
        onPress={onCancel}
        activeOpacity={0.8}
      >
        <Text style={styles.btnCancelText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#0e0f0c',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#0e0f0c',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0e0f0c',
  },
  input: {
    flex: 1,
    padding: 14,
    paddingLeft: 0,
    fontSize: 16,
    color: '#0e0f0c',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  hint: {
    fontSize: 12,
    color: '#868685',
    marginTop: 6,
  },
  summaryBox: {
    backgroundColor: '#f5f6f3',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    fontSize: 14,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#0e0f0c',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0e0f0c',
    fontFamily: 'monospace',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0e0f0c',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0e0f0c',
    fontFamily: 'monospace',
  },
  disclaimer: {
    backgroundColor: '#f5f6f3',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#868685',
    lineHeight: 18,
  },
  disclaimerBold: {
    fontWeight: '700',
    color: '#0e0f0c',
  },
  btnBuy: {
    backgroundColor: '#9fe870',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnBuyText: {
    color: '#163300',
    fontWeight: '700',
    fontSize: 16,
  },
  btnCancel: {
    backgroundColor: '#f5f6f3',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
  },
  btnCancelText: {
    color: '#0e0f0c',
    fontWeight: '700',
    fontSize: 16,
  },
});
