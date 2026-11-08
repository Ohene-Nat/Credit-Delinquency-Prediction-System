export type ProductType = 'Credit Card' | 'Loan'
export type Outcome = 'Delinquent' | 'Not Delinquent'
export type EmploymentStatus = 'Employed' | 'Self-employed' | 'Unemployed' | 'Retired' | 'Student'
export type ThemePref = 'light' | 'dark' | 'system'

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  age: number
  city: string
  employment: EmploymentStatus
  annualIncome: number
  product: ProductType
  createdAt: string
}

export interface FinancialInput {
  creditLimit: number
  currentBalance: number
  monthlyIncome: number
  monthlyDebtPayments: number
  openCreditLines: number
  late30to59: number
  late60to89: number
  late90Plus: number
  dependents: number
  accountAgeMonths: number
}

export interface FeatureContribution {
  feature: string
  /** positive = pushes toward Delinquent, negative = pushes toward Not Delinquent */
  impact: number
}

export interface Prediction {
  id: string
  customerId: string
  createdAt: string
  input: FinancialInput
  outcome: Outcome
  /** probability of delinquency, 0-1 */
  probability: number
  factors: FeatureContribution[]
  /** Phase 1: always 'mock'. Becomes 'model' once the FastAPI service is connected. */
  source: 'mock' | 'model'
}

export interface User {
  name: string
  email: string
  role: string
  phone: string
}
