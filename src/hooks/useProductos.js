import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useProductos() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarProductos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('productos')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) {
        console.error('Error cargando productos:', err);
        setError(err.message);
      } else {
        setProductos(data || []);
      }
    } catch (e) {
      console.error('Excepción en cargarProductos:', e);
      setError(e?.message || 'Error de conexión con la base de datos');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  const agregarProducto = async (nuevoProducto) => {
    const { error: err } = await supabase.from('productos').insert([nuevoProducto]);
    if (err) throw err;
    await cargarProductos();
  };

  const actualizarProducto = async (id, datos) => {
    const { error: err } = await supabase
      .from('productos')
      .update(datos)
      .eq('id', id);
    if (err) throw err;
    await cargarProductos();
  };

  const eliminarProducto = async (id) => {
    const { error: err } = await supabase.from('productos').delete().eq('id', id);
    if (err) throw err;
    await cargarProductos();
  };

  // Cálculos automáticos para Dashboard y Alertas
  const analisis = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const limiteCaducidad = new Date(hoy);
    limiteCaducidad.setDate(hoy.getDate() + 7); // Alerta: 7 días antes

    const agotados = [];
    const stockBajo = [];
    const porCaducar = [];

    (productos || []).forEach((p) => {
      const cantidad = Number(p.cantidad) || 0;
      const stockMinimo = p.stock_minimo != null ? Number(p.stock_minimo) : 5;

      if (cantidad === 0) {
        agotados.push(p);
      } else if (cantidad <= stockMinimo) {
        stockBajo.push(p);
      }

      if (p.fecha_caducidad) {
        // Parse seguro formato YYYY-MM-DD
        const partes = String(p.fecha_caducidad).split('-');
        if (partes.length === 3) {
          const anio = parseInt(partes[0], 10);
          const mes = parseInt(partes[1], 10) - 1;
          const dia = parseInt(partes[2], 10);
          const fechaCad = new Date(anio, mes, dia);
          if (!isNaN(fechaCad.getTime()) && fechaCad <= limiteCaducidad) {
            porCaducar.push(p);
          }
        }
      }
    });

    return {
      totalProductos: (productos || []).length,
      enStock: (productos || []).filter((p) => (Number(p.cantidad) || 0) > 0).length,
      agotados,
      stockBajo,
      porCaducar,
    };
  }, [productos]);

  return {
    productos,
    cargando,
    error,
    cargarProductos,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
    ...analisis,
  };
}
