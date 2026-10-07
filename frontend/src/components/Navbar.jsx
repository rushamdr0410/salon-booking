import { Link } from "react-router-dom"

function Navbar() {
    return (
        <nav className="navbar">
            <Link to="/services">Services</Link>
            <Link to="/appointments">Appointments</Link>
            <Link to="/book">Book Appointment</Link>
        </nav>
    )
}

export default Navbar