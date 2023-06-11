import { useState } from 'react';
import io from 'socket.io-client';
import './style.css';
import QRCode from 'react-qr-code';
import {
    OpenedVacancy,
    StylingVacancy,
    VacancyInfoFromSerial,
    VacancyStatus
} from '../../types';
import { reserveVacancy, updateVacancyStatus } from '../../helpers';

const baseUrlIPV4 = 'http://192.168.0.148';
const baseUrl = `${baseUrlIPV4}:5173`;
const socket = io(`${baseUrlIPV4}:8080`);

export const HomePage = (): JSX.Element => {
    const [vacancy, setVacancy] = useState<StylingVacancy | null>(null);
    const [vacancies, setVacancies] = useState<StylingVacancy[]>([]);
    const [openWarningBox, setOpenWarningBox] = useState<boolean>(false);
    const [openQrCodeWarningBox, setOpenQrCodeWarningBox] = useState<boolean>(false);
    const [qrCode, setQrCode] = useState<string>('');

    const handleVacancyClick = (vacancy: StylingVacancy): void => {
        if (vacancy.status === 'open') {
            setVacancy(vacancy);
            setOpenWarningBox(true);
            setQrCode(
                `${baseUrl}/reserve/?coords=${vacancy.coords.replace(' ', '%20')}&vacancy=${JSON.stringify(vacancy)}`
            );
        }
    }

    const handleReserveClick = async (): Promise<void> => {
        reserveVacancy.local(vacancy);
        setOpenWarningBox(false);
        setOpenQrCodeWarningBox(true);
        console.log({ qrCode });
    }

    const handleCancelReservedVacancy = () => {
        if (!vacancy) return;
        vacancy.bgColor = OpenedVacancy.bgColor;
        vacancy.bdColor = OpenedVacancy.bdColor;
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
        const config = await updateVacancyStatus(data, vacancies);
        setVacancies(config);
    });

    socket.on('changeVacancyColor', (id: string): void => {
        reserveVacancy.external(vacancies, id);
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
                                    Após esse período, a vaga ficará disponível para outro cliente reservá-la...
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
                        className='vacancy'
                        style={{ backgroundColor: v.bgColor, borderColor: v.bdColor }}
                        onClick={() => {
                            handleVacancyClick(v)
                        }}
                    >
                        {v.id}
                    </div>
                ))}
            </div>
        </>
    )
}