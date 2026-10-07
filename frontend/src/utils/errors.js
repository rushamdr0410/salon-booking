export function parseApiError(err) {
    if (!err.response) {
        return { fields: {}, message: "Could not reach the server. Please try again." }
    }

    const data = err.response.data
    if (data && typeof data === "object" && !Array.isArray(data)) {
        const fields = {}
        let message = ""
        for (const key of Object.keys(data)) {
            const value = Array.isArray(data[key]) ? data[key][0] : data[key]
            const text = typeof value === "string" ? value : JSON.stringify(value)
            if (key === "non_field_errors" || key === "error" || key === "detail") {
                message = text
            } else {
                fields[key] = text
            }
        }
        return { fields, message }
    }

    return { fields: {}, message: "Something went wrong. Please try again." }
}