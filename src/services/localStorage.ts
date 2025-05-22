// Generic localStorage utilities with type safety and error handling

export class LocalStorageService {
  /**
   * Get data from localStorage with type safety
   */
  static get<T>(key: string, defaultValue: T): T {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Set data in localStorage with error handling
   */
  static set<T>(key: string, value: T): boolean {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
      return false;
    }
  }

  /**
   * Remove item from localStorage
   */
  static remove(key: string): boolean {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      return false;
    }
  }

  /**
   * Check if localStorage is available
   */
  static isAvailable(): boolean {
    try {
      const testKey = "__localStorage_test__";
      window.localStorage.setItem(testKey, "test");
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all keys with a specific prefix
   */
  static getKeys(prefix: string): string[] {
    try {
      const keys: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keys.push(key);
        }
      }
      return keys;
    } catch (error) {
      console.error(
        `Error getting localStorage keys with prefix "${prefix}":`,
        error
      );
      return [];
    }
  }

  /**
   * Clear all items with a specific prefix
   */
  static clearByPrefix(prefix: string): boolean {
    try {
      const keys = this.getKeys(prefix);
      keys.forEach((key) => this.remove(key));
      return true;
    } catch (error) {
      console.error(
        `Error clearing localStorage with prefix "${prefix}":`,
        error
      );
      return false;
    }
  }

  /**
   * Get storage usage info
   */
  static getStorageInfo() {
    try {
      let totalSize = 0;
      for (let key in window.localStorage) {
        if (window.localStorage.hasOwnProperty(key)) {
          totalSize += window.localStorage[key].length + key.length;
        }
      }
      return {
        isAvailable: this.isAvailable(),
        totalKeys: window.localStorage.length,
        estimatedSize: `${(totalSize / 1024).toFixed(2)} KB`,
      };
    } catch (error) {
      return {
        isAvailable: false,
        totalKeys: 0,
        estimatedSize: "0 KB",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
