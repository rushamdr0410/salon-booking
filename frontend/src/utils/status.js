export const STATUSES = ["pending", "confirmed", "completed", "cancelled"]

export const NEXT_STATUS = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
}