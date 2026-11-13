import type { Animal, DemoCommand, DemoState } from './types.ts';
import { assertDomain } from './errors.ts';
import { activeAnimal, actor, bilingual, findById, heldCollateral, nextId, notify, ownedAnimal, payment } from './domain-context.ts';
import { hasText, isPositiveMoney, isValidDate, isoAfter, maximumLoanAmount } from './validation.ts';

/** Fixed, illustrative demo policy. It is not a market valuation or an actual lending rate. */
export function demoLoanQuote(animal: Animal) {
  const collateralValue = Math.floor(animal.value * (animal.healthScore < 75 ? 0.8 : 1));
  return { collateralValue, maximumAmount: maximumLoanAmount(collateralValue), annualRate: animal.healthScore < 75 ? 15 : 10 };
}
function policyActor(state: DemoState, policyId: string) {
  const insurer = actor(state, ['insurer']); const policy = findById(state.policies, policyId);
  assertDomain(policy.insurerId === insurer.id, 'unauthorized'); return policy;
}
function claimActor(state: DemoState, claimId: string) {
  const insurer = actor(state, ['insurer']); const claim = findById(state.claims, claimId);
  assertDomain(claim.insurerId === insurer.id, 'unauthorized'); return claim;
}
function loanActor(state: DemoState, loanId: string) {
  const bank = actor(state, ['bank']); const loan = findById(state.loans, loanId);
  assertDomain(loan.bankId === bank.id, 'unauthorized'); return loan;
}
export function hasIoTEvidence(state: DemoState, animalId: string, incidentAt: string): boolean {
  const device = state.devices.find(item => item.animalId === animalId && item.connected);
  if (!device || !isValidDate(incidentAt)) return false;
  const incident = Date.parse(incidentAt);
  const readings = device.readings.filter(item => Date.parse(item.at) <= incident).sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  if (readings.length < 9) return false;
  const window = readings.filter(item => Date.parse(item.at) >= incident - 48 * 3_600_000);
  return window.length >= 9 && Date.parse(window[0].at) <= incident - 48 * 3_600_000 && incident - Date.parse(window[window.length - 1].at) <= 6 * 3_600_000 && window.every((reading, index) => index === 0 || Date.parse(reading.at) - Date.parse(window[index - 1].at) <= 6 * 3_600_000);
}

