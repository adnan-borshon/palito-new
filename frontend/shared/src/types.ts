/** Platform-independent demo contract. Monetary amounts are BDT, never minor units. */
export type Role = 'farmer' | 'vet' | 'bank' | 'insurer' | 'admin';
export type Locale = 'bn' | 'en';
export type Id = string;
export type ISODate = string;
export type Localized = { bn: string; en: string };
export type Severity = 'info' | 'warning' | 'critical';
export interface User {
  id: Id; role: Role; name: string; nameBn: string; phone: string;
  status: 'active' | 'suspended'; district: string; avatar?: string;
  specialty?: string; fee?: number; rating?: number; available?: boolean; schedule?: string;
}
export interface Farm { id: Id; ownerId: Id; name: string; district: string; address: string; size: number; }
export interface Animal {
  id: Id; ownerId: Id; farmId: Id; tag: string; name: string;
  species: 'cattle' | 'goat' | 'buffalo'; breed: string; sex: 'female' | 'male';
  birthDate: ISODate; weightKg: number; value: number; healthScore: number;
  status: 'healthy' | 'attention' | 'critical' | 'deceased' | 'sold';
  image?: string; registeredAt: ISODate; productionDrop?: boolean;
}
export interface HealthRecord {
  id: Id; animalId: Id; vetId?: Id; appointmentId?: Id;
  kind: 'registration' | 'checkup' | 'vaccination' | 'treatment' | 'death';
  title: Localized; note: string; createdAt: ISODate; nextDueAt?: ISODate;
}
export interface VitalReading { at: ISODate; temperature: number; heartRate: number; activity: number; }
export interface Device {
  id: Id; animalId: Id; serial: string; connected: boolean; battery: number;
  lastSeenAt: ISODate; readings: VitalReading[];
}
export interface HealthAlert {
  id: Id; animalId: Id; kind: 'temperature' | 'heart_rate' | 'inactivity' | 'disconnected' | 'emergency';
  severity: Severity; title: Localized; message: Localized; createdAt: ISODate;
  status: 'open' | 'acknowledged' | 'escalated' | 'resolved'; appointmentId?: Id;
}
export interface Appointment {
  id: Id; farmerId: Id; animalId: Id; vetId: Id; alertId?: Id;
  scheduledAt: ISODate; mode: 'video' | 'visit'; priority: 'routine' | 'urgent' | 'emergency';
  reason: string; status: 'requested' | 'accepted' | 'rejected' | 'cancelled' | 'in_progress' | 'completed';
  createdAt: ISODate; decisionNote?: string; consultationNote?: string;
}
export interface Medicine { name: string; dose: string; frequency: string; days: number; }
export interface Prescription {
  id: Id; appointmentId: Id; animalId: Id; farmerId: Id; vetId: Id;
  diagnosis: string; advice: string; medicines: Medicine[]; createdAt: ISODate;
}
export interface MedicationReminder {
  id: Id; prescriptionId: Id; animalId: Id; medicine: string; time: string; takenDates: string[]; enabled: boolean;
}
export interface Product {
  id: Id; name: Localized; category: 'medicine' | 'feed' | 'equipment'; price: number;
  unit: Localized; stock: number; image?: string; requiresPrescription: boolean;
}
export interface CartItem { productId: Id; quantity: number; }
export interface Order {
  id: Id; farmerId: Id; items: (CartItem & { price: number })[]; total: number; address: string;
  status: 'placed' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'; createdAt: ISODate;
}
export interface Evidence { photo: boolean; location: boolean; description: string; capturedAt?: ISODate; latitude?: number; longitude?: number; }
export interface Policy {
  id: Id; farmerId: Id; animalId: Id; insurerId: Id; coverage: number; premium: number;
  status: 'submitted' | 'active' | 'rejected' | 'expired' | 'settled';
  submittedAt: ISODate; startsAt?: ISODate; expiresAt?: ISODate; decisionNote?: string; enhanced?: boolean;
}
export interface Claim {
  id: Id; policyId: Id; animalId: Id; farmerId: Id; insurerId: Id;
  kind: 'illness' | 'death'; amount: number; evidence: Evidence;
  status: 'submitted' | 'manual_review' | 'vet_review' | 'approved' | 'rejected' | 'paid';
  createdAt: ISODate; vetId?: Id; vetOpinion?: string; decisionNote?: string;
  payout?: number; debtSettlement?: number; farmerPayout?: number;
}
export interface Loan {
  id: Id; farmerId: Id; animalId: Id; bankId: Id; purpose: string; repaymentSource: string;
  collateralValue: number; amount: number; annualRate: number; termMonths: number;
  outstanding: number; status: 'offered' | 'submitted' | 'approved' | 'rejected' | 'active' | 'paid' | 'settled';
  createdAt: ISODate; dueAt?: ISODate; graceUntil?: ISODate; decisionNote?: string;
}
export interface Payment {
  id: Id; userId: Id; kind: 'loan_disbursement' | 'repayment' | 'insurance_payout' | 'debt_settlement' | 'order' | 'premium';
  amount: number; direction: 'credit' | 'debit'; referenceId: Id; createdAt: ISODate;
}
export interface Notification {
  id: Id; userId: Id; title: Localized; body: Localized; createdAt: ISODate;
  read: boolean; screen?: string; entityId?: Id;
}
export interface Education {
  id: Id; title: Localized; body: Localized; category: 'health' | 'nutrition' | 'finance';
  status: 'draft' | 'published'; updatedAt: ISODate;
}
export interface AuditEvent { id: Id; actorId: Id; action: string; entityId?: Id; at: ISODate; detail: string; }
export interface AIMessage { id: Id; userId: Id; role: 'user' | 'assistant'; text: Localized; at: ISODate; mode: 'text' | 'photo' | 'voice'; }
export type DemoScenario = 'normal' | 'health' | 'insurance' | 'lending' | 'empty';
export interface DemoState {
  schemaVersion: 1; revision: number; now: ISODate;
  session: { userId: Id | null; locale: Locale; onboarded: boolean; pendingPhone?: string; otpExpiresAt?: ISODate };
  settings: { offline: boolean; notifications: boolean; scenario: DemoScenario; failNext?: boolean };
  processedRequests: { requestId: Id; command: string; resultId?: Id }[];
  users: User[]; farms: Farm[]; animals: Animal[]; records: HealthRecord[];
  devices: Device[]; alerts: HealthAlert[]; appointments: Appointment[];
  prescriptions: Prescription[]; reminders: MedicationReminder[];
  products: Product[]; carts: Record<Id, CartItem[]>; orders: Order[];
  policies: Policy[]; claims: Claim[]; loans: Loan[]; payments: Payment[];
  notifications: Notification[]; content: Education[]; audit: AuditEvent[]; aiMessages: AIMessage[];
}
export type AnimalInput = Pick<Animal, 'name' | 'species' | 'breed' | 'sex' | 'birthDate' | 'weightKg' | 'value'>;
export type DemoCommandBody =
  | { type: 'auth.requestOtp'; phone: string }
  | { type: 'auth.verifyOtp'; code: string }
  | { type: 'auth.switch'; userId: Id }
  | { type: 'auth.logout' }
  | { type: 'session.locale'; locale: Locale }
  | { type: 'session.onboard' }
  | { type: 'profile.update'; name: string; district: string; specialty?: string; available?: boolean; schedule?: string }
  | { type: 'farm.save'; name: string; district: string; address: string; size: number }
  | { type: 'animal.add'; animal: AnimalInput }
  | { type: 'animal.update'; animalId: Id; animal: Partial<AnimalInput> }
  | { type: 'animal.archive'; animalId: Id }
  | { type: 'record.add'; animalId: Id; kind: HealthRecord['kind']; title: Localized; note: string; nextDueAt?: ISODate }
  | { type: 'device.connect'; animalId: Id; serial: string }
  | { type: 'device.disconnect'; deviceId: Id }
  | { type: 'alert.simulate'; animalId: Id; kind: HealthAlert['kind']; severity: Severity }
  | { type: 'alert.acknowledge'; alertId: Id }
  | { type: 'appointment.book'; animalId: Id; vetId: Id; scheduledAt: ISODate; mode: Appointment['mode']; priority: Appointment['priority']; reason: string; alertId?: Id }
  | { type: 'appointment.decide'; appointmentId: Id; accept: boolean; note?: string }
  | { type: 'appointment.cancel'; appointmentId: Id; reason: string }
  | { type: 'appointment.reschedule'; appointmentId: Id; scheduledAt: ISODate }
  | { type: 'consultation.start'; appointmentId: Id }
  | { type: 'consultation.complete'; appointmentId: Id; diagnosis: string; advice: string; medicines: Medicine[] }
  | { type: 'reminder.toggle'; reminderId: Id; enabled: boolean }
  | { type: 'reminder.take'; reminderId: Id }
  | { type: 'ai.ask'; text: string; mode: AIMessage['mode'] }
  | { type: 'cart.set'; productId: Id; quantity: number }
  | { type: 'order.place'; address: string }
  | { type: 'order.cancel'; orderId: Id }
  | { type: 'order.advance'; orderId: Id }
  | { type: 'policy.apply'; animalId: Id; insurerId: Id; coverage: number }
  | { type: 'policy.decide'; policyId: Id; approve: boolean; note?: string }
  | { type: 'policy.renew'; policyId: Id }
  | { type: 'claim.submit'; policyId: Id; kind: Claim['kind']; amount: number; evidence: Evidence }
  | { type: 'claim.autoReview'; claimId: Id }
  | { type: 'claim.refer'; claimId: Id; vetId: Id }
  | { type: 'claim.vetReview'; claimId: Id; opinion: string }
  | { type: 'claim.decide'; claimId: Id; approve: boolean; note: string }
  | { type: 'claim.pay'; claimId: Id }
  | { type: 'loan.offer'; animalId: Id; amount: number; termMonths: number; purpose: string; repaymentSource: string }
  | { type: 'loan.accept'; loanId: Id }
  | { type: 'loan.decide'; loanId: Id; approve: boolean; note?: string }
  | { type: 'loan.disburse'; loanId: Id }
  | { type: 'loan.repay'; loanId: Id; amount: number }
  | { type: 'loan.grace'; loanId: Id; days: number; note: string }
  | { type: 'notification.read'; notificationId?: Id }
  | { type: 'settings.notifications'; enabled: boolean }
  | { type: 'admin.userStatus'; userId: Id; status: User['status'] }
  | { type: 'admin.userRole'; userId: Id; role: Role }
  | { type: 'content.save'; id?: Id; title: Localized; body: Localized; category: Education['category']; status: Education['status'] }
  | { type: 'demo.offline'; offline: boolean }
  | { type: 'demo.failNext' }
  | { type: 'demo.advanceTime'; hours: number }
  | { type: 'demo.reset'; scenario: DemoScenario };
export type DemoCommand = DemoCommandBody & { requestId?: string };
export type ErrorCode = 'validation' | 'unauthorized' | 'not_found' | 'conflict' | 'offline' | 'storage' | 'unknown' | 'blocked' | 'invalid_transition' | 'duplicate' | 'network' | 'corrupt_storage' | 'version' | 'collateral' | 'ltv' | 'evidence' | 'coverage' | 'iot' | 'funds' | 'otp';
export type CommandResult = { ok: true; id?: Id; message?: Localized } | { ok: false; code: ErrorCode; message: Localized };
export interface DemoStorage { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<void>; removeItem(key: string): Promise<void>; }
export interface RepositoryOptions { storage?: DemoStorage; now?: () => Date; latencyMs?: number; initialState?: DemoState; }
export interface DemoRepository {
  getSnapshot(): DemoState;
  subscribe(listener: () => void): () => void;
  hydrate(): Promise<CommandResult>;
  execute(command: DemoCommand): Promise<CommandResult>;
}
