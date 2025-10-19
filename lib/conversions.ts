
import { Unit } from '../types';

const ML_PER_OZ = 29.5735;
const ML_PER_CUP = 236.588;

export const convertAmount = (amount: number, fromUnit: Unit, toUnit: Unit): number => {
    if (fromUnit === toUnit) return amount;

    // First, convert the input amount to a base unit (ml)
    let amountInMl: number;
    switch (fromUnit) {
        case 'oz':
            amountInMl = amount * ML_PER_OZ;
            break;
        case 'cups':
            amountInMl = amount * ML_PER_CUP;
            break;
        case 'ml':
        default:
            amountInMl = amount;
            break;
    }

    // Then, convert from ml to the target unit
    switch (toUnit) {
        case 'oz':
            return amountInMl / ML_PER_OZ;
        case 'cups':
            return amountInMl / ML_PER_CUP;
        case 'ml':
        default:
            return amountInMl;
    }
};
