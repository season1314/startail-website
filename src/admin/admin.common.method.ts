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
}