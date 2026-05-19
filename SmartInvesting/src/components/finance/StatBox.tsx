import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { spacing } from '../../theme/tokens';

interface StatBoxProps {
  label: string;
  value: string;
}

export const StatBox: React.FC<StatBoxProps> = ({ label, value }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f5f6f3',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#868685',
    fontWeight: '600',
    marginBottom: 6,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0e0f0c',
    fontFamily: 'monospace',
  },
});
