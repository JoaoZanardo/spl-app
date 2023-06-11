import Api from "../hooks/useApi";
import { StylingVacancy, VacancyInfoFromSerial, VacancyStatus } from "../types";

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

export const updateVacancyStatus = async (
    data: VacancyInfoFromSerial, 
    vacancies: StylingVacancy[]
    ): Promise<StylingVacancy[] | any> => {
    const { coords, isOccupied, vacancyNumber } = data;
    const vacancyIndex = vacancies.findIndex(v => v.id === vacancyNumber);

    if (vacancyIndex === -1) {
        return ([...vacancies, {
            id: vacancyNumber,
            bgColor: openVacancy.bgColor,
            bdColor: openVacancy.bdColor,
            coords,
            status: 'open'
        }]);
    }

    const vacancy = vacancies[vacancyIndex];
    const vacancyStatus = localStorage.getItem(vacancyNumber);

    if (isOccupied) {
        // delete Vacancy Reservation
        // set Vacancy isOccupied to true
        // create a Vacancy History
        if (!vacancyStatus || vacancyStatus !== VacancyStatus.OCCUPIED) {
            console.log('OCCUPIED');
            localStorage.setItem(vacancyNumber, VacancyStatus.OCCUPIED);
            await Api.setOccupied({ vacancy_number: Number(vacancy.id) });
        }
        const updatedVacancy = {
            ...vacancy, bgColor: occupiedVacancy.bgColor, bdColor: occupiedVacancy.bdColor, status: 'occupied'
        };
        return([
            ...vacancies.slice(0, vacancyIndex), updatedVacancy, ...vacancies.slice(vacancyIndex + 1)
        ]);
    } else if (vacancyStatus === VacancyStatus.RESERVED) {
        const updatedVacancy = {
            ...vacancy, bgColor: reservedVacancy.bgColor, bdColor: reservedVacancy.bdColor, status: 'reserved'
        };
        return ([
            ...vacancies.slice(0, vacancyIndex), updatedVacancy, ...vacancies.slice(vacancyIndex + 1)
        ]);
    } else {
        if (!vacancyStatus || vacancyStatus !== VacancyStatus.OPEN) {
            console.log('OPEN');
            localStorage.setItem(vacancyNumber, VacancyStatus.OPEN);
            await Api.setOpen({ vacancy_number: Number(vacancy.id) });
        }
        // set Vacancy isOccupied to false
        // set Vacancy History end_date
        const updatedVacancy = { ...vacancy, bgColor: openVacancy.bgColor, bdColor: openVacancy.bdColor, status: 'open' };
        return([
            ...vacancies.slice(0, vacancyIndex), updatedVacancy, ...vacancies.slice(vacancyIndex + 1)
        ]);
    }
}