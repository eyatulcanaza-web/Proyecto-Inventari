import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

export default function PantallaMovimientos({ hookProductos, hookMovimientos }) {
  const { productos = [], cargarProductos } = hookProductos;
  const { movimientos = [], cargando = false, error = null, registrarMovimiento } = hookMovimientos;

  const [productoSel, setProductoSel] = useState(null);
  const [tipo, setTipo] = useState('venta');
  const [cantidad, setCantidad] = useState('1');
  const [precio, setPrecio] = useState('');
  const [guardando, setGuardando] = useState(false);

  const mostrarMensaje = (titulo, mensaje) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}: ${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };

  const seleccionarProducto = (p) => {
    setProductoSel(p);
    const precioSugerido =
      tipo === 'venta'
        ? Number(p.precio_venta || 0).toFixed(2)
        : Number(p.precio_compra || 0).toFixed(2);
    setPrecio(precioSugerido);
  };

  const cambiarTipo = (nuevoTipo) => {
    setTipo(nuevoTipo);
    if (productoSel) {
      const precioSugerido =
        nuevoTipo === 'venta'
          ? Number(productoSel.precio_venta || 0).toFixed(2)
          : Number(productoSel.precio_compra || 0).toFixed(2);
      setPrecio(precioSugerido);
    }
  };

  const procesar = async () => {
    if (!productoSel) {
      return mostrarMensaje('Atención', 'Selecciona un producto de la lista arriba.');
    }

    setGuardando(true);
    try {
      await registrarMovimiento({
        producto: productoSel,
        tipo,
        cantidad,
        precio_unitario: precio,
      });
      await cargarProductos(); // Refresca el stock global
      setCantidad('1');
      mostrarMensaje('Éxito', `${tipo === 'venta' ? 'Venta' : 'Compra'} registrada correctamente.`);
    } catch (e) {
      mostrarMensaje('Error', e?.message || 'No se pudo registrar el movimiento');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Registrar Movimiento en Caja</Text>

      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tab, tipo === 'venta' && styles.tabVenta]}
          onPress={() => cambiarTipo('venta')}
        >
          <Text style={[styles.tabText, tipo === 'venta' && styles.tabTextActivo]}>
            🛒 Venta (Salida)
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tipo === 'compra' && styles.tabCompra]}
          onPress={() => cambiarTipo('compra')}
        >
          <Text style={[styles.tabText, tipo === 'compra' && styles.tabTextActivo]}>
            📦 Compra (Entrada)
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtituloSelector}>1. Selecciona un Producto:</Text>
      {productos.length === 0 ? (
        <Text style={styles.sinProductos}>
          No hay productos disponibles. Agrega productos en la pestaña "Inventario".
        </Text>
      ) : (
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={productos}
          keyExtractor={(item, index) => (item?.id ? String(item.id) : String(index))}
          style={styles.selectorHorizontal}
          renderItem={({ item }) => {
            const activo = productoSel?.id === item.id;
            return (
              <TouchableOpacity
                style={[styles.chip, activo && styles.chipActivo]}
                onPress={() => seleccionarProducto(item)}
              >
                <Text style={[styles.chipTexto, activo && styles.chipTextoActivo]}>
                  {item.nombre} ({item.cantidad} uds)
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {productoSel && (
        <View style={styles.productoSeleccionadoInfo}>
          <Text style={styles.productoSeleccionadoTexto}>
            Seleccionado: <Text style={{ fontWeight: 'bold' }}>{productoSel.nombre}</Text> (Stock:{' '}
            {productoSel.cantidad} uds)
          </Text>
        </View>
      )}

      <Text style={styles.subtituloSelector}>2. Cantidad y Precio:</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, { flex: 1, marginRight: 6 }]}
          placeholder="Cantidad"
          placeholderTextColor="#94a3b8"
          keyboardType="numeric"
          value={cantidad}
          onChangeText={setCantidad}
        />
        <TextInput
          style={[styles.input, { flex: 1, marginLeft: 6 }]}
          placeholder="Precio unitario ($)"
          placeholderTextColor="#94a3b8"
          keyboardType="decimal-pad"
          value={precio}
          onChangeText={setPrecio}
        />
      </View>

      <TouchableOpacity
        style={[styles.btnRegistrar, guardando && styles.btnDeshabilitado]}
        onPress={procesar}
        disabled={guardando}
      >
        {guardando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnTexto}>Confirmar {tipo.toUpperCase()}</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.subtitulo}>Historial Reciente</Text>
      {error ? (
        <Text style={styles.errorTexto}>⚠️ {error}</Text>
      ) : null}

      <FlatList
        data={movimientos}
        keyExtractor={(item, index) => (item?.id ? String(item.id) : String(index))}
        renderItem={({ item }) => {
          const esVenta = item.tipo === 'venta';
          const cant = Number(item.cantidad) || 0;
          const prec = Number(item.precio_unitario) || 0;
          const total = cant * prec;

          return (
            <View style={styles.movItem}>
              <View style={styles.movHeader}>
                <Text style={styles.movNombre}>
                  {esVenta ? '🟢 Venta' : '🔵 Compra'} - {item.productos?.nombre || 'Producto'}
                </Text>
                <Text style={[styles.movTotal, esVenta ? styles.totalVenta : styles.totalCompra]}>
                  {esVenta ? '+' : '-'}${total.toFixed(2)}
                </Text>
              </View>
              <Text style={styles.movDetalle}>
                {cant} uds x ${prec.toFixed(2)} c/u
              </Text>
            </View>
          );
        }}
        ListEmptyComponent={
          cargando ? (
            <ActivityIndicator style={{ marginTop: 20 }} color="#2563eb" />
          ) : (
            <Text style={styles.sinMovimientos}>No hay movimientos registrados todavía.</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, backgroundColor: '#f1f5f9' },
  titulo: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#0f172a' },
  subtitulo: { fontSize: 16, fontWeight: 'bold', marginTop: 14, marginBottom: 8, color: '#0f172a' },
  subtituloSelector: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 6, marginTop: 4 },
  tabsRow: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  tab: {
    flex: 1,
    padding: 12,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    borderRadius: 8,
  },
  tabVenta: { backgroundColor: '#16a34a' },
  tabCompra: { backgroundColor: '#2563eb' },
  tabText: { fontWeight: 'bold', color: '#475569', fontSize: 14 },
  tabTextActivo: { color: '#ffffff' },
  selectorHorizontal: { maxHeight: 45, marginBottom: 10 },
  chip: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    alignSelf: 'center',
  },
  chipActivo: { backgroundColor: '#0f172a', borderColor: '#0f172a' },
  chipTexto: { color: '#1e293b', fontSize: 13, fontWeight: '500' },
  chipTextoActivo: { color: '#ffffff', fontWeight: 'bold' },
  sinProductos: { color: '#64748b', fontStyle: 'italic', marginBottom: 10, fontSize: 13 },
  productoSeleccionadoInfo: {
    backgroundColor: '#e0f2fe',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  productoSeleccionadoTexto: { color: '#0369a1', fontSize: 13 },
  row: { flexDirection: 'row', marginBottom: 10 },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    color: '#0f172a',
    fontSize: 15,
  },
  btnRegistrar: {
    backgroundColor: '#0f172a',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  btnDeshabilitado: { opacity: 0.6 },
  btnTexto: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  errorTexto: { color: '#dc2626', marginBottom: 8, fontSize: 13 },
  movItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  movHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  movNombre: { fontWeight: 'bold', color: '#1e293b', fontSize: 14 },
  movTotal: { fontWeight: 'bold', fontSize: 14 },
  totalVenta: { color: '#16a34a' },
  totalCompra: { color: '#2563eb' },
  movDetalle: { color: '#64748b', fontSize: 12, marginTop: 4 },
  sinMovimientos: { color: '#64748b', fontStyle: 'italic', textAlign: 'center', marginTop: 14 },
});
