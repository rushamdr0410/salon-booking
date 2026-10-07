import { useState, useEffect } from "react"
import { getServices, createService, updateService, deleteService } from "../api/services"
import Loader from "../components/Loader"
import ErrorMessage from "../components/ErrorMessage"
import ServiceForm from "../components/ServiceForm"

function ServicesPage() {
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [actionError, setActionError] = useState("")
    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState(null)
    const [reloadKey, setReloadKey] = useState(0)

    useEffect(() => {
        let cancelled = false

        async function load() {
            setLoading(true)
            setError("")
            try {
                const res = await getServices()
                if (!cancelled) setServices(res.data)
            } catch {
                if (!cancelled) setError("Could not load services. Is the server running?")
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()
        return () => {
            cancelled = true
        }
    }, [reloadKey])

    function reload() {
        setReloadKey(reloadKey + 1)
    }

    function openAdd() {
        setEditing(null)
        setShowForm(true)
    }

    function openEdit(service) {
        setEditing(service)
        setShowForm(true)
    }

    function closeForm() {
        setShowForm(false)
        setEditing(null)
    }

    async function handleSave(data) {
        if (editing) {
            await updateService(editing.id, data)
        } else {
            await createService(data)
        }
        closeForm()
        reload()
    }

    async function handleDelete(id) {
        if (!window.confirm("Delete this service?")) return
        setActionError("")
        try {
            await deleteService(id)
            setServices(services.filter((s) => s.id !== id))
        } catch (err) {
            const message =
                err.response && err.response.data && err.response.data.error
                    ? err.response.data.error
                    : "Could not delete the service."
            setActionError(message)
        }
    }

    if (loading) return <Loader />
    if (error) return <ErrorMessage message={error} onRetry={reload} />

    return (
        <div>
            <div className="page-header">
                <h2>Services</h2>
                <button onClick={openAdd}>Add Service</button>
            </div>

            {actionError && <div className="error-box">{actionError}</div>}

            {showForm && (
                <ServiceForm
                    key={editing ? editing.id : "new"}
                    initialData={editing}
                    onSubmit={handleSave}
                    onCancel={closeForm}
                />
            )}

            {services.length === 0 ? (
                <p>No services yet.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Duration</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {services.map((service) => (
                            <tr key={service.id}>
                                <td>{service.name}</td>
                                <td>NPR {Number(service.price).toLocaleString()}</td>
                                <td>{service.duration} min</td>
                                <td>
                                    <div className="actions">
                                        <button onClick={() => openEdit(service)}>Edit</button>
                                        <button className="danger" onClick={() => handleDelete(service.id)}>
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    )
}

export default ServicesPage