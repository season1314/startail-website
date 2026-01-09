export class ConfigsModel {
    private readonly _id: string;
    private readonly _properties: Record<string, any>;
    private readonly _key: string;
    private readonly _name: string

    constructor(data: any) {
        this._id = data._id?.toString();
        this._properties = data.property;
        this._key = data.key;
        this._name = data.name
    }

    getFormattedProperty(lang: string = 'en') {
        return this._properties.map(item => {
            const keys = Object.keys(item);
            if (keys.length === 0) return '';
            const subObject = item[keys[0]];
            return { key: keys[0], value: subObject[lang] || subObject['en'] || '', path: keys[0].replace(/\s+/g, '') };
        });
    }

    getConfigObjectKeys() {
        return this._properties.map(item => {
            const keys = Object.keys(item)[0];
            return keys
        })
    }

    toConfigDto(lang: string = 'en') {
        return this.getFormattedProperty(lang);
    }

    toConfigObjectKeys() {
        return this.getConfigObjectKeys()
    }
}