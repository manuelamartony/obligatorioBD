"use client";
import { useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "./AuthContext";

export function makeFetchJSONHook(resource, options = undefined) {
    return function (...args) {
        const [data, setData] = useState(null);
        const [isLoading, setIsLoading] = useState(false);
        const [error, setError] = useState(null);

        const url = typeof resource === "function" ? resource(...args) : resource;

        const fetchData = useCallback(async () => {
            if (!url) return;

            setIsLoading(true);
            setError(null);

            try {
                const res = await fetch(url, {
                    ...options,
                    headers: {
                        ...(options?.headers || {}),
                        "ngrok-skip-browser-warning": "true",
                    },
                });

                if (!res.ok) {
                    throw new Error(`Fetch error ${res.status} for resource ${url}`);
                }

                const json = await res.json();
                setData(json);
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        }, [url]);

        useEffect(() => {
            fetchData();
        }, [fetchData]);

        return { data, isLoading, error, fetchData };
    };
}


export const useSalasMasReservadas = makeFetchJSONHook(
    "http://localhost:3000/api/reportes/salas-mas-reservadas"
);

export const useTurnosMasDemandados = makeFetchJSONHook(
    "http://localhost:3000/api/reportes/turnos-demandados"
);

export const usePromedioMasParticipantesPorSala = makeFetchJSONHook(
    'http://localhost:3000/api/reportes/promedios-mas-participantes-por-sala'
);

export const useSancionesSegunCarrera = makeFetchJSONHook(
    'http://localhost:3000/api/reportes/sanciones-segun-carrera'
);

export const useCantidadReservasSegunDia = makeFetchJSONHook(
    'http://localhost:3000/api/reportes/cantidad_reservas_segun_dia'
);

export const usePorcentajeSOcupacionSalasPorEdificio = makeFetchJSONHook(
    'http://localhost:3000/api/reportes/ocupacion_salas_por_edificio'
);

export const useCantidadAsistenciasProfesoresAlumnos = makeFetchJSONHook(
    'http://localhost:3000/api/reportes/cantidad_reservas_asistencias_profesores_alumnos'
);

export const useCantidadSancionesProfesAlumnos = makeFetchJSONHook(
    'http://localhost:3000/api/reportes/cantidad_sanciones_profesores_alumnos'
);

export const useReservasUtilizadasOCanceladas = makeFetchJSONHook(
    'http://localhost:3000/api/reportes/reservas_utilizadas_vs_canceladas_noAsistidas'
);

export const useTasaCancelacionPorParticipante = makeFetchJSONHook(
    'http://localhost:3000/api/reportes/tasa_cancelacion_por_participante'
);

export const useObtenerReservasUsuario = () => {
    const { user } = useContext(AuthContext);

    return makeFetchJSONHook(
        () => `http://localhost:3000/api/reservas/?ci=${user?.ci}`
    )();
};

export const useTodosLosTurnos = makeFetchJSONHook(
    "http://localhost:3000/api/turnos/"
);

export const useObtenerUsuario = () => {
    const { user } = useContext(AuthContext);

    return makeFetchJSONHook(
        () => `http://localhost:3000/api/participantes/${user?.ci}`
    )();
};

