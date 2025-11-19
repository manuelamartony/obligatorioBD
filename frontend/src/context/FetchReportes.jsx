"use client"

import { createContext, useContext, useEffect, useState } from "react";

export const FetchReportesContext = createContext();

// async function getReportes() {
//     const res = await fetch("");

//     if (!res.ok) throw new Error("Error obteniendo disponibilidad");

//     return await res.json();
// }

export const FetchReportesProvider = ({ children }) => {

    return (
        <FetchReportesContext.Provider value={{}}>
            {children}
        </FetchReportesContext.Provider>
    );
};

export const useFetchReportes = () => useContext(FetchReportesContext);
