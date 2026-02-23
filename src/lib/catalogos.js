import { supabase } from './supabase';

/**
 * Obtiene el catálogo de países desde Supabase
 * @returns {Promise<Array>} Lista de países activos
 */
export async function obtenerCatalogoPaises() {
  try {
    const { data, error } = await supabase
      .from('catalogo_paises')
      .select('codigo, nombre, moneda_oficial, tasa_impuesto_general, impuesto_principal')
      .eq('activo', true)
      .order('nombre');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al cargar catálogo de países:', error);
    return [];
  }
}

/**
 * Obtiene el catálogo de monedas desde Supabase
 * @returns {Promise<Array>} Lista de monedas activas
 */
export async function obtenerCatalogoMonedas() {
  try {
    const { data, error } = await supabase
      .from('catalogo_monedas')
      .select('codigo, nombre, simbolo, decimales')
      .eq('activo', true)
      .order('nombre');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error al cargar catálogo de monedas:', error);
    return [];
  }
}
