// Country & Identification enums (shared to avoid circular deps)
export enum Countries {
    Peru = "Peru", 
    Chile = "Chile", 
    Colombia = "Colombia"
}

export enum Identifications {
    Peru = "RUC", 
    Chile = "RUT", 
    Colombia = "NIT", 
}

export interface UserEmailInterface {
    email: string
    name: string
    token: string
}

export interface AdminEmailInterface {
    userId: string;
    email: string;
    name: string;
    businessName: string;
    personalId: string;
    businessId: string;
    idType: Identifications;
    country: Countries;
    address: string;
    phone: string;
    token: string;
}
