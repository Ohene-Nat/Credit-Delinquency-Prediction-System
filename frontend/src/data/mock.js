import { mockScore } from './mockEngine';
let seed = 42;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const int = (a, b) => Math.floor(a + rnd() * (b - a + 1));
const people = [
    ['Ama Mensah', 'Accra'], ['Kwame Boateng', 'Kumasi'], ['Efua Owusu', 'Takoradi'], ['Yaw Asante', 'Tamale'],
    ['Abena Darko', 'Accra'], ['Kofi Annan Jr.', 'Cape Coast'], ['Akosua Frimpong', 'Kumasi'], ['Nana Addo-Quartey', 'Accra'],
    ['Esi Ampofo', 'Tema'], ['Kojo Tetteh', 'Ho'], ['Adwoa Sarpong', 'Sunyani'], ['Fiifi Quaye', 'Accra'],
    ['Maame Serwaa', 'Koforidua'], ['Selorm Agbenyega', 'Tema'], ['Gifty Ofori', 'Kumasi'], ['Emmanuel Nyarko', 'Accra'],
];
const emp = ['Employed', 'Employed', 'Employed', 'Self-employed', 'Self-employed', 'Retired', 'Unemployed', 'Student'];
const NOW = new Date('2026-11-02T12:00:00Z').getTime();
const DAY = 86400000;
export const seedCustomers = people.map(([name, city], i) => ({
    id: `C-${1001 + i}`,
    name,
    email: `${name.toLowerCase().replace(/[^a-z ]/g, '').replace(/ /g, '.')}@example.com`,
    phone: `+233 24 ${int(100, 999)} ${int(1000, 9999)}`,
    age: int(23, 63),
    city,
    employment: pick(emp),
    annualIncome: int(18, 140) * 1000,
    product: (rnd() > 0.25 ? 'Credit Card' : 'Loan'),
    createdAt: new Date(NOW - int(60, 400) * DAY).toISOString(),
}));
export const buildMockInput = (c) => {
    const limit = int(10, 120) * 100;
    const risky = rnd() > 0.62;
    return {
        creditLimit: limit,
        currentBalance: Math.round(limit * (risky ? 0.6 + rnd() * 0.6 : rnd() * 0.5)),
        monthlyIncome: Math.round(c.annualIncome / 12),
        monthlyDebtPayments: Math.round((c.annualIncome / 12) * (risky ? 0.35 + rnd() * 0.5 : rnd() * 0.35)),
        openCreditLines: int(1, 12),
        late30to59: risky ? int(0, 3) : 0,
        late60to89: risky ? int(0, 2) : 0,
        late90Plus: risky && rnd() > 0.4 ? int(1, 3) : 0,
        dependents: int(0, 4),
        accountAgeMonths: int(6, 180),
    };
};
export const seedPredictions = Array.from({ length: 46 }, (_, i) => {
    const c = pick(seedCustomers);
    const input = buildMockInput(c);
    const s = mockScore(input, c.age);
    return {
        id: `P-${5001 + i}`, customerId: c.id,
        createdAt: new Date(NOW - Math.floor((i / 46) * 175 * DAY) - int(0, 20) * 3600000).toISOString(),
        input, outcome: s.outcome, probability: s.probability, factors: s.factors, source: 'mock',
    };
}).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
/** Sample figures for the Analytics page. Not measured from any real model. */
export const sampleModelStats = {
    accuracy: 0.912, precision: 0.783, recall: 0.744, f1: 0.763, rocAuc: 0.936,
    confusion: { tn: 8420, fp: 310, fn: 402, tp: 1168 },
    featureImportance: [
        { feature: 'Credit utilization', value: 0.27 }, { feature: 'Late 90+ days', value: 0.19 },
        { feature: 'Debt-to-income ratio', value: 0.15 }, { feature: 'Late 30–59 days', value: 0.12 },
        { feature: 'Late 60–89 days', value: 0.1 }, { feature: 'Account age', value: 0.07 },
        { feature: 'Customer age', value: 0.05 }, { feature: 'Open credit lines', value: 0.03 },
        { feature: 'Dependents', value: 0.02 },
    ],
};
