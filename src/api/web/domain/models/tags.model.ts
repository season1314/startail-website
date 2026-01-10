export class TagsModel {
    private readonly _id: string;
    private readonly _name: string;
    private readonly _lang: Record<string, any>;
    private readonly _type?: string

    constructor(data: any) {
        this._id = data._id.toString();
        this._name = data.name
        this._lang = data.lang
        this._type = data.type
    }

    get id() { return this._id; }
    get name() { return this._name; }
    get lang() { return this._lang; }
    get type() { return this._type; }


    toTagsDto() {
        return {
            id: this._id,
            name: this._name,
            lang: this._lang,
            type: this._type
        };
    }
}