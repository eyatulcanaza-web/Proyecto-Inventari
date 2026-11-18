import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function TarjetaResumen({ titulo, valor, color = '#2563eb' }) {
  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <Text style={styles.titulo}>{titulo}</Text>
      <Text style={[styles.valor, { color }]}>{valor ?? 0}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 4,
    margin: 5,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  titulo: { fontSize: 12, color: '#64748b', fontWeight: '600', textTransform: 'uppercase' },
  valor: { fontSize: 20, fontWeight: 'bold', marginTop: 4 },
});
