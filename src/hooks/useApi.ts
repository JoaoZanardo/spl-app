import axios, { AxiosInstance } from 'axios';

type HttpResponse = {
    status: number;
    data: any;
}

type ReserveData = {
    vehicle_id: string;
    vacancy_number: number;
}

type Data = {
    vacancy_number: number;
}

class Api {
    private instace: AxiosInstance;
    constructor(provider = axios) {
        this.instace = provider.create({
            baseURL: 'http://172.17.121.70:8080'
        });
    }

    async reserveVacancy(data: ReserveData): Promise<HttpResponse> {
        try {
            console.log("Before response");
            const response = await this.instace.post('/reserve', data);
            console.log({ response });
            return {
                data: response.data,
                status: response.status
            }
        } catch (error) {
            const response = (<any>error).response;
            return {
                status: response?.status || 500,
                data: response.data
            };       
        }
    }

    async setOccupied(data: Data): Promise<HttpResponse> {
        try {
            const response = await this.instace.post('/occupied', data);
            return {
                data: response.data,
                status: response.status
            }
        } catch (error) {
            const response = (<any>error).response;
            return {
                status: response?.status || 500,
                data: response.data
            };       
        }
    }

    async setOpen(data: Data): Promise<HttpResponse> {
        try {
            const response = await this.instace.post('/open', data);
            return {
                data: response.data,
                status: response.status
            }
        } catch (error) {
            const response = (<any>error).response;
            return {
                status: response?.status || 500,
                data: response.data
            };       
        }
    }

    async getAllVacancies(): Promise<HttpResponse> {
        try {
            const response = await this.instace.get('/vacancies');
            return {
                data: response.data,
                status: response.status
            }
        } catch (error) {
            const response = (<any>error).response;
            return {
                status: response?.status || 500,
                data: response.data
            } 
        } 
    }

    async getVancacyStories(vacancyId: string): Promise<HttpResponse> {
        try {
            const response = await this.instace.get(`/vacancies/stories/${vacancyId}`);
            return {
                data: response.data,
                status: response.status
            }
        } catch (error) {
            const response = (<any>error).response;
            return {
                status: response?.status || 500,
                data: response.data
            } 
        } 
    }

    async getVacancyCoordsByVacancyNumber(vacancyNumber: string): Promise<HttpResponse> {
        try {
            const response = await this.instace.get(`/search/number/${vacancyNumber}`);
            return {
                data: response.data,
                status: response.status
            }
        } catch (error) {
            const response = (<any>error).response;
            return {
                status: response?.status || 500,
                data: response.data
            } 
        } 
    }

    async getVacancyCoordsByVehicleId(vehicleId: string): Promise<HttpResponse> {
        try {
            const response = await this.instace.get(`/search/vehicle/${vehicleId}`);
            return {
                data: response.data,
                status: response.status
            }
        } catch (error) {
            const response = (<any>error).response;
            return {
                status: response?.status || 500,
                data: response.data
            } 
        } 
    }
}

export default new Api;