import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import TarjetaResumen from './componentes/TarjetaResumen';
import ItemProducto from './componentes/ItemProducto';

export default function PantallaInventario({ hookProductos, irAFormulario }) {
  const {
    productos = [],
    totalProductos = 0,
    enStock = 0,
    agotados = [],
    porCaducar = [],
    cargando = false,
    error = null,
    cargarProductos,
  } = hookProductos;

  const [busqueda, setBusqueda] = useState('');

  const filtrados = (productos || []).filter((p) =>
    (p.nombre || '').toLowerCase().includes((busqueda || '').toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TarjetaResumen titulo="Total" valor={totalProductos} color="#2563eb" />
        <TarjetaResumen titulo="En Stock" valor={enStock} color="#16a34a" />
      </View>
      <View style={styles.row}>
        <TarjetaResumen titulo="Por Caducar" valor={(porCaducar || []).length} color="#d97706" />
        <TarjetaResumen titulo="Agotados" valor={(agotados || []).length} color="#dc2626" />
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorTexto}>⚠️ Error: {error}</Text>
          <TouchableOpacity style={styles.errorBtn} onPress={cargarProductos}>
            <Text style={styles.errorBtnTexto}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Buscar producto por nombre..."
        placeholderTextColor="#94a3b8"
        value={busqueda}
        onChangeText={setBusqueda}
      />

      <TouchableOpacity style={styles.btnNuevo} onPress={() => irAFormulario(null)}>
        <Text style={styles.btnTexto}>+ Agregar Producto</Text>
      </TouchableOpacity>

      {cargando && (!productos || productos.length === 0) ? (
        <View style={styles.centrado}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.cargandoTexto}>Cargando inventario...</Text>
        </View>
      ) : (
        <FlatList
          data={filtrados}
          keyExtractor={(item, index) => (item?.id ? String(item.id) : String(index))}
          refreshing={cargando}
          onRefresh={cargarProductos}
          renderItem={({ item }) => (
            <ItemProducto producto={item} onPress={() => irAFormulario(item)} />
          )}
          ListEmptyComponent={
            <View style={styles.vacioContainer}>
              <Text style={styles.vacioTexto}>
                {busqueda
                  ? 'No se encontraron productos con ese nombre.'
                  : 'No hay productos en el inventario.'}
              </Text>
              {!busqueda && (
                <Text style={styles.vacioSubtexto}>
                  Toca "+ Agregar Producto" para crear el primero.
                </Text>
              )}
            </View>
          }
          contentContainerStyle={filtrados.length === 0 ? styles.listaVacia : undefined}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 14, backgroundColor: '#f1f5f9' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  errorBox: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  errorTexto: { color: '#991b1b', flex: 1, fontSize: 13, fontWeight: '500' },
  errorBtn: { backgroundColor: '#dc2626', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, marginLeft: 8 },
  errorBtnTexto: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    color: '#0f172a',
    fontSize: 15,
  },
  btnNuevo: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  btnTexto: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  centrado: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  cargandoTexto: { color: '#64748b', marginTop: 10, fontSize: 14 },
  vacioContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  vacioTexto: { color: '#64748b', fontSize: 15, fontWeight: '500', textAlign: 'center' },
  vacioSubtexto: { color: '#94a3b8', fontSize: 13, marginTop: 6, textAlign: 'center' },
  listaVacia: { flexGrow: 1, justifyContent: 'center' },
});
