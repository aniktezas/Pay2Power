// ============================================================
// SmartPay Switch — Wallet Service (Mock Payments)
// ============================================================

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Wallet, Transaction, TransactionStatus } from '../types';
import { generatePaymentRef } from '../utils/formatters';

const MOCK_WALLET_KEY = 'smartpay_mock_wallet';
const MOCK_TRANSACTIONS_KEY = 'smartpay_mock_transactions';

function getMockWallet(userId: string): Wallet {
  const stored = localStorage.getItem(MOCK_WALLET_KEY + '_' + userId);
  if (!stored) return { id: 'w-' + userId, user_id: userId, balance: 100, updated_at: new Date().toISOString() };
  try { return JSON.parse(stored); } catch { return { id: 'w-' + userId, user_id: userId, balance: 100, updated_at: new Date().toISOString() }; }
}

function saveMockWallet(wallet: Wallet): void {
  localStorage.setItem(MOCK_WALLET_KEY + '_' + wallet.user_id, JSON.stringify(wallet));
}

function getMockTransactions(userId: string): Transaction[] {
  const stored = localStorage.getItem(MOCK_TRANSACTIONS_KEY + '_' + userId);
  if (!stored) return [];
  try { return JSON.parse(stored); } catch { return []; }
}

function saveMockTransactions(userId: string, txns: Transaction[]): void {
  localStorage.setItem(MOCK_TRANSACTIONS_KEY + '_' + userId, JSON.stringify(txns));
}

export const walletService = {
  async getWallet(userId: string): Promise<Wallet> {
    if (!isSupabaseConfigured) return getMockWallet(userId);
    const { data, error } = await supabase.from('wallets').select('*').eq('user_id', userId).single();
    if (error || !data) {
      // Create wallet if not exists
      const { data: newWallet } = await supabase.from('wallets').insert({ user_id: userId, balance: 0 }).select().single();
      return newWallet!;
    }
    return data;
  },

  async addCredit(userId: string, amount: number): Promise<Wallet> {
    if (!isSupabaseConfigured) {
      const wallet = getMockWallet(userId);
      wallet.balance += amount;
      wallet.updated_at = new Date().toISOString();
      saveMockWallet(wallet);

      // Record transaction
      const txns = getMockTransactions(userId);
      const txn: Transaction = {
        id: 'txn-' + Math.random().toString(36).slice(2, 8),
        user_id: userId,
        device_id: '',
        amount,
        status: 'success',
        payment_reference: generatePaymentRef(),
        created_at: new Date().toISOString(),
      };
      txns.unshift(txn);
      saveMockTransactions(userId, txns);
      return wallet;
    }
    // Real Supabase
    const wallet = await this.getWallet(userId);
    const { data, error } = await supabase
      .from('wallets')
      .update({ balance: wallet.balance + amount, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async deductBalance(userId: string, amount: number): Promise<Wallet> {
    if (!isSupabaseConfigured) {
      const wallet = getMockWallet(userId);
      if (wallet.balance < amount) throw new Error('Insufficient wallet balance');
      wallet.balance -= amount;
      wallet.updated_at = new Date().toISOString();
      saveMockWallet(wallet);
      return wallet;
    }
    const wallet = await this.getWallet(userId);
    if (wallet.balance < amount) throw new Error('Insufficient wallet balance');
    const { data, error } = await supabase
      .from('wallets')
      .update({ balance: wallet.balance - amount, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .select().single();
    if (error) throw new Error(error.message);
    return data;
  },

  async getTransactions(userId: string): Promise<Transaction[]> {
    if (!isSupabaseConfigured) return getMockTransactions(userId);
    const { data, error } = await supabase
      .from('transactions')
      .select('*, devices(name, device_code)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async recordTransaction(
    userId: string,
    deviceId: string,
    amount: number,
    status: TransactionStatus = 'success'
  ): Promise<Transaction> {
    const txn: Transaction = {
      id: 'txn-' + Math.random().toString(36).slice(2, 8),
      user_id: userId,
      device_id: deviceId,
      amount,
      status,
      payment_reference: generatePaymentRef(),
      created_at: new Date().toISOString(),
    };
    if (!isSupabaseConfigured) {
      const txns = getMockTransactions(userId);
      txns.unshift(txn);
      saveMockTransactions(userId, txns);
      return txn;
    }
    const { data, error } = await supabase.from('transactions').insert({
      user_id: userId, device_id: deviceId, amount, status, payment_reference: txn.payment_reference,
    }).select().single();
    if (error) throw new Error(error.message);
    return data;
  },
};