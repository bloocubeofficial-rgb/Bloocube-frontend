"use client";
import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/lib/apiClient";

export type WalletTransaction = { _id: string; type: string; amount: number; note?: string; createdAt: string };
export type Withdrawal = { _id: string; amount: number; method: string; status: string; createdAt: string };
export type WalletData = { availableBalance: number; pendingBalance: number; totalEarnings: number };

export function useWallet() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<{ success: boolean; data: { wallet: WalletData; transactions: WalletTransaction[]; withdrawals: Withdrawal[] } }>("/api/wallet");
      setWallet(res.data.wallet);
      setTransactions(res.data.transactions);
      setWithdrawals(res.data.withdrawals);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load wallet");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const withdraw = useCallback(async (amount: number, method: "upi" | "bank", details: Record<string, string>) => {
    await apiRequest("/api/wallet/withdraw", { method: "POST", body: JSON.stringify({ amount, method, details }) });
    await refetch();
  }, [refetch]);

  return { wallet, transactions, withdrawals, loading, error, refetch, withdraw };
}
