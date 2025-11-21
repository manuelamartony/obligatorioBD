import React from 'react'
import '../styles/Reportes.css'
import { useNavigate } from 'react-router-dom'
import {
    useSalasMasReservadas,
    useTurnosMasDemandados,
    usePromedioMasParticipantesPorSala,
    useCantidadReservasSegunDia,
    usePorcentajeSOcupacionSalasPorEdificio
} from '../context/Fetch'

import TablaReporte from '../components/TablaReporte'

const Reportes = () => {
    const navigate = useNavigate();

    const { data: SalasMasReservadas, loading: salasLoading } = useSalasMasReservadas()
    const { data: TurnosMasDemandados, loading: turnosLoading } = useTurnosMasDemandados()
    const { data: PromedioMasParticipantesPorSala, loading: promedioLoading } = usePromedioMasParticipantesPorSala()
    const { data: CantidadReservasSegunDia, loading: reservasDiaLoading } = useCantidadReservasSegunDia()
    const { data: PorcentajeOcupacionPorSala, loading: porcentajeLoading } = usePorcentajeSOcupacionSalasPorEdificio()
    const { data: CantidadAsistenciasProfesoresAlumnos, loading: asistenciasLoading } = useCantidadAsistenciasProfesoresAlumnos()
    const { data: CantidadSancionesProfesAlumnos, loading: sancionesLoading } = useCantidadSancionesProfesAlumnos()
    const { data: ReservasUtilizadasOCanceladas, loading: reservasLoading } = useReservasUtilizadasOCanceladas()
    const { data: TasaCancelacionPorParticipante, loading: tasaLoading } = useTasaCancelacionPorParticipante()
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
    console.log(PromedioMasParticipantesPorSala?.promedio_participantes)
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

    // -------------------------------
    // 5)Porcentaje de ocupación de salas por edificio
    // -------------------------------
    const porcentajeRows = PorcentajeOcupacionPorSala?.porcentaje_ocupacion.map(s = s.edificio)
    const porcentajeCollums = ["Porcentaje Ocupación Sala"]
    const porcentajeData = PorcentajeOcupacionPorSala?.porcentaje_ocupacion.map(s => [s.porcentaje_ocupacion])
    // -------------------------------
    // 6) Cantidad de reservas y asistencias de profesores y alumnos
    // -------------------------------
    const cantRows = CantidadAsistenciasProfesoresAlumnos?.cantidad_reservas_asistencias_profesores_alumnos.map(r => `${r.nombre} - ${r.apellido}`)
    const cantCollums = ["Asistencias", "Reservas"]
    const cantData = CantidadAsistenciasProfesoresAlumnos?.cantidad_reservas_asistencias_profesores_alumnos.map(r => [r.total_asistencias, r.total_reservas])

    // -------------------------------
    // 7) Cantidad de sanciones Docentes y alumnos
    // -------------------------------
    const sanRows = CantidadSancionesProfesAlumnos?.cantidad_sanciones_profesores_alumnos.map(s => `${s.nombre} - ${s.apellido}`)
    const sanCollums = ["Sanciones"]
    const cantDataSan = CantidadSancionesProfesAlumnos?.cantidad_sanciones_profesores_alumnos.map(s = [s.total_sanciones])

    // -------------------------------
    // 8) Reservas utilizadas vs no Asistidas
    // -------------------------------
    const reservasCollums = ["Utilizadas", "No asistidas"]
    const dataRes = ReservasUtilizadasOCanceladas.reservas_utilizadas_vs_canceladas_noAsistidas.map(r => [r.porcentaje_utilizadas, r.porcentaje_no_utilizadas])
    // -------------------------------
    // 9) Tasa cancelación por participante
    // -------------------------------
    const tasaRows = TasaCancelacionPorParticipante.tasa_cancelacion_por_participante.map(t => `${t.nombre} - ${t.apellido}`)
    const tasaCollumns = ["Tasa Cancelacion"]
    const tasaData = TasaCancelacionPorParticipante.tasa_cancelacion_por_participante.map(t => t.tasa_cancelacion)


    return (
        <div className="reportes-page">
            <header className="rp-header">
                <button className="pill-btn back" onClick={() => navigate(-1)}>VOLVER</button>
                <h1 className="rp-title">REPORTES</h1>
                <button className="pill-btn profile">MI PERFIL</button>
            </header>

            <main className="reports-grid">

                <h2>Las 5 salas más reservadas:</h2>
                <TablaReporte
                    columns={salasColumns}
                    rows={salasRows}
                    data={salasData}
                />


                <h2>Turnos más demandados:</h2>
                <TablaReporte
                    columns={turnosColumns}
                    rows={turnosRows}
                    data={turnosData}
                />


                <h2>Promedio de participantes por sala:</h2>
                <TablaReporte
                    columns={promedioColumns}
                    rows={promedioRows}
                    data={promedioData}
                />


                <h2>Cantidad de reservas según día:</h2>
                <TablaReporte
                    columns={reservasDiaColumns}
                    rows={reservasDiaRows}
                    data={reservasDiaData}
                />

                <h2>Porcentaje Ocupacion de Salas Por edificio</h2>
                <TablaReporte
                    columns={porcentajeCollums}
                    rows={porcentajeRows}
                    data={porcentajeData}
                />
                <h2>Cantidad de Asistencias y Reservas por Alumnos y Profesores</h2>
                <TablaReporte
                    columns={cantRows}
                    rows={cantCollums}
                    data={cantData}
                />
                <h2>antidad de sanciones por alumno o profesor</h2>
                <TablaReporte
                    columns={sanCollums}
                    rows={sanRows}
                    data={cantDataSan}
                />
                <h2>Reservas Utilizadas vs No asistidas</h2>
                <TablaReporte
                    columns={reservasCollums}
                    data={dataRes}
                />
                <h2>Tasa Cancelacion de Participantes</h2>
                <TablaReporte
                    columns={tasaCollumns}
                    rows={tasaRows}
                    data={tasaData} />
            </main>
        </div>
    )
}

export default Reportes
