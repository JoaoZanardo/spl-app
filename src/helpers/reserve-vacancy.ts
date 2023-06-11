import { StylingVacancy, VacancyStatus } from "../types";
import { io } from "socket.io-client";

const baseUrlIPV4 = 'http://192.168.0.148';
const socket = io(`${baseUrlIPV4}:8080`);


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

export const reserveVacancy = {
    local: (vacancy: StylingVacancy | null): void => {
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
    },

    external: (vacancies: StylingVacancy[], id: string): void => {
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
    }
}