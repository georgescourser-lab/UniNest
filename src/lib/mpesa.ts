const MPESA_OAUTH_PATH = '/oauth/v1/generate?grant_type=client_credentials'
const MPESA_STK_PUSH_PATH = '/mpesa/stkpush/v1/processrequest'

export interface MpesaConfig {
  consumerKey: string
  consumerSecret: string
  shortcode: string
  passkey: string
  callbackUrl: string
  environment: 'sandbox' | 'production'
  callbackToken?: string
}

export interface MpesaStkPushRequest {
  amount: number
  phoneNumber: string
  accountReference: string
  transactionDescription: string
}

export interface MpesaStkPushResponse {
  MerchantRequestID?: string
  CheckoutRequestID?: string
  ResponseCode?: string
  ResponseDescription?: string
  CustomerMessage?: string
  errorCode?: string
  errorMessage?: string
}

export interface ParsedStkCallback {
  merchantRequestId: string
  checkoutRequestId: string
  resultCode: number
  resultDesc: string
  receiptNumber?: string
  transactionDate?: string
  phoneNumber?: string
  amount?: number
}

export function getMpesaConfig(): MpesaConfig {
  const consumerKey = process.env.MPESA_CONSUMER_KEY || ''
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET || ''
  const shortcode = process.env.MPESA_SHORTCODE || ''
  const passkey = process.env.MPESA_PASSKEY || ''
  const callbackUrl = process.env.MPESA_CALLBACK_URL || ''
  const callbackToken = process.env.MPESA_CALLBACK_TOKEN
  const environment = process.env.MPESA_ENV === 'production' ? 'production' : 'sandbox'

  return {
    consumerKey,
    consumerSecret,
    shortcode,
    passkey,
    callbackUrl,
    callbackToken,
    environment,
  }
}

export function assertMpesaConfig(config: MpesaConfig) {
  const missing: string[] = []

  if (!config.consumerKey) missing.push('MPESA_CONSUMER_KEY')
  if (!config.consumerSecret) missing.push('MPESA_CONSUMER_SECRET')
  if (!config.shortcode) missing.push('MPESA_SHORTCODE')
  if (!config.passkey) missing.push('MPESA_PASSKEY')
  if (!config.callbackUrl) missing.push('MPESA_CALLBACK_URL')

  return missing
}

export function normalizeKenyanPhoneNumber(rawPhoneNumber: string): string | null {
  const digits = rawPhoneNumber.replace(/\D/g, '')

  if (/^2547\d{8}$/.test(digits) || /^2541\d{8}$/.test(digits)) {
    return digits
  }

  if (/^07\d{8}$/.test(digits) || /^01\d{8}$/.test(digits)) {
    return `254${digits.slice(1)}`
  }

  return null
}

export function getMpesaBaseUrl(environment: MpesaConfig['environment']): string {
  return environment === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke'
}

export function buildMpesaTimestamp(date = new Date()): string {
  const year = date.getFullYear().toString()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')

  return `${year}${month}${day}${hours}${minutes}${seconds}`
}

export function buildStkPassword(shortcode: string, passkey: string, timestamp: string): string {
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64')
}

function withCallbackToken(url: string, token?: string): string {
  if (!token) {
    return url
  }

  const hasQuery = url.includes('?')
  const separator = hasQuery ? '&' : '?'
  return `${url}${separator}token=${encodeURIComponent(token)}`
}

async function fetchMpesaAccessToken(config: MpesaConfig): Promise<string> {
  const baseUrl = getMpesaBaseUrl(config.environment)
  const auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64')

  const response = await fetch(`${baseUrl}${MPESA_OAUTH_PATH}`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Failed to fetch M-Pesa token (${response.status}): ${body}`)
  }

  const data = (await response.json()) as { access_token?: string }

  if (!data.access_token) {
    throw new Error('M-Pesa token response missing access_token')
  }

  return data.access_token
}

export async function initiateStkPush(
  config: MpesaConfig,
  payload: MpesaStkPushRequest
): Promise<MpesaStkPushResponse> {
  const accessToken = await fetchMpesaAccessToken(config)
  const timestamp = buildMpesaTimestamp()
  const password = buildStkPassword(config.shortcode, config.passkey, timestamp)
  const baseUrl = getMpesaBaseUrl(config.environment)

  const response = await fetch(`${baseUrl}${MPESA_STK_PUSH_PATH}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      BusinessShortCode: config.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(payload.amount),
      PartyA: payload.phoneNumber,
      PartyB: config.shortcode,
      PhoneNumber: payload.phoneNumber,
      CallBackURL: withCallbackToken(config.callbackUrl, config.callbackToken),
      AccountReference: payload.accountReference,
      TransactionDesc: payload.transactionDescription,
    }),
    cache: 'no-store',
  })

  const data = (await response.json()) as MpesaStkPushResponse

  if (!response.ok) {
    throw new Error(
      `M-Pesa STK push failed (${response.status}): ${JSON.stringify(data)}`
    )
  }

  return data
}

interface CallbackMetadataItem {
  Name: string
  Value?: string | number
}

interface StkCallbackPayload {
  Body?: {
    stkCallback?: {
      MerchantRequestID?: string
      CheckoutRequestID?: string
      ResultCode?: number
      ResultDesc?: string
      CallbackMetadata?: {
        Item?: CallbackMetadataItem[]
      }
    }
  }
}

function getMetadataValue(items: CallbackMetadataItem[], key: string) {
  const item = items.find((entry) => entry.Name === key)
  return item?.Value
}

export function parseStkCallbackPayload(payload: unknown): ParsedStkCallback | null {
  const callback = (payload as StkCallbackPayload)?.Body?.stkCallback

  if (!callback?.CheckoutRequestID || typeof callback.ResultCode !== 'number') {
    return null
  }

  const metadataItems = callback.CallbackMetadata?.Item || []

  const receipt = getMetadataValue(metadataItems, 'MpesaReceiptNumber')
  const transactionDate = getMetadataValue(metadataItems, 'TransactionDate')
  const phone = getMetadataValue(metadataItems, 'PhoneNumber')
  const amount = getMetadataValue(metadataItems, 'Amount')

  return {
    merchantRequestId: callback.MerchantRequestID || '',
    checkoutRequestId: callback.CheckoutRequestID,
    resultCode: callback.ResultCode,
    resultDesc: callback.ResultDesc || 'Unknown result',
    receiptNumber: typeof receipt === 'string' ? receipt : undefined,
    transactionDate: typeof transactionDate === 'number' ? String(transactionDate) : undefined,
    phoneNumber:
      typeof phone === 'number' ? String(phone) : typeof phone === 'string' ? phone : undefined,
    amount: typeof amount === 'number' ? amount : undefined,
  }
}
