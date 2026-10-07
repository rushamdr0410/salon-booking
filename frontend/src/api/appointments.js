import client from "./client"

export function getAppointments(status) {
    return client.get("/appointments/", {
        params: status ? { status } : {},
    })
}
export function createAppointment(data) {
    return client.post("/appointments/", data)
}
export function updateAppointmentStatus(id, status) {
    return client.patch(`/appointments/${id}/status/`, { status })
}
export function deleteAppointment(id) {
    return client.delete(`/appointments/${id}/`)
}