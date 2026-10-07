import { useState } from "react"
import { parseApiError } from "../utils/errors"

function ServiceForm({ initialData, onSubmit, onCancel }) {
    const [values, setValues] = useState({
        name: initialData ? initialData.name : "",
        price: initialData ? initialData.price : "",
        duration: initialData ? initialData.duration : "",
    })
    const [errors, setErrors] = useState({})
    const [formError, setFormError] = useState("")
    const [submitting, setSubmitting] = useState(false)

    function handleChange(e) {
        const { name, value } = e.target
        setValues({ ...values, [name]: value })
    }

    function validate() {
        const newErrors = {}
        if (!values.name.trim()) {
            newErrors.name = "Service name is required."
        }
        if (values.price === "" || Number(values.price) <= 0) {
            newErrors.price = "Price must be a positive number."
        }
        if (values.duration === "" || Number(values.duration) <= 0) {
            newErrors.duration = "Duration must be greater than zero."
        }
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
            await onSubmit({
                name: values.name.trim(),
                price: values.price,
                duration: values.duration,
            })
        } catch (err) {
            const { fields, message } = parseApiError(err)
            setErrors(fields)
            setFormError(message)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="form" noValidate>
            <h3>{initialData ? "Edit Service" : "Add Service"}</h3>

            <label>
                Name
                <input name="name" value={values.name} onChange={handleChange} />
                {errors.name && <span className="field-error">{errors.name}</span>}
            </label>

            <label>
                Price (NPR)
                <input
                    name="price"
                    type="number"
                    step="0.01"
                    value={values.price}
                    onChange={handleChange}
                />
                {errors.price && <span className="field-error">{errors.price}</span>}
            </label>

            <label>
                Duration (minutes)
                <input
                    name="duration"
                    type="number"
                    value={values.duration}
                    onChange={handleChange}
                />
                {errors.duration && <span className="field-error">{errors.duration}</span>}
            </label>

            {formError && <p className="field-error">{formError}</p>}

            <div className="form-actions">
                <button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : "Save"}
                </button>
                <button type="button" className="secondary" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </form>
    )
}

export default ServiceForm