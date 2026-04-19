import { promises as fs } from 'fs'
import path from 'path'

export type ViewingRequestStatus = 'Matched' | 'Pending' | 'On the way'

export interface AgentViewingRequest {
  id: string
  tenantName: string
  tenantPhone: string
  houseId: string
  houseTitle: string
  area: string
  propertyType: string
  time: string
  pickupPoint: string
  status: ViewingRequestStatus
  feeStatus: 'To be decided later'
  createdAt: string
}

const STORE_DIR = path.join(process.cwd(), 'data')
const STORE_FILE = path.join(STORE_DIR, 'agent-viewing-requests.json')

const seededRequests: AgentViewingRequest[] = [
  {
    id: 'VR-101',
    tenantName: 'Mercy Wanjiku',
    tenantPhone: '0700000001',
    houseId: 'fallback-1',
    houseTitle: 'Sunny Bedsitter Near Main Gate',
    area: 'Kahawa Wendani',
    propertyType: 'Bedsitter',
    time: 'Today, 4:30 PM',
    pickupPoint: 'KU Main Gate',
    status: 'Matched',
    feeStatus: 'To be decided later',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'VR-102',
    tenantName: 'Kevin Auma',
    tenantPhone: '0700000002',
    houseId: 'fallback-2',
    houseTitle: 'Quiet Single Room With WiFi',
    area: 'Githurai 44',
    propertyType: 'Single room',
    time: 'Today, 6:00 PM',
    pickupPoint: 'KU Gate A',
    status: 'On the way',
    feeStatus: 'To be decided later',
    createdAt: new Date().toISOString(),
  },
]

async function ensureStore() {
  await fs.mkdir(STORE_DIR, { recursive: true })

  try {
    await fs.access(STORE_FILE)
  } catch {
    await fs.writeFile(STORE_FILE, JSON.stringify(seededRequests, null, 2), 'utf-8')
  }
}

export async function getAgentViewingRequests(): Promise<AgentViewingRequest[]> {
  await ensureStore()
  const raw = await fs.readFile(STORE_FILE, 'utf-8')

  try {
    const parsed = JSON.parse(raw) as AgentViewingRequest[]
    return Array.isArray(parsed) ? parsed : seededRequests
  } catch {
    return seededRequests
  }
}

export async function createAgentViewingRequest(
  payload: Omit<AgentViewingRequest, 'id' | 'createdAt'>
): Promise<AgentViewingRequest> {
  const current = await getAgentViewingRequests()

  const nextRequest: AgentViewingRequest = {
    ...payload,
    id: `VR-${100 + current.length + 1}`,
    createdAt: new Date().toISOString(),
  }

  const nextData = [nextRequest, ...current]
  await fs.writeFile(STORE_FILE, JSON.stringify(nextData, null, 2), 'utf-8')

  return nextRequest
}
