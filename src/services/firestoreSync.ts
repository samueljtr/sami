import {
  collection,
  doc,
  getDocs,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './firebase';
import { Category, DebtAccount, Transaction, UserSettings } from '../types/finance';

// User Profile
export async function saveFirestoreUserProfile(uid: string, settings: UserSettings, email?: string | null) {
  const path = `users/${uid}`;
  try {
    await setDoc(
      doc(db, 'users', uid),
      {
        uid,
        email: email || '',
        displayName: settings.personName,
        currency: settings.currency,
        currencySymbol: settings.currencySymbol,
        monthlyBudgetTotal: settings.monthlyBudgetTotal || 2000,
        monthlySavingsTarget: settings.monthlySavingsTarget || 500,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// User Transactions
export async function loadFirestoreTransactions(uid: string): Promise<Transaction[]> {
  const path = `users/${uid}/transactions`;
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'transactions'));
    return snap.docs.map((d) => d.data() as Transaction);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function saveFirestoreTransaction(uid: string, tx: Transaction) {
  const path = `users/${uid}/transactions/${tx.id}`;
  try {
    await setDoc(doc(db, 'users', uid, 'transactions', tx.id), tx);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function syncAllTransactionsToFirestore(uid: string, transactions: Transaction[]) {
  const path = `users/${uid}/transactions`;
  try {
    const batch = writeBatch(db);
    transactions.forEach((tx) => {
      const ref = doc(db, 'users', uid, 'transactions', tx.id);
      batch.set(ref, tx);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// User Debts
export async function loadFirestoreDebts(uid: string): Promise<DebtAccount[]> {
  const path = `users/${uid}/debts`;
  try {
    const snap = await getDocs(collection(db, 'users', uid, 'debts'));
    return snap.docs.map((d) => d.data() as DebtAccount);
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return [];
  }
}

export async function syncAllDebtsToFirestore(uid: string, debts: DebtAccount[]) {
  const path = `users/${uid}/debts`;
  try {
    const batch = writeBatch(db);
    debts.forEach((debt) => {
      const ref = doc(db, 'users', uid, 'debts', debt.id);
      batch.set(ref, debt);
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}
