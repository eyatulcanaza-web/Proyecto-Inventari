import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  Text,
  Platform,
  StatusBar as RNStatusBar,
  StyleSheet,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useProductos } from '../hooks/useProductos';
import { useMovimientos } from '../hooks/useMovimientos';

import PantallaInventario from '../ui/PantallaInventario';
import PantallaProducto from '../ui/PantallaProducto';
import PantallaAlertas from '../ui/PantallaAlertas';
import PantallaMovimientos from '../ui/PantallaMovimientos';
import PantallaReportes from '../ui/PantallaReportes';

export default function App() {
  const hookProductos = useProductos();
  const hookMovimientos = useMovimientos();

  const [pantalla, setPantalla] = useState('inventario');
  const [productoEditar, setProductoEditar] = useState<any>(null);

  const abrirFormulario = (producto: any = null) => {
    setProductoEditar(producto);
    setPantalla('formulario');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.contenido}>
        {pantalla === 'inventario' && (
          <PantallaInventario hookProductos={hookProductos} irAFormulario={abrirFormulario} />
        )}
        {pantalla === 'formulario' && (
          <PantallaProducto
            productoEditar={productoEditar}
            hookProductos={hookProductos}
            volver={() => setPantalla('inventario')}
          />
        )}
        {pantalla === 'alertas' && <PantallaAlertas hookProductos={hookProductos} />}
        {pantalla === 'movimientos' && (
          <PantallaMovimientos hookProductos={hookProductos} hookMovimientos={hookMovimientos} />
        )}
        {pantalla === 'reportes' && <PantallaReportes hookMovimientos={hookMovimientos} />}
      </View>

      {pantalla !== 'formulario' && (
        <View style={styles.navbar}>
          {[
            { id: 'inventario', label: '📦 Inventario' },
            { id: 'alertas', label: '🔔 Alertas' },
            { id: 'movimientos', label: '💵 Caja' },
            { id: 'reportes', label: '📊 Reportes' },
          ].map((tab) => {
            const activo = pantalla === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.navBtn, activo && styles.navBtnActivo]}
                onPress={() => setPantalla(tab.id)}
              >
                <Text style={[styles.navText, activo && styles.navActivo]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingTop: Platform.OS === 'android' ? (RNStatusBar.currentHeight || 24) : 0,
  },
  contenido: { flex: 1 },
  navbar: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
  },
  navBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  navBtnActivo: {
    backgroundColor: '#eff6ff',
  },
  navText: { color: '#64748b', fontWeight: '600', fontSize: 13 },
  navActivo: { color: '#2563eb', fontWeight: 'bold' },
});
