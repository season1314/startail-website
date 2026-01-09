export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

class Validator {
    private value: any;
    private errors: string[] = [];

    constructor(value: any) {
        this.value = value;
    }

    required(message = "This field is required") {
        if (!this.value || String(this.value).trim() === "") {
            this.errors.push(message);
        }
        return this;
    }

    email(message = "Invalid email format") {
        if (this.value && !emailRegex.test(this.value)) {
            this.errors.push(message);
        }
        return this;
    }

    isValid() {
        return this.errors.length === 0;
    }

    getErrors() {
        return this.errors;
    }
}

export const valid = (value: any) => new Validator(value);