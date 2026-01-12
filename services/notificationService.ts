
import { Product, UserProfile, NotificationLog, TransmissionConfig } from '../types';
import { generateNotificationEmail } from './geminiService';
import { dataService } from './dataService';

const SYSTEM_SMS_CONFIG = {
  accountSid: 'AC_VIGILANT_PRO_SYSTEM',
  fromNumber: 'VIGILANT-AUTH' 
};

export const notificationService = {
  async processGlobalSweep(currentUser: UserProfile): Promise<NotificationLog[]> {
    const logsKey = `vigilant_notif_logs_${currentUser.uid}`;
    const logs: NotificationLog[] = JSON.parse(localStorage.getItem(logsKey) || '[]');
    const config = this.getConfig(currentUser.uid);
    const now = new Date();
    const newDispatches: NotificationLog[] = [];

    await dataService.syncUserToGlobalDirectory(currentUser);
    
    const globalUsers = await dataService.getGlobalUserDirectory();
    const allProducts = dataService.getAllGlobalProducts();
    
    for (const product of allProducts) {
      const owner = globalUsers.find(u => u.uid === product.userId);
      if (!owner || owner.uid !== currentUser.uid) continue;

      const expiry = new Date(product.expiryDate + 'T00:00:00');
      const today = new Date();
      today.setHours(0,0,0,0);
      
      const diffMs = expiry.getTime() - today.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      const isUrgent = diffDays <= product.reminderDays && diffDays >= -2;
      
      const alreadyNotifiedToday = product.lastNotifiedAt && 
        new Date(product.lastNotifiedAt).toDateString() === now.toDateString();

      if (isUrgent && !alreadyNotifiedToday) {
        if (owner.phoneNumber && config.smsEnabled) {
          const smsBody = `VIGILANT: Your item "${product.name}" is expiring ${diffDays === 0 ? 'TODAY' : diffDays < 0 ? 'EXPIRED' : 'in ' + diffDays + ' days'}. Please check your inventory.`;
          
          window.dispatchEvent(new CustomEvent('vigilant-sms-received', { 
            detail: { 
              body: smsBody, 
              from: SYSTEM_SMS_CONFIG.fromNumber,
              to: owner.phoneNumber,
              timestamp: new Date().toISOString()
            } 
          }));
          
          newDispatches.push({
            id: `log-sms-${Math.random().toString(36).substring(7)}`,
            productId: product.id,
            productName: product.name,
            type: 'sms',
            recipient: owner.phoneNumber,
            timestamp: now.toISOString(),
            content: `VIGILANT: ${product.name} alert routed to ${owner.phoneNumber}.`,
            status: 'Delivered'
          });

          const userProducts = dataService.getLocalProducts(owner.uid);
          const idx = userProducts.findIndex(p => p.id === product.id);
          if (idx > -1) {
            userProducts[idx].lastNotifiedAt = now.toISOString();
            localStorage.setItem(`vigilant_products_${owner.uid}`, JSON.stringify(userProducts));
          }
        }
      }
    }

    if (newDispatches.length > 0) {
      const updatedLogs = [...newDispatches, ...logs].slice(0, 50);
      localStorage.setItem(logsKey, JSON.stringify(updatedLogs));
      window.dispatchEvent(new CustomEvent('vigilant-alert-sent', { detail: { count: newDispatches.length } }));
      return updatedLogs;
    }
    return logs;
  },

  getLogs(userId: string): NotificationLog[] {
    return JSON.parse(localStorage.getItem(`vigilant_notif_logs_${userId}`) || '[]');
  },

  getConfig(userId: string): TransmissionConfig {
    const defaultData: TransmissionConfig = { 
      enabled: true,
      smsEnabled: true,
      theme: 'light',
      language: 'English'
    };
    try {
      const data = localStorage.getItem(`vigilant_mail_config_${userId}`);
      return data ? { ...defaultData, ...JSON.parse(data) } : defaultData;
    } catch {
      return defaultData;
    }
  },

  saveConfig(userId: string, config: TransmissionConfig) {
    localStorage.setItem(`vigilant_mail_config_${userId}`, JSON.stringify(config));
  }
};
