// Local type definitions (removed Prisma dependency)
export type TransactionStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
export type TransactionType = 'BOOKING_FEE' | 'RENT_PAYMENT' | 'SECURITY_DEPOSIT'

export interface DemoMpesaTransaction {
  id: string
  status: TransactionStatus
  amount: number
  currency: string
  phoneNumber: string
  checkoutRequestId: string
  merchantRequestId: string
  receiptNumber?: string | null
  accountReference: string
  failedReason?: string | null
  paidAt?: string | null
  reconciledAt?: string | null
  transactionType: TransactionType
  property: {
    id: string
    title: string
    area?: string
    location?: string
  }
}

type DemoStore = {
  mpesaTransactions?: Map<string, DemoMpesaTransaction>
}

const globalForDemoStore = globalThis as typeof globalThis & DemoStore

function getStore() {
  if (!globalForDemoStore.mpesaTransactions) {
    globalForDemoStore.mpesaTransactions = new Map<string, DemoMpesaTransaction>()
  }

  return globalForDemoStore.mpesaTransactions
}

export function upsertDemoMpesaTransaction(transaction: DemoMpesaTransaction) {
  getStore().set(transaction.checkoutRequestId, transaction)
  return transaction
}

export function getDemoMpesaTransaction(checkoutRequestId: string) {
  return getStore().get(checkoutRequestId) || null
}

export function updateDemoMpesaTransaction(
  checkoutRequestId: string,
  patch: Partial<DemoMpesaTransaction>
) {
  const store = getStore()
  const existing = store.get(checkoutRequestId)

  if (!existing) {
    return null
  }

  const nextTransaction: DemoMpesaTransaction = {
    ...existing,
    ...patch,
    property: patch.property || existing.property,
  }

  store.set(checkoutRequestId, nextTransaction)
  return nextTransaction
}