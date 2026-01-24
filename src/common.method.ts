//Common methods
export class CommonMethods {
    /**
 * Check equality of two array
 * @param arr1 
 * @param arr2 
 * @returns 
 */
    static arraysEqualIgnoreOrder(arr1: any[], arr2: any[]) {
        if (arr1.length !== arr2.length) return false;
        const a = [...arr1].sort();
        const b = [...arr2].sort();
        return a.every((val, index) => val === b[index]);
    }

    /**
     * Find keys for Object[{}] 
     * [{a:1}{b:2}] =>  [a,b]
     * @param array 
     * @returns 
     */
    static getArrayObjectKey(array: Record<string, any> | null | undefined) {
        if (array) {
            return array.map(obj => Object.keys(obj)[0]);
        } else {
            return []
        }
    }

    /**
     * Config property format as lang
     * [a:{en:1,fr:2},b:{en:3,fr:4}] => [{a:1},{b:3}]
     * @param config 
     * @param lang 
     * @returns 
     */
    static configFormatByLang(config: Record<string, any> | null | undefined, lang: string) {
        if (!config) return config
        return config.map((item: any) => {
            const obj = item as Record<string, Record<string, string>>;
            const key = Object.keys(obj)[0];
            const value = Object.values(obj)[0][lang];
            return { [key]: value };
        })
    }

    /**
     * Tags format by lang
     * [{_id:xxxxxxx,lang:{cn:a,fr:b}}] => [{id:xxxxxx,lang:a}]
     * @param tags 
     * @param lang 
     * @returns 
     */
    static tagsFormatByLang(tags: Record<string, any> | null | undefined, lang: string, tagId: string) {
        if (!tags) return tags
        return tags.filter(Boolean).map(tag => {
            const id = tag._id?.toString();
            const langObj = Array.isArray(tag.lang) ? tag.lang.find(l => l.hasOwnProperty(lang)) : null;
            return {
                id: id,
                name: langObj ? langObj[lang] : langObj['en'],
                active: id == tagId ? "active" : ""
            }
        })
    }
}