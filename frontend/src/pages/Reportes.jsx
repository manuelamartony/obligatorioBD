import React from 'react'
import '../styles/Reportes.css'
import { useNavigate } from 'react-router-dom'
import {
    useSalasMasReservadas,
    useTurnosMasDemandados,
    usePromedioMasParticipantesPorSala,
    useCantidadReservasSegunDia
} from '../context/FetchReportes'

import TablaReporte from '../components/TablaReporte'

const Reportes = () => {
    const navigate = useNavigate();

    const { data: SalasMasReservadas, loading: salasLoading } = useSalasMasReservadas()
    const { data: TurnosMasDemandados, loading: turnosLoading } = useTurnosMasDemandados()
    const { data: PromedioMasParticipantesPorSala, loading: promedioLoading } = usePromedioMasParticipantesPorSala()
    const { data: CantidadReservasSegunDia, loading: reservasDiaLoading } = useCantidadReservasSegunDia()

    if (salasLoading || turnosLoading || promedioLoading || reservasDiaLoading)
        return <p>Cargando reportes...</p>

    // -------------------------------
    // 1) Salas más reservadas
    // -------------------------------
    const salasRows = SalasMasReservadas?.salas?.map(s => s.nombre_sala)
    const salasColumns = ["Cantidad de reservas"]
    const salasData = SalasMasReservadas?.salas?.map(s => [s.cant])

    // -------------------------------
    // 2) Turnos más demandados
    // -------------------------------

    function formatSecondsToHour(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        return `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}`;
    }

    const turnosRows = TurnosMasDemandados?.turnos?.map(t => {
        const inicio = formatSecondsToHour(t.hora_inicio);
        const fin = formatSecondsToHour(t.hora_fin);
        return `${inicio} - ${fin}`;
    });

    const turnosColumns = ["Cantidad"]
    const turnosData = TurnosMasDemandados?.turnos?.map(t => [t.cant])

    // -------------------------------
    // 3) Promedio más participantes por sala
    // -------------------------------

    const promedioRows = PromedioMasParticipantesPorSala?.promedio_participantes?.map(s => s.nombre_sala)
    const promedioColumns = ["Promedio de participantes"]
    const promedioData = PromedioMasParticipantesPorSala?.promedio_participantes?.map(s => [s.promedio_participantes])

    // -------------------------------
    // 4) Cantidad de reservas según día
    // -------------------------------
    console.log(CantidadReservasSegunDia);
    const reservasDiaRows = CantidadReservasSegunDia?.reservas_por_dia
        ?.map(d => d.dia)
    const reservasDiaColumns = ["Cantidad"]
    const reservasDiaData = CantidadReservasSegunDia?.reservas_por_dia
        ?.map(d => [d.cant])

    return (
        <div className="reportes-page">
            <header className="rp-header">
                <button className="pill-btn back" onClick={() => navigate(-1)}>VOLVER</button>
                <h1 className="rp-title">REPORTES</h1>
                <button className="pill-btn profile">MI PERFIL</button>
            </header>

            <main className="reports-grid">

                <h2>Las 5 salas más reservadas</h2>
                <TablaReporte
                    columns={salasColumns}
                    rows={salasRows}
                    data={salasData}
                />


                <h2>Turnos más demandados</h2>
                <TablaReporte
                    columns={turnosColumns}
                    rows={turnosRows}
                    data={turnosData}
                />


                <h2>Promedio de participantes por sala</h2>
                <TablaReporte
                    columns={promedioColumns}
                    rows={promedioRows}
                    data={promedioData}
                />


                <h2>Cantidad de reservas según día</h2>
                <TablaReporte
                    columns={reservasDiaColumns}
                    rows={reservasDiaRows}
                    data={reservasDiaData}
                />
            </main>
        </div>
    )
}

export default Reportes
