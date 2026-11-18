import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useReportes } from '../hooks/useReportes';
import TarjetaResumen from './componentes/TarjetaResumen';

export default function PantallaReportes({ hookMovimientos }) {
  const [filtro, setFiltro] = useState('mes'); // 'dia' | 'mes'
  const {
    movimientosFiltrados = [],
    totalCompras = 0,
    totalVentas = 0,
    ganancia = 0,
  } = useReportes(hookMovimientos?.movimientos || [], filtro);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.botonFiltro, filtro === 'dia' && styles.activo]}
          onPress={() => setFiltro('dia')}
        >
          <Text style={[styles.textoFiltro, filtro === 'dia' && { color: '#fff' }]}>Hoy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.botonFiltro, filtro === 'mes' && styles.activo]}
          onPress={() => setFiltro('mes')}
        >
          <Text style={[styles.textoFiltro, filtro === 'mes' && { color: '#fff' }]}>Este Mes</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TarjetaResumen
          titulo="Ventas"
          valor={`$${(Number(totalVentas) || 0).toFixed(2)}`}
          color="#16a34a"
        />
        <TarjetaResumen
          titulo="Compras"
          valor={`$${(Number(totalCompras) || 0).toFixed(2)}`}
          color="#dc2626"
        />
      </View>

      <View style={styles.row}>
        <TarjetaResumen
          titulo="Ganancia Neta"
          valor={`$${(Number(ganancia) || 0).toFixed(2)}`}
          color={ganancia >= 0 ? '#2563eb' : '#dc2626'}
        />
      </View>

      <Text style={styles.subtitulo}>Detalle del período ({movimientosFiltrados.length})</Text>
      <FlatList
        data={movimientosFiltrados}
        keyExtractor={(item, index) => (item?.id ? String(item.id) : String(index))}
        renderItem={({ item }) => {
          const esVenta = item.tipo === 'venta';
          const cant = Number(item.cantidad) || 0;
          const precio = Number(item.precio_unitario) || 0;
          const subtotal = cant * precio;

          return (
            <View style={styles.fila}>
              <Text style={styles.texto}>
                {esVenta ? '🟢 VENTA' : '🔵 COMPRA'} • {item.productos?.nombre || 'Producto'} ({cant})
              </Text>
              <Text style={{ fontWeight: 'bold', color: esVenta ? '#16a34a' : '#dc2626' }}>
                {esVenta ? '+' : '-'}${subtotal.toFixed(2)}
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.vacio}>No hay transacciones registradas en este período.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, backgroundColor: '#f1f5f9' },
  row: { flexDirection: 'row', marginBottom: 8 },
  botonFiltro: {
    flex: 1,
    padding: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  activo: { backgroundColor: '#2563eb' },
  textoFiltro: { fontWeight: 'bold', color: '#1e293b' },
  subtitulo: { fontSize: 16, fontWeight: 'bold', marginVertical: 10, color: '#0f172a' },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  texto: { color: '#1e293b', fontSize: 14 },
  vacio: {
    color: '#64748b',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});
