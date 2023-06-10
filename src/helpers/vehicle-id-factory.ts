export const vehicleIdFactory = (): string => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"; 
    const numbers = "0123456789";

    let first = "";
    let second = "";
    for (let i = 0; i <= 2; i++) {
        first += letters.at(Math.floor(Math.random() * letters.length));
    }
    for (let i = 0; i <= 3; i++) {
        second += numbers.at(Math.floor(Math.random() * numbers.length));
    }
    
    return (first + "-" + second);
}