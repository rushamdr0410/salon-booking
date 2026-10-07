import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { getServices } from "../api/services"
import { createAppointment } from "../api/appointments"
import { parseApiError } from "../utils/errors"
import Loader from "../components/Loader"
import ErrorMessage from "../components/ErrorMessage"

const emptyForm = {
    customer_name: "",
    customer_phone: "",
    service: "",
    date: "",
    time: "",
    notes: "",
}

function BookAppointmentPage() {
    const navigate = useNavigate()

    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [loadError, setLoadError] = useState("")
    const [reloadKey, setReloadKey] = useState(0)

    const [values, setValues] = useState(emptyForm)
    const [errors, setErrors] = useState({})
    const [formError, setFormError] = useState("")
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        let cancelled = false

        async function load() {
            setLoading(true)
            setLoadError("")
            try {
                const res = await getServices()
                if (!cancelled) setServices(res.data)
            } catch {
                if (!cancelled) setLoadError("Could not load services. Is the server running?")
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        load()
        return () => {
            cancelled = true
        }
    }, [reloadKey])

    function handleChange(e) {
        const { name, value } = e.target
        setValues({ ...values, [name]: value })
    }

    function validate() {
        const newErrors = {}
        if (!values.customer_name.trim()) newErrors.customer_name = "Customer name is required."
        if (!values.customer_phone.trim()) newErrors.customer_phone = "Customer phone is required."
        if (!values.service) newErrors.service = "Please select a service."
        if (!values.date) newErrors.date = "Appointment date is required."
        if (!values.time) newErrors.time = "Appointment time is required."
        return newErrors
    }

    async function handleSubmit(e) {
        e.preventDefault()

        const newErrors = validate()
        setErrors(newErrors)
        setFormError("")
        if (Object.keys(newErrors).length > 0) return

        setSubmitting(true)
        try {
            await createAppointment({
                customer_name: values.customer_name.trim(),
                customer_phone: values.customer_phone.trim(),
                service: Number(values.service),
                date: values.date,
                time: values.time,
                notes: values.notes,
            })
            navigate("/appointments")
        } catch (err) {
            const { fields, message } = parseApiError(err)
            setErrors(fields)
            setFormError(message)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <Loader />
    if (loadError) {
        return <ErrorMessage message={loadError} onRetry={() => setReloadKey(reloadKey + 1)} />
    }

    if (services.length === 0) {
        return (
            <div>
                <h2>Book Appointment</h2>
                <p>
                    There are no services yet. <Link to="/services">Add a service first.</Link>
                </p>
            </div>
        )
    }

    return (
        <div>
            <h2>Book Appointment</h2>

            <form onSubmit={handleSubmit} className="form" noValidate>
                <label>
                    Customer name
                    <input name="customer_name" value={values.customer_name} onChange={handleChange} />
                    {errors.customer_name && <span className="field-error">{errors.customer_name}</span>}
                </label>

                <label>
                    Customer phone
                    <input name="customer_phone" value={values.customer_phone} onChange={handleChange} />
                    {errors.customer_phone && <span className="field-error">{errors.customer_phone}</span>}
                </label>

                <label>
                    Service
                    <select name="service" value={values.service} onChange={handleChange}>
                        <option value="">Select a service</option>
                        {services.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name} (NPR {Number(s.price).toLocaleString()}, {s.duration} min)
                            </option>
                        ))}
                    </select>
                    {errors.service && <span className="field-error">{errors.service}</span>}
                </label>

                <label>
                    Date
                    <input name="date" type="date" value={values.date} onChange={handleChange} />
                    {errors.date && <span className="field-error">{errors.date}</span>}
                </label>

                <label>
                    Time
                    <input name="time" type="time" value={values.time} onChange={handleChange} />
                    {errors.time && <span className="field-error">{errors.time}</span>}
                </label>

                <label>
                    Notes (optional)
                    <textarea name="notes" rows="3" value={values.notes} onChange={handleChange} />
                    {errors.notes && <span className="field-error">{errors.notes}</span>}
                </label>

                {formError && <p className="field-error">{formError}</p>}

                <div className="form-actions">
                    <button type="submit" disabled={submitting}>
                        {submitting ? "Booking..." : "Book Appointment"}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default BookAppointmentPage