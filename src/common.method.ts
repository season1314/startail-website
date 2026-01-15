//Common methods
export class CommonMethods {
    /**
 * Check equality of two array
 * @param arr1 
 * @param arr2 
 * @returns 
 */
    static async arraysEqualIgnoreOrder(arr1: any[], arr2: any[]) {
        if (arr1.length !== arr2.length) return false;
        const a = [...arr1].sort();
        const b = [...arr2].sort();
        return a.every((val, index) => val === b[index]);
    }

    /**
     * find keys for Object[{}] 
     * @param array 
     * @returns 
     */
    static async getArrayObjectKey(array: Record<string, any> | null | undefined): Promise<string[]> {
        if (array) {
            return array.map(obj => Object.keys(obj)[0]);
        } else {
            return []
        }
    }

    /**
     * config property format as lang
     * @param config 
     * @param lang 
     * @returns 
     */
    static async configFormatByLang(config: Record<string, any> | null | undefined, lang: string): Promise<Record<string, any> | null | undefined> {
        if (!config) return config
        return config.map((item: any) => {
            const obj = item as Record<string, Record<string, string>>;
            const key = Object.keys(obj)[0];
            const value = Object.values(obj)[0][lang];
            return { [key]: value };
        })
    }
}