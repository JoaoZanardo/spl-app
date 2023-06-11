import { 
    OpenedVacancy, 
    ReservedVacancy, 
    StylingVacancy, 
    VacancyStatus 
} from "../types";
import { io } from "socket.io-client";
import { OccupiedVacancy } from '../types';

const baseUrlIPV4 = 'http://192.168.0.148';
const socket = io(`${baseUrlIPV4}:8080`);

export const reserveVacancy = {
    local: (vacancy: StylingVacancy | null): void => {
        if (!vacancy) return;
            if (vacancy.bgColor === OccupiedVacancy.bgColor) return;
            vacancy.bgColor = ReservedVacancy.bgColor;
            vacancy.bdColor = ReservedVacancy.bdColor;
            setTimeout(() => {
                if (localStorage.getItem(vacancy.id) === VacancyStatus.RESERVED) {
                    localStorage.setItem(vacancy.id, VacancyStatus.OPEN);
                }
                vacancy.bgColor = OpenedVacancy.bgColor;
                vacancy.bdColor = OpenedVacancy.bdColor;
            }, 30000);
            socket.emit('vacancyClicked', vacancy.id);
            localStorage.setItem(vacancy.id, VacancyStatus.RESERVED);
    },

    external: (vacancies: StylingVacancy[], id: string): void => {
        const vacancyIndex = vacancies.findIndex(v => v.id === id);
        if (vacancyIndex === -1) return;
        const vacancy = vacancies[vacancyIndex];
        vacancy.bgColor = ReservedVacancy.bgColor;
        vacancy.bdColor = ReservedVacancy.bdColor;
        setTimeout(() => {
            if (localStorage.getItem(id) === VacancyStatus.RESERVED) {
                localStorage.setItem(id, VacancyStatus.OPEN);
            }
            vacancy.bgColor = OpenedVacancy.bgColor;
            vacancy.bdColor = OpenedVacancy.bdColor;
        }, 30000);
    }
}