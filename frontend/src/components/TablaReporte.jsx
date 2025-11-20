import React from "react";
import "../styles/TablaReporte.css";

const TablaReporte = ({ columns = [], rows = [], data = [] }) => {
    return (
        <table className="tabla-reporte">
            <thead>
                <tr>
                    <th style={{ borderRadius: 0 }}></th>
                    {columns.map((col) => (
                        <th key={col}>{col}</th>
                    ))}
                </tr>
            </thead>

            <tbody>
                {rows.map((row, rowIndex) => (
                    <tr key={row}>
                        <td className="row-header">{row}</td>

                        {columns.map((_, colIndex) => (
                            <td key={colIndex}>
                                {data[rowIndex]?.[colIndex] ?? "-"}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default TablaReporte;
