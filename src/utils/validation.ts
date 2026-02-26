import { Countries, Identifications } from "../models/User";

/**
 * Country-aware ID validation patterns
 * Extensible: add new countries here as needed
 */

// Regex patterns for personal IDs per country
const personalIdPatterns: Record<Countries, { regex: RegExp; example: string; label: string }> = {
    [Countries.Chile]: {
        regex: /^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/,
        example: "12.345.678-9",
        label: "RUT",
    },
    [Countries.Peru]: {
        regex: /^\d{8,11}$/,
        example: "12345678901",
        label: "RUC",
    },
    [Countries.Colombia]: {
        regex: /^\d{1,3}\.?\d{3}\.?\d{3}-?\d$/,
        example: "123.456.789-0",
        label: "NIT",
    },
};

// Regex patterns for business IDs per country
const businessIdPatterns: Record<Countries, { regex: RegExp; example: string; label: string }> = {
    [Countries.Chile]: {
        regex: /^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/,
        example: "12.345.678-9",
        label: "RUT Empresa",
    },
    [Countries.Peru]: {
        regex: /^\d{8,11}$/,
        example: "12345678901",
        label: "RUC Empresa",
    },
    [Countries.Colombia]: {
        regex: /^\d{1,3}\.?\d{3}\.?\d{3}-?\d$/,
        example: "123.456.789-0",
        label: "NIT Empresa",
    },
};

// Maps Countries to their expected Identifications value  
const countryToIdType: Record<Countries, Identifications> = {
    [Countries.Chile]: Identifications.Chile,
    [Countries.Peru]: Identifications.Peru,
    [Countries.Colombia]: Identifications.Colombia,
};

/**
 * Validates a personalId value against the expected format for a given country.
 * Returns `true` if valid, throws an Error describing the issue otherwise.
 */
export function validatePersonalId(personalId: string, country: Countries): true {
    const pattern = personalIdPatterns[country];
    if (!pattern) {
        throw new Error(`País no soportado: ${country}`);
    }
    if (!pattern.regex.test(personalId)) {
        throw new Error(
            `Formato de ${pattern.label} inválido. Ejemplo: ${pattern.example}`
        );
    }
    return true;
}

/**
 * Validates a businessId value against the expected format for a given country.
 * Returns `true` if valid, throws an Error describing the issue otherwise.
 */
export function validateBusinessId(businessId: string, country: Countries): true {
    const pattern = businessIdPatterns[country];
    if (!pattern) {
        throw new Error(`País no soportado: ${country}`);
    }
    if (!pattern.regex.test(businessId)) {
        throw new Error(
            `Formato de ${pattern.label} inválido. Ejemplo: ${pattern.example}`
        );
    }
    return true;
}

/**
 * Gets the expected idType (identification type) for a given country.
 */
export function getIdTypeForCountry(country: Countries): Identifications {
    const idType = countryToIdType[country];
    if (!idType) {
        throw new Error(`País no soportado: ${country}`);
    }
    return idType;
}

export { personalIdPatterns, businessIdPatterns, countryToIdType };
