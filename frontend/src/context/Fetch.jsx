"use client";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";


export function makeFetchJSONHook(resource, options = undefined) {
    return function (...args) {
        const [data, setData] = useState(null);
        const [isLoading, setIsLoading] = useState(false);
        const [error, setError] = useState(null);


        useEffect(() => {
            (async () => {
                setIsLoading(true);
                try {
                    const url =
                        typeof resource === "function" ? resource(...args) : resource;

                    const res = await fetch(url, options);

                    if (!res.ok) {
                        setError(
                            new Error(`Fetch error ${res.status} for resource ${url}`)
                        );
                    } else {
                        setData(await res.json());
                    }
                } catch (err) {
                    setError(err);
                }
                setIsLoading(false);
            })();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [...args]);

        return { data, error, isLoading };

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

export const useObtenerReservasUsuario = () => {
    const { user } = useContext(AuthContext);

    return makeFetchJSONHook(
        () => `http://localhost:3000/api/reservas/?ci=${user?.ci}`
    )();
};

export const useTodosLosTurnos = makeFetchJSONHook(
    "http://localhost:3000/api/turnos/"
);

export const useObtenerTurnosDelDia = (fecha, sala) => {
    return makeFetchJSONHook(
        () =>
            fecha && sala
                ? `http://localhost:3000/api/turnos/disponibles?fecha=${encodeURIComponent(
                    fecha
                )}&sala=${encodeURIComponent(sala.nombre_sala)}&edificio=${encodeURIComponent(
                    sala.edificio
                )}`
                : null
    )();
};