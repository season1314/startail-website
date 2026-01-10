export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class Validator {
    private value: any;
    private errors: string[] = [];

    constructor(value: any) {this.value = value}

    required(message = "This field is required") {
        if (!this.value || String(this.value).trim() === "") {this.errors.push(message);}
        return this;
    }

    email(message = "Invalid email format") {
        if (this.value && !emailRegex.test(this.value)) { this.errors.push(message)}
        return this;
    }

    length(min:number = 0, max:number = 0) {
        if (min && this.value.length < min){ this.errors.push(`This field can last than ${min} characters`);return this}
        if (max && this.value.length > max){ this.errors.push(`This field can more than ${max} characters`); return this}
        return this
    }

    isValid() { return this.errors.length === 0;}

    getErrors() { return this.errors}
}

export const valid = (value: any) => new Validator(value);