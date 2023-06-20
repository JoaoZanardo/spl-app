import { useEffect } from "react";
import { io } from "socket.io-client";
import Api from "../../hooks/useApi";
import { vehicleIdFactory } from "../../helpers";
import { env } from "../../config/env";

const socket = io(`${env.baseUrl}:8080`);

export const RedirectPage = (): JSX.Element => {
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const coordsQuery = queryParams.get('coords');
        const vacancyQuery = queryParams.get('vacancy');
        if (coordsQuery && vacancyQuery) {
            socket.emit('qrCodeScanned');
            setTimeout(() => {
                (async () => {
                    console.log('BEFORE');
                    await Api.reserveVacancy({
                        vehicle_id: vehicleIdFactory(),
                        vacancy_number: Number(JSON.parse(vacancyQuery).id)
                    });
                })();
                const formattedCoords = coordsQuery!.replace(/,/g, '.').trim();
                window.location.replace('https://www.google.com/maps/dir/?api=1&origin=' +
                    encodeURIComponent('-22.705561746328065, -47.65297798509142')
                    + "&destination=" + encodeURIComponent(formattedCoords));
            }, 500);
        }
    }, []);

    return (
        <></>
    )
}