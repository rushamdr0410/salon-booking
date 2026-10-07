import { Routes, Route } from "react-router-dom"
import Navbar from "./components/Navbar"
import ServicesPage from "./pages/ServicesPage"
import AppointmentsPage from "./pages/AppointmentsPage"
import BookAppointmentPage from "./pages/BookAppointmentPage"

function App() {
    return (
        <div className="container">
            <Navbar />
            <Routes>
                <Route path="/" element={<ServicesPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/appointments" element={<AppointmentsPage />} />
                <Route path="/book" element={<BookAppointmentPage />} />
            </Routes>
        </div>
    )
}

export default App