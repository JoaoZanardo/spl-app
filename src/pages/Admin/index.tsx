import { useEffect, useState } from 'react';
import './style.css';
import Api from '../../hooks/useApi';
import moment from 'moment';
moment.locale('pt-br');

type Vacancy = {
    id: string;
    number: number;
    coords: string;
    isOccupied: boolean;
    created_at: Date;
}

type VacancyHistory = {
    id: string;
    vacancy_id: string;
    vehicle_id: string;
    start_date: string;
    end_date: string;
    created_at: Date;
}

export const AdminPage = () => {
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [vacancyHistory, setVacancyHistory] = useState<VacancyHistory[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        (async () => {
            const { status, data } = await Api.getAllVacancies();
            if (status !== 200) return;
            setVacancies(data.vacancies);
        })();
    }, []);

    const handleSeeHistoryClick = async (vacancy: Vacancy) => {
        const { status, data } = await Api.getVancacyStories(vacancy.id);
        if (status !== 200) return;
        setVacancyHistory(data.stories);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setVacancyHistory([]);
    };

    return (
        <>
            <h1 className="title-admin">Admin Page - Parking Lot</h1>
            <div className="container">
                <table>
                    <thead>
                        <tr>
                            <th>Number</th>
                            <th>Status</th>
                            <th>Coordinates</th>
                            <th>See history</th>
                        </tr>
                    </thead>
                    <tbody>
                        {vacancies.length > 0 ? (
                            vacancies.map((v) => (
                                <tr key={v.number}>
                                    <td>{v.number}</td>
                                    <td>{v.isOccupied ? 'OCCUPIED' : 'OPEN'}</td>
                                    <td>{v.coords}</td>
                                    <td>
                                        <a className="button" onClick={() => handleSeeHistoryClick(v)}>
                                            See
                                        </a>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4}>No vacancies found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {isModalOpen && vacancyHistory.length && (

                <div className="modal">
                    <div className="modal-content">
                        <table>
                            <thead>
                                <tr>
                                    <th>Vehicle Id</th>
                                    <th>Arrival Date</th>
                                    <th>Departure Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vacancyHistory.map(vH => (
                                    <tr className='modal-content-item' key={vH.id}>
                                        <td>{vH.vehicle_id}</td>
                                        <td>{moment(vH.start_date).format('LLL')}</td>
                                        <td>{vH.end_date ? moment(vH.end_date).format('LLL') : "The vancancy is occupied right now"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={closeModal}>Fechar</button>
                    </div>
                </div>
            )}
        </>
    );
};
