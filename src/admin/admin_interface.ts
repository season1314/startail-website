export interface response<T = any> {
    code: number;
    messages?: {};
    data?: T;
}
