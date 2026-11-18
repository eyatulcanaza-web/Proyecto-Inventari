import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import ItemProducto from './componentes/ItemProducto';

export default function PantallaAlertas({ hookProductos }) {
  const { porCaducar, stockBajo, agotados } = hookProductos;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.seccion}>Próximos a Caducar ({porCaducar.length})</Text>
      {porCaducar.length === 0 ? (
        <Text style={styles.vacio}>Sin productos próximos a vencer.</Text>
      ) : (
        porCaducar.map((p) => <ItemProducto key={p.id} producto={p} />)
      )}

      <Text style={styles.seccion}>Stock Bajo ({stockBajo.length})</Text>
      {stockBajo.length === 0 ? (
        <Text style={styles.vacio}>Todo el inventario tiene buen stock.</Text>
      ) : (
        stockBajo.map((p) => <ItemProducto key={p.id} producto={p} />)
      )}

      <Text style={styles.seccion}>Agotados ({agotados.length})</Text>
      {agotados.length === 0 ? (
        <Text style={styles.vacio}>No hay productos agotados.</Text>
      ) : (
        agotados.map((p) => <ItemProducto key={p.id} producto={p} />)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, backgroundColor: '#f1f5f9' },
  seccion: { fontSize: 16, fontWeight: 'bold', color: '#1e293b', marginTop: 14, marginBottom: 8 },
  vacio: { color: '#64748b', fontStyle: 'italic', marginBottom: 8 },
});