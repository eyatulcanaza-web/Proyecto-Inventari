import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ItemProducto({ producto, onPress }) {
  if (!producto) return null;

  const cantidad = Number(producto.cantidad) || 0;
  const stockMinimo = producto.stock_minimo != null ? Number(producto.stock_minimo) : 5;
  const sinStock = cantidad === 0;
  const stockBajo = !sinStock && cantidad <= stockMinimo;
  const precioVenta = Number(producto.precio_venta) || 0;

  return (
    <TouchableOpacity
      style={styles.item}
      onPress={() => onPress?.(producto)}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.info}>
        <Text style={styles.nombre}>{producto.nombre || 'Sin nombre'}</Text>
        <Text style={styles.detalle}>
          {producto.categoria || 'Sin categoría'} • Venta: ${precioVenta.toFixed(2)}
        </Text>
        {producto.fecha_caducidad && (
          <Text style={styles.caducidad}>Vence: {producto.fecha_caducidad}</Text>
        )}
      </View>

      <View
        style={[
          styles.badge,
          sinStock ? styles.badgeRojo : stockBajo ? styles.badgeNaranja : styles.badgeVerde,
        ]}
      >
        <Text
          style={[
            styles.badgeTexto,
            sinStock ? styles.textoRojo : stockBajo ? styles.textoNaranja : styles.textoVerde,
          ]}
        >
          {sinStock ? 'Agotado' : `${cantidad} uds`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  info: { flex: 1, paddingRight: 10 },
  nombre: { fontSize: 16, fontWeight: 'bold', color: '#0f172a' },
  detalle: { fontSize: 13, color: '#64748b', marginTop: 2 },
  caducidad: { fontSize: 12, color: '#d97706', marginTop: 3, fontWeight: '500' },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  badgeVerde: { backgroundColor: '#dcfce7' },
  badgeNaranja: { backgroundColor: '#fef3c7' },
  badgeRojo: { backgroundColor: '#fee2e2' },
  badgeTexto: { fontSize: 12, fontWeight: 'bold' },
  textoVerde: { color: '#15803d' },
  textoNaranja: { color: '#b45309' },
  textoRojo: { color: '#b91c1c' },
});