export function handleFinance(state: DemoState, command: DemoCommand): { id?: string } | undefined {
  switch (command.type) {
    case 'policy.apply': {
      const animal = activeAnimal(state, command.animalId); const insurer = findById(state.users, command.insurerId);
      assertDomain(insurer.role === 'insurer' && insurer.status === 'active', 'validation');
      assertDomain(isPositiveMoney(command.coverage) && command.coverage <= animal.value);
      assertDomain(!state.policies.some(item => item.animalId === animal.id && ['submitted', 'active'].includes(item.status)), 'duplicate');
      const id = nextId(state, 'policy'); state.policies.push({ id, farmerId: animal.ownerId, animalId: animal.id, insurerId: insurer.id, coverage: command.coverage, premium: Math.max(1, Math.ceil(command.coverage * 0.03)), status: 'submitted', submittedAt: state.now, enhanced: true });
      notify(state, insurer.id, bilingual('নতুন বীমা আবেদন', 'New insurance application'), bilingual('আবেদন ও পশুর স্বাস্থ্য তথ্য পর্যালোচনা করুন।', 'Review the application and animal health record.'), 'applications', id); return { id };
    }
    case 'policy.decide': {
      const policy = policyActor(state, command.policyId); assertDomain(policy.status === 'submitted', 'invalid_transition');
      assertDomain(command.approve || hasText(command.note, 3, 1000));
      if (command.approve) {
        const animal = findById(state.animals, policy.animalId); assertDomain(!['sold', 'deceased'].includes(animal.status), 'invalid_transition');
        payment(state, policy.farmerId, 'premium', policy.premium, 'debit', policy.id);
        policy.status = 'active'; policy.startsAt = state.now; policy.expiresAt = isoAfter(state.now, 365 * 1440);
      } else policy.status = 'rejected';
      policy.decisionNote = command.note;
      notify(state, policy.farmerId, bilingual('বীমা আবেদনের সিদ্ধান্ত', 'Insurance application decision'), command.approve ? bilingual('ডেমো প্রিমিয়াম পরিশোধ হয়েছে ও কভারেজ সক্রিয়।', 'The demo premium was paid and coverage is active.') : bilingual('আবেদন প্রত্যাখ্যান করা হয়েছে। কারণ দেখুন।', 'The application was declined. Review the reason.'), 'insurance', policy.id); return { id: policy.id };
    }
    case 'policy.renew': {
      const policy = findById(state.policies, command.policyId); const animal = activeAnimal(state, policy.animalId);
      assertDomain(policy.status === 'expired' || policy.status === 'active' && !!policy.expiresAt && Date.parse(policy.expiresAt) <= Date.parse(isoAfter(state.now, 30 * 1440)), 'invalid_transition');
      assertDomain(!state.claims.some(item => item.policyId === policy.id && !['rejected', 'paid'].includes(item.status)), 'invalid_transition');
      assertDomain(!state.policies.some(item => item.id !== policy.id && item.animalId === animal.id && ['active', 'submitted'].includes(item.status)), 'duplicate');
      payment(state, animal.ownerId, 'premium', policy.premium, 'debit', policy.id);
      const startsAt = policy.expiresAt && policy.expiresAt > state.now ? policy.expiresAt : state.now;
      policy.status = 'active'; policy.startsAt ??= state.now; policy.expiresAt = isoAfter(startsAt, 365 * 1440); return { id: policy.id };
    }
    case 'claim.submit': {
      const policy = findById(state.policies, command.policyId); const animal = ownedAnimal(state, policy.animalId);
      assertDomain(policy.farmerId === animal.ownerId, 'unauthorized');
      assertDomain(policy.status === 'active' && policy.startsAt && policy.expiresAt && policy.startsAt <= state.now && policy.expiresAt > state.now, 'coverage');
      assertDomain(animal.status !== 'sold' && animal.status !== 'deceased', 'invalid_transition');
      assertDomain(['illness', 'death'].includes(command.kind) && isPositiveMoney(command.amount) && command.amount <= policy.coverage);
      assertDomain(command.evidence && command.evidence.photo === true && command.evidence.location === true && hasText(command.evidence.description, 8, 2000), 'evidence');
      const capturedAt = command.evidence.capturedAt ?? state.now;
      assertDomain(isValidDate(capturedAt) && capturedAt <= state.now && capturedAt >= policy.startsAt, 'evidence');
      if (command.evidence.latitude !== undefined || command.evidence.longitude !== undefined) assertDomain(Number.isFinite(command.evidence.latitude) && Number.isFinite(command.evidence.longitude) && Math.abs(command.evidence.latitude!) <= 90 && Math.abs(command.evidence.longitude!) <= 180, 'evidence');
      assertDomain(!state.claims.some(item => item.policyId === policy.id && item.status !== 'rejected'), 'duplicate');
      const id = nextId(state, 'claim'); state.claims.push({ id, policyId: policy.id, animalId: animal.id, farmerId: animal.ownerId, insurerId: policy.insurerId, kind: command.kind, amount: command.amount, evidence: { ...command.evidence, capturedAt }, status: 'submitted', createdAt: state.now });
      notify(state, policy.insurerId, bilingual('নতুন দাবি', 'New claim'), bilingual('নমুনা প্রমাণ ও স্বাস্থ্য রেকর্ড যাচাই করুন।', 'Review the sample evidence and health records.'), 'claims', id); return { id };
    }
    case 'claim.autoReview': {
      const claim = claimActor(state, command.claimId); assertDomain(claim.status === 'submitted', 'invalid_transition');
      const policy = findById(state.policies, claim.policyId);
      const iot = hasIoTEvidence(state, claim.animalId, claim.evidence.capturedAt ?? claim.createdAt);
      const complete = claim.evidence.photo && claim.evidence.location && !!claim.evidence.capturedAt;
      // Only the complete enhanced death scenario demonstrates an automatic decision.
      claim.status = claim.kind === 'death' && policy.enhanced && iot && complete ? 'approved' : 'manual_review';
      claim.decisionNote = claim.status === 'approved' ? 'ডেমো নিয়ম: নমুনা ছবি, GPS/সময় ও ৪৮ ঘণ্টার IoT তথ্য মিলে গেছে। / Demo rule: sample photo, GPS/time and 48-hour IoT evidence matched.' : 'ডেমো নিয়ম: প্রমাণ বা IoT তথ্যের জন্য মানুষের পর্যালোচনা প্রয়োজন। / Demo rule: evidence or IoT data requires manual review.';
      notify(state, claim.farmerId, bilingual('দাবি পর্যালোচনা আপডেট', 'Claim review updated'), bilingual('আপনার দাবির বর্তমান অবস্থা দেখুন।', 'View the current status of your claim.'), 'claims', claim.id); return { id: claim.id };
    }
    case 'claim.refer': {
      const claim = claimActor(state, command.claimId); assertDomain(['submitted', 'manual_review'].includes(claim.status), 'invalid_transition');
      const vet = findById(state.users, command.vetId); assertDomain(vet.role === 'vet' && vet.status === 'active');
      claim.status = 'vet_review'; claim.vetId = vet.id;
      notify(state, vet.id, bilingual('দাবি পর্যালোচনার অনুরোধ', 'Claim review requested'), bilingual('স্বাস্থ্য রেকর্ড ও প্রমাণ দেখে মতামত দিন।', 'Review health records and evidence, then add your opinion.'), 'claims', claim.id); return { id: claim.id };
    }
    case 'claim.vetReview': {
      const vet = actor(state, ['vet']); const claim = findById(state.claims, command.claimId);
      assertDomain(claim.vetId === vet.id, 'unauthorized'); assertDomain(claim.status === 'vet_review', 'invalid_transition'); assertDomain(hasText(command.opinion, 8, 3000));
      claim.vetOpinion = command.opinion; claim.status = 'manual_review';
      notify(state, claim.insurerId, bilingual('পশুচিকিৎসকের মতামত এসেছে', 'Veterinary opinion received'), bilingual('দাবির সিদ্ধান্ত দেওয়া যাবে।', 'The claim is ready for a decision.'), 'claims', claim.id); return { id: claim.id };
    }
    case 'claim.decide': {
      const claim = claimActor(state, command.claimId); assertDomain(['submitted', 'manual_review'].includes(claim.status), 'invalid_transition'); assertDomain(hasText(command.note, 3, 2000));
      assertDomain(!claim.vetId || hasText(claim.vetOpinion), 'invalid_transition');
      claim.status = command.approve ? 'approved' : 'rejected'; claim.decisionNote = command.note;
      notify(state, claim.farmerId, bilingual('দাবির সিদ্ধান্ত', 'Claim decision'), command.approve ? bilingual('ডেমো দাবি অনুমোদিত। পেআউটের অপেক্ষায়।', 'The demo claim is approved and awaits payout.') : bilingual('দাবি প্রত্যাখ্যান হয়েছে। কারণ দেখুন।', 'The claim was declined. Review the reason.'), 'claims', claim.id); return { id: claim.id };
    }
    case 'claim.pay': {
      const claim = claimActor(state, command.claimId); assertDomain(claim.status === 'approved', 'invalid_transition');
      const policy = findById(state.policies, claim.policyId); assertDomain(policy.status === 'active' || policy.status === 'expired', 'coverage');
      assertDomain(claim.amount <= policy.coverage && isPositiveMoney(claim.amount));
      let remainder = claim.amount; let settlement = 0;
      if (claim.kind === 'death') {
        for (const loan of state.loans.filter(item => item.animalId === claim.animalId && item.farmerId === claim.farmerId && item.status === 'active')) {
          const amount = Math.min(remainder, loan.outstanding);
          if (amount > 0) { payment(state, loan.bankId, 'debt_settlement', amount, 'credit', loan.id); loan.outstanding -= amount; remainder -= amount; settlement += amount; if (loan.outstanding === 0) loan.status = 'settled'; }
        }
        // Cancel offers/approvals that have not disbursed; deceased livestock cannot secure new funds.
        for (const loan of state.loans.filter(item => item.animalId === claim.animalId && ['offered', 'submitted', 'approved'].includes(item.status))) { loan.status = 'rejected'; loan.decisionNote = 'পশুর মৃত্যুজনিত দাবি / Animal death claim'; }
        const animal = findById(state.animals, claim.animalId); animal.status = 'deceased';
        state.records.push({ id: nextId(state, 'record'), animalId: animal.id, kind: 'death', title: bilingual('মৃত্যুজনিত দাবি নিষ্পত্তি · ডেমো', 'Death claim settled · demo'), note: claim.evidence.description, createdAt: state.now });
        for (const device of state.devices.filter(item => item.animalId === animal.id)) device.connected = false;
      }
      if (remainder > 0) payment(state, claim.farmerId, 'insurance_payout', remainder, 'credit', claim.id);
      claim.payout = claim.amount; claim.debtSettlement = settlement; claim.farmerPayout = remainder; claim.status = 'paid'; policy.status = 'settled';
      notify(state, claim.farmerId, bilingual('ডেমো পেআউট সম্পন্ন', 'Demo payout complete'), bilingual('জামানতের বকেয়া ঋণ সমন্বয় করে অবশিষ্ট টাকা ওয়ালেটে যোগ হয়েছে।', 'Any secured debt was settled first; the remaining payout was credited to your wallet.'), 'claims', claim.id);
      if (settlement > 0) notify(state, findById(state.loans, state.loans.find(item => item.animalId === claim.animalId && item.farmerId === claim.farmerId)!.id).bankId, bilingual('জামানতের ঋণ সমন্বয়', 'Collateral debt settlement'), bilingual('বীমা দাবি থেকে ডেমো ঋণ সমন্বয় হয়েছে।', 'The insurance claim funded a simulated debt settlement.'), 'loans');
      return { id: claim.id };
    }
    case 'loan.offer': {
      const animal = activeAnimal(state, command.animalId); assertDomain(!heldCollateral(state, animal.id), 'collateral');
      assertDomain(isPositiveMoney(command.amount) && Number.isInteger(command.termMonths) && command.termMonths >= 1 && command.termMonths <= 36 && hasText(command.purpose, 3, 500) && hasText(command.repaymentSource, 3, 500));
      const quote = demoLoanQuote(animal); assertDomain(command.amount <= quote.maximumAmount, 'ltv');
      const bank = state.users.find(item => item.role === 'bank' && item.status === 'active'); assertDomain(bank, 'not_found');
      const id = nextId(state, 'loan'); state.loans.push({ id, farmerId: animal.ownerId, animalId: animal.id, bankId: bank.id, purpose: command.purpose, repaymentSource: command.repaymentSource, collateralValue: quote.collateralValue, amount: command.amount, annualRate: quote.annualRate, termMonths: command.termMonths, outstanding: 0, status: 'offered', createdAt: state.now }); return { id };
    }
    case 'loan.accept': {
      const loan = findById(state.loans, command.loanId); activeAnimal(state, loan.animalId); assertDomain(loan.status === 'offered', 'invalid_transition');
      assertDomain(!heldCollateral(state, loan.animalId, loan.id), 'collateral'); loan.status = 'submitted';
      notify(state, loan.bankId, bilingual('নতুন ঋণ আবেদন', 'New loan application'), bilingual('জামানত, স্বাস্থ্য তথ্য ও আয়ের উৎস যাচাই করুন।', 'Review the collateral, health history, and repayment source.'), 'applications', loan.id); return { id: loan.id };
    }
    case 'loan.decide': {
      const loan = loanActor(state, command.loanId); assertDomain(loan.status === 'submitted', 'invalid_transition'); assertDomain(command.approve || hasText(command.note, 3, 1000));
      assertDomain(loan.amount <= maximumLoanAmount(loan.collateralValue), 'ltv'); loan.status = command.approve ? 'approved' : 'rejected'; loan.decisionNote = command.note;
      notify(state, loan.farmerId, bilingual('ঋণ আবেদনের সিদ্ধান্ত', 'Loan application decision'), command.approve ? bilingual('ডেমো আবেদন অনুমোদিত। বিতরণের অপেক্ষায়।', 'The demo loan is approved and awaits disbursement.') : bilingual('ঋণ আবেদন প্রত্যাখ্যান হয়েছে।', 'The loan application was declined.'), 'loans', loan.id); return { id: loan.id };
    }
    case 'loan.disburse': {
      const loan = loanActor(state, command.loanId); assertDomain(loan.status === 'approved', 'invalid_transition');
      const animal = findById(state.animals, loan.animalId); assertDomain(!['sold', 'deceased'].includes(animal.status), 'invalid_transition'); assertDomain(!heldCollateral(state, loan.animalId, loan.id), 'collateral');
      assertDomain(loan.amount <= maximumLoanAmount(loan.collateralValue), 'ltv'); payment(state, loan.farmerId, 'loan_disbursement', loan.amount, 'credit', loan.id);
      loan.status = 'active'; loan.outstanding = loan.amount; loan.dueAt = isoAfter(state.now, 30 * 1440);
      notify(state, loan.farmerId, bilingual('ডেমো ঋণ বিতরণ', 'Demo loan disbursed'), bilingual('ওয়ালেটে নমুনা অর্থ যোগ হয়েছে। কোনো বাস্তব লেনদেন হয়নি।', 'Sample funds were added to the wallet. No real transaction occurred.'), 'loans', loan.id); return { id: loan.id };
    }
    case 'loan.repay': {
      const user = actor(state, ['farmer']); const loan = findById(state.loans, command.loanId); assertDomain(loan.farmerId === user.id, 'unauthorized'); assertDomain(loan.status === 'active', 'invalid_transition');
      assertDomain(isPositiveMoney(command.amount) && command.amount <= loan.outstanding);
      payment(state, user.id, 'repayment', command.amount, 'debit', loan.id); loan.outstanding -= command.amount;
      if (loan.outstanding === 0) loan.status = 'paid';
      notify(state, loan.bankId, bilingual('ঋণ পরিশোধ এসেছে', 'Repayment received'), bilingual('ডেমো বকেয়া আপডেট হয়েছে।', 'The simulated outstanding balance was updated.'), 'loans', loan.id); return { id: loan.id };
    }
    case 'loan.grace': {
      const loan = loanActor(state, command.loanId); assertDomain(loan.status === 'active' && !loan.graceUntil, 'invalid_transition');
      assertDomain(findById(state.animals, loan.animalId).productionDrop, 'invalid_transition'); assertDomain(Number.isInteger(command.days) && command.days >= 1 && command.days <= 90 && hasText(command.note, 3, 1000));
      loan.graceUntil = isoAfter(loan.dueAt && loan.dueAt > state.now ? loan.dueAt : state.now, command.days * 1440); loan.decisionNote = command.note;
      notify(state, loan.farmerId, bilingual('পরিশোধের সময় বাড়ানো হয়েছে', 'Repayment grace period granted'), bilingual('উৎপাদন কমার নমুনা তথ্য দেখে ব্যাংক সময় বাড়িয়েছে।', 'The bank granted more time after reviewing the sample production drop.'), 'loans', loan.id); return { id: loan.id };
    }
    default: return undefined;
  }
}
