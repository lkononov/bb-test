export function useLocalStorage() {
    function setItem<T>(key: string, value: T): boolean {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch {
            console.error('Cannot access localStorage');
        }
        return false;
    }

    function getItem<T>(key: string): T | null {
        try {
            const value = localStorage.getItem(key);
            if (!value) {
                return null;
            }

            return JSON.parse(value);
        } catch {
            console.error('Error while getting value from LS: ', key);
            return null;
        }
    }

    function removeItem(key: string): boolean {
        try {
            localStorage.removeItem(key);
            return true;
        } catch {
            console.error('Cannot access localStorage');
        }
        return false;
    }

    return { setItem, getItem, removeItem };
}
