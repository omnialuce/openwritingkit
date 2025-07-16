
'use client';

class StorageService {
  private isDriveConnected = false; 

  constructor() {
    // Defer the initial check to avoid running on the server
    if (typeof document !== 'undefined') {
      this.checkConnectionStatus();
    }
  }

  private checkConnectionStatus() {
    // This check is now safe because the constructor ensures it only runs client-side
    if (typeof document !== 'undefined') {
        this.isDriveConnected = document.cookie.includes('auth_session');
        console.log("Drive connected status:", this.isDriveConnected);
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    this.checkConnectionStatus();
    if (this.isDriveConnected) {
      await this.setDriveItem(key, value);
    } else {
      this.setLocalItem(key, value);
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    this.checkConnectionStatus();
    if (this.isDriveConnected) {
      return await this.getDriveItem(key);
    } else {
      return this.getLocalItem(key);
    }
  }

  async removeItem(key: string): Promise<void> {
    this.checkConnectionStatus();
    if (this.isDriveConnected) {
      await this.removeDriveItem(key);
    } else {
      this.removeLocalItem(key);
    }
  }

  // Local Storage Implementation
  private setLocalItem<T>(key: string, value: T): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  }

  private getLocalItem<T>(key: string): T | null {
    if (typeof window !== 'undefined') {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    }
    return null;
  }

  private removeLocalItem(key: string): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  }

  // Google Drive Implementation (Placeholders)
  private async setDriveItem<T>(key: string, value: T): Promise<void> {
    console.log(`DRIVE API: Setting item for key: ${key}`);
    // Placeholder: In a real app, you would make an API call to Google Drive
    // to create or update a file in a dedicated app folder.
    // The 'key' could be the filename.
    // The 'value' would be the file content (JSON stringified).
    // For now, we'll just log it.
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate network latency
    console.log(`DRIVE API: Successfully set ${key}`);
  }

  private async getDriveItem<T>(key: string): Promise<T | null> {
    console.log(`DRIVE API: Getting item for key: ${key}`);
    // Placeholder: In a real app, you would make an API call to Google Drive
    // to read a file's content from the app folder.
    // If the file doesn't exist, return null.
    // For now, we'll return null to demonstrate it's not implemented.
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(`DRIVE API: Item for ${key} not found (placeholder).`);
    return null;
  }

  private async removeDriveItem(key: string): Promise<void> {
    console.log(`DRIVE API: Removing item for key: ${key}`);
    // Placeholder: In a real app, you would make an API call to Google Drive
    // to delete a file.
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log(`DRIVE API: Successfully removed ${key}`);
  }
}

export const storage = new StorageService();
