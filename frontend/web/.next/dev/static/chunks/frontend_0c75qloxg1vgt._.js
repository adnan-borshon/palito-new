(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/frontend/shared/src/domain-context.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "activeAnimal",
    ()=>activeAnimal,
    "actor",
    ()=>actor,
    "bilingual",
    ()=>bilingual,
    "demoBalance",
    ()=>demoBalance,
    "findById",
    ()=>findById,
    "heldCollateral",
    ()=>heldCollateral,
    "linkedVet",
    ()=>linkedVet,
    "nextId",
    ()=>nextId,
    "notify",
    ()=>notify,
    "ownedAnimal",
    ()=>ownedAnimal,
    "payment",
    ()=>payment
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/errors.ts [app-client] (ecmascript)");
;
const bilingual = (bn, en)=>({
        bn,
        en
    });
const findById = (items, id)=>{
    const item = items.find((entry)=>entry.id === id);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(item, 'not_found');
    return item;
};
const demoBalance = (state, userId)=>state.payments.filter((payment)=>payment.userId === userId).reduce((total, payment)=>total + (payment.direction === 'credit' ? payment.amount : -payment.amount), 0);
function actor(state, roles) {
    const user = state.users.find((entry)=>entry.id === state.session.userId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(user, 'unauthorized');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(user.status === 'active', 'blocked');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(!roles || roles.includes(user.role), 'unauthorized');
    return user;
}
function ownedAnimal(state, animalId) {
    const user = actor(state, [
        'farmer'
    ]);
    const animal = findById(state.animals, animalId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(animal.ownerId === user.id, 'unauthorized');
    return animal;
}
function activeAnimal(state, animalId) {
    const animal = ownedAnimal(state, animalId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(![
        'sold',
        'deceased'
    ].includes(animal.status), 'invalid_transition');
    return animal;
}
function nextId(state, kind) {
    const count = Object.values(state).filter(Array.isArray).reduce((sum, values)=>sum + values.length, 0);
    return `${kind}-${state.revision + 1}-${count + 1}`;
}
function notify(state, userId, title, body, screen, entityId) {
    state.notifications.push({
        id: nextId(state, 'notification'),
        userId,
        title,
        body,
        read: false,
        createdAt: state.now,
        screen,
        entityId
    });
}
const heldCollateral = (state, animalId, exceptId)=>state.loans.some((loan)=>loan.animalId === animalId && loan.id !== exceptId && [
            'offered',
            'submitted',
            'approved',
            'active'
        ].includes(loan.status));
function payment(state, userId, kind, amount, direction, referenceId) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(Number.isSafeInteger(amount) && amount > 0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(Number.isSafeInteger(demoBalance(state, userId) + (direction === 'credit' ? amount : -amount)));
    if (direction === 'debit') (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(demoBalance(state, userId) >= amount, 'funds');
    state.payments.push({
        id: nextId(state, 'payment'),
        userId,
        kind,
        amount,
        direction,
        referenceId,
        createdAt: state.now
    });
}
function linkedVet(state, animalId) {
    const user = actor(state, [
        'vet'
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(state.appointments.some((item)=>item.animalId === animalId && item.vetId === user.id && ![
            'rejected',
            'cancelled'
        ].includes(item.status)) || state.claims.some((item)=>item.animalId === animalId && item.vetId === user.id && item.status === 'vet_review'), 'unauthorized');
    return user;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/shared/src/errors.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Domain failures are data. No native platform or network exceptions escape the repository. */ __turbopack_context__.s([
    "DomainError",
    ()=>DomainError,
    "assertDomain",
    ()=>assertDomain,
    "messages",
    ()=>messages
]);
const messages = {
    unauthorized: {
        bn: 'এই কাজের অনুমতি নেই। সঠিক অ্যাকাউন্টে প্রবেশ করুন।',
        en: 'This account cannot perform that action. Switch to the appropriate account.'
    },
    blocked: {
        bn: 'এই অ্যাকাউন্টটি সাময়িকভাবে স্থগিত আছে।',
        en: 'This account is currently suspended.'
    },
    not_found: {
        bn: 'তথ্যটি পাওয়া যায়নি। তালিকা আবার দেখুন।',
        en: 'That record was not found. Refresh the list.'
    },
    validation: {
        bn: 'তথ্য যাচাই করে আবার চেষ্টা করুন।',
        en: 'Check the entered information and try again.'
    },
    invalid_transition: {
        bn: 'বর্তমান অবস্থায় এই কাজ করা যাবে না।',
        en: 'That action is not available in the current state.'
    },
    duplicate: {
        bn: 'এই কাজটি ইতিমধ্যে সম্পন্ন হয়েছে।',
        en: 'This action has already been completed.'
    },
    offline: {
        bn: 'অফলাইন মোড চালু আছে। সংযোগ সচল করে আবার চেষ্টা করুন।',
        en: 'Offline mode is active. Restore connectivity and try again.'
    },
    network: {
        bn: 'নেটওয়ার্ক সংযোগ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।',
        en: 'Network connection failed. Try again.'
    },
    storage: {
        bn: 'তথ্য সংরক্ষণ করা যায়নি। কোনো পরিবর্তন হয়নি।',
        en: 'Data could not be saved. No changes were made.'
    },
    corrupt_storage: {
        bn: 'সংরক্ষিত তথ্য পড়া যায়নি। অ্যাপ ডেটা রিসেট করুন।',
        en: 'Saved data could not be read. Reset app data to continue.'
    },
    version: {
        bn: 'সংরক্ষিত তথ্যের সংস্করণ মেলে না। অ্যাপ ডেটা রিসেট করুন।',
        en: 'Saved data uses an unsupported version. Reset app data to continue.'
    },
    collateral: {
        bn: 'এই পশুটি অন্য ঋণের জন্য সংরক্ষিত আছে।',
        en: 'This animal is already reserved as collateral.'
    },
    ltv: {
        bn: 'ঋণ যাচাইকৃত মূল্যের সর্বোচ্চ ৭০% হতে পারে।',
        en: 'The loan cannot exceed 70% of the verified collateral value.'
    },
    evidence: {
        bn: 'প্রয়োজনীয় ছবি, অবস্থান এবং ঘটনার সময় যোগ করুন।',
        en: 'Add the required photo, location, and incident timestamp.'
    },
    coverage: {
        bn: 'এই পশুর জন্য সক্রিয় বীমা নেই।',
        en: 'This animal does not have active insurance coverage.'
    },
    iot: {
        bn: 'এই পর্যালোচনার জন্য ৪৮ ঘণ্টার সংযুক্ত ডিভাইস তথ্য প্রয়োজন।',
        en: 'This review requires 48 hours of connected device evidence.'
    },
    funds: {
        bn: 'ওয়ালেটে পর্যাপ্ত ব্যালেন্স নেই।',
        en: 'Your wallet has insufficient funds.'
    },
    otp: {
        bn: 'যাচাইকরণ কোড ভুল বা মেয়াদ শেষ। নতুন কোড নিন।',
        en: 'The verification code is incorrect or expired. Request a new code.'
    },
    success: {
        bn: 'তথ্য সফলভাবে সংরক্ষিত হয়েছে।',
        en: 'Changes saved successfully.'
    }
};
class DomainError extends Error {
    code;
    constructor(code){
        super(messages[code].en);
        this.name = 'DomainError';
        this.code = code;
    }
}
function assertDomain(condition, code = 'validation') {
    if (!condition) throw new DomainError(code);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/shared/src/finance.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "demoLoanQuote",
    ()=>demoLoanQuote,
    "handleFinance",
    ()=>handleFinance,
    "hasIoTEvidence",
    ()=>hasIoTEvidence
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/errors.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/domain-context.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/validation.ts [app-client] (ecmascript)");
;
;
;
function demoLoanQuote(animal) {
    const collateralValue = animal.healthScore < 75 ? Math.floor(animal.value / 5) * 4 + Math.floor(animal.value % 5 * 4 / 5) : animal.value;
    return {
        collateralValue,
        maximumAmount: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["maximumLoanAmount"])(collateralValue),
        annualRate: animal.healthScore < 75 ? 15 : 10
    };
}
function policyActor(state, policyId) {
    const insurer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["actor"])(state, [
        'insurer'
    ]);
    const policy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.policies, policyId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(policy.insurerId === insurer.id, 'unauthorized');
    return policy;
}
function claimActor(state, claimId) {
    const insurer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["actor"])(state, [
        'insurer'
    ]);
    const claim = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.claims, claimId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(claim.insurerId === insurer.id, 'unauthorized');
    return claim;
}
function loanActor(state, loanId) {
    const bank = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["actor"])(state, [
        'bank'
    ]);
    const loan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.loans, loanId);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(loan.bankId === bank.id, 'unauthorized');
    return loan;
}
function hasIoTEvidence(state, animalId, incidentAt) {
    const device = state.devices.find((item)=>item.animalId === animalId && item.connected);
    if (!device || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidDate"])(incidentAt)) return false;
    const incident = Date.parse(incidentAt);
    const readings = device.readings.filter((item)=>Date.parse(item.at) <= incident).sort((a, b)=>Date.parse(a.at) - Date.parse(b.at));
    if (readings.length < 9) return false;
    const window = readings.filter((item)=>Date.parse(item.at) >= incident - 48 * 3_600_000);
    return window.length >= 9 && Date.parse(window[0].at) <= incident - 48 * 3_600_000 && incident - Date.parse(window[window.length - 1].at) <= 6 * 3_600_000 && window.every((reading, index)=>index === 0 || Date.parse(reading.at) - Date.parse(window[index - 1].at) <= 6 * 3_600_000);
}
function handleFinance(state, command) {
    switch(command.type){
        case 'policy.apply':
            {
                const animal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeAnimal"])(state, command.animalId);
                const insurer = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.users, command.insurerId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(insurer.role === 'insurer' && insurer.status === 'active', 'validation');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isPositiveMoney"])(command.coverage) && command.coverage <= animal.value);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(!state.policies.some((item)=>item.animalId === animal.id && [
                        'submitted',
                        'active'
                    ].includes(item.status)), 'duplicate');
                const premium = Math.floor(command.coverage / 100) * 3 + Math.ceil(command.coverage % 100 * 3 / 100);
                const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextId"])(state, 'policy');
                state.policies.push({
                    id,
                    farmerId: animal.ownerId,
                    animalId: animal.id,
                    insurerId: insurer.id,
                    coverage: command.coverage,
                    premium: Math.max(1, premium),
                    status: 'submitted',
                    submittedAt: state.now,
                    enhanced: true
                });
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, insurer.id, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('নতুন বীমা আবেদন', 'New insurance application'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('আবেদন ও পশুর স্বাস্থ্য তথ্য পর্যালোচনা করুন।', 'Review the application and animal health record.'), 'applications', id);
                return {
                    id
                };
            }
        case 'policy.decide':
            {
                const policy = policyActor(state, command.policyId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(policy.status === 'submitted', 'invalid_transition');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(command.approve || (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.note, 3, 1000));
                if (command.approve) {
                    const animal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.animals, policy.animalId);
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(![
                        'sold',
                        'deceased'
                    ].includes(animal.status), 'invalid_transition');
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["payment"])(state, policy.farmerId, 'premium', policy.premium, 'debit', policy.id);
                    policy.status = 'active';
                    policy.startsAt = state.now;
                    policy.expiresAt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isoAfter"])(state.now, 365 * 1440);
                } else policy.status = 'rejected';
                policy.decisionNote = command.note;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, policy.farmerId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('বীমা আবেদনের সিদ্ধান্ত', 'Insurance application decision'), command.approve ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('প্রিমিয়াম পরিশোধিত হয়েছে এবং আপনার বীমা কভারেজ সক্রিয় হয়েছে।', 'Your premium has been paid and insurance coverage is now active.') : (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('আবেদন প্রত্যাখ্যান করা হয়েছে। কারণ দেখুন।', 'The application was declined. Review the reason.'), 'insurance', policy.id);
                return {
                    id: policy.id
                };
            }
        case 'policy.renew':
            {
                const policy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.policies, command.policyId);
                const animal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeAnimal"])(state, policy.animalId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(policy.status === 'expired' || policy.status === 'active' && !!policy.expiresAt && Date.parse(policy.expiresAt) <= Date.parse((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isoAfter"])(state.now, 30 * 1440)), 'invalid_transition');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(!state.claims.some((item)=>item.policyId === policy.id && ![
                        'rejected',
                        'paid'
                    ].includes(item.status)), 'invalid_transition');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(!state.policies.some((item)=>item.id !== policy.id && item.animalId === animal.id && [
                        'active',
                        'submitted'
                    ].includes(item.status)), 'duplicate');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["payment"])(state, animal.ownerId, 'premium', policy.premium, 'debit', policy.id);
                const startsAt = policy.expiresAt && policy.expiresAt > state.now ? policy.expiresAt : state.now;
                policy.status = 'active';
                policy.startsAt ??= state.now;
                policy.expiresAt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isoAfter"])(startsAt, 365 * 1440);
                return {
                    id: policy.id
                };
            }
        case 'claim.submit':
            {
                const policy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.policies, command.policyId);
                const animal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ownedAnimal"])(state, policy.animalId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(policy.farmerId === animal.ownerId, 'unauthorized');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(policy.status === 'active' && policy.startsAt && policy.expiresAt && policy.startsAt <= state.now && policy.expiresAt > state.now, 'coverage');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(animal.status !== 'sold' && animal.status !== 'deceased', 'invalid_transition');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])([
                    'illness',
                    'death'
                ].includes(command.kind) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isPositiveMoney"])(command.amount) && command.amount <= policy.coverage);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(command.evidence && command.evidence.photo === true && command.evidence.location === true && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.evidence.description, 8, 2000), 'evidence');
                const capturedAt = command.evidence.capturedAt ?? state.now;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidDate"])(capturedAt) && capturedAt <= state.now && capturedAt >= policy.startsAt, 'evidence');
                if (command.evidence.latitude !== undefined || command.evidence.longitude !== undefined) (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(Number.isFinite(command.evidence.latitude) && Number.isFinite(command.evidence.longitude) && Math.abs(command.evidence.latitude) <= 90 && Math.abs(command.evidence.longitude) <= 180, 'evidence');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(!state.claims.some((item)=>item.policyId === policy.id && item.status !== 'rejected'), 'duplicate');
                const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextId"])(state, 'claim');
                state.claims.push({
                    id,
                    policyId: policy.id,
                    animalId: animal.id,
                    farmerId: animal.ownerId,
                    insurerId: policy.insurerId,
                    kind: command.kind,
                    amount: command.amount,
                    evidence: {
                        ...command.evidence,
                        capturedAt
                    },
                    status: 'submitted',
                    createdAt: state.now
                });
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, policy.insurerId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('নতুন দাবি জমা পড়েছে', 'New claim submitted'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('ঘটনার প্রমাণ, জিপিএস ও স্বাস্থ্য রেকর্ড যাচাই করুন।', 'Review the incident evidence, GPS data, and health records.'), 'claims', id);
                return {
                    id
                };
            }
        case 'claim.autoReview':
            {
                const claim = claimActor(state, command.claimId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(claim.status === 'submitted', 'invalid_transition');
                const policy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.policies, claim.policyId);
                const iot = hasIoTEvidence(state, claim.animalId, claim.evidence.capturedAt ?? claim.createdAt);
                const complete = claim.evidence.photo && claim.evidence.location && !!claim.evidence.capturedAt;
                // Only the complete enhanced death scenario demonstrates an automatic decision.
                claim.status = claim.kind === 'death' && policy.enhanced && iot && complete ? 'approved' : 'manual_review';
                claim.decisionNote = claim.status === 'approved' ? 'স্বয়ংক্রিয় যাচাই সম্পন্ন: ছবি, জিপিএস/সময় ও ৪৮ ঘণ্টার আইওটি টেলিমেট্রি তথ্য মিলে গেছে। / Automated verification passed: photo, GPS/timestamp, and 48-hour IoT telemetry matched.' : 'স্বয়ংক্রিয় যাচাই: প্রমাণ বা আইওটি তথ্যের জন্য ম্যানুয়াল পর্যালোচনা প্রয়োজন। / Automated check: evidence or IoT telemetry requires manual officer review.';
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, claim.farmerId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('দাবি পর্যালোচনা আপডেট', 'Claim review updated'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('আপনার দাবির বর্তমান অবস্থা দেখুন।', 'View the current status of your claim.'), 'claims', claim.id);
                return {
                    id: claim.id
                };
            }
        case 'claim.refer':
            {
                const claim = claimActor(state, command.claimId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])([
                    'submitted',
                    'manual_review'
                ].includes(claim.status), 'invalid_transition');
                const vet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.users, command.vetId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(vet.role === 'vet' && vet.status === 'active');
                claim.status = 'vet_review';
                claim.vetId = vet.id;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, vet.id, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('দাবি পর্যালোচনার অনুরোধ', 'Claim review requested'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('স্বাস্থ্য রেকর্ড ও প্রমাণ দেখে মতামত দিন।', 'Review health records and evidence, then add your opinion.'), 'claims', claim.id);
                return {
                    id: claim.id
                };
            }
        case 'claim.vetReview':
            {
                const vet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["actor"])(state, [
                    'vet'
                ]);
                const claim = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.claims, command.claimId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(claim.vetId === vet.id, 'unauthorized');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(claim.status === 'vet_review', 'invalid_transition');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.opinion, 8, 3000));
                claim.vetOpinion = command.opinion;
                claim.status = 'manual_review';
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, claim.insurerId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('পশুচিকিৎসকের মতামত এসেছে', 'Veterinary opinion received'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('দাবির সিদ্ধান্ত দেওয়া যাবে।', 'The claim is ready for a decision.'), 'claims', claim.id);
                return {
                    id: claim.id
                };
            }
        case 'claim.decide':
            {
                const claim = claimActor(state, command.claimId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])([
                    'submitted',
                    'manual_review'
                ].includes(claim.status), 'invalid_transition');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.note, 3, 2000));
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(!claim.vetId || (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(claim.vetOpinion), 'invalid_transition');
                claim.status = command.approve ? 'approved' : 'rejected';
                claim.decisionNote = command.note;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, claim.farmerId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('দাবির সিদ্ধান্ত', 'Claim decision'), command.approve ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('বীমা দাবি অনুমোদিত হয়েছে এবং পেআউটের জন্য প্রস্তুত।', 'Your insurance claim is approved and ready for payout.') : (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('দাবি প্রত্যাখ্যান হয়েছে। কারণ দেখুন।', 'The claim was declined. Review the reason.'), 'claims', claim.id);
                return {
                    id: claim.id
                };
            }
        case 'claim.pay':
            {
                const claim = claimActor(state, command.claimId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(claim.status === 'approved', 'invalid_transition');
                const policy = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.policies, claim.policyId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(policy.status === 'active' || policy.status === 'expired', 'coverage');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(claim.amount <= policy.coverage && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isPositiveMoney"])(claim.amount));
                let remainder = claim.amount;
                let settlement = 0;
                if (claim.kind === 'death') {
                    for (const loan of state.loans.filter((item)=>item.animalId === claim.animalId && item.farmerId === claim.farmerId && item.status === 'active')){
                        const amount = Math.min(remainder, loan.outstanding);
                        if (amount > 0) {
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["payment"])(state, loan.bankId, 'debt_settlement', amount, 'credit', loan.id);
                            loan.outstanding -= amount;
                            remainder -= amount;
                            settlement += amount;
                            if (loan.outstanding === 0) loan.status = 'settled';
                        }
                    }
                    // Cancel offers/approvals that have not disbursed; deceased livestock cannot secure new funds.
                    for (const loan of state.loans.filter((item)=>item.animalId === claim.animalId && [
                            'offered',
                            'submitted',
                            'approved'
                        ].includes(item.status))){
                        loan.status = 'rejected';
                        loan.decisionNote = 'পশুর মৃত্যুজনিত দাবি / Animal death claim';
                    }
                    const animal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.animals, claim.animalId);
                    animal.status = 'deceased';
                    state.records.push({
                        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextId"])(state, 'record'),
                        animalId: animal.id,
                        kind: 'death',
                        title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('মৃত্যুজনিত বীমা দাবি নিষ্পত্তি', 'Mortality insurance claim settled'),
                        note: claim.evidence.description,
                        createdAt: state.now
                    });
                    for (const device of state.devices.filter((item)=>item.animalId === animal.id))device.connected = false;
                }
                if (remainder > 0) (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["payment"])(state, claim.farmerId, 'insurance_payout', remainder, 'credit', claim.id);
                claim.payout = claim.amount;
                claim.debtSettlement = settlement;
                claim.farmerPayout = remainder;
                claim.status = 'paid';
                policy.status = 'settled';
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, claim.farmerId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('বীমা পেআউট সম্পন্ন', 'Insurance payout complete'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('জামানতের বকেয়া ঋণ সমন্বয় করে অবশিষ্ট টাকা ওয়ালেটে যোগ হয়েছে।', 'Any secured debt was settled first; the remaining payout was credited to your wallet.'), 'claims', claim.id);
                if (settlement > 0) (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.loans, state.loans.find((item)=>item.animalId === claim.animalId && item.farmerId === claim.farmerId).id).bankId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('জামানতের ঋণ সমন্বয়', 'Collateral debt settlement'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('বীমা দাবি থেকে জামানতকৃত ঋণের বকেয়া সমন্বয় হয়েছে।', 'The insurance claim settled the outstanding collateralized loan balance.'), 'loans');
                return {
                    id: claim.id
                };
            }
        case 'loan.offer':
            {
                const animal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeAnimal"])(state, command.animalId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(!(0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["heldCollateral"])(state, animal.id), 'collateral');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isPositiveMoney"])(command.amount) && Number.isInteger(command.termMonths) && command.termMonths >= 1 && command.termMonths <= 36 && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.purpose, 3, 500) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.repaymentSource, 3, 500));
                const quote = demoLoanQuote(animal);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(command.amount <= quote.maximumAmount, 'ltv');
                const bank = state.users.find((item)=>item.role === 'bank' && item.status === 'active');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(bank, 'not_found');
                const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextId"])(state, 'loan');
                state.loans.push({
                    id,
                    farmerId: animal.ownerId,
                    animalId: animal.id,
                    bankId: bank.id,
                    purpose: command.purpose,
                    repaymentSource: command.repaymentSource,
                    collateralValue: quote.collateralValue,
                    amount: command.amount,
                    annualRate: quote.annualRate,
                    termMonths: command.termMonths,
                    outstanding: 0,
                    status: 'offered',
                    createdAt: state.now
                });
                return {
                    id
                };
            }
        case 'loan.accept':
            {
                const loan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.loans, command.loanId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeAnimal"])(state, loan.animalId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(loan.status === 'offered', 'invalid_transition');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(!(0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["heldCollateral"])(state, loan.animalId, loan.id), 'collateral');
                loan.status = 'submitted';
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, loan.bankId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('নতুন ঋণ আবেদন', 'New loan application'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('জামানত, স্বাস্থ্য তথ্য ও আয়ের উৎস যাচাই করুন।', 'Review the collateral, health history, and repayment source.'), 'applications', loan.id);
                return {
                    id: loan.id
                };
            }
        case 'loan.decide':
            {
                const loan = loanActor(state, command.loanId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(loan.status === 'submitted', 'invalid_transition');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(command.approve || (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.note, 3, 1000));
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(loan.amount <= (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["maximumLoanAmount"])(loan.collateralValue), 'ltv');
                loan.status = command.approve ? 'approved' : 'rejected';
                loan.decisionNote = command.note;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, loan.farmerId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('ঋণ আবেদনের সিদ্ধান্ত', 'Loan application decision'), command.approve ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('আপনার ঋণ আবেদন অনুমোদিত হয়েছে এবং অর্থ ছাড়ের অপেক্ষায় আছে।', 'Your loan application is approved and awaiting disbursement.') : (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('ঋণ আবেদন প্রত্যাখ্যান হয়েছে।', 'The loan application was declined.'), 'loans', loan.id);
                return {
                    id: loan.id
                };
            }
        case 'loan.disburse':
            {
                const loan = loanActor(state, command.loanId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(loan.status === 'approved', 'invalid_transition');
                const animal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.animals, loan.animalId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(![
                    'sold',
                    'deceased'
                ].includes(animal.status), 'invalid_transition');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(!(0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["heldCollateral"])(state, loan.animalId, loan.id), 'collateral');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(loan.amount <= (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["maximumLoanAmount"])(loan.collateralValue), 'ltv');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["payment"])(state, loan.farmerId, 'loan_disbursement', loan.amount, 'credit', loan.id);
                loan.status = 'active';
                loan.outstanding = loan.amount;
                loan.dueAt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isoAfter"])(state.now, 30 * 1440);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, loan.farmerId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('ঋণের অর্থ ছাড় হয়েছে', 'Loan disbursed'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('অনুমোদিত ঋণের অর্থ আপনার ওয়ালেটে জমা হয়েছে।', 'Approved loan funds have been credited to your wallet.'), 'loans', loan.id);
                return {
                    id: loan.id
                };
            }
        case 'loan.repay':
            {
                const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["actor"])(state, [
                    'farmer'
                ]);
                const loan = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.loans, command.loanId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(loan.farmerId === user.id, 'unauthorized');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(loan.status === 'active', 'invalid_transition');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isPositiveMoney"])(command.amount) && command.amount <= loan.outstanding);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["payment"])(state, user.id, 'repayment', command.amount, 'debit', loan.id);
                loan.outstanding -= command.amount;
                if (loan.outstanding === 0) loan.status = 'paid';
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, loan.bankId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('ঋণ পরিশোধ এসেছে', 'Repayment received'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('ঋণের বকেয়া স্থিতি আপডেট হয়েছে।', 'The loan outstanding balance has been updated.'), 'loans', loan.id);
                return {
                    id: loan.id
                };
            }
        case 'loan.grace':
            {
                const loan = loanActor(state, command.loanId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(loan.status === 'active' && !loan.graceUntil, 'invalid_transition');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.animals, loan.animalId).productionDrop, 'invalid_transition');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(Number.isInteger(command.days) && command.days >= 1 && command.days <= 90 && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.note, 3, 1000));
                loan.graceUntil = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isoAfter"])(loan.dueAt && loan.dueAt > state.now ? loan.dueAt : state.now, command.days * 1440);
                loan.decisionNote = command.note;
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, loan.farmerId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('পরিশোধের সময় বাড়ানো হয়েছে', 'Repayment grace period granted'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('দুধ উৎপাদন হ্রাসের তথ্য যাচাই করে ব্যাংক কিস্তির সময় বাড়িয়েছে।', 'The bank granted a repayment extension after verifying the milk production drop.'), 'loans', loan.id);
                return {
                    id: loan.id
                };
            }
        default:
            return undefined;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/shared/src/fixtures.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEMO_ACCOUNTS",
    ()=>DEMO_ACCOUNTS,
    "DEMO_IDS",
    ()=>DEMO_IDS,
    "createDemoState",
    ()=>createDemoState,
    "sampleReadings",
    ()=>sampleReadings
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/validation.ts [app-client] (ecmascript)");
;
const DEMO_IDS = {
    farmer: 'farmer-rahim',
    otherFarmer: 'farmer-salma',
    vet: 'vet-farhana',
    bank: 'bank-padma',
    insurer: 'insurer-suraksha',
    admin: 'admin-palito',
    farm: 'farm-shobuj',
    healthy: 'animal-lali',
    sick: 'animal-moti',
    collateral: 'animal-shyamoli',
    uninsured: 'animal-champa',
    otherAnimal: 'animal-salma'
};
const DEMO_ACCOUNTS = [
    {
        id: DEMO_IDS.farmer,
        role: 'farmer',
        name: 'Rahim Uddin',
        nameBn: 'রহিম উদ্দিন',
        phone: '+8801712345678',
        status: 'active',
        district: 'Sirajganj'
    },
    {
        id: DEMO_IDS.otherFarmer,
        role: 'farmer',
        name: 'Salma Begum',
        nameBn: 'সালমা বেগম',
        phone: '+8801812345678',
        status: 'active',
        district: 'Pabna'
    },
    {
        id: DEMO_IDS.vet,
        role: 'vet',
        name: 'Dr. Farhana Ahmed',
        nameBn: 'ডা. ফারহানা আহমেদ',
        phone: '+8801912345678',
        status: 'active',
        district: 'Sirajganj',
        specialty: 'Cattle & Buffalo · গরু ও মহিষ বিশেষজ্ঞ',
        fee: 500,
        rating: 4.9,
        available: true,
        schedule: 'প্রতিদিন সকাল ৯টা – রাত ৮টা · Daily 9 AM – 8 PM'
    },
    {
        id: DEMO_IDS.bank,
        role: 'bank',
        name: 'Padma Bank',
        nameBn: 'পদ্মা ব্যাংক',
        phone: '+8801612345678',
        status: 'active',
        district: 'Dhaka'
    },
    {
        id: DEMO_IDS.insurer,
        role: 'insurer',
        name: 'Suraksha Insurance',
        nameBn: 'সুরক্ষা বীমা',
        phone: '+8801512345678',
        status: 'active',
        district: 'Dhaka'
    },
    {
        id: DEMO_IDS.admin,
        role: 'admin',
        name: 'Palito Admin',
        nameBn: 'পালিত অ্যাডমিন',
        phone: '+8801312345678',
        status: 'active',
        district: 'Dhaka'
    },
    {
        id: 'vet-kamrul',
        role: 'vet',
        name: 'Dr. Kamrul Hasan',
        nameBn: 'ডা. কামরুল হাসান',
        phone: '+8801922345678',
        status: 'active',
        district: 'Pabna',
        specialty: 'Goat & Sheep · ছাগল ও ভেড়া বিশেষজ্ঞ',
        fee: 400,
        rating: 4.8,
        available: true,
        schedule: 'শনি–বৃহস্পতি সকাল ১০টা – সন্ধ্যা ৭টা · Sat–Thu 10 AM – 7 PM'
    },
    {
        id: 'vet-nasrin',
        role: 'vet',
        name: 'Dr. Nasrin Sultana',
        nameBn: 'ডা. নাসরিন সুলতানা',
        phone: '+8801932345678',
        status: 'active',
        district: 'Sirajganj',
        specialty: 'Cattle & Dairy Medicine · ডেইরি ও প্রজনন বিশেষজ্ঞ',
        fee: 600,
        rating: 4.9,
        available: false,
        schedule: 'রবি–বৃহস্পতি দুপুর ২টা – রাত ৯টা · Sun–Thu 2 PM – 9 PM'
    }
];
function sampleReadings(now, abnormal = false) {
    return Array.from({
        length: 29
    }, (_, index)=>({
            at: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isoAfter"])(now, -(28 - index) * 360),
            temperature: abnormal && index === 28 ? 40.2 : 38.2 + index % 4 * 0.1,
            heartRate: abnormal && index === 28 ? 100 : 65 + index % 8,
            activity: abnormal && index === 28 ? 21 : 70 + index % 9
        }));
}
function createDemoState(scenario = 'normal', date = new Date('2026-11-14T03:00:00.000Z')) {
    const now = date.toISOString();
    const earlier = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isoAfter"])(now, -1440 * 10);
    const state = {
        schemaVersion: 1,
        revision: 0,
        now,
        processedRequests: [],
        session: {
            userId: null,
            locale: 'bn',
            onboarded: false
        },
        settings: {
            offline: false,
            notifications: true,
            scenario
        },
        users: DEMO_ACCOUNTS.map((user)=>({
                ...user
            })),
        farms: [
            {
                id: DEMO_IDS.farm,
                ownerId: DEMO_IDS.farmer,
                name: 'সবুজ খামার',
                district: 'Sirajganj',
                address: 'শাহজাদপুর, সিরাজগঞ্জ',
                size: 2
            },
            {
                id: 'farm-salma',
                ownerId: DEMO_IDS.otherFarmer,
                name: 'সালমার খামার',
                district: 'Pabna',
                address: 'পাবনা সদর',
                size: 1
            }
        ],
        animals: [
            {
                id: DEMO_IDS.healthy,
                ownerId: DEMO_IDS.farmer,
                farmId: DEMO_IDS.farm,
                tag: 'PL-1001',
                name: 'লালী',
                species: 'cattle',
                breed: 'Holstein Friesian',
                sex: 'female',
                birthDate: '2022-03-10T00:00:00.000Z',
                weightKg: 380,
                value: 140000,
                healthScore: 94,
                status: 'healthy',
                registeredAt: earlier
            },
            {
                id: DEMO_IDS.sick,
                ownerId: DEMO_IDS.farmer,
                farmId: DEMO_IDS.farm,
                tag: 'PL-1002',
                name: 'মতি',
                species: 'cattle',
                breed: 'Sahiwal',
                sex: 'female',
                birthDate: '2023-01-10T00:00:00.000Z',
                weightKg: 280,
                value: 110000,
                healthScore: 66,
                status: 'attention',
                productionDrop: true,
                registeredAt: earlier
            },
            {
                id: DEMO_IDS.collateral,
                ownerId: DEMO_IDS.farmer,
                farmId: DEMO_IDS.farm,
                tag: 'PL-1003',
                name: 'শ্যামলী',
                species: 'cattle',
                breed: 'Red Chittagong',
                sex: 'female',
                birthDate: '2021-05-12T00:00:00.000Z',
                weightKg: 320,
                value: 100000,
                healthScore: 89,
                status: 'healthy',
                registeredAt: earlier
            },
            {
                id: DEMO_IDS.uninsured,
                ownerId: DEMO_IDS.farmer,
                farmId: DEMO_IDS.farm,
                tag: 'PL-1004',
                name: 'চম্পা',
                species: 'goat',
                breed: 'Black Bengal',
                sex: 'female',
                birthDate: '2024-06-01T00:00:00.000Z',
                weightKg: 24,
                value: 18000,
                healthScore: 92,
                status: 'healthy',
                registeredAt: earlier
            },
            {
                id: DEMO_IDS.otherAnimal,
                ownerId: DEMO_IDS.otherFarmer,
                farmId: 'farm-salma',
                tag: 'PL-2001',
                name: 'রূপা',
                species: 'buffalo',
                breed: 'Local',
                sex: 'female',
                birthDate: '2022-01-01T00:00:00.000Z',
                weightKg: 400,
                value: 160000,
                healthScore: 90,
                status: 'healthy',
                registeredAt: earlier
            }
        ],
        records: [],
        devices: [],
        alerts: [],
        appointments: [],
        prescriptions: [],
        reminders: [],
        products: [
            {
                id: 'product-feed',
                name: {
                    bn: 'সুষম গবাদিপশুর খাদ্য',
                    en: 'Balanced cattle feed'
                },
                category: 'feed',
                price: 1450,
                unit: {
                    bn: '২৫ কেজি',
                    en: '25 kg'
                },
                stock: 40,
                requiresPrescription: false
            },
            {
                id: 'product-mineral',
                name: {
                    bn: 'মিনারেল মিক্স প্রিমিয়াম',
                    en: 'Premium mineral mix'
                },
                category: 'feed',
                price: 350,
                unit: {
                    bn: '১ কেজি',
                    en: '1 kg'
                },
                stock: 80,
                requiresPrescription: false
            },
            {
                id: 'product-medicine',
                name: {
                    bn: 'ভেটেরিনারি অ্যান্টিবায়োটিক ও স্যালাইন প্যাক',
                    en: 'Veterinary antibiotic & electrolyte pack'
                },
                category: 'medicine',
                price: 450,
                unit: {
                    bn: '১ প্যাকেট',
                    en: '1 pack'
                },
                stock: 10,
                requiresPrescription: true
            },
            {
                id: 'product-collar',
                name: {
                    bn: 'পালিত আইওটি স্মার্ট কলার',
                    en: 'Palito IoT smart collar'
                },
                category: 'equipment',
                price: 2500,
                unit: {
                    bn: '১টি',
                    en: '1 item'
                },
                stock: 12,
                requiresPrescription: false
            }
        ],
        carts: {},
        orders: [],
        policies: [],
        claims: [],
        loans: [],
        payments: [],
        notifications: [],
        content: [
            {
                id: 'content-health',
                title: {
                    bn: 'প্রতিদিন পশুর যত্ন',
                    en: 'Your daily care routine'
                },
                body: {
                    bn: 'পরিষ্কার পানি, নিরাপদ আশ্রয় এবং নিয়মিত পর্যবেক্ষণ নিশ্চিত করুন। অসুস্থতার লক্ষণে পশুচিকিৎসকের সাহায্য নিন।',
                    en: 'Provide clean water and safe shelter, and observe animals regularly. Contact a veterinarian when you notice signs of illness.'
                },
                category: 'health',
                status: 'published',
                updatedAt: now
            },
            {
                id: 'content-finance',
                title: {
                    bn: 'খামার ঋণ ও পরিশোধ নির্দেশিকা',
                    en: 'Farm loan & repayment guide'
                },
                body: {
                    bn: 'পশুর যাচাইকৃত স্বাস্থ্য স্কোরের ভিত্তিতে সুদের হার নির্ধারিত হয়। ঋণের শর্ত ও মাসিক কিস্তির পরিকল্পনা আগে যাচাই করুন।',
                    en: 'Interest rates are linked to verified animal health scores. Review loan terms and monthly installment schedules before applying.'
                },
                category: 'finance',
                status: 'draft',
                updatedAt: now
            }
        ],
        audit: [],
        aiMessages: []
    };
    if (scenario === 'empty') {
        state.farms = [];
        state.animals = [];
        return state;
    }
    for (const animal of state.animals){
        state.records.push({
            id: `record-${animal.id}`,
            animalId: animal.id,
            kind: 'registration',
            title: {
                bn: 'স্বাস্থ্য পাসপোর্ট তৈরি',
                en: 'Health passport created'
            },
            note: 'প্রাথমিক স্বাস্থ্য ও পরিচয় নিবন্ধন সম্পন্ন / Initial health & identity registration completed',
            createdAt: earlier
        });
        if (animal.id !== DEMO_IDS.uninsured) state.devices.push({
            id: `device-${animal.id}`,
            animalId: animal.id,
            serial: `PAL-${animal.tag}`,
            connected: true,
            battery: 82,
            lastSeenAt: now,
            readings: sampleReadings(now, animal.id === DEMO_IDS.sick)
        });
    }
    for (const animalId of [
        DEMO_IDS.healthy,
        DEMO_IDS.collateral
    ])state.policies.push({
        id: `policy-${animalId}`,
        farmerId: DEMO_IDS.farmer,
        animalId,
        insurerId: DEMO_IDS.insurer,
        coverage: animalId === DEMO_IDS.healthy ? 120000 : 90000,
        premium: 3000,
        status: 'active',
        submittedAt: earlier,
        startsAt: earlier,
        expiresAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isoAfter"])(now, 1440 * 355),
        enhanced: true
    });
    state.policies.push({
        id: 'policy-pending',
        farmerId: DEMO_IDS.farmer,
        animalId: DEMO_IDS.sick,
        insurerId: DEMO_IDS.insurer,
        coverage: 80000,
        premium: 2400,
        status: 'submitted',
        submittedAt: now,
        enhanced: true
    });
    state.loans.push({
        id: 'loan-active',
        farmerId: DEMO_IDS.farmer,
        animalId: DEMO_IDS.collateral,
        bankId: DEMO_IDS.bank,
        purpose: 'খামারের উন্নতি / Farm improvements',
        repaymentSource: 'দুধ বিক্রি / Milk sales',
        collateralValue: 100000,
        amount: 40000,
        annualRate: 10,
        termMonths: 12,
        outstanding: 32000,
        status: 'active',
        createdAt: earlier,
        dueAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isoAfter"])(now, 1440 * 20)
    });
    state.loans.push({
        id: 'loan-pending',
        farmerId: DEMO_IDS.otherFarmer,
        animalId: DEMO_IDS.otherAnimal,
        bankId: DEMO_IDS.bank,
        purpose: 'খাদ্য কেনা / Feed purchase',
        repaymentSource: 'দুধ বিক্রি / Milk sales',
        collateralValue: 160000,
        amount: 60000,
        annualRate: 10,
        termMonths: 12,
        outstanding: 0,
        status: 'submitted',
        createdAt: now
    });
    state.payments.push({
        id: 'payment-opening',
        userId: DEMO_IDS.farmer,
        kind: 'loan_disbursement',
        amount: 40000,
        direction: 'credit',
        referenceId: 'loan-active',
        createdAt: earlier
    }, {
        id: 'payment-repaid',
        userId: DEMO_IDS.farmer,
        kind: 'repayment',
        amount: 8000,
        direction: 'debit',
        referenceId: 'loan-active',
        createdAt: earlier
    });
    state.alerts.push({
        id: 'alert-temperature',
        animalId: DEMO_IDS.sick,
        kind: 'temperature',
        severity: 'warning',
        title: {
            bn: 'মতির তাপমাত্রা বৃদ্ধি পেয়েছে (৪০.২°সে)',
            en: 'Moti’s temperature is elevated (40.2°C)'
        },
        message: {
            bn: 'স্বাভাবিক মাত্রার চেয়ে দেহের তাপমাত্রা বেশি এবং রোমন্থন কমেছে। দ্রুত পশুচিকিৎসকের পরামর্শ নিন।',
            en: 'Body temperature is above normal range and rumination has decreased. Book a veterinarian for clinical review.'
        },
        createdAt: now,
        status: 'open'
    });
    state.appointments.push({
        id: 'appointment-pending',
        farmerId: DEMO_IDS.farmer,
        animalId: DEMO_IDS.healthy,
        vetId: DEMO_IDS.vet,
        scheduledAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isoAfter"])(now, 120),
        mode: 'video',
        priority: 'routine',
        reason: 'নিয়মিত স্বাস্থ্য পরীক্ষা / Routine checkup',
        status: 'requested',
        createdAt: now
    });
    for (const user of state.users)state.notifications.push({
        id: `welcome-${user.id}`,
        userId: user.id,
        title: {
            bn: 'পালিতে স্বাগতম',
            en: 'Welcome to Palito'
        },
        body: {
            bn: 'আপনার খামারের স্বাস্থ্য, টেলিমেডিসিন ও আর্থিক সেবা ড্যাশবোর্ড প্রস্তুত।',
            en: 'Your livestock health, telemedicine, and financial services workspace is ready.'
        },
        createdAt: now,
        read: false
    });
    if (scenario === 'insurance') state.claims.push({
        id: 'claim-pending',
        policyId: `policy-${DEMO_IDS.collateral}`,
        animalId: DEMO_IDS.collateral,
        farmerId: DEMO_IDS.farmer,
        insurerId: DEMO_IDS.insurer,
        kind: 'death',
        amount: 90000,
        evidence: {
            photo: true,
            location: true,
            description: 'আকস্মিক কার্ডিয়াক শক ও তীব্র জ্বরজনিত মৃত্যু / Sudden acute fever and cardiac arrest incident',
            capturedAt: now
        },
        status: 'submitted',
        createdAt: now
    });
    return state;
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/shared/src/health.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "handleHealth",
    ()=>handleHealth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/errors.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/domain-context.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/validation.ts [app-client] (ecmascript)");
;
;
;
function validateAnimal(input, now) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(input.name, 1, 80) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(input.breed, 1, 100));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])([
        'cattle',
        'goat',
        'buffalo'
    ].includes(input.species) && [
        'female',
        'male'
    ].includes(input.sex));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidDate"])(input.birthDate) && Date.parse(input.birthDate) <= Date.parse(now) && Date.parse(now) - Date.parse(input.birthDate) < 40 * 366 * 86_400_000);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(Number.isFinite(input.weightKg) && input.weightKg > 0 && input.weightKg <= 2000 && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isPositiveMoney"])(input.value));
}
function availableSlot(state, vetId, scheduledAt, exceptId) {
    // Each sample appointment reserves a 30-minute slot.
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(!state.appointments.some((item)=>item.id !== exceptId && item.vetId === vetId && [
            'requested',
            'accepted',
            'in_progress'
        ].includes(item.status) && Math.abs(Date.parse(item.scheduledAt) - Date.parse(scheduledAt)) < 30 * 60_000), 'duplicate');
}
function handleHealth(state, command) {
    switch(command.type){
        case 'farm.save':
            {
                const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["actor"])(state, [
                    'farmer'
                ]);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.name, 1, 100) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.address, 3, 500) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.district, 1, 100));
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(Number.isFinite(command.size) && command.size > 0 && command.size <= 10000);
                let farm = state.farms.find((item)=>item.ownerId === user.id);
                if (!farm) {
                    farm = {
                        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextId"])(state, 'farm'),
                        ownerId: user.id,
                        name: '',
                        district: '',
                        address: '',
                        size: 1
                    };
                    state.farms.push(farm);
                }
                Object.assign(farm, {
                    name: command.name.trim(),
                    district: command.district.trim(),
                    address: command.address.trim(),
                    size: command.size
                });
                return {
                    id: farm.id
                };
            }
        case 'animal.add':
            {
                const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["actor"])(state, [
                    'farmer'
                ]);
                validateAnimal(command.animal, state.now);
                const farm = state.farms.find((item)=>item.ownerId === user.id);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(farm, 'not_found');
                const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextId"])(state, 'animal');
                state.animals.push({
                    ...command.animal,
                    id,
                    ownerId: user.id,
                    farmId: farm.id,
                    tag: `PL-${state.revision + 1005}`,
                    healthScore: 80,
                    status: 'healthy',
                    registeredAt: state.now
                });
                state.records.push({
                    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextId"])(state, 'record'),
                    animalId: id,
                    kind: 'registration',
                    title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('স্বাস্থ্য পাসপোর্ট তৈরি', 'Health passport created'),
                    note: 'প্রাথমিক স্বাস্থ্য ও পরিচয় নিবন্ধন সম্পন্ন / Initial health & identity registration completed',
                    createdAt: state.now
                });
                return {
                    id
                };
            }
        case 'animal.update':
            {
                const animal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeAnimal"])(state, command.animalId);
                validateAnimal({
                    ...animal,
                    ...command.animal
                }, state.now);
                // Editable profile fields never change existing signed-off collateral valuations.
                for (const key of [
                    'name',
                    'species',
                    'breed',
                    'sex',
                    'birthDate',
                    'weightKg',
                    'value'
                ]){
                    const value = command.animal[key];
                    if (value !== undefined) Object.assign(animal, {
                        [key]: value
                    });
                }
                return {
                    id: animal.id
                };
            }
        case 'animal.archive':
            {
                const animal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeAnimal"])(state, command.animalId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(!(0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["heldCollateral"])(state, animal.id), 'collateral');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(!state.policies.some((item)=>item.animalId === animal.id && [
                        'active',
                        'submitted'
                    ].includes(item.status)), 'invalid_transition');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(!state.appointments.some((item)=>item.animalId === animal.id && [
                        'requested',
                        'accepted',
                        'in_progress'
                    ].includes(item.status)), 'invalid_transition');
                animal.status = 'sold';
                return {
                    id: animal.id
                };
            }
        case 'record.add':
            {
                const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["actor"])(state);
                const animal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.animals, command.animalId);
                if (user.role === 'farmer') {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ownedAnimal"])(state, animal.id);
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])([
                        'registration',
                        'checkup'
                    ].includes(command.kind), 'unauthorized');
                } else (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["linkedVet"])(state, animal.id);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(animal.status !== 'sold' && animal.status !== 'deceased', 'invalid_transition');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])([
                    'registration',
                    'checkup',
                    'vaccination',
                    'treatment'
                ].includes(command.kind));
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.title.bn) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.title.en) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.note, 1, 2000));
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(!command.nextDueAt || (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidDate"])(command.nextDueAt));
                const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextId"])(state, 'record');
                state.records.push({
                    id,
                    animalId: animal.id,
                    vetId: user.role === 'vet' ? user.id : undefined,
                    kind: command.kind,
                    title: command.title,
                    note: command.note,
                    nextDueAt: command.nextDueAt,
                    createdAt: state.now
                });
                return {
                    id
                };
            }
        case 'device.connect':
            {
                const animal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeAnimal"])(state, command.animalId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.serial, 3, 60) && /^[a-zA-Z0-9-]+$/.test(command.serial));
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(!state.devices.some((item)=>item.serial === command.serial && item.animalId !== animal.id), 'duplicate');
                let device = state.devices.find((item)=>item.animalId === animal.id);
                if (device) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(!device.connected || device.serial !== command.serial, 'duplicate');
                    device.connected = true;
                    device.serial = command.serial;
                    device.lastSeenAt = state.now;
                } else {
                    device = {
                        id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextId"])(state, 'device'),
                        animalId: animal.id,
                        serial: command.serial,
                        connected: true,
                        battery: 100,
                        lastSeenAt: state.now,
                        readings: [
                            {
                                at: state.now,
                                temperature: 38.5,
                                heartRate: 70,
                                activity: 75
                            }
                        ]
                    };
                    state.devices.push(device);
                }
                for (const alert of state.alerts.filter((item)=>item.animalId === animal.id && item.kind === 'disconnected' && item.status !== 'resolved'))alert.status = 'resolved';
                return {
                    id: device.id
                };
            }
        case 'device.disconnect':
            {
                const device = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.devices, command.deviceId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeAnimal"])(state, device.animalId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(device.connected, 'invalid_transition');
                device.connected = false;
                const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextId"])(state, 'alert');
                state.alerts.push({
                    id,
                    animalId: device.animalId,
                    kind: 'disconnected',
                    severity: 'warning',
                    title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('ডিভাইসের সংযোগ বিচ্ছিন্ন', 'Device disconnected'),
                    message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('ব্যাটারি ও কলারের সংযোগ পরীক্ষা করুন।', 'Check the collar connection and battery level.'),
                    createdAt: state.now,
                    status: 'open'
                });
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["actor"])(state).id, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('ডিভাইস পরীক্ষা করুন', 'Check your device'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('সেন্সর থেকে নতুন তথ্য আসছে না।', 'New sensor readings are currently unavailable.'), 'devices', device.id);
                return {
                    id
                };
            }
        case 'alert.simulate':
            {
                const animal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeAnimal"])(state, command.animalId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])([
                    'temperature',
                    'heart_rate',
                    'inactivity',
                    'disconnected',
                    'emergency'
                ].includes(command.kind) && [
                    'info',
                    'warning',
                    'critical'
                ].includes(command.severity));
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(!state.alerts.some((item)=>item.animalId === animal.id && item.kind === command.kind && [
                        'open',
                        'escalated'
                    ].includes(item.status)), 'duplicate');
                const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextId"])(state, 'alert');
                const emergency = command.kind === 'emergency';
                const title = emergency ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('জরুরি ভেটেরিনারি সহায়তা', 'Emergency veterinary alert') : (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('স্বাস্থ্য সূচকে পরিবর্তন', 'Health indicator alert');
                state.alerts.push({
                    id,
                    animalId: animal.id,
                    kind: command.kind,
                    severity: emergency ? 'critical' : command.severity,
                    title,
                    message: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('সেন্সর রিডিংয়ে অস্বাভাবিকতা দেখা গেছে। দ্রুত পশুচিকিৎসকের পরামর্শ নিন।', 'Abnormal sensor reading detected. Contact a veterinarian for clinical assessment.'),
                    createdAt: state.now,
                    status: 'open'
                });
                animal.status = emergency ? 'critical' : 'attention';
                if (command.kind === 'inactivity') animal.productionDrop = true;
                const device = state.devices.find((item)=>item.animalId === animal.id);
                if (device && device.connected && command.kind !== 'disconnected') device.readings.push({
                    at: state.now,
                    temperature: 40.2,
                    heartRate: 100,
                    activity: 20
                });
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, animal.ownerId, title, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('সতর্কতা পর্যালোচনা করুন।', 'Review the alert.'), 'alerts', id);
                if (emergency) {
                    const vet = state.users.find((item)=>item.role === 'vet' && item.available && item.status === 'active');
                    if (vet) {
                        const appointmentId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextId"])(state, 'appointment');
                        state.appointments.push({
                            id: appointmentId,
                            farmerId: animal.ownerId,
                            animalId: animal.id,
                            vetId: vet.id,
                            alertId: id,
                            scheduledAt: state.now,
                            mode: 'visit',
                            priority: 'emergency',
                            reason: 'জরুরি খামার পরিদর্শন অনুরোধ / Emergency farm visit dispatch',
                            status: 'requested',
                            createdAt: state.now
                        });
                        state.alerts[state.alerts.length - 1].appointmentId = appointmentId;
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, vet.id, title, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('জরুরি অনুরোধ পর্যালোচনা করুন।', 'Review the emergency request.'), 'appointments', appointmentId);
                    }
                }
                return {
                    id
                };
            }
        case 'alert.acknowledge':
            {
                const alert = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.alerts, command.alertId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ownedAnimal"])(state, alert.animalId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])([
                    'open',
                    'escalated'
                ].includes(alert.status), 'invalid_transition');
                alert.status = 'acknowledged';
                return {
                    id: alert.id
                };
            }
        case 'appointment.book':
            {
                const animal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["activeAnimal"])(state, command.animalId);
                const vet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.users, command.vetId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(vet.role === 'vet' && vet.status === 'active' && vet.available, 'invalid_transition');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidDate"])(command.scheduledAt) && Date.parse(command.scheduledAt) >= Date.parse(state.now) && Date.parse(command.scheduledAt) <= Date.parse((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isoAfter"])(state.now, 1440 * 365)));
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.reason, 3, 1000) && [
                    'video',
                    'visit'
                ].includes(command.mode) && [
                    'routine',
                    'urgent',
                    'emergency'
                ].includes(command.priority));
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(!state.appointments.some((item)=>item.animalId === animal.id && item.vetId === vet.id && item.scheduledAt === command.scheduledAt && ![
                        'cancelled',
                        'rejected'
                    ].includes(item.status)), 'duplicate');
                availableSlot(state, vet.id, command.scheduledAt);
                const alert = command.alertId ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.alerts, command.alertId) : undefined;
                if (alert) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(alert.animalId === animal.id, 'unauthorized');
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(alert.status !== 'resolved' && !alert.appointmentId, 'duplicate');
                }
                const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextId"])(state, 'appointment');
                state.appointments.push({
                    id,
                    farmerId: animal.ownerId,
                    animalId: animal.id,
                    vetId: vet.id,
                    alertId: alert?.id,
                    scheduledAt: command.scheduledAt,
                    mode: command.mode,
                    priority: alert ? alert.severity === 'critical' ? 'emergency' : 'urgent' : command.priority,
                    reason: command.reason,
                    status: 'requested',
                    createdAt: state.now
                });
                if (alert) {
                    alert.appointmentId = id;
                    alert.status = 'acknowledged';
                }
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, vet.id, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('নতুন বুকিং', 'New appointment'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('কৃষকের অনুরোধ পর্যালোচনা করুন।', 'Review the farmer’s request.'), 'appointments', id);
                return {
                    id
                };
            }
        case 'appointment.decide':
            {
                const vet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["actor"])(state, [
                    'vet'
                ]);
                const appointment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.appointments, command.appointmentId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(appointment.vetId === vet.id, 'unauthorized');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(appointment.status === 'requested', 'invalid_transition');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(command.accept || (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.note, 3, 1000));
                appointment.status = command.accept ? 'accepted' : 'rejected';
                appointment.decisionNote = command.note;
                if (!command.accept && appointment.alertId) {
                    const alert = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.alerts, appointment.alertId);
                    alert.appointmentId = undefined;
                    alert.status = 'escalated';
                }
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, appointment.farmerId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('বুকিং আপডেট', 'Appointment updated'), command.accept ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('পশুচিকিৎসক বুকিং গ্রহণ করেছেন।', 'The veterinarian accepted the booking.') : (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('বুকিং প্রত্যাখ্যান করা হয়েছে। অন্য সময় বেছে নিন।', 'The booking was declined. Choose another time.'), 'appointments', appointment.id);
                return {
                    id: appointment.id
                };
            }
        case 'appointment.cancel':
        case 'appointment.reschedule':
            {
                const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["actor"])(state, [
                    'farmer',
                    'vet'
                ]);
                const appointment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.appointments, command.appointmentId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(user.id === appointment.farmerId || user.id === appointment.vetId, 'unauthorized');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])([
                    'requested',
                    'accepted'
                ].includes(appointment.status), 'invalid_transition');
                if (command.type === 'appointment.cancel') {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.reason, 3, 1000));
                    appointment.status = 'cancelled';
                    appointment.decisionNote = command.reason;
                    if (appointment.alertId) {
                        const alert = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.alerts, appointment.alertId);
                        alert.appointmentId = undefined;
                        alert.status = 'open';
                    }
                } else {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidDate"])(command.scheduledAt) && Date.parse(command.scheduledAt) > Date.parse(state.now) && Date.parse(command.scheduledAt) <= Date.parse((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isoAfter"])(state.now, 1440 * 365)));
                    availableSlot(state, appointment.vetId, command.scheduledAt, appointment.id);
                    appointment.scheduledAt = command.scheduledAt;
                    appointment.status = 'requested';
                }
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, user.role === 'farmer' ? appointment.vetId : appointment.farmerId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('বুকিং পরিবর্তন', 'Appointment changed'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('বুকিংয়ের সময় বা অবস্থা পরিবর্তিত হয়েছে।', 'The appointment time or status has changed.'), 'appointments', appointment.id);
                return {
                    id: appointment.id
                };
            }
        case 'consultation.start':
            {
                const vet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["actor"])(state, [
                    'vet'
                ]);
                const appointment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.appointments, command.appointmentId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(vet.id === appointment.vetId, 'unauthorized');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(appointment.status === 'accepted', 'invalid_transition');
                appointment.status = 'in_progress';
                return {
                    id: appointment.id
                };
            }
        case 'consultation.complete':
            {
                const vet = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["actor"])(state, [
                    'vet'
                ]);
                const appointment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.appointments, command.appointmentId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(vet.id === appointment.vetId, 'unauthorized');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(appointment.status === 'in_progress', 'invalid_transition');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.diagnosis, 3, 1000) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.advice, 3, 2000) && Array.isArray(command.medicines) && command.medicines.length <= 12);
                for (const medicine of command.medicines)(0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(medicine.name, 1, 120) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(medicine.dose, 1, 100) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(medicine.frequency, 1, 100) && Number.isInteger(medicine.days) && medicine.days > 0 && medicine.days <= 90);
                const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextId"])(state, 'prescription');
                state.prescriptions.push({
                    id,
                    appointmentId: appointment.id,
                    animalId: appointment.animalId,
                    farmerId: appointment.farmerId,
                    vetId: vet.id,
                    diagnosis: command.diagnosis,
                    advice: command.advice,
                    medicines: command.medicines,
                    createdAt: state.now
                });
                appointment.status = 'completed';
                appointment.consultationNote = command.diagnosis;
                state.records.push({
                    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextId"])(state, 'record'),
                    animalId: appointment.animalId,
                    vetId: vet.id,
                    appointmentId: appointment.id,
                    kind: 'treatment',
                    title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('পশুচিকিৎসকের পরামর্শ ও চিকিৎসা', 'Veterinary consultation & treatment'),
                    note: `${command.diagnosis}\n${command.advice}`,
                    createdAt: state.now
                });
                for (const medicine of command.medicines)state.reminders.push({
                    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextId"])(state, 'reminder'),
                    prescriptionId: id,
                    animalId: appointment.animalId,
                    medicine: medicine.name,
                    time: '08:00',
                    takenDates: [],
                    enabled: true
                });
                if (appointment.alertId) (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.alerts, appointment.alertId).status = 'resolved';
                const animal = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.animals, appointment.animalId);
                if (![
                    'deceased',
                    'sold'
                ].includes(animal.status)) animal.status = 'attention';
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, appointment.farmerId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('পরামর্শ সম্পন্ন', 'Consultation complete'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('প্রেসক্রিপশন ও স্বাস্থ্য রেকর্ড আপডেট হয়েছে।', 'Your prescription and health record have been updated.'), 'prescriptions', id);
                for (const policy of state.policies.filter((item)=>item.animalId === animal.id && item.status === 'active'))(0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, policy.insurerId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('প্রতিরোধমূলক যত্নের রেকর্ড', 'Preventive care recorded'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('প্রাণীর ডিজিটাল স্বাস্থ্য পাসপোর্টে নতুন চিকিৎসা রেকর্ড যুক্ত হয়েছে।', 'A new clinical treatment record has been added to the animal health passport.'), 'policies', policy.id);
                return {
                    id
                };
            }
        case 'reminder.toggle':
        case 'reminder.take':
            {
                const reminder = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.reminders, command.reminderId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ownedAnimal"])(state, reminder.animalId);
                if (command.type === 'reminder.toggle') {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(typeof command.enabled === 'boolean');
                    reminder.enabled = command.enabled;
                } else {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(reminder.enabled, 'invalid_transition');
                    const day = state.now.slice(0, 10);
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(!reminder.takenDates.includes(day), 'duplicate');
                    reminder.takenDates.push(day);
                }
                return {
                    id: reminder.id
                };
            }
        default:
            return undefined;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/shared/src/index.ts [app-client] (ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$types$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/types.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$repository$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/repository.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$fixtures$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/fixtures.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/domain-context.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$finance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/finance.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/validation.ts [app-client] (ecmascript)");
;
;
;
;
;
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/shared/src/persistence.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "assertState",
    ()=>assertState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/errors.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/validation.ts [app-client] (ecmascript)");
;
;
const text = (value)=>typeof value === 'string' && value.length <= 20000;
const nonempty = (value)=>text(value) && value.trim().length > 0;
const bool = (value)=>typeof value === 'boolean';
const numeric = (value)=>typeof value === 'number' && Number.isFinite(value);
const integer = (value)=>typeof value === 'number' && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isNonNegativeMoney"])(value);
const money = (value)=>typeof value === 'number' && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isPositiveMoney"])(value);
const date = __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidDate"];
const choice = (...values)=>(value)=>values.includes(value);
const optional = (check)=>(value)=>value === undefined || check(value);
const array = (check)=>(value)=>Array.isArray(value) && value.length <= 50000 && value.every(check);
const object = (fields)=>(value)=>!!value && typeof value === 'object' && !Array.isArray(value) && Object.entries(fields).every(([key, check])=>check(value[key])) && Object.keys(value).every((key)=>key in fields);
const localized = object({
    bn: nonempty,
    en: nonempty
});
const id = nonempty;
const role = choice('farmer', 'vet', 'bank', 'insurer', 'admin');
const medicine = object({
    name: nonempty,
    dose: nonempty,
    frequency: nonempty,
    days: (value)=>integer(value) && value >= 1 && value <= 90
});
const cartItem = object({
    productId: id,
    quantity: (value)=>integer(value) && value > 0 && value <= 99
});
const shape = object({
    schemaVersion: choice(1),
    revision: integer,
    now: date,
    session: object({
        userId: (value)=>value === null || id(value),
        locale: choice('bn', 'en'),
        onboarded: bool,
        pendingPhone: optional(nonempty),
        otpExpiresAt: optional(date)
    }),
    settings: object({
        offline: bool,
        notifications: bool,
        scenario: choice('normal', 'health', 'insurance', 'lending', 'empty'),
        failNext: optional(bool)
    }),
    processedRequests: array(object({
        requestId: id,
        command: nonempty,
        resultId: optional(id)
    })),
    users: array(object({
        id,
        role,
        name: nonempty,
        nameBn: nonempty,
        phone: nonempty,
        status: choice('active', 'suspended'),
        district: nonempty,
        avatar: optional(text),
        specialty: optional(text),
        fee: optional(integer),
        rating: optional(numeric),
        available: optional(bool),
        schedule: optional(text)
    })),
    farms: array(object({
        id,
        ownerId: id,
        name: nonempty,
        district: nonempty,
        address: nonempty,
        size: (value)=>numeric(value) && value > 0
    })),
    animals: array(object({
        id,
        ownerId: id,
        farmId: id,
        tag: nonempty,
        name: nonempty,
        species: choice('cattle', 'goat', 'buffalo'),
        breed: nonempty,
        sex: choice('female', 'male'),
        birthDate: date,
        weightKg: (value)=>numeric(value) && value > 0 && value <= 2000,
        value: money,
        healthScore: (value)=>numeric(value) && value >= 0 && value <= 100,
        status: choice('healthy', 'attention', 'critical', 'deceased', 'sold'),
        image: optional(text),
        registeredAt: date,
        productionDrop: optional(bool)
    })),
    records: array(object({
        id,
        animalId: id,
        vetId: optional(id),
        appointmentId: optional(id),
        kind: choice('registration', 'checkup', 'vaccination', 'treatment', 'death'),
        title: localized,
        note: nonempty,
        createdAt: date,
        nextDueAt: optional(date)
    })),
    devices: array(object({
        id,
        animalId: id,
        serial: nonempty,
        connected: bool,
        battery: (value)=>numeric(value) && value >= 0 && value <= 100,
        lastSeenAt: date,
        readings: array(object({
            at: date,
            temperature: numeric,
            heartRate: numeric,
            activity: numeric
        }))
    })),
    alerts: array(object({
        id,
        animalId: id,
        kind: choice('temperature', 'heart_rate', 'inactivity', 'disconnected', 'emergency'),
        severity: choice('info', 'warning', 'critical'),
        title: localized,
        message: localized,
        createdAt: date,
        status: choice('open', 'acknowledged', 'escalated', 'resolved'),
        appointmentId: optional(id)
    })),
    appointments: array(object({
        id,
        farmerId: id,
        animalId: id,
        vetId: id,
        alertId: optional(id),
        scheduledAt: date,
        mode: choice('video', 'visit'),
        priority: choice('routine', 'urgent', 'emergency'),
        reason: nonempty,
        status: choice('requested', 'accepted', 'rejected', 'cancelled', 'in_progress', 'completed'),
        createdAt: date,
        decisionNote: optional(text),
        consultationNote: optional(text)
    })),
    prescriptions: array(object({
        id,
        appointmentId: id,
        animalId: id,
        farmerId: id,
        vetId: id,
        diagnosis: nonempty,
        advice: nonempty,
        medicines: array(medicine),
        createdAt: date
    })),
    reminders: array(object({
        id,
        prescriptionId: id,
        animalId: id,
        medicine: nonempty,
        time: nonempty,
        takenDates: array(date),
        enabled: bool
    })),
    products: array(object({
        id,
        name: localized,
        category: choice('medicine', 'feed', 'equipment'),
        price: money,
        unit: localized,
        stock: integer,
        image: optional(text),
        requiresPrescription: bool
    })),
    carts: (value)=>!!value && typeof value === 'object' && !Array.isArray(value) && Object.values(value).every(array(cartItem)),
    orders: array(object({
        id,
        farmerId: id,
        items: array(object({
            productId: id,
            quantity: money,
            price: money
        })),
        total: money,
        address: nonempty,
        status: choice('placed', 'confirmed', 'shipped', 'delivered', 'cancelled'),
        createdAt: date
    })),
    policies: array(object({
        id,
        farmerId: id,
        animalId: id,
        insurerId: id,
        coverage: money,
        premium: money,
        status: choice('submitted', 'active', 'rejected', 'expired', 'settled'),
        submittedAt: date,
        startsAt: optional(date),
        expiresAt: optional(date),
        decisionNote: optional(text),
        enhanced: optional(bool)
    })),
    claims: array(object({
        id,
        policyId: id,
        animalId: id,
        farmerId: id,
        insurerId: id,
        kind: choice('illness', 'death'),
        amount: money,
        evidence: object({
            photo: bool,
            location: bool,
            description: nonempty,
            capturedAt: optional(date),
            latitude: optional((value)=>numeric(value) && Math.abs(value) <= 90),
            longitude: optional((value)=>numeric(value) && Math.abs(value) <= 180)
        }),
        status: choice('submitted', 'manual_review', 'vet_review', 'approved', 'rejected', 'paid'),
        createdAt: date,
        vetId: optional(id),
        vetOpinion: optional(text),
        decisionNote: optional(text),
        payout: optional(integer),
        debtSettlement: optional(integer),
        farmerPayout: optional(integer)
    })),
    loans: array(object({
        id,
        farmerId: id,
        animalId: id,
        bankId: id,
        purpose: nonempty,
        repaymentSource: nonempty,
        collateralValue: money,
        amount: money,
        annualRate: (value)=>numeric(value) && value >= 0 && value <= 100,
        termMonths: (value)=>integer(value) && value >= 1 && value <= 36,
        outstanding: integer,
        status: choice('offered', 'submitted', 'approved', 'rejected', 'active', 'paid', 'settled'),
        createdAt: date,
        dueAt: optional(date),
        graceUntil: optional(date),
        decisionNote: optional(text)
    })),
    payments: array(object({
        id,
        userId: id,
        kind: choice('loan_disbursement', 'repayment', 'insurance_payout', 'debt_settlement', 'order', 'premium'),
        amount: money,
        direction: choice('credit', 'debit'),
        referenceId: id,
        createdAt: date
    })),
    notifications: array(object({
        id,
        userId: id,
        title: localized,
        body: localized,
        createdAt: date,
        read: bool,
        screen: optional(text),
        entityId: optional(id)
    })),
    content: array(object({
        id,
        title: localized,
        body: localized,
        category: choice('health', 'nutrition', 'finance'),
        status: choice('draft', 'published'),
        updatedAt: date
    })),
    audit: array(object({
        id,
        actorId: id,
        action: nonempty,
        entityId: optional(id),
        at: date,
        detail: text
    })),
    aiMessages: array(object({
        id,
        userId: id,
        role: choice('user', 'assistant'),
        text: localized,
        at: date,
        mode: choice('text', 'photo', 'voice')
    }))
});
function assertState(value) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(value && typeof value === 'object', 'corrupt_storage');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(value.schemaVersion === 1, 'version');
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(shape(value), 'corrupt_storage');
    const state = value;
    const valid = (condition)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(condition, 'corrupt_storage');
    for (const entries of Object.values(state).filter(Array.isArray)){
        if (entries.length && 'id' in entries[0]) valid(new Set(entries.map((item)=>item.id)).size === entries.length);
    }
    valid(new Set(state.processedRequests.map((item)=>item.requestId)).size === state.processedRequests.length);
    const user = (userId, expectedRole)=>state.users.find((item)=>item.id === userId && (!expectedRole || item.role === expectedRole));
    const animal = (animalId, ownerId)=>state.animals.find((item)=>item.id === animalId && (!ownerId || item.ownerId === ownerId));
    valid(!state.session.userId || user(state.session.userId));
    valid(state.users.some((item)=>item.role === 'admin' && item.status === 'active'));
    for (const farm of state.farms)valid(user(farm.ownerId, 'farmer'));
    for (const item of state.animals){
        valid(user(item.ownerId, 'farmer') && state.farms.some((farm)=>farm.id === item.farmId && farm.ownerId === item.ownerId));
        valid(Date.parse(item.birthDate) <= Date.parse(state.now));
    }
    for (const item of state.devices)valid(animal(item.animalId));
    valid(new Set(state.devices.map((item)=>item.serial)).size === state.devices.length);
    valid(new Set(state.devices.map((item)=>item.animalId)).size === state.devices.length);
    for (const item of state.records)valid(animal(item.animalId) && (!item.vetId || user(item.vetId, 'vet')) && (!item.appointmentId || state.appointments.some((appointment)=>appointment.id === item.appointmentId && appointment.animalId === item.animalId)));
    for (const item of state.alerts)valid(animal(item.animalId) && (!item.appointmentId || state.appointments.some((appointment)=>appointment.id === item.appointmentId && appointment.animalId === item.animalId)));
    for (const item of state.appointments)valid(animal(item.animalId, item.farmerId) && user(item.vetId, 'vet') && (!item.alertId || state.alerts.some((alert)=>alert.id === item.alertId && alert.animalId === item.animalId)));
    for (const item of state.prescriptions)valid(state.appointments.some((appointment)=>appointment.id === item.appointmentId && appointment.animalId === item.animalId && appointment.farmerId === item.farmerId && appointment.vetId === item.vetId));
    for (const item of state.reminders)valid(state.prescriptions.some((prescription)=>prescription.id === item.prescriptionId && prescription.animalId === item.animalId));
    for (const [userId, cart] of Object.entries(state.carts)){
        valid(user(userId, 'farmer'));
        valid(new Set(cart.map((item)=>item.productId)).size === cart.length);
        for (const item of cart)valid(state.products.some((product)=>product.id === item.productId));
    }
    for (const item of state.orders){
        valid(user(item.farmerId, 'farmer') && item.items.length > 0 && item.total === item.items.reduce((sum, entry)=>sum + entry.price * entry.quantity, 0));
        for (const entry of item.items)valid(state.products.some((product)=>product.id === entry.productId));
    }
    for (const item of state.policies){
        valid(animal(item.animalId, item.farmerId) && user(item.insurerId, 'insurer'));
        if ([
            'active',
            'expired',
            'settled'
        ].includes(item.status)) valid(item.startsAt && item.expiresAt && Date.parse(item.startsAt) < Date.parse(item.expiresAt));
    }
    for (const item of state.claims){
        const policy = state.policies.find((policy)=>policy.id === item.policyId);
        valid(policy && policy.animalId === item.animalId && policy.farmerId === item.farmerId && policy.insurerId === item.insurerId && item.amount <= policy.coverage);
        valid(!item.vetId || user(item.vetId, 'vet'));
        if (item.status === 'paid') valid(item.payout === item.amount && item.debtSettlement !== undefined && item.farmerPayout !== undefined && item.payout === item.debtSettlement + item.farmerPayout);
    }
    for (const item of state.loans){
        valid(animal(item.animalId, item.farmerId) && user(item.bankId, 'bank') && item.amount <= (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["maximumLoanAmount"])(item.collateralValue) && item.outstanding <= item.amount);
        if ([
            'paid',
            'settled',
            'offered',
            'submitted',
            'approved',
            'rejected'
        ].includes(item.status)) valid(item.outstanding === 0);
    }
    const held = state.loans.filter((item)=>[
            'offered',
            'submitted',
            'approved',
            'active'
        ].includes(item.status));
    valid(new Set(held.map((item)=>item.animalId)).size === held.length);
    const covered = state.policies.filter((item)=>[
            'submitted',
            'active'
        ].includes(item.status));
    valid(new Set(covered.map((item)=>item.animalId)).size === covered.length);
    for (const item of state.payments){
        valid(user(item.userId));
        if ([
            'loan_disbursement',
            'repayment',
            'debt_settlement'
        ].includes(item.kind)) valid(state.loans.some((loan)=>loan.id === item.referenceId && (item.kind === 'debt_settlement' ? loan.bankId : loan.farmerId) === item.userId));
        if (item.kind === 'insurance_payout') valid(state.claims.some((claim)=>claim.id === item.referenceId && claim.farmerId === item.userId));
        if (item.kind === 'premium') valid(state.policies.some((policy)=>policy.id === item.referenceId && policy.farmerId === item.userId));
        if (item.kind === 'order') valid(state.orders.some((order)=>order.id === item.referenceId && order.farmerId === item.userId));
    }
    for (const item of state.notifications)valid(user(item.userId));
    for (const item of state.aiMessages)valid(user(item.userId, 'farmer'));
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/shared/src/repository.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DEMO_STORAGE_KEY",
    ()=>DEMO_STORAGE_KEY,
    "createDemoRepository",
    ()=>createDemoRepository
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$fixtures$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/fixtures.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/domain-context.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/errors.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$health$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/health.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$finance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/finance.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$support$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/support.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$persistence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/persistence.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/validation.ts [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
const DEMO_STORAGE_KEY = 'palito.demo.v1';
const clone = (value)=>JSON.parse(JSON.stringify(value));
function freeze(value) {
    if (value && typeof value === 'object') {
        for (const child of Object.values(value))freeze(child);
        Object.freeze(value);
    }
    return value;
}
function canonical(value) {
    if (value && typeof value === 'object' && !Array.isArray(value)) return `{${Object.entries(value).sort(([a], [b])=>a.localeCompare(b)).map(([key, item])=>`${JSON.stringify(key)}:${canonical(item)}`).join(',')}}`;
    if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
    return JSON.stringify(value) ?? 'null';
}
const failure = (error)=>error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DomainError"] ? {
        ok: false,
        code: error.code === 'success' ? 'unknown' : error.code,
        message: __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["messages"][error.code]
    } : {
        ok: false,
        code: 'validation',
        message: __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["messages"].validation
    };
const localCommand = (command)=>command.type.startsWith('demo.') || command.type.startsWith('session.') || [
        'auth.switch',
        'auth.logout',
        'settings.notifications',
        'notification.read',
        'reminder.toggle',
        'reminder.take'
    ].includes(command.type);
const publicCommand = (command)=>command.type.startsWith('demo.') || command.type.startsWith('auth.') || command.type.startsWith('session.');
function advanceClock(state, hours) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(Number.isFinite(hours) && hours > 0 && hours <= 24 * 366);
    state.now = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isoAfter"])(state.now, hours * 60);
    for (const alert of state.alerts.filter((item)=>item.status === 'open' && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["elapsedHours"])(item.createdAt, state.now) >= 4)){
        alert.status = 'escalated';
        const animal = state.animals.find((item)=>item.id === alert.animalId);
        for (const vet of state.users.filter((item)=>item.role === 'vet' && item.status === 'active'))(0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, vet.id, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('৪ ঘণ্টার অমীমাংসিত সতর্কতা', 'Unacknowledged alert after four hours'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('কৃষকের সঙ্গে জরুরি ফলোআপ প্রয়োজন।', 'An urgent follow-up with the farmer is needed.'), 'emergency', alert.id);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, animal.ownerId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('সতর্কতা এসকেলেট হয়েছে', 'Alert escalated'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('পশুচিকিৎসকের কাছে ফলোআপ অনুরোধ পাঠানো হয়েছে।', 'A follow-up request was sent to the veterinarian.'), 'alerts', alert.id);
    }
    for (const policy of state.policies.filter((item)=>item.status === 'active' && item.expiresAt && item.expiresAt <= state.now)){
        policy.status = 'expired';
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, policy.farmerId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('বীমার মেয়াদ শেষ', 'Insurance expired'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('নবায়নের বিকল্প দেখুন।', 'Review your renewal options.'), 'insurance', policy.id);
    }
    for (const claim of state.claims.filter((item)=>[
            'manual_review',
            'vet_review'
        ].includes(item.status) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["elapsedHours"])(item.createdAt, state.now) >= 7 * 24)){
        if (!state.notifications.some((item)=>item.entityId === claim.id && item.screen === 'review-overdue')) (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, claim.insurerId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('দাবি পর্যালোচনা ৭ দিন পেরিয়েছে', 'Claim review older than seven days'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('অগ্রাধিকার ভিত্তিতে দাবির ফলোআপ সম্পন্ন করুন।', 'Complete a priority follow-up on this pending claim.'), 'review-overdue', claim.id);
    }
}
function createDemoRepository(options = {}) {
    const initial = options.initialState ? clone(options.initialState) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$fixtures$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createDemoState"])('normal', options.now?.() ?? new Date());
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$persistence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertState"])(initial);
    let state = freeze(initial);
    let queue = Promise.resolve();
    let failNext = false;
    const listeners = new Set();
    function serial(operation) {
        const result = queue.then(operation, operation);
        queue = result.then(()=>undefined, ()=>undefined);
        return result;
    }
    async function commit(draft) {
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$persistence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertState"])(draft);
        if (options.storage) {
            try {
                await options.storage.setItem(DEMO_STORAGE_KEY, JSON.stringify(draft));
            } catch  {
                throw new __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DomainError"]('storage');
            }
        }
        state = freeze(draft);
        for (const listener of listeners){
            try {
                listener();
            } catch  {}
        }
    }
    async function executeCommand(command) {
        try {
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(command && typeof command.type === 'string');
            if (!publicCommand(command)) (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["actor"])(state);
            if (command.requestId !== undefined) (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.requestId, 1, 150));
            const fingerprint = canonical({
                actorId: state.session.userId,
                ...command
            });
            const previous = command.requestId ? state.processedRequests.find((item)=>item.requestId === command.requestId) : undefined;
            if (previous) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(previous.command === fingerprint, 'duplicate');
                return {
                    ok: true,
                    id: previous.resultId,
                    message: __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["messages"].success
                };
            }
            if (!localCommand(command)) {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(!state.settings.offline, 'offline');
                if (failNext) {
                    failNext = false;
                    throw new __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DomainError"]('network');
                }
            }
            const latency = options.latencyMs ?? 0;
            if (latency > 0 && Number.isFinite(latency)) await new Promise((resolve)=>{
                const schedule = globalThis.setTimeout;
                schedule(resolve, Math.min(latency, 5000));
            });
            let draft = clone(state);
            let result;
            switch(command.type){
                case 'demo.offline':
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(typeof command.offline === 'boolean');
                    draft.settings.offline = command.offline;
                    result = {};
                    break;
                case 'demo.failNext':
                    result = {};
                    break;
                case 'demo.advanceTime':
                    advanceClock(draft, command.hours);
                    result = {};
                    break;
                case 'demo.reset':
                    {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])([
                            'normal',
                            'health',
                            'insurance',
                            'lending',
                            'empty'
                        ].includes(command.scenario));
                        draft = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$fixtures$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createDemoState"])(command.scenario, new Date(state.now));
                        draft.session = {
                            userId: state.session.userId,
                            locale: state.session.locale,
                            onboarded: state.session.onboarded
                        };
                        result = {};
                        break;
                    }
                default:
                    result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$support$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["handleSupport"])(draft, command) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$health$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["handleHealth"])(draft, command) ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$finance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["handleFinance"])(draft, command);
            }
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(result, 'validation');
            draft.revision = state.revision + 1;
            if (command.requestId) draft.processedRequests.push({
                requestId: command.requestId,
                command: fingerprint,
                resultId: result.id
            });
            // Keep identifiers and action labels only: OTP values and personal form text never enter the audit log.
            draft.audit.push({
                id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextId"])(draft, 'audit'),
                actorId: state.session.userId ?? 'guest',
                action: command.type,
                entityId: result.id,
                at: draft.now,
                detail: 'কার্যক্রম নিবন্ধিত / Activity recorded'
            });
            await commit(draft);
            if (command.type === 'demo.failNext') failNext = true;
            if (command.type === 'demo.reset') failNext = false;
            return {
                ok: true,
                id: result.id,
                message: __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["messages"].success
            };
        } catch (error) {
            return failure(error);
        }
    }
    return {
        getSnapshot: ()=>state,
        subscribe (listener) {
            listeners.add(listener);
            return ()=>{
                listeners.delete(listener);
            };
        },
        hydrate: ()=>serial(async ()=>{
                if (!options.storage) return {
                    ok: true
                };
                let saved;
                try {
                    saved = await options.storage.getItem(DEMO_STORAGE_KEY);
                } catch  {
                    return {
                        ok: false,
                        code: 'storage',
                        message: __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["messages"].storage
                    };
                }
                if (saved === null) return {
                    ok: true
                };
                try {
                    let parsed;
                    try {
                        parsed = JSON.parse(saved);
                    } catch  {
                        throw new __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DomainError"]('corrupt_storage');
                    }
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$persistence$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertState"])(parsed);
                    state = freeze(parsed);
                    failNext = false;
                    for (const listener of listeners){
                        try {
                            listener();
                        } catch  {}
                    }
                    return {
                        ok: true
                    };
                } catch (error) {
                    return failure(error);
                }
            }),
        execute (command) {
            // Capture immediately so callers cannot mutate a queued command before it is validated.
            let captured;
            try {
                captured = clone(command);
            } catch  {
                return Promise.resolve({
                    ok: false,
                    code: 'validation',
                    message: __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["messages"].validation
                });
            }
            return serial(()=>executeCommand(captured));
        }
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/shared/src/support.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "handleSupport",
    ()=>handleSupport
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/errors.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/domain-context.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/validation.ts [app-client] (ecmascript)");
;
;
;
function handleSupport(state, command) {
    switch(command.type){
        case 'auth.requestOtp':
            {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(typeof command.phone === 'string' && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isBangladeshPhone"])(command.phone));
                const phone = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["normalizePhone"])(command.phone);
                const user = state.users.find((item)=>item.phone === phone);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(user, 'not_found');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(user.status === 'active', 'blocked');
                state.session.pendingPhone = phone;
                state.session.otpExpiresAt = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isoAfter"])(state.now, 5);
                return {};
            }
        case 'auth.verifyOtp':
            {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(command.code === '123456' && state.session.pendingPhone && state.session.otpExpiresAt && state.session.otpExpiresAt > state.now, 'otp');
                const user = state.users.find((item)=>item.phone === state.session.pendingPhone);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(user, 'not_found');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(user.status === 'active', 'blocked');
                state.session.userId = user.id;
                state.session.pendingPhone = undefined;
                state.session.otpExpiresAt = undefined;
                return {
                    id: user.id
                };
            }
        case 'auth.switch':
            {
                const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.users, command.userId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(user.status === 'active', 'blocked');
                state.session.userId = user.id;
                state.session.pendingPhone = undefined;
                state.session.otpExpiresAt = undefined;
                return {
                    id: user.id
                };
            }
        case 'auth.logout':
            state.session.userId = null;
            state.session.pendingPhone = undefined;
            state.session.otpExpiresAt = undefined;
            return {};
        case 'session.locale':
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])([
                'bn',
                'en'
            ].includes(command.locale));
            state.session.locale = command.locale;
            return {};
        case 'session.onboard':
            state.session.onboarded = true;
            return {};
        case 'profile.update':
            {
                const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["actor"])(state);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.name, 2, 100) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.district, 1, 100));
                user.name = command.name.trim();
                user.nameBn = command.name.trim();
                user.district = command.district.trim();
                if (command.specialty !== undefined || command.available !== undefined || command.schedule !== undefined) {
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(user.role === 'vet', 'unauthorized');
                    if (command.specialty !== undefined) {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.specialty, 2, 200));
                        user.specialty = command.specialty;
                    }
                    if (command.available !== undefined) {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(typeof command.available === 'boolean');
                        user.available = command.available;
                    }
                    if (command.schedule !== undefined) {
                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.schedule, 1, 500));
                        user.schedule = command.schedule;
                    }
                }
                return {
                    id: user.id
                };
            }
        case 'ai.ask':
            {
                const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["actor"])(state, [
                    'farmer'
                ]);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.text, 2, 2000) && [
                    'text',
                    'photo',
                    'voice'
                ].includes(command.mode));
                state.aiMessages.push({
                    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextId"])(state, 'ai-user'),
                    userId: user.id,
                    role: 'user',
                    text: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])(command.text.trim(), command.text.trim()),
                    at: state.now,
                    mode: command.mode
                });
                const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextId"])(state, 'ai-reply');
                const reply = command.mode === 'photo' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('ছবি পর্যবেক্ষণ সম্পন্ন: দৃশ্যমান লক্ষণ অনুযায়ী প্রাণীকে ছায়াযুক্ত ও পরিষ্কার স্থানে আলাদা রাখুন, শরীরের তাপমাত্রা পরিমাপ করুন এবং দ্রুত নিবন্ধিত পশুচিকিৎসকের পরামর্শ নিন।', 'Visual triage note: Keep the animal in a clean, shaded area, check body temperature, and book a registered veterinarian for clinical assessment.') : command.mode === 'voice' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('ভয়েস নোট বিশ্লেষণ: প্রাণীর পানির প্রাপ্যতা ও রোমন্থনের হার পর্যবেক্ষণ করুন। লক্ষণ তীব্র হলে জরুরি ভেট সহায়তা চালু করুন।', 'Voice triage note: Monitor hydration and rumination frequency closely. If symptoms worsen, initiate emergency veterinary dispatch.') : (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('প্রাথমিক পরামর্শ: প্রাণীর তাপমাত্রা, খাদ্য গ্রহণ ও আচরণ নোট করুন। পরিষ্কার পানি ও ইলেক্ট্রোলাইট দিন এবং প্রয়োজনে পশুচিকিৎসকের অ্যাপয়েন্টমেন্ট নিন।', 'Primary advisory: Record temperature, appetite, and behavior. Provide clean water with electrolytes and schedule a veterinary consultation if needed.');
                state.aiMessages.push({
                    id,
                    userId: user.id,
                    role: 'assistant',
                    text: reply,
                    at: state.now,
                    mode: command.mode
                });
                return {
                    id
                };
            }
        case 'cart.set':
            {
                const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["actor"])(state, [
                    'farmer'
                ]);
                const product = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.products, command.productId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(Number.isInteger(command.quantity) && command.quantity >= 0 && command.quantity <= product.stock && command.quantity <= 99);
                const cart = state.carts[user.id] ?? [];
                const filtered = cart.filter((item)=>item.productId !== product.id);
                if (command.quantity > 0) filtered.push({
                    productId: product.id,
                    quantity: command.quantity
                });
                state.carts[user.id] = filtered;
                return {
                    id: product.id
                };
            }
        case 'order.place':
            {
                const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["actor"])(state, [
                    'farmer'
                ]);
                const cart = state.carts[user.id] ?? [];
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(cart.length > 0 && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.address, 8, 500));
                const items = cart.map((item)=>{
                    const product = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.products, item.productId);
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(item.quantity > 0 && product.stock >= item.quantity, 'invalid_transition');
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(!product.requiresPrescription || state.prescriptions.some((prescription)=>prescription.farmerId === user.id && prescription.medicines.length > 0), 'invalid_transition');
                    return {
                        ...item,
                        price: product.price
                    };
                });
                const total = items.reduce((sum, item)=>sum + item.price * item.quantity, 0);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(Number.isSafeInteger(total) && total > 0);
                const id = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextId"])(state, 'order');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["payment"])(state, user.id, 'order', total, 'debit', id);
                for (const item of items)(0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.products, item.productId).stock -= item.quantity;
                state.orders.push({
                    id,
                    farmerId: user.id,
                    items,
                    total,
                    address: command.address.trim(),
                    status: 'placed',
                    createdAt: state.now
                });
                state.carts[user.id] = [];
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, user.id, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('অর্ডার নিশ্চিত হয়েছে', 'Order placed'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('ওয়ালেট থেকে মূল্য পরিশোধিত হয়েছে এবং ডেলিভারি প্রক্রিয়াধীন।', 'Payment has been processed from your wallet and delivery is being prepared.'), 'orders', id);
                return {
                    id
                };
            }
        case 'order.cancel':
            {
                const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["actor"])(state, [
                    'farmer'
                ]);
                const order = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.orders, command.orderId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(order.farmerId === user.id, 'unauthorized');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])([
                    'placed',
                    'confirmed'
                ].includes(order.status), 'invalid_transition');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["payment"])(state, user.id, 'order', order.total, 'credit', order.id);
                for (const item of order.items)(0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.products, item.productId).stock += item.quantity;
                order.status = 'cancelled';
                return {
                    id: order.id
                };
            }
        case 'order.advance':
            {
                const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["actor"])(state, [
                    'farmer',
                    'admin'
                ]);
                const order = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.orders, command.orderId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(user.role === 'admin' || order.farmerId === user.id, 'unauthorized');
                const statuses = [
                    'placed',
                    'confirmed',
                    'shipped',
                    'delivered'
                ];
                const index = statuses.indexOf(order.status);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(index >= 0 && index < 3, 'invalid_transition');
                order.status = statuses[index + 1];
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["notify"])(state, order.farmerId, (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('ডেলিভারি স্ট্যাটাস আপডেট', 'Delivery status updated'), (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["bilingual"])('আপনার অর্ডারের ডেলিভারি ধাপ এগিয়েছে।', 'Your order has progressed to the next delivery stage.'), 'orders', order.id);
                return {
                    id: order.id
                };
            }
        case 'notification.read':
            {
                const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["actor"])(state);
                if (command.notificationId) {
                    const notification = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.notifications, command.notificationId);
                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(notification.userId === user.id, 'unauthorized');
                    notification.read = true;
                } else for (const notification of state.notifications.filter((item)=>item.userId === user.id))notification.read = true;
                return {};
            }
        case 'settings.notifications':
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["actor"])(state);
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(typeof command.enabled === 'boolean');
            state.settings.notifications = command.enabled;
            return {};
        case 'admin.userStatus':
            {
                const admin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["actor"])(state, [
                    'admin'
                ]);
                const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.users, command.userId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(user.id !== admin.id, 'unauthorized');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])([
                    'active',
                    'suspended'
                ].includes(command.status));
                user.status = command.status;
                return {
                    id: user.id
                };
            }
        case 'admin.userRole':
            {
                const admin = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["actor"])(state, [
                    'admin'
                ]);
                const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.users, command.userId);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(user.id !== admin.id, 'unauthorized');
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])([
                    'farmer',
                    'vet',
                    'bank',
                    'insurer',
                    'admin'
                ].includes(command.role));
                // Established domain relationships retain their role; change unused demo accounts only.
                const linked = state.animals.some((item)=>item.ownerId === user.id) || state.appointments.some((item)=>item.vetId === user.id || item.farmerId === user.id) || state.policies.some((item)=>item.insurerId === user.id) || state.loans.some((item)=>item.bankId === user.id);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])(!linked || user.role === command.role, 'invalid_transition');
                user.role = command.role;
                return {
                    id: user.id
                };
            }
        case 'content.save':
            {
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["actor"])(state, [
                    'admin'
                ]);
                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$errors$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["assertDomain"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.title?.bn, 3, 150) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.title?.en, 3, 150) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.body?.bn, 8, 10000) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasText"])(command.body?.en, 8, 10000) && [
                    'health',
                    'nutrition',
                    'finance'
                ].includes(command.category) && [
                    'draft',
                    'published'
                ].includes(command.status));
                const id = command.id ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["nextId"])(state, 'content');
                const content = {
                    id,
                    title: command.title,
                    body: command.body,
                    category: command.category,
                    status: command.status,
                    updatedAt: state.now
                };
                if (command.id) Object.assign((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findById"])(state.content, command.id), content);
                else state.content.push(content);
                return {
                    id
                };
            }
        default:
            return undefined;
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/shared/src/types.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Platform-independent demo contract. Monetary amounts are BDT, never minor units. */ __turbopack_context__.s([]);
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/shared/src/validation.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/** Platform-independent validation. All monetary values are integer BDT amounts. */ __turbopack_context__.s([
    "elapsedHours",
    ()=>elapsedHours,
    "hasText",
    ()=>hasText,
    "isBangladeshPhone",
    ()=>isBangladeshPhone,
    "isNonNegativeMoney",
    ()=>isNonNegativeMoney,
    "isPositiveMoney",
    ()=>isPositiveMoney,
    "isValidDate",
    ()=>isValidDate,
    "isoAfter",
    ()=>isoAfter,
    "maximumLoanAmount",
    ()=>maximumLoanAmount,
    "normalizePhone",
    ()=>normalizePhone,
    "uniqueIds",
    ()=>uniqueIds
]);
const isBangladeshPhone = (value)=>/^(?:\+?88)?01[3-9]\d{8}$/.test(value.replace(/[\s()-]/g, ''));
const normalizePhone = (value)=>{
    const digits = value.replace(/\D/g, '');
    return digits.startsWith('88') ? `+${digits}` : `+88${digits}`;
};
const isPositiveMoney = (value)=>Number.isSafeInteger(value) && value > 0;
const isNonNegativeMoney = (value)=>Number.isSafeInteger(value) && value >= 0;
const hasText = (value, min = 1, max = 1000)=>typeof value === 'string' && value.trim().length >= min && value.trim().length <= max;
const isValidDate = (value)=>{
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z)?$/.test(value)) return false;
    const date = new Date(value);
    return Number.isFinite(date.valueOf()) && date.toISOString().slice(0, 10) === value.slice(0, 10);
};
const maximumLoanAmount = (verifiedValue, ratio = 0.7)=>{
    if (!isNonNegativeMoney(verifiedValue) || !Number.isFinite(ratio) || ratio < 0) return 0;
    // Avoid floating-point rounding past the cap when dealing with large integers.
    const cap = Math.floor(verifiedValue / 10) * 7 + Math.floor(verifiedValue % 10 * 7 / 10);
    return ratio >= 0.7 ? cap : Math.min(cap, Math.floor(verifiedValue * ratio));
};
const uniqueIds = (ids)=>new Set(ids).size === ids.length;
const isoAfter = (iso, minutes)=>new Date(Date.parse(iso) + minutes * 60_000).toISOString();
const elapsedHours = (start, end)=>(Date.parse(end) - Date.parse(start)) / 3_600_000;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/web/src/lib/client.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "createPalitoWebClient",
    ()=>createPalitoWebClient,
    "createRequestId",
    ()=>createRequestId
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/frontend/shared/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$repository$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/repository.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/web/src/lib/storage.ts [app-client] (ecmascript)");
;
;
let requestCounter = 0;
function createRequestId(prefix = 'web') {
    requestCounter += 1;
    return `${prefix}_${Date.now().toString(36)}_${requestCounter.toString(36)}`;
}
const NON_IDEMPOTENT_TYPES = new Set([
    'demo.offline',
    'demo.failNext',
    'demo.advanceTime',
    'demo.reset',
    'session.locale',
    'session.onboard',
    'auth.switch',
    'auth.logout'
]);
function createPalitoWebClient(options = {}) {
    const baseRepo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$repository$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createDemoRepository"])({
        storage: __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["browserStorage"],
        latencyMs: 120,
        ...options
    });
    return {
        getSnapshot: baseRepo.getSnapshot,
        subscribe: baseRepo.subscribe,
        hydrate: baseRepo.hydrate,
        async execute (command) {
            const enriched = command.requestId || NON_IDEMPOTENT_TYPES.has(command.type) ? command : {
                ...command,
                requestId: createRequestId(command.type.replace('.', '_'))
            };
            return baseRepo.execute(enriched);
        }
    };
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/web/src/lib/storage.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "browserStorage",
    ()=>browserStorage
]);
const browserStorage = {
    async getItem (key) {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        try {
            return window.localStorage.getItem(key);
        } catch  {
            return null;
        }
    },
    async setItem (key, value) {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        window.localStorage.setItem(key, value);
    },
    async removeItem (key) {
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        window.localStorage.removeItem(key);
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/frontend/web/src/providers/web-provider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "WebAppProvider",
    ()=>WebAppProvider,
    "useWebApp",
    ()=>useWebApp
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$lib$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/web/src/lib/client.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
'use client';
;
;
const WebAppContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
const unexpectedError = {
    ok: false,
    code: 'unknown',
    message: {
        bn: 'কাজটি শেষ করা যায়নি। আবার চেষ্টা করুন।',
        en: 'This action could not finish. Please try again.'
    }
};
function WebAppProvider({ children, repository }) {
    _s();
    const [repo] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "WebAppProvider.useState": ()=>repository ?? (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$lib$2f$client$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createPalitoWebClient"])()
    }["WebAppProvider.useState"]);
    const state = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStore"])(repo.subscribe, repo.getSnapshot, repo.getSnapshot);
    const [ready, setReady] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pending, setPending] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [errorResult, setErrorResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [successResult, setSuccessResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [mobileHandoff, setMobileHandoff] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "WebAppProvider.useEffect": ()=>{
            let alive = true;
            void repo.hydrate().then({
                "WebAppProvider.useEffect": (result)=>{
                    if (alive) {
                        if (!result.ok) setErrorResult(result);
                        setReady(true);
                    }
                }
            }["WebAppProvider.useEffect"], {
                "WebAppProvider.useEffect": ()=>{
                    if (alive) {
                        setErrorResult(unexpectedError);
                        setReady(true);
                    }
                }
            }["WebAppProvider.useEffect"]);
            return ({
                "WebAppProvider.useEffect": ()=>{
                    alive = false;
                }
            })["WebAppProvider.useEffect"];
        }
    }["WebAppProvider.useEffect"], [
        repo
    ]);
    const locale = state.session.locale;
    const t = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebAppProvider.useCallback[t]": (bn, en)=>locale === 'bn' ? bn : en
    }["WebAppProvider.useCallback[t]"], [
        locale
    ]);
    const currency = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "WebAppProvider.useMemo[currency]": ()=>new Intl.NumberFormat(locale === 'bn' ? 'bn-BD' : 'en-BD', {
                style: 'currency',
                currency: 'BDT',
                maximumFractionDigits: 0
            })
    }["WebAppProvider.useMemo[currency]"], [
        locale
    ]);
    const dates = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "WebAppProvider.useMemo[dates]": ()=>new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                timeZone: 'Asia/Dhaka'
            })
    }["WebAppProvider.useMemo[dates]"], [
        locale
    ]);
    const dateTimes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "WebAppProvider.useMemo[dateTimes]": ()=>new Intl.DateTimeFormat(locale === 'bn' ? 'bn-BD' : 'en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
                timeZone: 'Asia/Dhaka'
            })
    }["WebAppProvider.useMemo[dateTimes]"], [
        locale
    ]);
    const money = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebAppProvider.useCallback[money]": (amount)=>currency.format(amount)
    }["WebAppProvider.useCallback[money]"], [
        currency
    ]);
    const date = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebAppProvider.useCallback[date]": (iso)=>Number.isNaN(Date.parse(iso)) ? '—' : dates.format(new Date(iso))
    }["WebAppProvider.useCallback[date]"], [
        dates
    ]);
    const dateTime = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebAppProvider.useCallback[dateTime]": (iso)=>Number.isNaN(Date.parse(iso)) ? '—' : dateTimes.format(new Date(iso))
    }["WebAppProvider.useCallback[dateTime]"], [
        dateTimes
    ]);
    const clearError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebAppProvider.useCallback[clearError]": ()=>setErrorResult(null)
    }["WebAppProvider.useCallback[clearError]"], []);
    const clearFeedback = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebAppProvider.useCallback[clearFeedback]": ()=>setSuccessResult(null)
    }["WebAppProvider.useCallback[clearFeedback]"], []);
    const openMobileHandoff = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebAppProvider.useCallback[openMobileHandoff]": (target)=>setMobileHandoff({
                open: true,
                ...target
            })
    }["WebAppProvider.useCallback[openMobileHandoff]"], []);
    const closeMobileHandoff = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebAppProvider.useCallback[closeMobileHandoff]": ()=>setMobileHandoff(null)
    }["WebAppProvider.useCallback[closeMobileHandoff]"], []);
    const run = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "WebAppProvider.useCallback[run]": async (command)=>{
            setPending({
                "WebAppProvider.useCallback[run]": (v)=>v + 1
            }["WebAppProvider.useCallback[run]"]);
            setErrorResult(null);
            setSuccessResult(null);
            try {
                const result = await repo.execute(command);
                if (!result.ok) setErrorResult(result);
                else if (result.message) setSuccessResult(result);
                return result;
            } catch  {
                setErrorResult(unexpectedError);
                return unexpectedError;
            } finally{
                setPending({
                    "WebAppProvider.useCallback[run]": (v)=>v - 1
                }["WebAppProvider.useCallback[run]"]);
            }
        }
    }["WebAppProvider.useCallback[run]"], [
        repo
    ]);
    const user = state.users.find((account)=>account.id === state.session.userId);
    const value = {
        state,
        repo,
        user,
        role: user?.role,
        locale,
        t,
        money,
        date,
        dateTime,
        run,
        busy: pending > 0,
        ready,
        error: errorResult && !errorResult.ok ? errorResult.message[locale] : null,
        feedback: successResult && successResult.ok && successResult.message ? successResult.message[locale] : null,
        clearError,
        clearFeedback,
        mobileHandoff,
        openMobileHandoff,
        closeMobileHandoff
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(WebAppContext.Provider, {
        value: value,
        children: children
    }, void 0, false, {
        fileName: "[project]/frontend/web/src/providers/web-provider.tsx",
        lineNumber: 192,
        columnNumber: 10
    }, this);
}
_s(WebAppProvider, "Q45444lG7f88jNiXPCUZu+A31kw=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStore"]
    ];
});
_c = WebAppProvider;
function useWebApp() {
    _s1();
    const value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(WebAppContext);
    if (!value) throw new Error('useWebApp must be used inside WebAppProvider');
    return value;
}
_s1(useWebApp, "ksutO2/Ix3UeCrGnhyM+QEP505Y=");
var _c;
__turbopack_context__.k.register(_c, "WebAppProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=frontend_0c75qloxg1vgt._.js.map