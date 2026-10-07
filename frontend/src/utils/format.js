export function formatTime(time) {
    const [h, m] = time.split(":")
    const hour = Number(h)
    const suffix = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 === 0 ? 12 : hour % 12
    return `${hour12}:${m} ${suffix}`
}

export function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1)
}