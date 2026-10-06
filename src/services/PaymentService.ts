import type { PaymentAttempt, PaymentStatus } from '@/types';
import type { PaymentInitiateInput } from '@/services/interfaces';

// =====================
// Payment Service Abstraction
// =====================

export interface IPaymentProvider {
  initiatePayment(input: PaymentInitiateInput): PaymentAttempt;
  checkPaymentStatus(attemptId: string): PaymentStatus;
  name: string;
}

// =====================
// Mock Co-op Bank M-Pesa STK Push Provider
// =====================

type StatusUpdateCallback = (attemptId: string, status: PaymentStatus, ref?: string) => void;

export class MockCoopPaymentProvider implements IPaymentProvider {
  name = 'Mock Co-op Bank M-Pesa STK Push';
  private attempts: Map<string, PaymentAttempt> = new Map();
  private callbacks: Map<string, StatusUpdateCallback> = new Map();
  private timers: Map<string, ReturnType<typeof setTimeout>> = new Map();
  private onUpdateCallback?: (attemptId: string, status: PaymentStatus) => void;

  setOnUpdate(cb: (attemptId: string, status: PaymentStatus) => void) {
    this.onUpdateCallback = cb;
  }

  initiatePayment(input: PaymentInitiateInput): PaymentAttempt {
    const now = new Date().toISOString();
    const attempt: PaymentAttempt = {
      id: `pay-${Date.now()}`,
      saleId: input.saleId,
      amount: input.amount,
      method: 'MPESA_STK',
      status: 'PROCESSING',
      phoneNumber: input.phoneNumber,
      stkRef: `CO${Date.now().toString().slice(-8)}`,
      merchantRef: `MR${Date.now().toString().slice(-4)}`,
      createdAt: now,
      updatedAt: now,
      failureReason: null,
    };
    this.attempts.set(attempt.id, attempt);

    // Simulate STK Push lifecycle
    // After 4-7 seconds, payment will be confirmed (95% success rate)
    const delay = 4000 + Math.random() * 3000;
    const shouldSucceed = Math.random() > 0.05;

    const timer = setTimeout(() => {
      const current = this.attempts.get(attempt.id);
      if (!current || current.status !== 'PROCESSING') return;

      const finalStatus: PaymentStatus = shouldSucceed ? 'CONFIRMED' : 'FAILED';
      const updated: PaymentAttempt = {
        ...current,
        status: finalStatus,
        updatedAt: new Date().toISOString(),
        failureReason: shouldSucceed ? null : 'Customer did not respond to STK prompt',
      };
      this.attempts.set(attempt.id, updated);
      this.onUpdateCallback?.(attempt.id, finalStatus);
    }, delay);

    this.timers.set(attempt.id, timer);

    return attempt;
  }

  checkPaymentStatus(attemptId: string): PaymentStatus {
    const attempt = this.attempts.get(attemptId);
    return attempt?.status ?? 'PENDING';
  }

  cancelPayment(attemptId: string) {
    const timer = this.timers.get(attemptId);
    if (timer) clearTimeout(timer);
    const attempt = this.attempts.get(attemptId);
    if (attempt && attempt.status === 'PROCESSING') {
      const updated: PaymentAttempt = {
        ...attempt,
        status: 'CANCELLED',
        updatedAt: new Date().toISOString(),
        failureReason: 'Payment cancelled by cashier',
      };
      this.attempts.set(attemptId, updated);
      this.onUpdateCallback?.(attemptId, 'CANCELLED');
    }
  }

  // For demo testing: force confirm
  forceConfirm(attemptId: string) {
    const timer = this.timers.get(attemptId);
    if (timer) clearTimeout(timer);
    const attempt = this.attempts.get(attemptId);
    if (attempt && attempt.status === 'PROCESSING') {
      const updated: PaymentAttempt = {
        ...attempt,
        status: 'CONFIRMED',
        updatedAt: new Date().toISOString(),
        failureReason: null,
      };
      this.attempts.set(attemptId, updated);
      this.onUpdateCallback?.(attemptId, 'CONFIRMED');
    }
  }

  // For demo testing: force fail
  forceFail(attemptId: string) {
    const timer = this.timers.get(attemptId);
    if (timer) clearTimeout(timer);
    const attempt = this.attempts.get(attemptId);
    if (attempt && attempt.status === 'PROCESSING') {
      const updated: PaymentAttempt = {
        ...attempt,
        status: 'FAILED',
        updatedAt: new Date().toISOString(),
        failureReason: 'STK Push timed out',
      };
      this.attempts.set(attemptId, updated);
      this.onUpdateCallback?.(attemptId, 'FAILED');
    }
  }
}

// =====================
// Production Co-op Bank Provider (stub for future Laravel integration)
// =====================

export class CoopBankPaymentProvider implements IPaymentProvider {
  name = 'Co-op Bank M-Pesa STK Push';
  private baseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

  async initiatePayment(input: PaymentInitiateInput): Promise<PaymentAttempt> {
    // Production: POST to Laravel backend which handles Co-op Bank API
    // POST {baseUrl}/payments/stk-push
    // Body: { saleId, amount, phoneNumber }
    // Backend holds COOP_CLIENT_ID, COOP_CLIENT_SECRET, etc.
    const response = await fetch(`${this.baseUrl}/payments/stk-push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    const data = await response.json();
    return data.data as PaymentAttempt;
  }

  async checkPaymentStatus(attemptId: string): Promise<PaymentStatus> {
    // Production: GET {baseUrl}/payments/{id}
    const response = await fetch(`${this.baseUrl}/payments/${attemptId}`);
    const data = await response.json();
    return data.data.status as PaymentStatus;
  }
}

// Export singleton instance for demo mode
export const mockPaymentProvider = new MockCoopPaymentProvider();
