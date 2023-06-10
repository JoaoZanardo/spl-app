import { useState } from 'react';
import io from 'socket.io-client';
import './style.css';
import QRCode from 'react-qr-code';
import {
    Vacancy,
    VacancyInfoFromSerial,
    VacancyStatus
} from '../../types';
import Api from '../../hooks/useApi';

const openVacancy = {
    bgColor: 'rgb(92, 184, 92)',
    bdColor: 'rgb(76, 174, 76)'
}

const reservedVacancy = {
    bgColor: 'rgb(239, 168, 36)',
    bdColor: 'rgb(204, 131, 4)'
}

const occupiedVacancy = {
    bgColor: 'rgb(219, 29, 29)',
    bdColor: 'rgb(204, 8, 8)'
}

const baseUrlIPV4 = 'http://192.168.0.148';
const baseUrl = `${baseUrlIPV4}:5173`;
const socket = io(`${baseUrlIPV4}:8080`);

export const HomePage = (): JSX.Element => {
    const [vacancy, setVacancy] = useState<Vacancy | null>(null);
    const [vacancies, setVacancies] = useState<Vacancy[]>([]);
    const [openWarningBox, setOpenWarningBox] = useState<boolean>(false);
    const [openQrCodeWarningBox, setOpenQrCodeWarningBox] = useState<boolean>(false);
    const [qrCode, setQrCode] = useState<string>('');

    const handleVacancyClick = (vacancy: Vacancy): void => {
        if (vacancy.status === 'open') {
            setVacancy(vacancy);
            setOpenWarningBox(true);
            setQrCode(
                `${baseUrl}/reserve/?coords=${vacancy.coords.replace(' ', '%20')}&vacancy=${JSON.stringify(vacancy)}`
            );
        }
    }

    const handleReserveClick = async (): Promise<void> => {
        if (!vacancy) return;
        if (vacancy.bgColor === occupiedVacancy.bgColor) return;
        vacancy.bgColor = reservedVacancy.bgColor;
        vacancy.bdColor = reservedVacancy.bdColor;
        setTimeout(() => {
            if (localStorage.getItem(vacancy.id) === VacancyStatus.RESERVED) {
                localStorage.setItem(vacancy.id, VacancyStatus.OPEN);
            }
            vacancy.bgColor = openVacancy.bgColor;
            vacancy.bdColor = openVacancy.bdColor;
        }, 30000);
        socket.emit('vacancyClicked', vacancy.id);
        localStorage.setItem(vacancy.id, VacancyStatus.RESERVED);
        setOpenWarningBox(false);
        setOpenQrCodeWarningBox(true);
        console.log({ qrCode });
    }

    const handleCancelReservedVacancy = () => {
        if (!vacancy) return;
        vacancy.bgColor = openVacancy.bgColor;
        vacancy.bdColor = openVacancy.bdColor;
        localStorage.setItem(vacancy.id, VacancyStatus.OPEN);
        handleBackClick();
    }

    const handleBackClick = (): void => {
        setQrCode('');
        setOpenQrCodeWarningBox(false);
        setOpenWarningBox(false);
        setVacancy(null);
    }

    socket.on('data', async (data: VacancyInfoFromSerial): Promise<void> => {
        const { isOccupied, vacancyNumber, coords } = data;
        const vacancyIndex = vacancies.findIndex(v => v.id === vacancyNumber);

        if (vacancyIndex === -1) {
            setVacancies([...vacancies, {
                id: vacancyNumber,
                bgColor: openVacancy.bgColor,
                bdColor: openVacancy.bdColor,
                coords,
                status: 'open'
            }]);
            return;
        }

        const vacancy = vacancies[vacancyIndex];
        const vacancyStatus = localStorage.getItem(vacancyNumber);

        if (isOccupied) {
            // delete Vacancy_Reservation
            // set Vacancy isOccupied to true
            // create a Vacancy_History
            if (!vacancyStatus || vacancyStatus !== VacancyStatus.OCCUPIED) {
                console.log('OCCUPIED');
                localStorage.setItem(vacancyNumber, VacancyStatus.OCCUPIED);
                await Api.setOccupied({ vacancy_number: Number(vacancy.id) });
            }
            const updatedVacancy = {
                ...vacancy, bgColor: occupiedVacancy.bgColor, bdColor: occupiedVacancy.bdColor, status: 'occupied'
            };
            setVacancies([
                ...vacancies.slice(0, vacancyIndex), updatedVacancy, ...vacancies.slice(vacancyIndex + 1)
            ]);
            return;
        } else if (vacancyStatus === VacancyStatus.RESERVED) {
            const updatedVacancy = {
                ...vacancy, bgColor: reservedVacancy.bgColor, bdColor: reservedVacancy.bdColor, status: 'reserved'
            };
            setVacancies([
                ...vacancies.slice(0, vacancyIndex), updatedVacancy, ...vacancies.slice(vacancyIndex + 1)
            ]);
        } else {
            if (!vacancyStatus || vacancyStatus !== VacancyStatus.OPEN) {
                console.log('OPEN');
                localStorage.setItem(vacancyNumber, VacancyStatus.OPEN);
                await Api.setOpen({ vacancy_number: Number(vacancy.id) });
            }
            // set Vacancy isOccupied to false
            // set Vacancy_History end_date
            const updatedVacancy = { ...vacancy, bgColor: openVacancy.bgColor, bdColor: openVacancy.bdColor, status: 'open' };
            setVacancies([
                ...vacancies.slice(0, vacancyIndex), updatedVacancy, ...vacancies.slice(vacancyIndex + 1)
            ]);
        }
    });

    socket.on('changeVacancyColor', (id: string): void => {
        const vacancyIndex = vacancies.findIndex(v => v.id === id);
        if (vacancyIndex === -1) return;
        const vacancy = vacancies[vacancyIndex];
        vacancy.bgColor = reservedVacancy.bgColor;
        vacancy.bdColor = reservedVacancy.bdColor;
        setTimeout(() => {
            if (localStorage.getItem(id) === VacancyStatus.RESERVED) {
                localStorage.setItem(id, VacancyStatus.OPEN);
            }
            vacancy.bgColor = openVacancy.bgColor;
            vacancy.bdColor = openVacancy.bdColor;
        }, 30000);
    });

    socket.once('disableQrCodeView', () => {
        setOpenQrCodeWarningBox(false);
    });

    return (
        <>
            {!openWarningBox || (
                <div id="warning-box-bg">
                    <div className="warning-box">
                        <div className="message">
                            <div className="icon"><img src="src/assets/warning-icon.png" /></div>
                            <div className="text">
                                <div className="title">Deseja reservar essa vaga ?</div>
                                <div className="description">
                                    Após reservar esta vaga, você terá apenas 10 minutos para se dirigir a ela.
                                    Após esse período, a vaga ficará disponível para outro cliente reservá-la..
                                </div>
                            </div>
                        </div>
                        <div className="buttons">
                            <div className="back" onClick={handleBackClick}>Voltar</div>
                            <div id="reserve-button"
                                onClick={handleReserveClick}
                            >Reservar vaga</div>
                        </div>
                    </div>
                </div>
            )}

            {!openQrCodeWarningBox || (
                <div id="warning-box-bg">
                    <div className="qrCode warning-box">
                        <div className="title">
                            Scaneia o QrCode para ter acesso à rota até sua vaga
                        </div>
                        <div className="qrCodeView"><QRCode value={qrCode} /></div>
                        <button className='cancel'
                            onClick={handleCancelReservedVacancy}>Cancelar reserva</button>
                    </div>
                </div>
            )}
            <div className="parking-title">
                <h1>Smart Parking Lot</h1>
            </div>
            <div id="parking-lot">
                {vacancies.map(v => (
                    <div
                        key={v.id}
                        className={'vacancy'}
                        style={{ backgroundColor: v.bgColor, borderColor: v.bdColor }}
                        onClick={() => {
                            handleVacancyClick(v)
                        }}
                    >
                    </div>
                ))}
            </div>
        </>
    )
}