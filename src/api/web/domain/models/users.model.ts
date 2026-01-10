export class UsersModel {
    private readonly _id: string;
    private readonly _nickname: string;
    private readonly _avatar: string
    private readonly _status: number
    private readonly _password: string
    private readonly _email: string

    constructor(data: any) {
        this._id = data._id?.toString();
        this._nickname = data.nickname;
        this._status = data.status;
        this._avatar = data.avatar;
        this._password = data.password;
        this._email = data.email;
    }
    
    get id() { return this._id; }
    get nickname() { return this._nickname; }
    get email() { return this._email; }
    get password() { return this._password; }
    get avatar() { return this._avatar; }
    get status() { return this._status; }

    toUserDto() {
        return {
            id: this._id,
            nickname: this._nickname,
            status: this._status ? 'disabled' : 'available',
            avatar: this._avatar,
            email: this._email
        };
    }

    toUserDtoWithPass() {
        return {
            id: this._id,
            nickname: this._nickname,
            status: this._status ? 'disabled' : 'available',
            avatar: this._avatar,
            email: this._email,
            password: this._password
        }
    }
}