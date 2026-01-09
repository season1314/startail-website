export interface RegistrationRecord {
    email: string;
    reg: string | null; // existed | pending | available
    count: number;
    hash: string;
}