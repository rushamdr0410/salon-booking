import { useState, useEffect } from "react"
import {
    getAppointments,
    updateAppointmentStatus,
    deleteAppointment,
} from "../api/appointments"
import Loader from "../components/Loader"
import ErrorMessage from "../components/ErrorMessage"
import StatusBadge from "../components/StatusBadge"
import { STATUSES, NEXT_STATUS } from "../utils/status"
import { formatTime, capitalize } from "../utils/format"

function AppointmentsPage() {
    const [appointments, setAppointments] = useState([])
    const [statusFilter, setStatusFilter] = useState("")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [actionError, setActionError] = useState("")
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        let cancelled = false

        async function load() {
            setLoading(true)
            setError("")
            try {
                const res = await getAppointments(statusFilter)
                if (!cancelled) setAppointments(res.data)
            } catch {
                if (!cancelled) setError("Could not load appointments. Is the server running?")
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()
        return () => {
            cancelled = true
        }
    }, [statusFilter, reloadKey])

    async function handleStatusChange(id, newStatus) {
        if (!newStatus) return
        setActionError("")
        try {
            const res = await updateAppointmentStatus(id, newStatus)
            const updated = res.data
            if (statusFilter && updated.status !== statusFilter) {
                setAppointments(appointments.filter((a) => a.id !== id))
            } else {
                setAppointments(appointments.map((a) => (a.id === id ? updated : a)))
            }
        } catch (err) {
            const message =
                err.response && err.response.data && err.response.data.error
                    ? err.response.data.error
                    : "Could not update the status."
            setActionError(message)
        }
    }

    async function handleDelete(id) {
        if (!window.confirm("Delete this appointment?")) return
        setActionError("")
        try {
            await deleteAppointment(id)
            setAppointments(appointments.filter((a) => a.id !== id))
        } catch {
            setActionError("Could not delete the appointment.")
        }
    }

    return (
        <div>
            <div className="page-header">
                <h2>Appointments</h2>
            </div>

            <div className="filters">
                <label htmlFor="statusFilter">Filter by status:</label>
                <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">All</option>
                    {STATUSES.map((s) => (
                        <option key={s} value={s}>
                            {capitalize(s)}
                        </option>
                    ))}
                </select>
            </div>

            {actionError && <div className="error-box">{actionError}</div>}

            {loading && <Loader />}
            {!loading && error && (
                <ErrorMessage message={error} onRetry={() => setReloadKey(reloadKey + 1)} />
            )}

            {!loading && !error && appointments.length === 0 && <p>No appointments found.</p>}

            {!loading && !error && appointments.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Service</th>
                            <th>Date</th>
                            <th>Time</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map((a) => {
                            const next = NEXT_STATUS[a.status] || []
                            return (
                                <tr key={a.id}>
                                    <td>
                                        {a.customer_name}
                                        <div className="muted">{a.customer_phone}</div>
                                    </td>
                                    <td>{a.service_name}</td>
                                    <td>{a.date}</td>
                                    <td>{formatTime(a.time)}</td>
                                    <td>
                                        <StatusBadge status={a.status} />
                                    </td>
                                    <td>
                                        <div className="actions">
                                            {next.length > 0 && (
                                                <select
                                                    value=""
                                                    onChange={(e) => handleStatusChange(a.id, e.target.value)}
                                                >
                                                    <option value="" disabled>
                                                        Update...
                                                    </option>
                                                    {next.map((s) => (
                                                        <option key={s} value={s}>
                                                            {capitalize(s)}
                                                        </option>
                                                    ))}
                                                </select>
                                            )}
                                            <button className="danger" onClick={() => handleDelete(a.id)}>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default AppointmentsPage