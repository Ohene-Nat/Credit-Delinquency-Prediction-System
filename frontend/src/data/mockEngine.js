/**
 * PLACEHOLDER SCORING — NOT A MACHINE LEARNING MODEL.
 * A fixed rule-of-thumb formula so the UI has something to render during Phase 1.
 * It will be replaced by a call to the FastAPI model service in a later phase.
 */
export function mockScore(i, age) {
    const util = i.creditLimit > 0 ? Math.min(i.currentBalance / i.creditLimit, 1.5) : 1;
    const dti = i.monthlyIncome > 0 ? Math.min(i.monthlyDebtPayments / i.monthlyIncome, 1.5) : 1.5;
    const factors = [
        { feature: 'Credit utilization', impact: (util - 0.4) * 2.0 },
        { feature: 'Late 30–59 days', impact: i.late30to59 * 0.45 },
        { feature: 'Late 60–89 days', impact: i.late60to89 * 0.8 },
        { feature: 'Late 90+ days', impact: i.late90Plus * 1.3 },
        { feature: 'Debt-to-income ratio', impact: (dti - 0.35) * 1.8 },
        { feature: 'Account age', impact: -Math.min(i.accountAgeMonths / 120, 1) * 0.6 },
        { feature: 'Customer age', impact: age < 30 ? 0.25 : age > 45 ? -0.3 : 0 },
        { feature: 'Dependents', impact: i.dependents * 0.08 },
    ].map((f) => ({ ...f, impact: Math.round(f.impact * 100) / 100 }));
    const z = -1.2 + factors.reduce((s, f) => s + f.impact, 0);
    const probability = 1 / (1 + Math.exp(-z));
    return { outcome: probability >= 0.5 ? 'Delinquent' : 'Not Delinquent', probability, factors: factors.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact)) };
}
