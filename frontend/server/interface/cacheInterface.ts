export interface RegistrationRecord {
    email: string;
    reg: string | null; // existed | pending | available
    count: number;
    hash: string;
}

export interface UserData {
    email: string;
    avatar?: string;
    nickname: string;
    id: string;
    key?: string
}