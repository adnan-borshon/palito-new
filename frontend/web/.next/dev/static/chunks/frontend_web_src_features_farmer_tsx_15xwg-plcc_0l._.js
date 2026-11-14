(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/frontend/web/src/features/farmer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FarmerWebFeature",
    ()=>FarmerWebFeature
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/frontend/shared/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/domain-context.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$finance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/finance.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/validation.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$providers$2f$web$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/web/src/providers/web-provider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/web/src/components/ui.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function FarmerWebFeature({ screen, id }) {
    _s();
    const { state, user, locale, t, money, date, dateTime, run, busy, openMobileHandoff } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$providers$2f$web$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWebApp"])();
    const mappedInitial = [
        'animals',
        'animal',
        'animal-add',
        'animal-edit',
        'record-add',
        'farm'
    ].includes(screen) ? 'animals' : [
        'devices',
        'device',
        'vitals',
        'alerts',
        'alert'
    ].includes(screen) ? 'devices' : [
        'care',
        'vets',
        'vet',
        'book',
        'appointments',
        'appointment',
        'emergency',
        'prescriptions',
        'prescription',
        'reminders'
    ].includes(screen) ? 'care' : screen === 'ai' ? 'ai' : [
        'wallet',
        'loans',
        'loan',
        'loan-apply',
        'insurance',
        'insurance-apply',
        'policy',
        'policies',
        'claims',
        'claim',
        'claim-apply'
    ].includes(screen) ? 'wallet' : [
        'market',
        'shop',
        'orders',
        'order'
    ].includes(screen) ? 'market' : [
        'education',
        'article'
    ].includes(screen) ? 'education' : 'home';
    const [section, setSection] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(mappedInitial);
    const myAnimals = state.animals.filter((a)=>a.ownerId === user?.id && a.status !== 'sold');
    const myAnimalIds = new Set(myAnimals.map((a)=>a.id));
    const myAlerts = state.alerts.filter((al)=>myAnimalIds.has(al.animalId));
    const myLoans = state.loans.filter((l)=>l.farmerId === user?.id);
    const myPolicies = state.policies.filter((p)=>p.farmerId === user?.id);
    const myClaims = state.claims.filter((c)=>c.farmerId === user?.id);
    const myAppointments = state.appointments.filter((a)=>a.farmerId === user?.id);
    const myPrescriptions = state.prescriptions.filter((p)=>p.farmerId === user?.id);
    const myReminders = state.reminders.filter((r)=>myAnimalIds.has(r.animalId));
    const myOrders = state.orders.filter((o)=>o.farmerId === user?.id);
    const myPayments = state.payments.filter((p)=>p.userId === user?.id);
    const walletBalance = user ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$domain$2d$context$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["demoBalance"])(state, user.id) : 0;
    // Animal & Passport state
    const [selectedAnimalId, setSelectedAnimalId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])((mappedInitial === 'animals' && id ? id : undefined) ?? myAnimals[0]?.id ?? '');
    const [passportSubTab, setPassportSubTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(screen === 'record-add' ? 'records' : 'overview');
    const [animalName, setAnimalName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('রূপা / Rupa');
    const [animalSpecies, setAnimalSpecies] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('cattle');
    const [animalBreed, setAnimalBreed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Sahiwal Cross');
    const [animalSex, setAnimalSex] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('female');
    const [animalBirth, setAnimalBirth] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('2023-04-15');
    const [animalWeight, setAnimalWeight] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('340');
    const [animalValue, setAnimalValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('140000');
    const [editAnimalName, setEditAnimalName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [editAnimalBreed, setEditAnimalBreed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [editAnimalWeight, setEditAnimalWeight] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [editAnimalValue, setEditAnimalValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [recKind, setRecKind] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('checkup');
    const [recTitleBn, setRecTitleBn] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('নিয়মিত স্বাস্থ্য পর্যবেক্ষণ');
    const [recTitleEn, setRecTitleEn] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Routine Owner Health Check');
    const [recNote, setRecNote] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Normal appetite and rumination observed.');
    const [recNextDueAt, setRecNextDueAt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    // IoT & Vitals state
    const [collarSerial, setCollarSerial] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('PLT-CLR-908');
    const [simKind, setSimKind] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('temperature');
    const [simSeverity, setSimSeverity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('critical');
    const [selectedAlertId, setSelectedAlertId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    // Vet Care & Reminders state
    const vets = state.users.filter((u)=>u.role === 'vet' && u.status === 'active');
    const [speciesFilter, setSpeciesFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [selectedVetId, setSelectedVetId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(vets[0]?.id ?? '');
    const [paymentMethod, setPaymentMethod] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('wallet');
    const [apptMode, setApptMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('video');
    const [apptPriority, setApptPriority] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('urgent');
    const [apptReason, setApptReason] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Elevated collar temperature and reduced morning feed intake.');
    const [skippedIds, setSkippedIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [micMuted, setMicMuted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [callEnded, setCallEnded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // AI Scan state
    const [aiMode, setAiMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('text');
    const [aiPrompt, setAiPrompt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('গাভীর তাপমাত্রা ৩৯.৬°সে এবং জাবর কাটা কমে গেছে, এখন করণীয় কী?');
    // Finance (Loan & Insurance) state
    const [loanAmount, setLoanAmount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('70000');
    const [loanTerm, setLoanTerm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('12');
    const [loanPurpose, setLoanPurpose] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Dairy feed & automated milking unit');
    const [loanRepaySource, setLoanRepaySource] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Daily milk collection revenue');
    const [repayInput, setRepayInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('5000');
    const insurers = state.users.filter((u)=>u.role === 'insurer' && u.status === 'active');
    const [selectedInsurerId, setSelectedInsurerId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(insurers[0]?.id ?? 'u-insurer-1');
    const [coverageInput, setCoverageInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('120000');
    const [claimKind, setClaimKind] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('illness');
    const [claimAmount, setClaimAmount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('25000');
    const [claimDesc, setClaimDesc] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Acute fever verified by collar telemetry and treated by veterinarian.');
    const [claimPhoto, setClaimPhoto] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [claimLocation, setClaimLocation] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // Marketplace state
    const [deliveryAddress, setDeliveryAddress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('শাহজাদপুর ডেইরি ক্লাস্টার, সিরাজগঞ্জ');
    const activeAnimal = myAnimals.find((a)=>a.id === selectedAnimalId) ?? myAnimals[0];
    const activeDevice = activeAnimal ? state.devices.find((d)=>d.animalId === activeAnimal.id) : undefined;
    const activeAnimalRecords = activeAnimal ? state.records.filter((r)=>r.animalId === activeAnimal.id) : [];
    const dailyVitals = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "FarmerWebFeature.useMemo[dailyVitals]": ()=>{
            const readings = activeDevice?.readings ?? [];
            const byDay = new Map();
            for (const r of readings){
                const dayKey = r.at.slice(0, 10);
                const prev = byDay.get(dayKey);
                if (!prev) {
                    byDay.set(dayKey, {
                        day: dayKey,
                        temp: r.temperature,
                        hr: r.heartRate,
                        act: r.activity,
                        count: 1
                    });
                } else {
                    prev.temp += r.temperature;
                    prev.hr += r.heartRate;
                    prev.act += r.activity;
                    prev.count += 1;
                }
            }
            return Array.from(byDay.values()).slice(0, 7).map({
                "FarmerWebFeature.useMemo[dailyVitals]": (d)=>({
                        day: d.day,
                        temperature: Number((d.temp / d.count).toFixed(1)),
                        heartRate: Math.round(d.hr / d.count),
                        activity: Math.round(d.act / d.count)
                    })
            }["FarmerWebFeature.useMemo[dailyVitals]"]);
        }
    }["FarmerWebFeature.useMemo[dailyVitals]"], [
        activeDevice
    ]);
    const filteredVets = vets.filter((v)=>{
        if (speciesFilter === 'all') return true;
        const spec = (v.specialty ?? '').toLowerCase();
        return speciesFilter === 'goat' ? spec.includes('goat') || spec.includes('sheep') : spec.includes('cattle') || spec.includes('dairy') || !spec.includes('goat');
    });
    const activeLoanQuote = activeAnimal ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$finance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["demoLoanQuote"])(activeAnimal) : null;
    const estMonthlyInstallment = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "FarmerWebFeature.useMemo[estMonthlyInstallment]": ()=>{
            const amt = Math.max(1000, Number(loanAmount) || 50000);
            const months = Math.max(3, Number(loanTerm) || 12);
            const rate = activeLoanQuote?.annualRate ?? 9;
            return Math.ceil(amt * (1 + rate / 100 * (months / 12)) / months);
        }
    }["FarmerWebFeature.useMemo[estMonthlyInstallment]"], [
        loanAmount,
        loanTerm,
        activeLoanQuote
    ]);
    const myCart = user ? state.carts[user.id] ?? [] : [];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KpiCard"], {
                        label: t('আমার প্রাণী সংখ্যা', 'Registered Herd'),
                        value: myAnimals.length,
                        hint: t('ডিজিটাল স্বাস্থ্য পাসপোর্টসহ', 'With digital health passports'),
                        tone: "brand",
                        icon: "paw"
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                        lineNumber: 258,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KpiCard"], {
                        label: t('খোলা স্বাস্থ্য সতর্কতা', 'Active Health Alerts'),
                        value: myAlerts.filter((a)=>a.status !== 'resolved').length,
                        hint: t('২৪/৭ আইওটি কলার পর্যবেক্ষণ', '24/7 IoT collar monitoring'),
                        tone: myAlerts.some((a)=>a.status !== 'resolved') ? 'danger' : 'success',
                        icon: "radio"
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                        lineNumber: 265,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KpiCard"], {
                        label: t('পালিতো ওয়ালেট ব্যালেন্স', 'Palito Wallet Balance'),
                        value: money(walletBalance),
                        hint: t('ঋণ বিতরণ, কিস্তি ও পেআউট', 'Loans, repayments & payouts'),
                        tone: "success",
                        icon: "wallet"
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                        lineNumber: 274,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KpiCard"], {
                        label: t('সক্রিয় ঋণ ও বীমা পলিসি', 'Active Loans & Policies'),
                        value: `${myLoans.length} / ${myPolicies.length}`,
                        hint: t('৭০% জামানত ঋণ ও সুরক্ষা', '70% LTV credit & livestock cover'),
                        tone: "info",
                        icon: "shield-check"
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                        lineNumber: 281,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                lineNumber: 257,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsBar"], {
                ariaLabel: t('খামারি পোর্টাল বিভাগসমূহ', 'Farmer workspace sections'),
                active: section,
                onChange: setSection,
                tabs: [
                    {
                        id: 'home',
                        label: t('হোম ও সারাংশ', 'Overview')
                    },
                    {
                        id: 'animals',
                        label: t('আমার প্রাণী ও পাসপোর্ট', 'Animals & Passports'),
                        count: myAnimals.length
                    },
                    {
                        id: 'devices',
                        label: t('আইওটি ভাইটালস ও সতর্কতা', 'IoT Vitals & Alerts'),
                        count: myAlerts.filter((a)=>a.status !== 'resolved').length
                    },
                    {
                        id: 'care',
                        label: t('পশুচিকিৎসক, জরুরি কল ও রিমাইন্ডার', 'Vet Care & Reminders'),
                        count: myAppointments.length
                    },
                    {
                        id: 'ai',
                        label: t('স্ক্যান ও AI পরামর্শ', 'Scan & AI Advisor')
                    },
                    {
                        id: 'wallet',
                        label: t('ওয়ালেট, ঋণ ও বীমা', 'Wallet, Loans & Insurance'),
                        count: myLoans.length + myPolicies.length
                    },
                    {
                        id: 'market',
                        label: t('ওষুধ ও খাদ্য বাজার', 'Marketplace & Orders'),
                        count: myOrders.length
                    },
                    {
                        id: 'education',
                        label: t('খামার শিক্ষা', 'Knowledge Hub'),
                        count: state.content.filter((c)=>c.status === 'published').length
                    }
                ]
            }, void 0, false, {
                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                lineNumber: 291,
                columnNumber: 7
            }, this),
            section === 'home' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 lg:grid-cols-12 gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lg:col-span-7 flex flex-col gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                tinted: true,
                                className: "flex flex-wrap items-center justify-between gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                tone: "brand",
                                                children: t('২৪/৭ সক্রিয় সেবা', '24/7 Active Care')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 337,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-lg font-bold text-[#0A401E] mt-1",
                                                children: t('মোবাইল ও ওয়েব — উভয় মাধ্যমেই সম্পূর্ণ খামার ব্যবস্থাপনা', 'Complete Farm, Veterinary & Financial Workflows in Your Browser')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 338,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-[#0F602D] mt-0.5",
                                                children: t('প্রাণী নিবন্ধন, কলার ভাইটালস, জরুরি ভেট বুকিং, AI স্ক্যান, ৭০% জামানত ঋণ এবং বীমা দাবি এখান থেকেই সম্পন্ন করুন।', 'Register animals, pair collars, dispatch emergency vets, run AI scans, apply for 70% LTV loans, and file insurance claims right here.')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 344,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 336,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "danger",
                                                size: "sm",
                                                icon: "phone",
                                                onClick: ()=>setSection('care'),
                                                children: t('জরুরি ভেট কল', 'Emergency Vet')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 352,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "primary",
                                                size: "sm",
                                                icon: "scan",
                                                onClick: ()=>setSection('ai'),
                                                children: t('AI লক্ষণ স্ক্যান', 'AI Symptom Scan')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 360,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 351,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 335,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "flex flex-col gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-base font-bold text-[#1F2937]",
                                                children: t('আমার প্রাণী তালিকা (স্বাস্থ্য পাসপোর্ট)', 'My Herd & Health Passports')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 373,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "secondary",
                                                size: "sm",
                                                icon: "plus",
                                                onClick: ()=>setSection('animals'),
                                                children: t('প্রাণী যোগ / সম্পাদনা', 'Manage Animals')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 376,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 372,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
                                        children: myAnimals.map((animal)=>{
                                            const insured = myPolicies.some((p)=>p.animalId === animal.id && p.status === 'active');
                                            const pledged = myLoans.some((l)=>l.animalId === animal.id && [
                                                    'submitted',
                                                    'approved',
                                                    'active'
                                                ].includes(l.status));
                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>{
                                                    setSelectedAnimalId(animal.id);
                                                    setSection('animals');
                                                },
                                                className: "rounded-[14px] border border-[#E2E8F0] bg-white p-3.5 text-left hover:border-[#15803D] transition-colors cursor-pointer flex flex-col gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-between gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-2.5",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                        src: "/images/cow.jpg",
                                                                        alt: animal.name,
                                                                        className: "w-11 h-11 rounded-[10px] object-cover"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                        lineNumber: 407,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "text-sm font-bold text-[#1F2937]",
                                                                                children: [
                                                                                    animal.name,
                                                                                    " (",
                                                                                    animal.tag,
                                                                                    ")"
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                                lineNumber: 413,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "text-xs text-[#64748B] tabular-nums",
                                                                                children: [
                                                                                    animal.breed,
                                                                                    " · ",
                                                                                    animal.weightKg,
                                                                                    " kg"
                                                                                ]
                                                                            }, void 0, true, {
                                                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                                lineNumber: 416,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                        lineNumber: 412,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                lineNumber: 406,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                tone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toneForStatus"])(animal.status),
                                                                children: animal.status
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                lineNumber: 421,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 405,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HealthScoreBar"], {
                                                        score: animal.healthScore
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 423,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-wrap gap-1.5 pt-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                tone: "neutral",
                                                                children: money(animal.value)
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                lineNumber: 425,
                                                                columnNumber: 25
                                                            }, this),
                                                            insured ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                tone: "success",
                                                                children: t('বীমাকৃত', 'Insured')
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                lineNumber: 427,
                                                                columnNumber: 27
                                                            }, this) : null,
                                                            pledged ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                tone: "info",
                                                                children: t('জামানতকৃত', 'Pledged')
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                lineNumber: 430,
                                                                columnNumber: 27
                                                            }, this) : null
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 424,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, animal.id, true, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 396,
                                                columnNumber: 21
                                            }, this);
                                        })
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 385,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 371,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                        lineNumber: 334,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lg:col-span-5 flex flex-col gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "flex flex-col gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-base font-bold text-[#1F2937]",
                                                children: t('যাচাইকৃত পশুচিকিৎসক প্যানেল', 'Verified Veterinarians')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 444,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "ghost",
                                                size: "sm",
                                                onClick: ()=>setSection('care'),
                                                children: t('সাক্ষাৎ বুক করুন', 'Book Visit')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 447,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 443,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col gap-2.5",
                                        children: vets.map((v, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between gap-3 rounded-[12px] border border-[#E2E8F0] p-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                src: `/images/vet-avatar-${idx % 5 + 1}.${idx === 0 ? 'png' : 'jpg'}`,
                                                                alt: v.name,
                                                                className: "w-11 h-11 rounded-full object-cover border border-[#D8E9DE]"
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                lineNumber: 458,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-sm font-bold text-[#1F2937]",
                                                                        children: locale === 'bn' ? v.nameBn : v.name
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                        lineNumber: 464,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "text-xs text-[#64748B]",
                                                                        children: [
                                                                            v.specialty,
                                                                            " · ",
                                                                            v.district
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                        lineNumber: 467,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                lineNumber: 463,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 457,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        variant: "secondary",
                                                        size: "sm",
                                                        onClick: ()=>{
                                                            setSelectedVetId(v.id);
                                                            setSection('care');
                                                        },
                                                        children: money(v.fee ?? 500)
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 472,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, v.id, true, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 453,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 451,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 442,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "flex flex-col gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-base font-bold text-[#1F2937]",
                                        children: t('সাম্প্রতিক সতর্কতা ও ওষুধের রিমাইন্ডার', 'Recent Alerts & Dose Reminders')
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 489,
                                        columnNumber: 15
                                    }, this),
                                    myAlerts.slice(0, 2).map((al)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-[10px] border border-[#FECDD3] bg-[#FFF1F2] p-3 flex items-center justify-between gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-xs font-bold text-[#BE123C]",
                                                            children: al.title[locale]
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 498,
                                                            columnNumber: 21
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-xs text-[#9F1239]",
                                                            children: al.message[locale]
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 501,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 497,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    variant: "outline",
                                                    size: "sm",
                                                    onClick: ()=>setSection('devices'),
                                                    children: t('দেখুন', 'Inspect')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 503,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, al.id, true, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 493,
                                            columnNumber: 17
                                        }, this)),
                                    myReminders.slice(0, 2).map((rem)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-3 flex items-center justify-between gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-xs",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            className: "text-[#1F2937]",
                                                            children: rem.medicine
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 518,
                                                            columnNumber: 21
                                                        }, this),
                                                        " ·",
                                                        ' ',
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[#64748B] tabular-nums",
                                                            children: rem.time
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 519,
                                                            columnNumber: 21
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 517,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    variant: "secondary",
                                                    size: "sm",
                                                    onClick: ()=>void run({
                                                            type: 'reminder.take',
                                                            reminderId: rem.id
                                                        }),
                                                    children: t('ডোজ সম্পন্ন', 'Log Dose')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 521,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, rem.id, true, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 513,
                                            columnNumber: 17
                                        }, this))
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 488,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                        lineNumber: 440,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                lineNumber: 333,
                columnNumber: 9
            }, this) : null,
            section === 'animals' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SplitWorkbench"], {
                masterTitle: t('আমার প্রাণী ও নিবন্ধন', 'My Animals & Registration'),
                masterCount: myAnimals.length,
                masterList: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-3",
                    children: [
                        myAnimals.map((animal)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>setSelectedAnimalId(animal.id),
                                className: `w-full rounded-[12px] border p-3.5 text-left cursor-pointer ${activeAnimal?.id === animal.id ? 'border-[#15803D] bg-[#EBF4EE]/60' : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm font-bold text-[#1F2937]",
                                                children: [
                                                    animal.name,
                                                    " (",
                                                    animal.tag,
                                                    ")"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 554,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                tone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toneForStatus"])(animal.status),
                                                children: animal.status
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 557,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 553,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-[#64748B] mt-1 tabular-nums",
                                        children: [
                                            animal.breed,
                                            " · ",
                                            animal.weightKg,
                                            " kg · ",
                                            money(animal.value)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 559,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, animal.id, true, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 543,
                                columnNumber: 17
                            }, this)),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "border-t border-[#E2E8F0] pt-4 mt-2 flex flex-col gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-sm font-bold text-[#1F2937]",
                                    children: t('নতুন প্রাণী নিবন্ধন করুন', 'Register New Animal')
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                    lineNumber: 567,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                    label: t('প্রাণীর নাম', 'Animal Name'),
                                    value: animalName,
                                    onChange: (e)=>setAnimalName(e.target.value)
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                    lineNumber: 570,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-2 gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectField"], {
                                            label: t('প্রজাতি', 'Species'),
                                            value: animalSpecies,
                                            onChange: (e)=>setAnimalSpecies(e.target.value),
                                            options: [
                                                {
                                                    value: 'cattle',
                                                    label: t('গরু (Cattle)', 'Cattle')
                                                },
                                                {
                                                    value: 'goat',
                                                    label: t('ছাগল (Goat)', 'Goat')
                                                },
                                                {
                                                    value: 'buffalo',
                                                    label: t('মহিষ (Buffalo)', 'Buffalo')
                                                }
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 576,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectField"], {
                                            label: t('লিঙ্গ', 'Sex'),
                                            value: animalSex,
                                            onChange: (e)=>setAnimalSex(e.target.value),
                                            options: [
                                                {
                                                    value: 'female',
                                                    label: t('মাদী (Female)', 'Female')
                                                },
                                                {
                                                    value: 'male',
                                                    label: t('মর্দা (Male)', 'Male')
                                                }
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 586,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                    lineNumber: 575,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                    label: t('জাত (Breed)', 'Breed'),
                                    value: animalBreed,
                                    onChange: (e)=>setAnimalBreed(e.target.value)
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                    lineNumber: 596,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-3 gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                            label: t('জন্ম তারিখ', 'Birth Date'),
                                            value: animalBirth,
                                            onChange: (e)=>setAnimalBirth(e.target.value)
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 602,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                            label: t('ওজন (কেজি)', 'Weight (kg)'),
                                            type: "number",
                                            value: animalWeight,
                                            onChange: (e)=>setAnimalWeight(e.target.value)
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 607,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                            label: t('মূল্য (৳)', 'Value (BDT)'),
                                            type: "number",
                                            value: animalValue,
                                            onChange: (e)=>setAnimalValue(e.target.value)
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 613,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                    lineNumber: 601,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: "primary",
                                    icon: "plus",
                                    disabled: busy,
                                    onClick: ()=>void run({
                                            type: 'animal.add',
                                            animal: {
                                                name: animalName,
                                                species: animalSpecies,
                                                breed: animalBreed,
                                                sex: animalSex,
                                                birthDate: animalBirth,
                                                weightKg: Math.max(10, Number(animalWeight) || 250),
                                                value: Math.max(5000, Number(animalValue) || 100000)
                                            }
                                        }),
                                    children: t('প্রাণী যুক্ত করুন', 'Add Animal to Herd')
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                    lineNumber: 620,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                            lineNumber: 566,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                    lineNumber: 541,
                    columnNumber: 13
                }, this),
                detailPane: !activeAnimal ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EmptyWorkspaceState"], {
                    title: t('কোনো প্রাণী নির্বাচন করা হয়নি', 'No animal selected'),
                    description: t('বাম দিকের তালিকা থেকে প্রাণী নির্বাচন করুন।', 'Select an animal from your herd.')
                }, void 0, false, {
                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                    lineNumber: 646,
                    columnNumber: 15
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                        className: "flex flex-col gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap items-start justify-between gap-4 border-b border-[#E2E8F0] pb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: "/images/cow.jpg",
                                                alt: activeAnimal.name,
                                                className: "w-16 h-16 rounded-[14px] object-cover border border-[#E2E8F0]"
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 655,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                className: "text-xl font-bold text-[#1F2937]",
                                                                children: [
                                                                    activeAnimal.name,
                                                                    " (",
                                                                    activeAnimal.tag,
                                                                    ")"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                lineNumber: 662,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                tone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toneForStatus"])(activeAnimal.status),
                                                                children: activeAnimal.status
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                lineNumber: 665,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 661,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs text-[#64748B] mt-0.5 tabular-nums",
                                                        children: [
                                                            activeAnimal.breed,
                                                            " · ",
                                                            activeAnimal.weightKg,
                                                            " kg ·",
                                                            ' ',
                                                            t('মূল্যায়ন:', 'Valuation:'),
                                                            " ",
                                                            money(activeAnimal.value)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 669,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 660,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 654,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "outline",
                                                size: "sm",
                                                icon: "smartphone",
                                                onClick: ()=>openMobileHandoff({
                                                        role: 'farmer',
                                                        screen: 'animal',
                                                        id: activeAnimal.id,
                                                        title: `${activeAnimal.name} (${activeAnimal.tag})`
                                                    }),
                                                children: t('মোবাইল পাসপোর্ট QR', 'Mobile Passport QR')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 677,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "secondary",
                                                size: "sm",
                                                disabled: busy,
                                                onClick: ()=>void run({
                                                        type: 'animal.update',
                                                        animalId: activeAnimal.id,
                                                        animal: {
                                                            weightKg: activeAnimal.weightKg + 5
                                                        }
                                                    }),
                                                children: t('+৫ কেজি ওজন হালনাগাদ', '+5 kg Weight Update')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 692,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "ghost",
                                                size: "sm",
                                                disabled: busy,
                                                onClick: ()=>void run({
                                                        type: 'animal.archive',
                                                        animalId: activeAnimal.id
                                                    }),
                                                children: t('বিক্রয়/আর্কাইভ', 'Archive')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 706,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 676,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 653,
                                columnNumber: 19
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsBar"], {
                                ariaLabel: t('প্রাণী পাসপোর্ট ট্যাব', 'Animal passport tabs'),
                                active: passportSubTab,
                                onChange: setPassportSubTab,
                                tabs: [
                                    {
                                        id: 'overview',
                                        label: t('ওভারভিউ ও পূর্বাভাস', 'Overview & Forecast')
                                    },
                                    {
                                        id: 'records',
                                        label: t('টিকা ও চিকিৎসা রেকর্ড', 'Health & Vaccination Records'),
                                        count: activeAnimalRecords.length
                                    },
                                    {
                                        id: 'gallery',
                                        label: t('গ্যালারি ও পরিচয়', 'Photo Gallery')
                                    }
                                ]
                            }, void 0, false, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 723,
                                columnNumber: 19
                            }, this),
                            passportSubTab === 'overview' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HealthScoreBar"], {
                                        score: activeAnimal.healthScore,
                                        label: t('যাচাইকৃত স্বাস্থ্য স্কোর', 'Verified Health Passport Score')
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 740,
                                        columnNumber: 23
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-[14px] border border-[#D8E9DE] bg-[#EBF4EE]/70 p-4 flex flex-col gap-1.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-bold text-[#0A401E]",
                                                        children: t('এআই স্বাস্থ্য ও উৎপাদন পূর্বাভাস', 'AI Biometric & Lactation Health Forecast')
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 748,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                        tone: "brand",
                                                        children: t('৭ দিনের বিশ্লেষণ', '7-Day Telemetry')
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 754,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 747,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-[#0F602D]",
                                                children: activeAnimal.healthScore >= 80 ? t('রুমিনেশন ও তাপমাত্রা স্বাভাবিক সীমার মধ্যে রয়েছে। আগামী ১৪ দিনে দুগ্ধ উৎপাদন স্থিতিশীল থাকার সম্ভাবনা বেশি।', 'Rumination and collar temperature remain within normal reference limits. Stable milk yield projected over the next 14 days.') : t('তাপমাত্রা ও সক্রিয়তার তারতম্য দেখা গেছে। দ্রুত পশুচিকিৎসকের পরামর্শ ও ইলেকট্রোলাইট প্রদানের সুপারিশ করা হচ্ছে।', 'Elevated temperature and reduced activity detected. Immediate veterinary consultation and electrolyte supplementation advised.')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 758,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 746,
                                        columnNumber: 23
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 flex flex-col gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm font-bold text-[#1F2937]",
                                                children: t('প্রাণীর তথ্য সম্পাদনা করুন (animal.update)', 'Edit Selected Animal Profile')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 773,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                        label: t('নাম', 'Name'),
                                                        value: editAnimalName || activeAnimal.name,
                                                        onChange: (e)=>setEditAnimalName(e.target.value)
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 777,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                        label: t('জাত (Breed)', 'Breed'),
                                                        value: editAnimalBreed || activeAnimal.breed,
                                                        onChange: (e)=>setEditAnimalBreed(e.target.value)
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 782,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                        label: t('ওজন (কেজি)', 'Weight (kg)'),
                                                        type: "number",
                                                        value: editAnimalWeight || String(activeAnimal.weightKg),
                                                        onChange: (e)=>setEditAnimalWeight(e.target.value)
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 787,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                        label: t('বাজারমূল্য (৳)', 'Valuation (BDT)'),
                                                        type: "number",
                                                        value: editAnimalValue || String(activeAnimal.value),
                                                        onChange: (e)=>setEditAnimalValue(e.target.value)
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 793,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 776,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-end",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    variant: "secondary",
                                                    size: "sm",
                                                    icon: "check",
                                                    disabled: busy,
                                                    onClick: ()=>void run({
                                                            type: 'animal.update',
                                                            animalId: activeAnimal.id,
                                                            animal: {
                                                                name: (editAnimalName || activeAnimal.name).trim(),
                                                                breed: (editAnimalBreed || activeAnimal.breed).trim(),
                                                                weightKg: Math.max(5, Number(editAnimalWeight || activeAnimal.weightKg) || activeAnimal.weightKg),
                                                                value: Math.max(1000, Number(editAnimalValue || activeAnimal.value) || activeAnimal.value)
                                                            }
                                                        }),
                                                    children: t('প্রাণীর তথ্য হালনাগাদ করুন', 'Save Animal Profile')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 801,
                                                    columnNumber: 27
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 800,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 772,
                                        columnNumber: 23
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 739,
                                columnNumber: 21
                            }, this) : null,
                            passportSubTab === 'records' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col gap-2",
                                        children: activeAnimalRecords.map((rec)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-3 flex items-start justify-between gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-sm font-bold text-[#1F2937]",
                                                                children: rec.title[locale]
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                lineNumber: 843,
                                                                columnNumber: 31
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-xs text-[#475569]",
                                                                children: rec.note
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                lineNumber: 846,
                                                                columnNumber: 31
                                                            }, this),
                                                            rec.nextDueAt ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-[11px] font-semibold text-[#0F602D] mt-0.5",
                                                                children: [
                                                                    t('পরবর্তী তারিখ:', 'Next Due:'),
                                                                    " ",
                                                                    date(rec.nextDueAt)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                lineNumber: 848,
                                                                columnNumber: 33
                                                            }, this) : null
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 842,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-right shrink-0",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                tone: "brand",
                                                                children: rec.kind
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                lineNumber: 854,
                                                                columnNumber: 31
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-[11px] text-[#64748B] mt-1 tabular-nums",
                                                                children: date(rec.createdAt)
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                lineNumber: 855,
                                                                columnNumber: 31
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 853,
                                                        columnNumber: 29
                                                    }, this)
                                                ]
                                            }, rec.id, true, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 838,
                                                columnNumber: 27
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 836,
                                        columnNumber: 23
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "border-t border-[#E2E8F0] pt-4 flex flex-col gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm font-bold text-[#1F2937]",
                                                children: t('স্বাস্থ্য পর্যবেক্ষণ রেকর্ড যুক্ত করুন (ভ্যাকসিনেশন পশুচিকিৎসক কর্তৃক নিবন্ধিত হয়)', 'Log Owner Health Check Record (Vaccinations are logged by Veterinarians)')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 864,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectField"], {
                                                        label: t('ধরন', 'Type'),
                                                        value: recKind,
                                                        onChange: (e)=>setRecKind(e.target.value),
                                                        options: [
                                                            {
                                                                value: 'checkup',
                                                                label: t('চেকআপ (Checkup)', 'Checkup')
                                                            },
                                                            {
                                                                value: 'registration',
                                                                label: t('নিবন্ধন (Registration)', 'Registration')
                                                            }
                                                        ]
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 871,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                        label: t('শিরোনাম (বাংলা)', 'Title (BN)'),
                                                        value: recTitleBn,
                                                        onChange: (e)=>setRecTitleBn(e.target.value)
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 882,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                        label: t('শিরোনাম (EN)', 'Title (EN)'),
                                                        value: recTitleEn,
                                                        onChange: (e)=>setRecTitleEn(e.target.value)
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 887,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                        label: t('পরবর্তী নির্ধারিত তারিখ (ঐচ্ছিক)', 'Next Due Date (Optional)'),
                                                        type: "date",
                                                        value: recNextDueAt,
                                                        onChange: (e)=>setRecNextDueAt(e.target.value)
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 892,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 870,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                label: t('বিবরণ / নোট', 'Notes'),
                                                value: recNote,
                                                onChange: (e)=>setRecNote(e.target.value)
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 899,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-end",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    variant: "primary",
                                                    size: "sm",
                                                    icon: "plus",
                                                    disabled: busy,
                                                    onClick: ()=>void run({
                                                            type: 'record.add',
                                                            animalId: activeAnimal.id,
                                                            kind: recKind,
                                                            title: {
                                                                bn: recTitleBn,
                                                                en: recTitleEn
                                                            },
                                                            note: recNote,
                                                            nextDueAt: recNextDueAt.trim() || undefined
                                                        }),
                                                    children: t('রেকর্ড সংরক্ষণ করুন', 'Save Record')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 905,
                                                    columnNumber: 27
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 904,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 863,
                                        columnNumber: 23
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 835,
                                columnNumber: 21
                            }, this) : null,
                            passportSubTab === 'gallery' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 sm:grid-cols-3 gap-3",
                                children: [
                                    {
                                        src: '/images/cow.jpg',
                                        caption: t('প্রাণী প্রোফাইল ও ইয়ার-ট্যাগ', 'Primary Ear-Tag ID Photo')
                                    },
                                    {
                                        src: '/images/article-cattle.jpg',
                                        caption: t('খামার শেড পরিদর্শন', 'Shed & Posture Verification')
                                    },
                                    {
                                        src: '/images/article-farm.jpg',
                                        caption: t('চারণ ও স্বাস্থ্য পরীক্ষা', 'Field Grazing Inspection')
                                    }
                                ].map((img, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-[12px] border border-[#E2E8F0] overflow-hidden bg-[#F8FAFC]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                src: img.src,
                                                alt: img.caption,
                                                className: "w-full h-36 object-cover"
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 939,
                                                columnNumber: 27
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-2.5 text-xs font-medium text-[#475569]",
                                                children: img.caption
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 944,
                                                columnNumber: 27
                                            }, this)
                                        ]
                                    }, i, true, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 935,
                                        columnNumber: 25
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 929,
                                columnNumber: 21
                            }, this) : null
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                        lineNumber: 652,
                        columnNumber: 17
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                    lineNumber: 651,
                    columnNumber: 15
                }, this)
            }, void 0, false, {
                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                lineNumber: 537,
                columnNumber: 9
            }, this) : null,
            section === 'devices' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 lg:grid-cols-12 gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lg:col-span-5 flex flex-col gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "flex flex-col gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-base font-bold text-[#1F2937]",
                                        children: t('আইওটি কলার পেয়ারিং ও সংযোগ', 'IoT Collar Pairing & Status')
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 963,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectField"], {
                                        label: t('প্রাণী নির্বাচন করুন', 'Select Animal'),
                                        value: activeAnimal?.id ?? '',
                                        onChange: (e)=>setSelectedAnimalId(e.target.value),
                                        options: myAnimals.map((a)=>({
                                                value: a.id,
                                                label: `${a.name} (${a.tag})`
                                            }))
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 966,
                                        columnNumber: 15
                                    }, this),
                                    activeDevice ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-[12px] border border-[#D8E9DE] bg-[#EBF4EE]/60 p-3.5 flex flex-col gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-bold text-[#0A401E] tabular-nums",
                                                        children: [
                                                            "Serial: ",
                                                            activeDevice.serial
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 978,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                        tone: activeDevice.connected ? 'success' : 'danger',
                                                        children: activeDevice.connected ? t('সংযুক্ত', 'Connected') : t('বিচ্ছিন্ন', 'Disconnected')
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 981,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 977,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs text-[#0F602D] tabular-nums",
                                                children: [
                                                    t('ব্যাটারি:', 'Battery:'),
                                                    " ",
                                                    activeDevice.battery,
                                                    "% ·",
                                                    ' ',
                                                    t('সর্বশেষ সিঙ্ক:', 'Last Seen:'),
                                                    " ",
                                                    dateTime(activeDevice.lastSeenAt)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 987,
                                                columnNumber: 19
                                            }, this),
                                            activeDevice.connected ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "outline",
                                                size: "sm",
                                                disabled: busy,
                                                onClick: ()=>void run({
                                                        type: 'device.disconnect',
                                                        deviceId: activeDevice.id
                                                    }),
                                                children: t('কলার সংযোগ বিচ্ছিন্ন করুন', 'Disconnect Collar')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 992,
                                                columnNumber: 21
                                            }, this) : null
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 976,
                                        columnNumber: 17
                                    }, this) : null,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 sm:grid-cols-2 gap-2 items-end",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                label: t('কলার সিরিয়াল নম্বর', 'Collar Serial Number'),
                                                value: collarSerial,
                                                onChange: (e)=>setCollarSerial(e.target.value)
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 1010,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "primary",
                                                icon: "radio",
                                                disabled: busy || !activeAnimal,
                                                onClick: ()=>activeAnimal && void run({
                                                        type: 'device.connect',
                                                        animalId: activeAnimal.id,
                                                        serial: collarSerial
                                                    }),
                                                children: t('কলার পেয়ার করুন', 'Pair Collar')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 1015,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 1009,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 962,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "flex flex-col gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-base font-bold text-[#1F2937]",
                                        children: t('স্বাস্থ্য সতর্কতা পরীক্ষা ও অ্যাকনলেজমেন্ট', 'Health Alerts & Anomaly Check')
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 1034,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-2 gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectField"], {
                                                label: t('সতর্কতার ধরন', 'Alert Type'),
                                                value: simKind,
                                                onChange: (e)=>setSimKind(e.target.value),
                                                options: [
                                                    {
                                                        value: 'temperature',
                                                        label: t('উচ্চ তাপমাত্রা', 'Fever / Temp')
                                                    },
                                                    {
                                                        value: 'heart_rate',
                                                        label: t('হৃদস্পন্দন', 'Heart Rate')
                                                    },
                                                    {
                                                        value: 'inactivity',
                                                        label: t('নিষ্ক্রিয়তা', 'Inactivity')
                                                    },
                                                    {
                                                        value: 'disconnected',
                                                        label: t('কলার সংযোগ বিচ্ছিন্ন', 'Collar Disconnected')
                                                    },
                                                    {
                                                        value: 'emergency',
                                                        label: t('জরুরি অসুস্থতা (Emergency)', 'Acute Emergency')
                                                    }
                                                ]
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 1038,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectField"], {
                                                label: t('তীব্রতা', 'Severity'),
                                                value: simSeverity,
                                                onChange: (e)=>setSimSeverity(e.target.value),
                                                options: [
                                                    {
                                                        value: 'critical',
                                                        label: 'Critical'
                                                    },
                                                    {
                                                        value: 'warning',
                                                        label: 'Warning'
                                                    }
                                                ]
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 1050,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 1037,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: "secondary",
                                        icon: "alert",
                                        disabled: busy || !activeAnimal,
                                        onClick: ()=>activeAnimal && void run({
                                                type: 'alert.simulate',
                                                animalId: activeAnimal.id,
                                                kind: simKind,
                                                severity: simSeverity
                                            }),
                                        children: t('নতুন সতর্কতা তৈরি করুন', 'Log Biometric Alert')
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 1060,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 1033,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                        lineNumber: 961,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lg:col-span-7 flex flex-col gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "flex flex-col gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap items-center justify-between gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-base font-bold text-[#1F2937]",
                                                children: t('৭-দিনের দৈনিক ভাইটালস ও আদর্শ ক্লিনিক্যাল সীমা', '7-Day Daily Vitals & Clinical Reference Ranges')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 1082,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap gap-2 text-xs font-semibold text-[#0F602D]",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "rounded bg-[#EBF4EE] px-2 py-0.5",
                                                        children: t('তাপমাত্রা: ৩৮.০–৩৯.০°সে', 'Temp: 38.0–39.0°C')
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 1089,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "rounded bg-[#EBF4EE] px-2 py-0.5",
                                                        children: t('হৃদস্পন্দন: ৬০–৮০ /মিনিট', 'HR: 60–80 bpm')
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 1092,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "rounded bg-[#EBF4EE] px-2 py-0.5",
                                                        children: t('সক্রিয়তা: ৭০%+', 'Activity: 70%+')
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 1095,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 1088,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 1081,
                                        columnNumber: 15
                                    }, this),
                                    !activeDevice?.connected || activeDevice && Date.parse(state.now) - Date.parse(activeDevice.lastSeenAt) > 4 * 3_600_000 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-[10px] border border-[#FDE68A] bg-[#FFFBEB] p-3 text-xs font-semibold text-[#92400E]",
                                        children: t('সতর্কতা: আইওটি কলার অফলাইন বা দীর্ঘ সময় সিঙ্ক হয়নি (Stale Telemetry)। কলার সংযোগ ও ব্যাটারি পরীক্ষা করুন।', 'Warning: IoT collar is disconnected or telemetry is stale (>4h since last sync). Check collar battery and pairing.')
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 1105,
                                        columnNumber: 17
                                    }, this) : null,
                                    activeAnimal?.productionDrop ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-[10px] border border-[#FECDD3] bg-[#FFF1F2] p-3 text-xs font-semibold text-[#BE123C]",
                                        children: t('দুধ উৎপাদন হ্রাস শনাক্ত (productionDrop): ব্যাংক কিস্তি বিরতি (UC-003) ও জরুরি চিকিৎসার জন্য উপযুক্ত।', 'Verified Milk Yield Drop Detected (productionDrop): Eligible for bank loan grace period (UC-003) and priority care.')
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 1114,
                                        columnNumber: 17
                                    }, this) : null,
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2",
                                        children: dailyVitals.map((v)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs tabular-nums",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-[#64748B] font-semibold",
                                                        children: v.day.slice(5)
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 1128,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-base font-bold text-[#15803D] mt-1",
                                                        children: [
                                                            v.temperature,
                                                            "°C"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 1129,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-[#475569] mt-0.5",
                                                        children: [
                                                            v.heartRate,
                                                            " bpm"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 1132,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-[#0F602D] font-semibold",
                                                        children: [
                                                            v.activity,
                                                            "% act"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 1133,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, v.day, true, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 1124,
                                                columnNumber: 19
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 1122,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 1080,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "flex flex-col gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-base font-bold text-[#1F2937]",
                                        children: [
                                            t('সক্রিয় সতর্কতা তালিকা', 'Active Herd Alerts'),
                                            " (",
                                            myAlerts.length,
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 1140,
                                        columnNumber: 15
                                    }, this),
                                    myAlerts.map((al)=>{
                                        const an = myAnimals.find((a)=>a.id === al.animalId);
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-[12px] border border-[#E2E8F0] p-3.5 flex flex-wrap items-center justify-between gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-sm font-bold text-[#1F2937]",
                                                                    children: [
                                                                        an?.name,
                                                                        " (",
                                                                        an?.tag,
                                                                        ") — ",
                                                                        al.title[locale]
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                    lineNumber: 1152,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                    tone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toneForStatus"])(al.status),
                                                                    children: al.status
                                                                }, void 0, false, {
                                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                    lineNumber: 1155,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 1151,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs text-[#475569] mt-0.5",
                                                            children: al.message[locale]
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 1157,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[11px] text-[#64748B] tabular-nums",
                                                            children: dateTime(al.createdAt)
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 1158,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 1150,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-wrap items-center gap-2",
                                                    children: [
                                                        al.status === 'open' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                            variant: "secondary",
                                                            size: "sm",
                                                            disabled: busy,
                                                            onClick: ()=>void run({
                                                                    type: 'alert.acknowledge',
                                                                    alertId: al.id
                                                                }),
                                                            children: t('সতর্কতা গ্রহণ করুন', 'Acknowledge')
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 1164,
                                                            columnNumber: 25
                                                        }, this) : null,
                                                        al.kind === 'emergency' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                            variant: "outline",
                                                            size: "sm",
                                                            onClick: ()=>setSection('wallet'),
                                                            children: t('জরুরি চিকিৎসা ঋণ', 'Emergency Medical Loan Options')
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 1176,
                                                            columnNumber: 25
                                                        }, this) : null,
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                            variant: "primary",
                                                            size: "sm",
                                                            onClick: ()=>{
                                                                setSelectedAnimalId(al.animalId);
                                                                setSelectedAlertId(al.id);
                                                                setSection('care');
                                                            },
                                                            children: t('ভেট বুক করুন', 'Book Vet')
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 1184,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 1162,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, al.id, true, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1146,
                                            columnNumber: 19
                                        }, this);
                                    })
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 1139,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                        lineNumber: 1079,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                lineNumber: 960,
                columnNumber: 9
            }, this) : null,
            section === 'care' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 lg:grid-cols-12 gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lg:col-span-6 flex flex-col gap-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-center justify-between gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-base font-bold text-[#1F2937]",
                                            children: t('পশুচিকিৎসক নির্বাচন ও সাক্ষাৎ বুকিং', 'Veterinarian Discovery & Booking')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1210,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-1.5",
                                            children: [
                                                'all',
                                                'cattle',
                                                'goat'
                                            ].map((sp)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>setSpeciesFilter(sp),
                                                    className: `rounded-full px-2.5 py-1 text-xs font-semibold cursor-pointer ${speciesFilter === sp ? 'bg-[#15803D] text-white' : 'bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]'}`,
                                                    children: sp === 'all' ? t('সব বিশেষজ্ঞ', 'All') : sp === 'cattle' ? t('গরু ও ডেইরি', 'Cattle & Dairy') : t('ছাগল ও ভেড়া', 'Goat & Sheep')
                                                }, sp, false, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 1215,
                                                    columnNumber: 21
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1213,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                    lineNumber: 1209,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 gap-2.5",
                                    children: filteredVets.map((v)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>setSelectedVetId(v.id),
                                            className: `rounded-[12px] border p-3.5 text-left cursor-pointer flex items-center justify-between ${selectedVetId === v.id ? 'border-[#15803D] bg-[#EBF4EE]/60' : 'border-[#E2E8F0] bg-white'}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-sm font-bold text-[#1F2937]",
                                                            children: locale === 'bn' ? v.nameBn : v.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 1248,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-xs text-[#64748B]",
                                                            children: [
                                                                v.specialty,
                                                                " · ",
                                                                v.district,
                                                                " · ⭐ ",
                                                                v.rating ?? 4.9
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 1251,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 1247,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    tone: "brand",
                                                    children: money(v.fee ?? 500)
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 1255,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, v.id, true, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1237,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                    lineNumber: 1235,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectField"], {
                                            label: t('প্রাণী নির্বাচন', 'Animal'),
                                            value: activeAnimal?.id ?? '',
                                            onChange: (e)=>setSelectedAnimalId(e.target.value),
                                            options: myAnimals.map((a)=>({
                                                    value: a.id,
                                                    label: `${a.name} (${a.tag})`
                                                }))
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1261,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectField"], {
                                            label: t('পরামর্শের মাধ্যম', 'Consultation Mode'),
                                            value: apptMode,
                                            onChange: (e)=>setApptMode(e.target.value),
                                            options: [
                                                {
                                                    value: 'video',
                                                    label: t('ভিডিও কল (Video)', 'Video Call')
                                                },
                                                {
                                                    value: 'visit',
                                                    label: t('খামার পরিদর্শন (Visit)', 'Farm Visit')
                                                }
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1270,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectField"], {
                                            label: t('অগ্রাধিকার', 'Priority'),
                                            value: apptPriority,
                                            onChange: (e)=>setApptPriority(e.target.value),
                                            options: [
                                                {
                                                    value: 'routine',
                                                    label: t('নিয়মিত (Routine)', 'Routine')
                                                },
                                                {
                                                    value: 'urgent',
                                                    label: t('জরুরি (Urgent)', 'Urgent')
                                                },
                                                {
                                                    value: 'emergency',
                                                    label: t('তাৎক্ষণিক জরুরি (Emergency)', 'Emergency')
                                                }
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1279,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectField"], {
                                            label: t('পেমেন্ট মাধ্যম', 'Payment Method'),
                                            value: paymentMethod,
                                            onChange: (e)=>setPaymentMethod(e.target.value),
                                            options: [
                                                {
                                                    value: 'wallet',
                                                    label: 'Palito Wallet'
                                                },
                                                {
                                                    value: 'bkash',
                                                    label: 'bKash'
                                                },
                                                {
                                                    value: 'nagad',
                                                    label: 'Nagad'
                                                },
                                                {
                                                    value: 'card',
                                                    label: 'Debit / Credit Card'
                                                }
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1293,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                    lineNumber: 1260,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextareaField"], {
                                    label: t('রোগের লক্ষণ ও বিবরণ', 'Symptoms & Reason'),
                                    value: apptReason,
                                    onChange: (e)=>setApptReason(e.target.value)
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                    lineNumber: 1306,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap gap-2.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "primary",
                                            icon: "calendar",
                                            disabled: busy || !activeAnimal || !selectedVetId,
                                            onClick: ()=>activeAnimal && void run({
                                                    type: 'appointment.book',
                                                    animalId: activeAnimal.id,
                                                    vetId: selectedVetId,
                                                    alertId: selectedAlertId || undefined,
                                                    scheduledAt: new Date(Date.parse(state.now) + 3_600_000).toISOString(),
                                                    mode: apptMode,
                                                    priority: apptPriority,
                                                    reason: apptReason
                                                }),
                                            children: t('সাক্ষাৎ বুক করুন', 'Confirm Appointment')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1313,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "danger",
                                            icon: "phone",
                                            disabled: busy || !activeAnimal || !selectedVetId,
                                            onClick: async ()=>{
                                                if (!activeAnimal) return;
                                                const existingEmergency = myAlerts.find((a)=>a.animalId === activeAnimal.id && a.kind === 'emergency' && a.status !== 'resolved');
                                                if (!existingEmergency) {
                                                    await run({
                                                        type: 'alert.simulate',
                                                        animalId: activeAnimal.id,
                                                        kind: 'emergency',
                                                        severity: 'critical'
                                                    });
                                                }
                                                await run({
                                                    type: 'appointment.book',
                                                    animalId: activeAnimal.id,
                                                    vetId: selectedVetId,
                                                    alertId: existingEmergency?.id,
                                                    scheduledAt: state.now,
                                                    mode: 'video',
                                                    priority: 'emergency',
                                                    reason: 'Emergency dispatch notice: acute distress & fever'
                                                });
                                            },
                                            children: t('১-ক্লিক জরুরি ভেট ডিসপ্যাচ', '1-Click Emergency Dispatch')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1333,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                    lineNumber: 1312,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                            lineNumber: 1208,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                        lineNumber: 1207,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lg:col-span-6 flex flex-col gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "flex flex-col gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-base font-bold text-[#1F2937]",
                                        children: [
                                            t('আমার অ্যাপয়েন্টমেন্ট ও টেলিমেডিসিন রুম', 'My Appointments & Telemedicine Room'),
                                            " (",
                                            myAppointments.length,
                                            ")"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 1373,
                                        columnNumber: 15
                                    }, this),
                                    myAppointments.map((appt)=>{
                                        const an = myAnimals.find((a)=>a.id === appt.animalId);
                                        const receipt = myPayments.find((p)=>p.referenceId === appt.id);
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-[12px] border border-[#E2E8F0] p-3.5 flex flex-col gap-2.5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-wrap items-center justify-between gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex items-center gap-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-sm font-bold text-[#1F2937]",
                                                                            children: [
                                                                                an?.name,
                                                                                " (",
                                                                                an?.tag,
                                                                                ")"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                            lineNumber: 1387,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                            tone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toneForStatus"])(appt.status),
                                                                            children: appt.status
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                            lineNumber: 1390,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        receipt ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                            tone: "success",
                                                                            children: [
                                                                                t('ফি পরিশোধিত', 'Fee Paid'),
                                                                                " (",
                                                                                receipt.id,
                                                                                ")"
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                            lineNumber: 1392,
                                                                            columnNumber: 29
                                                                        }, this) : null
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                    lineNumber: 1386,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-xs text-[#64748B] tabular-nums",
                                                                    children: [
                                                                        dateTime(appt.scheduledAt),
                                                                        " · ",
                                                                        appt.mode
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                    lineNumber: 1397,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 1385,
                                                            columnNumber: 23
                                                        }, this),
                                                        [
                                                            'requested',
                                                            'accepted'
                                                        ].includes(appt.status) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                    variant: "outline",
                                                                    size: "sm",
                                                                    disabled: busy,
                                                                    onClick: ()=>void run({
                                                                            type: 'appointment.reschedule',
                                                                            appointmentId: appt.id,
                                                                            scheduledAt: new Date(Date.parse(appt.scheduledAt) + 86_400_000).toISOString()
                                                                        }),
                                                                    children: t('সময় পরিবর্তন', 'Reschedule')
                                                                }, void 0, false, {
                                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                    lineNumber: 1403,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                    variant: "ghost",
                                                                    size: "sm",
                                                                    disabled: busy,
                                                                    onClick: ()=>void run({
                                                                            type: 'appointment.cancel',
                                                                            appointmentId: appt.id,
                                                                            reason: 'Cancelled by farmer'
                                                                        }),
                                                                    children: t('বাতিল', 'Cancel')
                                                                }, void 0, false, {
                                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                    lineNumber: 1419,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 1402,
                                                            columnNumber: 25
                                                        }, this) : null
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 1384,
                                                    columnNumber: 21
                                                }, this),
                                                [
                                                    'accepted',
                                                    'in_progress'
                                                ].includes(appt.status) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "rounded-[10px] border border-[#D8E9DE] bg-[#EBF4EE]/65 p-3 flex flex-wrap items-center justify-between gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-xs text-[#0A401E]",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    className: "block",
                                                                    children: callEnded ? t('টেলিমেডিসিন কল বিরতিতে রয়েছে', 'Telemedicine Call Paused') : t('লাইভ টেলিমেডিসিন কনসালটেশন রুম সক্রিয়', 'Live Telemedicine Room Connected')
                                                                }, void 0, false, {
                                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                    lineNumber: 1440,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    children: micMuted ? t('মাইক্রোফোন মিউট করা আছে', 'Microphone Muted') : t('অডিও ও কলার টেলিমেট্রি স্ট্রিম সক্রিয়', 'Audio & live collar telemetry stream active')
                                                                }, void 0, false, {
                                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                    lineNumber: 1445,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 1439,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                    variant: "outline",
                                                                    size: "sm",
                                                                    onClick: ()=>setMicMuted((m)=>!m),
                                                                    children: micMuted ? t('আনমিউট করুন', 'Unmute Mic') : t('মিউট করুন', 'Mute Mic')
                                                                }, void 0, false, {
                                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                    lineNumber: 1452,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                    variant: callEnded ? 'primary' : 'danger',
                                                                    size: "sm",
                                                                    onClick: ()=>setCallEnded((c)=>!c),
                                                                    children: callEnded ? t('পুনরায় যুক্ত হোন', 'Reconnect Call') : t('কল শেষ করুন', 'End Call')
                                                                }, void 0, false, {
                                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                    lineNumber: 1459,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 1451,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 1438,
                                                    columnNumber: 23
                                                }, this) : null
                                            ]
                                        }, appt.id, true, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1380,
                                            columnNumber: 19
                                        }, this);
                                    })
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 1372,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "flex flex-col gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-base font-bold text-[#1F2937]",
                                        children: t('ডিজিটাল প্রেসক্রিপশন, টিকা ও ওষুধ রিমাইন্ডার', 'Prescriptions, Upcoming Checkups & Medication Reminders')
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 1475,
                                        columnNumber: 15
                                    }, this),
                                    state.records.filter((r)=>myAnimalIds.has(r.animalId) && Boolean(r.nextDueAt)).map((dueRec)=>{
                                        const dueAnimal = myAnimals.find((a)=>a.id === dueRec.animalId);
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-[10px] border border-[#FDE68A] bg-[#FFFBEB] p-3 flex items-center justify-between gap-2 text-xs",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-bold text-[#92400E]",
                                                        children: [
                                                            dueAnimal?.name,
                                                            ": ",
                                                            dueRec.title[locale]
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 1488,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 1487,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    tone: "warning",
                                                    children: [
                                                        t('পরবর্তী তারিখ:', 'Due:'),
                                                        " ",
                                                        date(dueRec.nextDueAt)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 1492,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, dueRec.id, true, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1483,
                                            columnNumber: 21
                                        }, this);
                                    }),
                                    myPrescriptions.map((rx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-[12px] border border-[#D8E9DE] bg-[#EBF4EE]/55 p-3.5 text-xs flex flex-col gap-1",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "font-bold text-sm text-[#0A401E]",
                                                    children: rx.diagnosis
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 1503,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-[#0F602D]",
                                                    children: rx.advice
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 1504,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-[#475569] mt-1",
                                                    children: rx.medicines.map((m)=>`${m.name} (${m.dose}, ${m.frequency}, ${m.days}d)`).join(' · ')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 1505,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, rx.id, true, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1499,
                                            columnNumber: 17
                                        }, this)),
                                    myReminders.map((rem)=>{
                                        const isSkipped = skippedIds.includes(rem.id);
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-[10px] border border-[#E2E8F0] p-3 flex flex-wrap items-center justify-between gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-sm font-bold text-[#1F2937]",
                                                            children: rem.medicine
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 1521,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-xs text-[#64748B] tabular-nums",
                                                            children: [
                                                                rem.time,
                                                                " · ",
                                                                rem.takenDates.length,
                                                                " ",
                                                                t('বার গৃহীত', 'doses logged'),
                                                                isSkipped ? ` · ${t('আজ বাদ দেওয়া হয়েছে', 'Skipped today')}` : ''
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 1524,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 1520,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-wrap gap-1.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                            variant: "primary",
                                                            size: "sm",
                                                            disabled: busy,
                                                            onClick: ()=>void run({
                                                                    type: 'reminder.take',
                                                                    reminderId: rem.id
                                                                }),
                                                            children: t('ডোজ দিন', 'Take Dose')
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 1530,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                            variant: "outline",
                                                            size: "sm",
                                                            onClick: ()=>setSkippedIds((prev)=>prev.includes(rem.id) ? prev : [
                                                                        ...prev,
                                                                        rem.id
                                                                    ]),
                                                            children: t('আজকের ডোজ বাদ দিন', 'Skip today')
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 1540,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                            variant: "ghost",
                                                            size: "sm",
                                                            disabled: busy,
                                                            onClick: ()=>void run({
                                                                    type: 'reminder.toggle',
                                                                    reminderId: rem.id,
                                                                    enabled: !rem.enabled
                                                                }),
                                                            children: rem.enabled ? t('চালু', 'On') : t('বন্ধ', 'Off')
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 1551,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 1529,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, rem.id, true, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1516,
                                            columnNumber: 19
                                        }, this);
                                    })
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 1474,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                        lineNumber: 1371,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                lineNumber: 1206,
                columnNumber: 9
            }, this) : null,
            section === 'ai' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 lg:grid-cols-12 gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                        className: "lg:col-span-5 flex flex-col gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-base font-bold text-[#1F2937]",
                                        children: t('পালিতো AI লক্ষণ, ছবি ও ভয়েস পরামর্শক', 'Palito AI Symptom, Photo & Voice Advisor')
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 1579,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        tone: "brand",
                                        children: "24/7 Active"
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 1582,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 1578,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-3 gap-2",
                                children: [
                                    'text',
                                    'photo',
                                    'voice'
                                ].map((m)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setAiMode(m),
                                        className: `rounded-[10px] border py-2 text-xs font-bold cursor-pointer ${aiMode === m ? 'border-[#15803D] bg-[#EBF4EE] text-[#0F602D]' : 'border-[#E2E8F0] bg-white text-[#475569]'}`,
                                        children: m === 'text' ? t('টেক্সট প্রশ্ন', 'Text Query') : m === 'photo' ? t('ছবি স্ক্যান', 'Photo Scan') : t('ভয়েস বার্তা', 'Voice Note')
                                    }, m, false, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 1587,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 1585,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextareaField"], {
                                label: t('প্রাণীর লক্ষণ বা ছবির বিবরণ লিখুন', 'Describe symptoms, photo findings, or voice question'),
                                value: aiPrompt,
                                onChange: (e)=>setAiPrompt(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 1606,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: "primary",
                                        icon: "scan",
                                        disabled: busy || !aiPrompt.trim(),
                                        onClick: ()=>void run({
                                                type: 'ai.ask',
                                                text: aiPrompt,
                                                mode: aiMode
                                            }),
                                        children: t('AI বিশ্লেষণ চালান', 'Run AI Assessment')
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 1616,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: "outline",
                                        icon: "smartphone",
                                        onClick: ()=>openMobileHandoff({
                                                role: 'farmer',
                                                screen: 'ai',
                                                title: t('মোবাইল ক্যামেরা ও ভয়েস স্ক্যান', 'Mobile Camera & Voice Scan')
                                            }),
                                        children: t('মোবাইল ক্যামেরায় খুলুন', 'Open Camera on Mobile')
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 1626,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 1615,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                        lineNumber: 1577,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                        className: "lg:col-span-7 flex flex-col gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-base font-bold text-[#1F2937]",
                                children: t('AI পরামর্শ ও কথোপকথন ইতিহাস', 'AI Consultation History')
                            }, void 0, false, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 1643,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-3 max-h-[520px] overflow-y-auto pr-1",
                                children: state.aiMessages.map((msg)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: `rounded-[12px] p-3.5 text-sm ${msg.role === 'assistant' ? 'bg-[#EBF4EE] border border-[#D8E9DE] text-[#0A401E]' : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#1F2937]'}`,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between text-xs font-semibold mb-1",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: [
                                                            msg.role === 'assistant' ? t('পালিতো AI পরামর্শক', 'Palito AI Advisor') : t('খামারি', 'Farmer'),
                                                            ' ',
                                                            "(",
                                                            msg.mode,
                                                            ")"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 1657,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "tabular-nums text-[#64748B]",
                                                        children: dateTime(msg.at)
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 1663,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 1656,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: msg.text[locale]
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 1667,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, msg.id, true, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 1648,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 1646,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                        lineNumber: 1642,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                lineNumber: 1576,
                columnNumber: 9
            }, this) : null,
            section === 'wallet' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 lg:grid-cols-12 gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lg:col-span-6 flex flex-col gap-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-base font-bold text-[#1F2937]",
                                            children: t('৭০% জামানত কৃষি ঋণ আবেদন (UC-003)', '70% LTV Livestock Collateral Loan')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1682,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                            tone: "brand",
                                            children: "Max 70% Valuation"
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1685,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                    lineNumber: 1681,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 sm:grid-cols-2 gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectField"], {
                                            label: t('জামানত প্রাণী নির্বাচন', 'Collateral Animal'),
                                            value: activeAnimal?.id ?? '',
                                            onChange: (e)=>setSelectedAnimalId(e.target.value),
                                            options: myAnimals.map((a)=>({
                                                    value: a.id,
                                                    label: `${a.name} (${a.tag}) — Max ${money((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["maximumLoanAmount"])(a.value))}`
                                                }))
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1689,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                            label: t('আবেদনকৃত ঋণ (৳)', 'Loan Amount (BDT)'),
                                            type: "number",
                                            value: loanAmount,
                                            onChange: (e)=>setLoanAmount(e.target.value),
                                            hint: activeAnimal ? `${t('সর্বোচ্চ ৭০% সীমা:', '70% LTV Cap:')} ${money((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["maximumLoanAmount"])(activeAnimal.value))}` : undefined
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1698,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                            label: t('মেয়াদ (মাস)', 'Term (Months)'),
                                            type: "number",
                                            value: loanTerm,
                                            onChange: (e)=>setLoanTerm(e.target.value)
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1709,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                            label: t('ঋণের উদ্দেশ্য', 'Purpose'),
                                            value: loanPurpose,
                                            onChange: (e)=>setLoanPurpose(e.target.value)
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1715,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                    lineNumber: 1688,
                                    columnNumber: 15
                                }, this),
                                activeLoanQuote ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-[12px] bg-[#EBF4EE]/60 border border-[#D8E9DE] p-3.5 grid grid-cols-3 gap-2 text-xs tabular-nums",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[#64748B] block",
                                                    children: t('সর্বোচ্চ সীমা', '70% Cap')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 1725,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    className: "text-sm text-[#15803D]",
                                                    children: money(activeLoanQuote.maximumAmount)
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 1726,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1724,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[#64748B] block",
                                                    children: t('বার্ষিক সুদ', 'Annual Rate')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 1731,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    className: "text-sm text-[#1F2937]",
                                                    children: [
                                                        activeLoanQuote.annualRate,
                                                        "%"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 1732,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1730,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-[#64748B] block",
                                                    children: t('মাসিক কিস্তি', 'Monthly Installment')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 1737,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    className: "text-sm text-[#0F602D]",
                                                    children: money(estMonthlyInstallment)
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 1738,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1736,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                    lineNumber: 1723,
                                    columnNumber: 17
                                }, this) : null,
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: "primary",
                                    icon: "landmark",
                                    disabled: busy || !activeAnimal,
                                    onClick: ()=>activeAnimal && void run({
                                            type: 'loan.offer',
                                            animalId: activeAnimal.id,
                                            amount: Math.max(1000, Number(loanAmount) || 50000),
                                            termMonths: Math.max(3, Number(loanTerm) || 12),
                                            purpose: loanPurpose,
                                            repaymentSource: loanRepaySource
                                        }),
                                    children: t('ঋণ প্রস্তাব তৈরি করুন', 'Generate Loan Offer')
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                    lineNumber: 1745,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "border-t border-[#E2E8F0] pt-3 flex flex-col gap-2.5",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                        label: t('কিস্তি পরিশোধের পরিমাণ (৳)', 'Custom Installment Repayment Amount (BDT)'),
                                        type: "number",
                                        value: repayInput,
                                        onChange: (e)=>setRepayInput(e.target.value)
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 1765,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                    lineNumber: 1764,
                                    columnNumber: 15
                                }, this),
                                myLoans.map((l)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-[12px] border border-[#E2E8F0] p-3.5 flex flex-wrap items-center justify-between gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-sm font-bold text-[#1F2937] tabular-nums",
                                                                children: [
                                                                    money(l.amount),
                                                                    " (",
                                                                    l.purpose,
                                                                    ")"
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                lineNumber: 1780,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                tone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toneForStatus"])(l.status),
                                                                children: l.status
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                lineNumber: 1783,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 1779,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs text-[#64748B] tabular-nums",
                                                        children: [
                                                            t('বকেয়া:', 'Outstanding:'),
                                                            " ",
                                                            money(l.outstanding),
                                                            " · ",
                                                            l.annualRate,
                                                            "%",
                                                            l.graceUntil ? ` · ${t('গ্রেস মেয়াদ:', 'Grace Until:')} ${date(l.graceUntil)}` : ''
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 1785,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 1778,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap gap-2",
                                                children: [
                                                    l.status === 'offered' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        variant: "primary",
                                                        size: "sm",
                                                        disabled: busy,
                                                        onClick: ()=>void run({
                                                                type: 'loan.accept',
                                                                loanId: l.id
                                                            }),
                                                        children: t('শর্ত গ্রহণ ও জমা দিন', 'Accept & Submit to Bank')
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 1792,
                                                        columnNumber: 23
                                                    }, this) : null,
                                                    l.status === 'active' && l.outstanding > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                variant: "secondary",
                                                                size: "sm",
                                                                disabled: busy,
                                                                onClick: ()=>void run({
                                                                        type: 'loan.repay',
                                                                        loanId: l.id,
                                                                        amount: Math.min(l.outstanding, Math.max(500, Number(repayInput) || 5000))
                                                                    }),
                                                                children: t(`কিস্তি পরিশোধ (${money(Number(repayInput) || 5000)})`, 'Pay Installment')
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                lineNumber: 1805,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                variant: "outline",
                                                                size: "sm",
                                                                disabled: busy,
                                                                onClick: ()=>void run({
                                                                        type: 'loan.repay',
                                                                        loanId: l.id,
                                                                        amount: l.outstanding
                                                                    }),
                                                                children: t('সম্পূর্ণ বকেয়া পরিশোধ', 'Pay Full Balance')
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                lineNumber: 1822,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 1804,
                                                        columnNumber: 23
                                                    }, this) : null
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 1790,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, l.id, true, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 1774,
                                        columnNumber: 17
                                    }, this))
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                            lineNumber: 1680,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                        lineNumber: 1678,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lg:col-span-6 flex flex-col gap-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-base font-bold text-[#1F2937]",
                                    children: t('প্রাণী বীমা ও দাবি দাখিল (UC-002)', 'Livestock Insurance & Claims')
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                    lineNumber: 1847,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 sm:grid-cols-3 gap-3 items-end",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectField"], {
                                            label: t('বীমা প্রতিষ্ঠান নির্বাচন করুন', 'Select Insurer'),
                                            value: selectedInsurerId,
                                            onChange: (e)=>setSelectedInsurerId(e.target.value),
                                            options: insurers.map((ins)=>({
                                                    value: ins.id,
                                                    label: locale === 'bn' ? ins.nameBn : ins.name
                                                }))
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1851,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                            label: t('বীমা কভারেজ পরিমাণ (৳)', 'Coverage Amount (BDT)'),
                                            type: "number",
                                            value: coverageInput,
                                            onChange: (e)=>setCoverageInput(e.target.value)
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1860,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "primary",
                                            icon: "shield-check",
                                            disabled: busy || !activeAnimal || !selectedInsurerId,
                                            onClick: ()=>activeAnimal && selectedInsurerId && void run({
                                                    type: 'policy.apply',
                                                    animalId: activeAnimal.id,
                                                    insurerId: selectedInsurerId,
                                                    coverage: Math.max(10000, Number(coverageInput) || 100000)
                                                }),
                                            children: t('বীমা পলিসির আবেদন করুন', 'Apply for Insurance Policy')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1866,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                    lineNumber: 1850,
                                    columnNumber: 15
                                }, this),
                                myPolicies.map((pol)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-[12px] border border-[#E2E8F0] p-3.5 flex flex-col gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-bold text-[#1F2937] tabular-nums",
                                                        children: [
                                                            t('কভারেজ:', 'Coverage:'),
                                                            " ",
                                                            money(pol.coverage),
                                                            " ·",
                                                            ' ',
                                                            t('প্রিমিয়াম:', 'Premium:'),
                                                            " ",
                                                            money(pol.premium)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 1891,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                        tone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toneForStatus"])(pol.status),
                                                        children: pol.status
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 1895,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 1890,
                                                columnNumber: 19
                                            }, this),
                                            pol.status === 'expired' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "secondary",
                                                size: "sm",
                                                disabled: busy,
                                                onClick: ()=>void run({
                                                        type: 'policy.renew',
                                                        policyId: pol.id
                                                    }),
                                                children: t('পলিসি নবায়ন করুন', 'Renew Policy')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 1898,
                                                columnNumber: 21
                                            }, this) : null,
                                            pol.status === 'active' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "border-t border-[#E2E8F0] pt-2 mt-1 flex flex-col gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "grid grid-cols-2 gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectField"], {
                                                                label: t('দাবির ধরন', 'Claim Type'),
                                                                value: claimKind,
                                                                onChange: (e)=>setClaimKind(e.target.value),
                                                                options: [
                                                                    {
                                                                        value: 'illness',
                                                                        label: t('অসুস্থতা (Illness)', 'Illness')
                                                                    },
                                                                    {
                                                                        value: 'death',
                                                                        label: t('মৃত্যু (Mortality)', 'Mortality')
                                                                    }
                                                                ]
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                lineNumber: 1912,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                                label: t('দাবির পরিমাণ (৳)', 'Claim Amount'),
                                                                type: "number",
                                                                value: claimAmount,
                                                                onChange: (e)=>setClaimAmount(e.target.value)
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                lineNumber: 1923,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 1911,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                        label: t('প্রমাণ ও বিবরণ (Photo + GPS যুক্ত)', 'Evidence Description'),
                                                        value: claimDesc,
                                                        onChange: (e)=>setClaimDesc(e.target.value)
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 1930,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-wrap gap-4 text-xs font-semibold text-[#475569] py-1",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "flex items-center gap-1.5 cursor-pointer",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "checkbox",
                                                                        checked: claimPhoto,
                                                                        onChange: (e)=>setClaimPhoto(e.target.checked),
                                                                        className: "accent-[#15803D]"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                        lineNumber: 1937,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    t('ইয়ার-ট্যাগ ছবি সংযুক্ত (Photo)', 'Attach Ear-Tag Photo')
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                lineNumber: 1936,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                className: "flex items-center gap-1.5 cursor-pointer",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                        type: "checkbox",
                                                                        checked: claimLocation,
                                                                        onChange: (e)=>setClaimLocation(e.target.checked),
                                                                        className: "accent-[#15803D]"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                        lineNumber: 1946,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    t('জিপিএস লোকেশন সংযুক্ত (GPS)', 'Attach GPS Coordinates')
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                lineNumber: 1945,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 1935,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        variant: "secondary",
                                                        size: "sm",
                                                        disabled: busy,
                                                        onClick: ()=>void run({
                                                                type: 'claim.submit',
                                                                policyId: pol.id,
                                                                kind: claimKind,
                                                                amount: Math.min(pol.coverage, Math.max(1000, Number(claimAmount) || 20000)),
                                                                evidence: {
                                                                    photo: claimPhoto,
                                                                    location: claimLocation,
                                                                    description: claimDesc,
                                                                    capturedAt: state.now,
                                                                    latitude: 24.3396,
                                                                    longitude: 89.6011
                                                                }
                                                            }),
                                                        children: t('ছবি ও জিপিএস প্রমাণসহ দাবি জমা দিন', 'Submit Claim with Photo & GPS')
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 1955,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 1910,
                                                columnNumber: 21
                                            }, this) : null
                                        ]
                                    }, pol.id, true, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 1886,
                                        columnNumber: 17
                                    }, this)),
                                myClaims.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "border-t border-[#E2E8F0] pt-3 flex flex-col gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs font-bold text-[#64748B]",
                                            children: t('জমাকৃত দাবি তালিকা', 'Submitted Claims')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 1988,
                                            columnNumber: 19
                                        }, this),
                                        myClaims.map((cl)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between text-xs rounded-[8px] bg-[#F8FAFC] p-2.5 tabular-nums",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        children: [
                                                            cl.kind.toUpperCase(),
                                                            " · ",
                                                            money(cl.amount)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 1996,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                        tone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toneForStatus"])(cl.status),
                                                        children: cl.status
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 1999,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, cl.id, true, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 1992,
                                                columnNumber: 21
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                    lineNumber: 1987,
                                    columnNumber: 17
                                }, this) : null,
                                myPayments.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "border-t border-[#E2E8F0] pt-3 flex flex-col gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs font-bold text-[#64748B]",
                                            children: t('ওয়ালেট লেনদেন ও পেমেন্ট রশিদ খতিয়ান', 'Wallet Transactions & Payment Receipts')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 2007,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "divide-y divide-[#E2E8F0] rounded-[10px] border border-[#E2E8F0] bg-white",
                                            children: myPayments.slice(0, 8).map((pmt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-between px-3 py-2 text-xs tabular-nums",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-semibold text-[#1F2937]",
                                                                    children: pmt.kind
                                                                }, void 0, false, {
                                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                    lineNumber: 2017,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[#64748B] ml-2",
                                                                    children: [
                                                                        pmt.direction.toUpperCase(),
                                                                        " · ",
                                                                        pmt.id
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                                    lineNumber: 2018,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 2016,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "font-bold text-[#0F602D]",
                                                            children: money(pmt.amount)
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 2022,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, pmt.id, true, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 2012,
                                                    columnNumber: 23
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 2010,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                    lineNumber: 2006,
                                    columnNumber: 17
                                }, this) : null
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                            lineNumber: 1846,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                        lineNumber: 1844,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                lineNumber: 1677,
                columnNumber: 9
            }, this) : null,
            section === 'market' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 lg:grid-cols-12 gap-6",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4",
                        children: state.products.map((prod)=>{
                            const inCart = myCart.find((c)=>c.productId === prod.id)?.quantity ?? 0;
                            const hasValidPrescription = myPrescriptions.some((p)=>p.medicines.length > 0);
                            const rxLocked = prod.requiresPrescription && !hasValidPrescription;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                className: "flex flex-col justify-between gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                        tone: "brand",
                                                        children: prod.category
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 2050,
                                                        columnNumber: 23
                                                    }, this),
                                                    prod.requiresPrescription ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                        tone: rxLocked ? 'danger' : 'warning',
                                                        children: rxLocked ? t('প্রেসক্রিপশন ছাড়া লকড', 'Rx Required (Locked)') : t('প্রেসক্রিপশন যাচাইকৃত', 'Rx Verified')
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 2052,
                                                        columnNumber: 25
                                                    }, this) : null
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 2049,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                className: "text-base font-bold text-[#1F2937] mt-2",
                                                children: prod.name[locale]
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 2059,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm font-bold text-[#0F602D] tabular-nums mt-1",
                                                children: [
                                                    money(prod.price),
                                                    " / ",
                                                    prod.unit[locale]
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 2062,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 2048,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between gap-2 pt-2 border-t border-[#E2E8F0]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-[#64748B] tabular-nums",
                                                children: [
                                                    t('স্টক:', 'Stock:'),
                                                    " ",
                                                    prod.stock,
                                                    " · ",
                                                    t('কার্টে:', 'In Cart:'),
                                                    " ",
                                                    inCart
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 2067,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex gap-1.5",
                                                children: [
                                                    inCart > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        variant: "outline",
                                                        size: "sm",
                                                        disabled: busy,
                                                        onClick: ()=>void run({
                                                                type: 'cart.set',
                                                                productId: prod.id,
                                                                quantity: inCart - 1
                                                            }),
                                                        children: "-"
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 2072,
                                                        columnNumber: 25
                                                    }, this) : null,
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        variant: "primary",
                                                        size: "sm",
                                                        disabled: busy || rxLocked || prod.stock <= inCart,
                                                        onClick: ()=>void run({
                                                                type: 'cart.set',
                                                                productId: prod.id,
                                                                quantity: inCart + 1
                                                            }),
                                                        children: t('কার্টে যোগ', 'Add +1')
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                        lineNumber: 2087,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                lineNumber: 2070,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                        lineNumber: 2066,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, prod.id, true, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 2047,
                                columnNumber: 17
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                        lineNumber: 2038,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "lg:col-span-5 flex flex-col gap-4",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                            className: "flex flex-col gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                    className: "text-base font-bold text-[#1F2937]",
                                    children: t('চেকআউট ও অর্ডার ট্র্যাকিং', 'Checkout & Order Tracking')
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                    lineNumber: 2110,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                    label: t('ডেলিভারি ঠিকানা', 'Delivery Address'),
                                    value: deliveryAddress,
                                    onChange: (e)=>setDeliveryAddress(e.target.value)
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                    lineNumber: 2113,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: "primary",
                                    icon: "shopping-bag",
                                    disabled: busy || myCart.length === 0,
                                    onClick: ()=>void run({
                                            type: 'order.place',
                                            address: deliveryAddress
                                        }),
                                    children: t('অর্ডার নিশ্চিত করুন', 'Place Order from Wallet')
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                    lineNumber: 2118,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "border-t border-[#E2E8F0] pt-3 flex flex-col gap-2.5",
                                    children: myOrders.map((ord)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-[10px] border border-[#E2E8F0] p-3 flex flex-wrap items-center justify-between gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-sm font-bold text-[#1F2937] tabular-nums",
                                                            children: [
                                                                money(ord.total),
                                                                " · ",
                                                                ord.address
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 2136,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-xs text-[#64748B] tabular-nums",
                                                            children: dateTime(ord.createdAt)
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 2139,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 2135,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-wrap items-center gap-1.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                            tone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toneForStatus"])(ord.status),
                                                            children: ord.status
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 2144,
                                                            columnNumber: 23
                                                        }, this),
                                                        [
                                                            'placed',
                                                            'confirmed'
                                                        ].includes(ord.status) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                            variant: "danger",
                                                            size: "sm",
                                                            disabled: busy,
                                                            onClick: ()=>void run({
                                                                    type: 'order.cancel',
                                                                    orderId: ord.id
                                                                }),
                                                            children: t('বাতিল ও রিফান্ড', 'Cancel & Refund')
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 2146,
                                                            columnNumber: 25
                                                        }, this) : null,
                                                        ![
                                                            'delivered',
                                                            'cancelled'
                                                        ].includes(ord.status) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                            variant: "outline",
                                                            size: "sm",
                                                            disabled: busy,
                                                            onClick: ()=>void run({
                                                                    type: 'order.advance',
                                                                    orderId: ord.id
                                                                }),
                                                            children: t('পরবর্তী ধাপ', 'Advance')
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                            lineNumber: 2158,
                                                            columnNumber: 25
                                                        }, this) : null
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                                    lineNumber: 2143,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, ord.id, true, {
                                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                            lineNumber: 2131,
                                            columnNumber: 19
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                    lineNumber: 2129,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/web/src/features/farmer.tsx",
                            lineNumber: 2109,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                        lineNumber: 2108,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                lineNumber: 2037,
                columnNumber: 9
            }, this) : null,
            section === 'education' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                children: state.content.filter((c)=>c.status === 'published').map((art)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                        className: "flex flex-col gap-2.5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                tone: "brand",
                                children: art.category
                            }, void 0, false, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 2185,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-base font-bold text-[#1F2937]",
                                children: art.title[locale]
                            }, void 0, false, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 2186,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-[#475569]",
                                children: art.body[locale]
                            }, void 0, false, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 2189,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xs text-[#64748B] mt-auto pt-2 tabular-nums",
                                children: date(art.updatedAt)
                            }, void 0, false, {
                                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                                lineNumber: 2190,
                                columnNumber: 17
                            }, this)
                        ]
                    }, art.id, true, {
                        fileName: "[project]/frontend/web/src/features/farmer.tsx",
                        lineNumber: 2184,
                        columnNumber: 15
                    }, this))
            }, void 0, false, {
                fileName: "[project]/frontend/web/src/features/farmer.tsx",
                lineNumber: 2180,
                columnNumber: 9
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/web/src/features/farmer.tsx",
        lineNumber: 255,
        columnNumber: 5
    }, this);
}
_s(FarmerWebFeature, "a9vbOeDTKy6NwOX+1rCu56/vqEY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$providers$2f$web$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWebApp"]
    ];
});
_c = FarmerWebFeature;
var _c;
__turbopack_context__.k.register(_c, "FarmerWebFeature");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=frontend_web_src_features_farmer_tsx_15xwg-plcc_0l._.js.map