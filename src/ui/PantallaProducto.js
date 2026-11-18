import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

export default function PantallaProducto({ productoEditar, hookProductos, volver }) {
  const [nombre, setNombre] = useState(productoEditar?.nombre || '');
  const [categoria, setCategoria] = useState(productoEditar?.categoria || '');
  const [cantidad, setCantidad] = useState(String(productoEditar?.cantidad ?? '0'));
  const [stockMinimo, setStockMinimo] = useState(String(productoEditar?.stock_minimo ?? '5'));
  const [precioCompra, setPrecioCompra] = useState(String(productoEditar?.precio_compra ?? '0'));
  const [precioVenta, setPrecioVenta] = useState(String(productoEditar?.precio_venta ?? '0'));
  const [fechaCaducidad, setFechaCaducidad] = useState(productoEditar?.fecha_caducidad || '');
  const [guardando, setGuardando] = useState(false);

  const mostrarMensaje = (titulo, mensaje) => {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}: ${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };

  const guardar = async () => {
    if (!nombre.trim()) {
      return mostrarMensaje('Error', 'El nombre del producto es obligatorio.');
    }

    const cantNum = parseInt(cantidad, 10);
    const stockMinNum = parseInt(stockMinimo, 10);
    const precioCompraNum = parseFloat(precioCompra);
    const precioVentaNum = parseFloat(precioVenta);

    if (isNaN(cantNum) || cantNum < 0) {
      return mostrarMensaje('Error', 'La cantidad debe ser un número entero mayor o igual a 0.');
    }
    if (isNaN(stockMinNum) || stockMinNum < 0) {
      return mostrarMensaje('Error', 'El stock mínimo debe ser un número entero mayor o igual a 0.');
    }
    if (isNaN(precioCompraNum) || precioCompraNum < 0) {
      return mostrarMensaje('Error', 'El precio de compra debe ser un número mayor o igual a 0.');
    }
    if (isNaN(precioVentaNum) || precioVentaNum < 0) {
      return mostrarMensaje('Error', 'El precio de venta debe ser un número mayor o igual a 0.');
    }

    const payload = {
      nombre: nombre.trim(),
      categoria: categoria.trim() || null,
      cantidad: cantNum,
      stock_minimo: stockMinNum,
      precio_compra: precioCompraNum,
      precio_venta: precioVentaNum,
      fecha_caducidad: fechaCaducidad.trim() || null,
    };

    setGuardando(true);
    try {
      if (productoEditar) {
        await hookProductos.actualizarProducto(productoEditar.id, payload);
      } else {
        await hookProductos.agregarProducto(payload);
      }
      volver();
    } catch (e) {
      mostrarMensaje('Error en Supabase', e?.message || 'No se pudo guardar el producto');
    } finally {
      setGuardando(false);
    }
  };

  const eliminar = () => {
    const ejecutarEliminar = async () => {
      setGuardando(true);
      try {
        await hookProductos.eliminarProducto(productoEditar.id);
        volver();
      } catch (e) {
        mostrarMensaje('Error al eliminar', e?.message || 'No se pudo eliminar');
      } finally {
        setGuardando(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('¿Seguro que deseas eliminar este producto?')) {
        ejecutarEliminar();
      }
    } else {
      Alert.alert('Eliminar Producto', '¿Seguro que deseas eliminar este producto?', [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: ejecutarEliminar,
        },
      ]);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.titulo}>{productoEditar ? 'Editar Producto' : 'Nuevo Producto'}</Text>

      <Text style={styles.label}>Nombre *</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Leche Entera 1L"
        placeholderTextColor="#94a3b8"
        value={nombre}
        onChangeText={setNombre}
      />

      <Text style={styles.label}>Categoría</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: Lácteos, Bebidas, Abarrotes..."
        placeholderTextColor="#94a3b8"
        value={categoria}
        onChangeText={setCategoria}
      />

      <View style={styles.filaInputs}>
        <View style={styles.columna}>
          <Text style={styles.label}>Cantidad Actual</Text>
          <TextInput
            style={styles.input}
            placeholder="0"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
            value={cantidad}
            onChangeText={setCantidad}
          />
        </View>
        <View style={styles.columna}>
          <Text style={styles.label}>Stock Mínimo</Text>
          <TextInput
            style={styles.input}
            placeholder="5"
            placeholderTextColor="#94a3b8"
            keyboardType="numeric"
            value={stockMinimo}
            onChangeText={setStockMinimo}
          />
        </View>
      </View>

      <View style={styles.filaInputs}>
        <View style={styles.columna}>
          <Text style={styles.label}>Precio de Compra ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor="#94a3b8"
            keyboardType="decimal-pad"
            value={precioCompra}
            onChangeText={setPrecioCompra}
          />
        </View>
        <View style={styles.columna}>
          <Text style={styles.label}>Precio de Venta ($)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor="#94a3b8"
            keyboardType="decimal-pad"
            value={precioVenta}
            onChangeText={setPrecioVenta}
          />
        </View>
      </View>

      <Text style={styles.label}>Fecha de Caducidad (YYYY-MM-DD)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 2026-12-31"
        placeholderTextColor="#94a3b8"
        value={fechaCaducidad}
        onChangeText={setFechaCaducidad}
      />

      <TouchableOpacity
        style={[styles.btnGuardar, guardando && styles.btnDeshabilitado]}
        onPress={guardar}
        disabled={guardando}
      >
        {guardando ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.btnTexto}>Guardar Producto</Text>
        )}
      </TouchableOpacity>

      {productoEditar && (
        <TouchableOpacity
          style={[styles.btnEliminar, guardando && styles.btnDeshabilitado]}
          onPress={eliminar}
          disabled={guardando}
        >
          <Text style={styles.btnTexto}>Eliminar Producto</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.btnVolver} onPress={volver} disabled={guardando}>
        <Text style={styles.btnVolverTexto}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  content: { padding: 16, paddingBottom: 40 },
  titulo: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, color: '#0f172a' },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 4 },
  filaInputs: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  columna: { flex: 1 },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    color: '#0f172a',
    fontSize: 15,
  },
  btnGuardar: {
    backgroundColor: '#16a34a',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  btnEliminar: {
    backgroundColor: '#dc2626',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  btnDeshabilitado: { opacity: 0.6 },
  btnTexto: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  btnVolver: { padding: 14, alignItems: 'center', marginTop: 8 },
  btnVolverTexto: { color: '#64748b', fontWeight: '600', fontSize: 15 },
});
