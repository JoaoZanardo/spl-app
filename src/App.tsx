import { Route, Routes } from "react-router-dom";
import { 
    AdminPage, 
    HomePage, 
    RedirectPage 
} from "./pages";

export const App = () => {
    return (
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/reserve" element={<RedirectPage />} />
        </Routes>
    )
}