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
}