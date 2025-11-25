import { useState } from "react";

/**
 * Hook para validar si una cédula existe en la BD
 * @returns {Object} { validarCI, loading, error }
 */
export function useValidarCI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validarCI = async (ci) => {
    if (!ci || !ci.trim()) {
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:3000/api/participantes/${ci}`);
      if (!res.ok) {
        setError("Cédula no encontrada");
        return false;
      }

      const json = await res.json();
      // Si la respuesta es exitosa, el usuario existe
      setError(null);
      return true;
    } catch (err) {
      console.error("Error validando CI:", err);
      setError("Error al validar cédula");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { validarCI, loading, error };
}
