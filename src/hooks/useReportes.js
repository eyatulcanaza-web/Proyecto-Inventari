import { useMemo } from 'react';

export function useReportes(movimientos = [], filtro = 'mes') {
  return useMemo(() => {
    const ahora = new Date();
    const lista = Array.isArray(movimientos) ? movimientos : [];

    const filtrados = lista.filter((m) => {
      if (!m || !m.fecha) return false;
      const fechaMov = new Date(m.fecha);
      if (isNaN(fechaMov.getTime())) return false;

      if (filtro === 'dia') {
        return (
          fechaMov.getDate() === ahora.getDate() &&
          fechaMov.getMonth() === ahora.getMonth() &&
          fechaMov.getFullYear() === ahora.getFullYear()
        );
      }
      // Por defecto: mes actual
      return (
        fechaMov.getMonth() === ahora.getMonth() &&
        fechaMov.getFullYear() === ahora.getFullYear()
      );
    });

    let totalCompras = 0;
    let totalVentas = 0;

    filtrados.forEach((m) => {
      const cant = Number(m.cantidad) || 0;
      const precio = Number(m.precio_unitario) || 0;
      const subtotal = cant * precio;

      if (m.tipo === 'compra') totalCompras += subtotal;
      if (m.tipo === 'venta') totalVentas += subtotal;
    });

    return {
      movimientosFiltrados: filtrados,
      totalCompras,
      totalVentas,
      ganancia: totalVentas - totalCompras,
    };
  }, [movimientos, filtro]);
}
