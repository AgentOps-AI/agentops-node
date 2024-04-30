export function toSnakeCase(str: string): string {
    return str.replace(/([A-Z])/g, "_$1").toLowerCase();
}


export function transformKeysToSnakeCase(obj: any): any {
    if (obj instanceof Array) {
        return obj.map((v) => transformKeysToSnakeCase(v));
    } else if (obj !== null && typeof obj === 'object') {
        return Object.keys(obj).reduce((result, key) => {
            result[toSnakeCase(key)] = transformKeysToSnakeCase(obj[key]);
            return result;
        }, {} as any);
    }
    return obj;
}
