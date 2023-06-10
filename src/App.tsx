import { Route, Routes } from "react-router-dom"
import { HomePage } from "./pages/Home";
import { AdminPage } from "./pages/Admin";
import { RedirectPage } from "./pages/Redirect";

export const App = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/reserve" element={<RedirectPage />} />
        </Routes>
    )
}