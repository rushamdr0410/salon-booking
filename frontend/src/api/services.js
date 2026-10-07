import client from "./client"

export function getServices() {
    return client.get("/services/")
}

export function createService(data) {
    return client.post("/services/", data)
}

export function updateService(id, data) {
    return client.put(`/services/${id}/`, data)
}

export function deleteService(id) {
    return client.delete(`/services/${id}/`)
}