import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useMovimientos() {
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const cargarMovimientos = useCallback(async () => {
    setCargando(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('movimientos')
        .select('*, productos(nombre, cantidad)')
        .order('fecha', { ascending: false });

      if (err) {
        console.error('Error cargando movimientos:', err);
        setError(err.message);
      } else {
        setMovimientos(data || []);
      }
    } catch (e) {
      console.error('Excepción en cargarMovimientos:', e);
      setError(e?.message || 'Error al cargar historial de movimientos');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarMovimientos();
  }, [cargarMovimientos]);

  const registrarMovimiento = async ({ producto, tipo, cantidad, precio_unitario }) => {
    if (!producto || !producto.id) {
      throw new Error('Debes seleccionar un producto válido.');
    }

    const cantNum = parseInt(cantidad, 10);
    const precioNum = parseFloat(precio_unitario);
    const stockActual = Number(producto.cantidad) || 0;

    if (isNaN(cantNum) || cantNum <= 0) {
      throw new Error('La cantidad debe ser un número entero mayor a 0.');
    }

    if (isNaN(precioNum) || precioNum < 0) {
      throw new Error('El precio unitario debe ser un número mayor o igual a 0.');
    }

    if (tipo === 'venta' && cantNum > stockActual) {
      throw new Error(`Stock insuficiente. Solo hay ${stockActual} unidades disponibles.`);
    }

    // 1. Insertar movimiento
    const { error: errMov } = await supabase.from('movimientos').insert([
      {
        producto_id: producto.id,
        tipo,
        cantidad: cantNum,
        precio_unitario: precioNum,
      },
    ]);
    if (errMov) throw errMov;

    // 2. Actualizar stock del producto
    const nuevoStock =
      tipo === 'compra' ? stockActual + cantNum : stockActual - cantNum;

    const { error: errProd } = await supabase
      .from('productos')
      .update({ cantidad: Math.max(0, nuevoStock) })
      .eq('id', producto.id);
    if (errProd) throw errProd;

    await cargarMovimientos();
  };

  return { movimientos, cargando, error, cargarMovimientos, registrarMovimiento };
}
