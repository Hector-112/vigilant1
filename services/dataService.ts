
import { Product, UserProfile } from '../types';
import { db, isFirebaseConfigured } from './firebase';
import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  setDoc,
  limit,
  where
} from 'firebase/firestore';

const COLLECTION_NAME = 'products';
const USERS_COLLECTION = 'users';

export const dataService = {
  async getProducts(userId: string): Promise<Product[]> {
    if (!isFirebaseConfigured || !db) {
      return this.getLocalProducts(userId);
    }

    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        where('userId', '==', userId),
        orderBy('addedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const products: Product[] = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as Product);
      });
      
      localStorage.setItem(`vigilant_products_${userId}`, JSON.stringify(products));
      return products;
    } catch (error: any) {
      return this.getLocalProducts(userId);
    }
  },

  getAllGlobalProducts(): Product[] {
    const products: Product[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('vigilant_products_')) {
        try {
          const list = JSON.parse(localStorage.getItem(key) || '[]');
          products.push(...list);
        } catch (e) {}
      }
    }
    return products;
  },

  async syncUserToGlobalDirectory(user: UserProfile) {
    if (!user.phoneNumber) return;

    const localDir = JSON.parse(localStorage.getItem('vigilant_global_directory') || '[]');
    const exists = localDir.findIndex((u: any) => u.phoneNumber === user.phoneNumber);
    const userEntry = { 
      uid: user.uid, 
      email: user.email, 
      displayName: user.displayName,
      phoneNumber: user.phoneNumber,
      lastSeen: new Date().toISOString()
    };

    if (exists > -1) {
      localDir[exists] = { ...localDir[exists], ...userEntry };
    } else {
      localDir.push(userEntry);
    }
    localStorage.setItem('vigilant_global_directory', JSON.stringify(localDir));

    if (isFirebaseConfigured && db) {
      try {
        const userDoc = doc(db, USERS_COLLECTION, user.uid);
        await setDoc(userDoc, userEntry, { merge: true });
      } catch (e) {}
    }
  },

  async getGlobalUserDirectory(): Promise<UserProfile[]> {
    if (isFirebaseConfigured && db) {
      try {
        const snapshot = await getDocs(collection(db, USERS_COLLECTION));
        const users: UserProfile[] = [];
        snapshot.forEach(doc => users.push(doc.data() as UserProfile));
        if (users.length > 0) return users;
      } catch (e) {}
    }
    return JSON.parse(localStorage.getItem('vigilant_global_directory') || '[]');
  },

  getLocalProducts(userId: string): Product[] {
    const localData = localStorage.getItem(`vigilant_products_${userId}`);
    return localData ? JSON.parse(localData) : [];
  },

  async saveProduct(product: Product): Promise<boolean> {
    const userId = product.userId || 'demo-user';
    const localProducts = this.getLocalProducts(userId);
    const exists = localProducts.findIndex(p => p.id === product.id);
    if (exists > -1) localProducts[exists] = product;
    else localProducts.unshift(product);
    localStorage.setItem(`vigilant_products_${userId}`, JSON.stringify(localProducts));

    if (!isFirebaseConfigured || !db) return true;

    try {
      const docRef = doc(db, COLLECTION_NAME, product.id);
      await setDoc(docRef, product);
      return true;
    } catch (error) {
      return false;
    }
  },

  async deleteProduct(id: string, userId: string): Promise<boolean> {
    const localProducts = this.getLocalProducts(userId);
    const updated = localProducts.filter(p => p.id !== id);
    localStorage.setItem(`vigilant_products_${userId}`, JSON.stringify(updated));

    if (!isFirebaseConfigured || !db) return true;

    try {
      await deleteDoc(doc(db, COLLECTION_NAME, id));
      return true;
    } catch (error) {
      return false;
    }
  },

  async checkConnectivity(): Promise<boolean> {
    if (!isFirebaseConfigured || !db) return false;
    try {
      const q = query(collection(db, COLLECTION_NAME), limit(1));
      await getDocs(q);
      return true;
    } catch (e: any) {
      return false;
    }
  }
};
