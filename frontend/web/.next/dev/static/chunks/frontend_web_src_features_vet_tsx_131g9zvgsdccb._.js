(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/frontend/web/src/features/vet.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "VetWebFeature",
    ()=>VetWebFeature
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/frontend/shared/src/index.ts [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$finance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/shared/src/finance.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$providers$2f$web$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/web/src/providers/web-provider.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/web/src/components/ui.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function VetWebFeature({ screen, id }) {
    _s();
    const { state, user, locale, t, money, date, dateTime, run, busy, openMobileHandoff } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$providers$2f$web$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWebApp"])();
    const myAppointments = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "VetWebFeature.useMemo[myAppointments]": ()=>state.appointments.filter({
                "VetWebFeature.useMemo[myAppointments]": (a)=>!user?.id || user.role !== 'vet' || a.vetId === user.id
            }["VetWebFeature.useMemo[myAppointments]"])
    }["VetWebFeature.useMemo[myAppointments]"], [
        state.appointments,
        user?.id,
        user?.role
    ]);
    const myClaims = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "VetWebFeature.useMemo[myClaims]": ()=>state.claims.filter({
                "VetWebFeature.useMemo[myClaims]": (c)=>!user?.id || user.role !== 'vet' || c.vetId === user.id
            }["VetWebFeature.useMemo[myClaims]"])
    }["VetWebFeature.useMemo[myClaims]"], [
        state.claims,
        user?.id,
        user?.role
    ]);
    const linkedAnimals = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "VetWebFeature.useMemo[linkedAnimals]": ()=>{
            if (!user?.id || user.role !== 'vet') return state.animals;
            return state.animals.filter({
                "VetWebFeature.useMemo[linkedAnimals]": (animal)=>state.appointments.some({
                        "VetWebFeature.useMemo[linkedAnimals]": (a)=>a.animalId === animal.id && a.vetId === user.id && ![
                                'rejected',
                                'cancelled'
                            ].includes(a.status)
                    }["VetWebFeature.useMemo[linkedAnimals]"]) || state.claims.some({
                        "VetWebFeature.useMemo[linkedAnimals]": (c)=>c.animalId === animal.id && c.vetId === user.id && c.status === 'vet_review'
                    }["VetWebFeature.useMemo[linkedAnimals]"])
            }["VetWebFeature.useMemo[linkedAnimals]"]);
        }
    }["VetWebFeature.useMemo[linkedAnimals]"], [
        state.animals,
        state.appointments,
        state.claims,
        user?.id,
        user?.role
    ]);
    const initialTab = screen === 'animals' || screen === 'animal' || screen === 'passport' ? 'patients' : screen === 'reviews' || screen === 'claims' || screen === 'claim' || screen === 'review-overdue' ? 'claims' : screen === 'emergency' ? 'emergency' : screen === 'schedule' ? 'schedule' : 'consultations';
    const [tab, setTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialTab);
    // Consultations state
    const [selectedApptId, setSelectedApptId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialTab === 'consultations' && id ? id : myAppointments[0]?.id ?? state.appointments[0]?.id ?? '');
    const [decisionNote, setDecisionNote] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [rescheduleTime, setRescheduleTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('2026-04-20T15:00:00.000Z');
    const [diagnosis, setDiagnosis] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Acute ruminal acidosis & mild pyrexia');
    const [advice, setAdvice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Provide clean drinking water, oral buffer electrolytes, and monitor collar temperature every 6 hours.');
    const [medicines, setMedicines] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([
        {
            name: 'Ketoprofen Bolus',
            dose: '1 bolus',
            frequency: 'Twice daily',
            days: 3
        },
        {
            name: 'Rumenotoric Powder',
            dose: '50g',
            frequency: 'With warm water',
            days: 5
        }
    ]);
    // Patient record state
    const [selectedAnimalId, setSelectedAnimalId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialTab === 'patients' && id ? id : linkedAnimals[0]?.id ?? state.animals[0]?.id ?? '');
    const [recKind, setRecKind] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('checkup');
    const [recTitleBn, setRecTitleBn] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('নিয়মিত স্বাস্থ্য পরীক্ষা');
    const [recTitleEn, setRecTitleEn] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Routine Clinical Checkup');
    const [recNote, setRecNote] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Normal auscultation, mucous membranes pink, appetite normal.');
    const [recNextDueAt, setRecNextDueAt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    // Claim review state
    const [selectedClaimId, setSelectedClaimId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialTab === 'claims' && id ? id : myClaims.find({
        "VetWebFeature.useState": (c)=>c.status === 'vet_review'
    }["VetWebFeature.useState"])?.id ?? myClaims[0]?.id ?? state.claims[0]?.id ?? '');
    const [vetOpinion, setVetOpinion] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Clinical history and IoT collar telemetry corroborate acute onset prior to incident.');
    // Schedule state
    const [scheduleSpecialty, setScheduleSpecialty] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(user?.specialty ?? 'Dairy & Large Ruminant Medicine');
    const [scheduleHours, setScheduleHours] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(user?.schedule ?? 'Sat–Thu, 09:00 AM – 06:00 PM');
    const [scheduleAvailable, setScheduleAvailable] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(user?.available ?? true);
    const escalatedAlerts = state.alerts.filter((a)=>[
            'open',
            'escalated'
        ].includes(a.status));
    const activeAppt = myAppointments.find((a)=>a.id === selectedApptId) ?? myAppointments[0];
    const apptAnimal = activeAppt ? state.animals.find((a)=>a.id === activeAppt.animalId) : undefined;
    const apptFarmer = activeAppt ? state.users.find((u)=>u.id === activeAppt.farmerId) : undefined;
    const apptDevice = apptAnimal ? state.devices.find((d)=>d.animalId === apptAnimal.id) : undefined;
    const dailyVitals = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "VetWebFeature.useMemo[dailyVitals]": ()=>{
            const readings = apptDevice?.readings ?? [];
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
                "VetWebFeature.useMemo[dailyVitals]": (d)=>({
                        day: d.day,
                        temperature: Number((d.temp / d.count).toFixed(1)),
                        heartRate: Math.round(d.hr / d.count),
                        activity: Math.round(d.act / d.count)
                    })
            }["VetWebFeature.useMemo[dailyVitals]"]);
        }
    }["VetWebFeature.useMemo[dailyVitals]"], [
        apptDevice
    ]);
    const activePatient = linkedAnimals.find((a)=>a.id === selectedAnimalId) ?? state.animals.find((a)=>a.id === selectedAnimalId) ?? linkedAnimals[0] ?? state.animals[0];
    const patientRecords = activePatient ? state.records.filter((r)=>r.animalId === activePatient.id) : [];
    const activeClaim = myClaims.find((c)=>c.id === selectedClaimId) ?? state.claims.find((c)=>c.id === selectedClaimId) ?? myClaims[0] ?? state.claims[0];
    const claimAnimal = activeClaim ? state.animals.find((a)=>a.id === activeClaim.animalId) : undefined;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KpiCard"], {
                        label: t('সক্রিয় ও এসকেলেটেড সতর্কতা', 'Open & Escalated Alerts'),
                        value: escalatedAlerts.length,
                        hint: t('UC-001 ৪ ঘণ্টা SLA পর্যবেক্ষণ', 'UC-001 4-hour SLA monitoring'),
                        tone: escalatedAlerts.length > 0 ? 'danger' : 'brand',
                        icon: "alert"
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                        lineNumber: 206,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KpiCard"], {
                        label: t('সাক্ষাৎ ও টেলিমেডিসিন কিউ', 'Consultation Queue'),
                        value: myAppointments.length,
                        hint: t(`${myAppointments.filter((a)=>a.priority === 'emergency').length}টি জরুরি কল`, `${myAppointments.filter((a)=>a.priority === 'emergency').length} emergency priority`),
                        tone: "brand",
                        icon: "calendar"
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                        lineNumber: 213,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KpiCard"], {
                        label: t('প্রদত্ত ডিজিটাল প্রেসক্রিপশন', 'Digital Prescriptions'),
                        value: state.prescriptions.length,
                        hint: t('ওষুধ রিমাইন্ডারের সাথে যুক্ত', 'Synced with farmer reminders'),
                        tone: "success",
                        icon: "stethoscope"
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                        lineNumber: 223,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KpiCard"], {
                        label: t('বীমা দাবি পর্যালোচনা', 'Insurance Claim Reviews'),
                        value: state.claims.filter((c)=>c.status === 'vet_review').length,
                        hint: t('ক্লিনিক্যাল মতামতের অপেক্ষায়', 'Awaiting veterinary opinion'),
                        tone: "info",
                        icon: "shield-check"
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                        lineNumber: 230,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/web/src/features/vet.tsx",
                lineNumber: 205,
                columnNumber: 7
            }, this),
            escalatedAlerts.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-[14px] border border-[#FECDD3] bg-[#FFF1F2] p-4 flex flex-wrap items-center justify-between gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-start gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "p-2 rounded-[10px] bg-[#BE123C] text-white shrink-0",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WebIcon"], {
                                    name: "alert",
                                    className: "w-4 h-4"
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 244,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                lineNumber: 243,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm font-bold text-[#BE123C]",
                                        children: t(`জরুরি ক্লিনিক্যাল ট্রায়াজ প্রয়োজন (${escalatedAlerts.length}টি সতর্কতা)`, `Urgent Clinical Triage Required (${escalatedAlerts.length} active alerts)`)
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                                        lineNumber: 247,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-xs text-[#9F1239] mt-0.5",
                                        children: escalatedAlerts.map((al)=>{
                                            const an = state.animals.find((a)=>a.id === al.animalId);
                                            return `${an?.name ?? al.animalId}: ${al.title[locale]} (${al.status})`;
                                        }).join(' · ')
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                                        lineNumber: 253,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                lineNumber: 246,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                        lineNumber: 242,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "outline",
                        size: "sm",
                        icon: "smartphone",
                        onClick: ()=>openMobileHandoff({
                                role: 'vet',
                                screen: screen || 'home',
                                title: t('পশুচিকিৎসক ট্রায়াজ ডেস্ক', 'Veterinary Clinical Triage')
                            }),
                        children: t('মোবাইল টেলিমেডিসিন লিংক', 'Mobile Telemedicine Link')
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                        lineNumber: 263,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/web/src/features/vet.tsx",
                lineNumber: 241,
                columnNumber: 9
            }, this) : null,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsBar"], {
                ariaLabel: t('পশুচিকিৎসক ওয়ার্কবেঞ্চ ট্যাব', 'Veterinarian workbench tabs'),
                active: tab,
                onChange: setTab,
                tabs: [
                    {
                        id: 'consultations',
                        label: t('সাক্ষাৎ, ৭-দিনের ভাইটালস ও প্রেসক্রিপশন', 'Consultations, 7-Day Vitals & Rx'),
                        count: myAppointments.length
                    },
                    {
                        id: 'patients',
                        label: t('প্রাণী ডিরেক্টরি ও ক্লিনিক্যাল রেকর্ড', 'Patient Registry & Health Records'),
                        count: linkedAnimals.length
                    },
                    {
                        id: 'claims',
                        label: t('বীমা দাবি ক্লিনিক্যাল যাচাই (UC-002)', 'Insurance Claim Clinical Reviews'),
                        count: myClaims.length
                    },
                    {
                        id: 'emergency',
                        label: t('জরুরি ট্রায়াজ কিউ (UC-001)', 'Emergency Alert Triage (UC-001)'),
                        count: escalatedAlerts.length
                    },
                    {
                        id: 'schedule',
                        label: t('চেম্বার সময়সূচি ও প্রাপ্যতা', 'Clinic Schedule & Availability')
                    }
                ]
            }, void 0, false, {
                fileName: "[project]/frontend/web/src/features/vet.tsx",
                lineNumber: 280,
                columnNumber: 7
            }, this),
            tab === 'consultations' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SplitWorkbench"], {
                masterTitle: t('সাক্ষাৎ ও জরুরি কল তালিকা', 'Appointments & Emergency Queue'),
                masterCount: myAppointments.length,
                masterList: myAppointments.map((appt)=>{
                    const animal = state.animals.find((a)=>a.id === appt.animalId);
                    const farmer = state.users.find((u)=>u.id === appt.farmerId);
                    const selected = activeAppt?.id === appt.id;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setSelectedApptId(appt.id),
                        className: `w-full rounded-[12px] border p-3.5 text-left transition-colors cursor-pointer ${selected ? 'border-[#15803D] bg-[#EBF4EE]/60' : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-start justify-between gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-sm font-bold text-[#1F2937]",
                                                        children: animal ? `${animal.name} (${animal.tag})` : appt.animalId
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                        lineNumber: 334,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                        tone: appt.priority === 'emergency' ? 'danger' : appt.priority === 'urgent' ? 'warning' : 'info',
                                                        children: appt.priority
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                        lineNumber: 337,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                lineNumber: 333,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs text-[#64748B] mt-0.5",
                                                children: [
                                                    farmer ? locale === 'bn' ? farmer.nameBn : farmer.name : appt.farmerId,
                                                    ' ',
                                                    "· ",
                                                    appt.mode === 'video' ? t('ভিডিও কল', 'Video Call') : t('খামার পরিদর্শন', 'Farm Visit')
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                lineNumber: 349,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                                        lineNumber: 332,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        tone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toneForStatus"])(appt.status),
                                        children: appt.status
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                                        lineNumber: 354,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                lineNumber: 331,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-[#475569] mt-2 line-clamp-1",
                                children: appt.reason
                            }, void 0, false, {
                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                lineNumber: 356,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-[11px] text-[#64748B] mt-1 tabular-nums",
                                children: dateTime(appt.scheduledAt)
                            }, void 0, false, {
                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                lineNumber: 357,
                                columnNumber: 17
                            }, this)
                        ]
                    }, appt.id, true, {
                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                        lineNumber: 321,
                        columnNumber: 15
                    }, this);
                }),
                detailPane: !activeAppt ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EmptyWorkspaceState"], {
                    title: t('কোনো সাক্ষাৎ নির্বাচিত নেই', 'No appointment selected'),
                    description: t('বাম পাশের তালিকা থেকে একটি অ্যাপয়েন্টমেন্ট নির্বাচন করুন।', 'Select an appointment from the queue to inspect vitals and write a prescription.')
                }, void 0, false, {
                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                    lineNumber: 365,
                    columnNumber: 15
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-start justify-between gap-3 border-b border-[#E2E8F0] pb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: "/images/cow.jpg",
                                                    alt: apptAnimal?.name ?? 'Animal',
                                                    className: "w-14 h-14 rounded-[12px] object-cover border border-[#E2E8F0]"
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                    lineNumber: 378,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                    className: "text-lg font-bold text-[#1F2937]",
                                                                    children: apptAnimal ? `${apptAnimal.name} (${apptAnimal.tag})` : activeAppt.animalId
                                                                }, void 0, false, {
                                                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                                    lineNumber: 385,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                    tone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toneForStatus"])(activeAppt.status),
                                                                    children: activeAppt.status
                                                                }, void 0, false, {
                                                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                                    lineNumber: 390,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                            lineNumber: 384,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-xs text-[#64748B] mt-0.5",
                                                            children: [
                                                                apptAnimal?.breed,
                                                                " · ",
                                                                apptAnimal?.weightKg,
                                                                " kg ·",
                                                                ' ',
                                                                t('মালিক:', 'Owner:'),
                                                                ' ',
                                                                apptFarmer ? locale === 'bn' ? apptFarmer.nameBn : apptFarmer.name : activeAppt.farmerId,
                                                                ' ',
                                                                "(",
                                                                apptFarmer?.phone,
                                                                ")"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                            lineNumber: 394,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                    lineNumber: 383,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 377,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-right",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    tone: activeAppt.priority === 'emergency' ? 'danger' : activeAppt.priority === 'urgent' ? 'warning' : 'info',
                                                    children: [
                                                        activeAppt.priority.toUpperCase(),
                                                        " · ",
                                                        activeAppt.mode.toUpperCase()
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                    lineNumber: 408,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-xs text-[#64748B] mt-1 tabular-nums",
                                                    children: dateTime(activeAppt.scheduledAt)
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                    lineNumber: 419,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 407,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 376,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 text-sm",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs font-semibold text-[#64748B] block",
                                            children: t('রোগের লক্ষণ ও পরামর্শের কারণ', 'Chief Complaint & Reason for Visit')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 426,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "font-medium text-[#1F2937] mt-0.5",
                                            children: activeAppt.reason
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 429,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 425,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-2.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap items-center justify-between gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-sm font-bold text-[#1F2937]",
                                                    children: t('৭-দিনের দৈনিক আইওটি ভাইটালস ও আদর্শ সীমা', '7-Day Daily Aggregated Vitals & Reference Ranges')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                    lineNumber: 435,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-wrap gap-2 text-[11px] font-semibold text-[#0F602D]",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "rounded bg-[#EBF4EE] px-2 py-0.5",
                                                            children: t('তাপমাত্রা: ৩৮.০–৩৯.০°সে', 'Temp: 38.0–39.0°C')
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                            lineNumber: 442,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "rounded bg-[#EBF4EE] px-2 py-0.5",
                                                            children: t('হৃদস্পন্দন: ৬০–৮০ /মিনিট', 'HR: 60–80 bpm')
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                            lineNumber: 445,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "rounded bg-[#EBF4EE] px-2 py-0.5",
                                                            children: t('সক্রিয়তা: ৭০%+', 'Activity: 70%+')
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                            lineNumber: 448,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                    lineNumber: 441,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 434,
                                            columnNumber: 21
                                        }, this),
                                        dailyVitals.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2",
                                            children: dailyVitals.map((v)=>{
                                                const fever = v.temperature > 39.2;
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: `rounded-[10px] border p-2.5 text-xs tabular-nums ${fever ? 'border-[#FECDD3] bg-[#FFF1F2]' : 'border-[#E2E8F0] bg-white'}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "font-semibold text-[#64748B]",
                                                            children: v.day.slice(5)
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                            lineNumber: 467,
                                                            columnNumber: 31
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: `text-sm font-bold mt-1 ${fever ? 'text-[#BE123C]' : 'text-[#15803D]'}`,
                                                            children: [
                                                                v.temperature,
                                                                "°C"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                            lineNumber: 470,
                                                            columnNumber: 31
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-[11px] text-[#475569]",
                                                            children: [
                                                                v.heartRate,
                                                                " bpm · ",
                                                                v.activity,
                                                                "%"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                            lineNumber: 477,
                                                            columnNumber: 31
                                                        }, this)
                                                    ]
                                                }, v.day, true, {
                                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                    lineNumber: 459,
                                                    columnNumber: 29
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 455,
                                            columnNumber: 23
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-xs text-[#64748B]",
                                            children: t('কোনো কলার রিডিং পাওয়া যায়নি।', 'No collar readings recorded.')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 485,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 433,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                            lineNumber: 375,
                            columnNumber: 17
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "text-base font-bold text-[#1F2937]",
                                    children: t('সাক্ষাৎ সিদ্ধান্ত ও ডিজিটাল প্রেসক্রিপশন কম্পোজার', 'Consultation Controls & Digital Prescription Composer')
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 494,
                                    columnNumber: 19
                                }, this),
                                activeAppt.status === 'requested' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                            label: t('পশুচিকিৎসকের নোট', 'Clinician Note'),
                                            value: decisionNote,
                                            onChange: (e)=>setDecisionNote(e.target.value),
                                            placeholder: t('যেমন: ভিডিও পরামর্শের জন্য প্রস্তুত...', 'e.g., Ready for telemedicine consultation...')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 503,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2.5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    variant: "primary",
                                                    icon: "check",
                                                    disabled: busy,
                                                    onClick: ()=>void run({
                                                            type: 'appointment.decide',
                                                            appointmentId: activeAppt.id,
                                                            accept: true,
                                                            note: decisionNote.trim() || 'Accepted by veterinarian'
                                                        }),
                                                    children: t('অ্যাপয়েন্টমেন্ট গ্রহণ করুন', 'Accept Appointment')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                    lineNumber: 513,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    variant: "danger",
                                                    icon: "close",
                                                    disabled: busy,
                                                    onClick: ()=>void run({
                                                            type: 'appointment.decide',
                                                            appointmentId: activeAppt.id,
                                                            accept: false,
                                                            note: decisionNote.trim() || 'Reschedule requested'
                                                        }),
                                                    children: t('প্রত্যাখ্যান করুন', 'Decline')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                    lineNumber: 528,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 512,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 502,
                                    columnNumber: 21
                                }, this) : null,
                                [
                                    'requested',
                                    'accepted'
                                ].includes(activeAppt.status) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-end justify-between gap-3 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-3.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 min-w-[200px]",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                label: t('সময় পরিবর্তন করুন (ISO / সময়)', 'Reschedule Time'),
                                                value: rescheduleTime,
                                                onChange: (e)=>setRescheduleTime(e.target.value)
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                lineNumber: 550,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 549,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    variant: "outline",
                                                    size: "sm",
                                                    icon: "calendar",
                                                    disabled: busy,
                                                    onClick: ()=>void run({
                                                            type: 'appointment.reschedule',
                                                            appointmentId: activeAppt.id,
                                                            scheduledAt: rescheduleTime
                                                        }),
                                                    children: t('সময় পরিবর্তন (Reschedule)', 'Reschedule')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                    lineNumber: 557,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    variant: "danger",
                                                    size: "sm",
                                                    icon: "close",
                                                    disabled: busy,
                                                    onClick: ()=>void run({
                                                            type: 'appointment.cancel',
                                                            appointmentId: activeAppt.id,
                                                            reason: decisionNote.trim() || 'Cancelled by veterinarian'
                                                        }),
                                                    children: t('অ্যাপয়েন্টমেন্ট বাতিল', 'Cancel Appointment')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                    lineNumber: 572,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 556,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 548,
                                    columnNumber: 21
                                }, this) : null,
                                activeAppt.status === 'accepted' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between gap-3 rounded-[12px] bg-[#EBF4EE] border border-[#D8E9DE] p-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm font-bold text-[#0A401E]",
                                                    children: t('পরামর্শ শুরু করার জন্য প্রস্তুত', 'Ready to Start Consultation')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                    lineNumber: 594,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-xs text-[#0F602D]",
                                                    children: t('ভিডিও/ভিজিট সেশন শুরু করে প্রেসক্রিপশন প্রদান করুন।', 'Begin the active session to record diagnosis and issue a prescription.')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                    lineNumber: 597,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 593,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "primary",
                                            icon: "stethoscope",
                                            disabled: busy,
                                            onClick: ()=>void run({
                                                    type: 'consultation.start',
                                                    appointmentId: activeAppt.id
                                                }),
                                            children: t('পরামর্শ শুরু করুন', 'Start Consultation')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 604,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 592,
                                    columnNumber: 21
                                }, this) : null,
                                [
                                    'accepted',
                                    'in_progress'
                                ].includes(activeAppt.status) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-4 border-t border-[#E2E8F0] pt-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                    label: t('রোগ নির্ণয় (Diagnosis)', 'Clinical Diagnosis'),
                                                    value: diagnosis,
                                                    onChange: (e)=>setDiagnosis(e.target.value)
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                    lineNumber: 623,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                    label: t('খামারির প্রতি পরামর্শ', 'Care & Feeding Advice'),
                                                    value: advice,
                                                    onChange: (e)=>setAdvice(e.target.value)
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                    lineNumber: 628,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 622,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-col gap-2.5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-between",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-sm font-bold text-[#1F2937]",
                                                            children: t('ওষুধের তালিকা (Medicines)', 'Prescribed Medicines')
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                            lineNumber: 637,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                            variant: "secondary",
                                                            size: "sm",
                                                            icon: "plus",
                                                            onClick: ()=>setMedicines((prev)=>[
                                                                        ...prev,
                                                                        {
                                                                            name: 'Electrolyte Mix',
                                                                            dose: '25g',
                                                                            frequency: 'Twice daily',
                                                                            days: 3
                                                                        }
                                                                    ]),
                                                            children: t('ওষুধ যোগ করুন', 'Add Medicine')
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                            lineNumber: 640,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                    lineNumber: 636,
                                                    columnNumber: 25
                                                }, this),
                                                medicines.map((med, idx)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "grid grid-cols-1 sm:grid-cols-12 gap-2 items-end rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "sm:col-span-4",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                                    label: t('ওষুধের নাম', 'Medicine Name'),
                                                                    value: med.name,
                                                                    onChange: (e)=>setMedicines((list)=>list.map((m, i)=>i === idx ? {
                                                                                    ...m,
                                                                                    name: e.target.value
                                                                                } : m))
                                                                }, void 0, false, {
                                                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                                    lineNumber: 666,
                                                                    columnNumber: 31
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                                lineNumber: 665,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "sm:col-span-3",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                                    label: t('মাত্রা (Dose)', 'Dose'),
                                                                    value: med.dose,
                                                                    onChange: (e)=>setMedicines((list)=>list.map((m, i)=>i === idx ? {
                                                                                    ...m,
                                                                                    dose: e.target.value
                                                                                } : m))
                                                                }, void 0, false, {
                                                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                                    lineNumber: 679,
                                                                    columnNumber: 31
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                                lineNumber: 678,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "sm:col-span-3",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                                    label: t('নিয়ম (Frequency)', 'Frequency'),
                                                                    value: med.frequency,
                                                                    onChange: (e)=>setMedicines((list)=>list.map((m, i)=>i === idx ? {
                                                                                    ...m,
                                                                                    frequency: e.target.value
                                                                                } : m))
                                                                }, void 0, false, {
                                                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                                    lineNumber: 692,
                                                                    columnNumber: 31
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                                lineNumber: 691,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "sm:col-span-2 flex items-center gap-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                                        label: t('দিন', 'Days'),
                                                                        type: "number",
                                                                        value: String(med.days),
                                                                        onChange: (e)=>setMedicines((list)=>list.map((m, i)=>i === idx ? {
                                                                                        ...m,
                                                                                        days: Math.max(1, Number(e.target.value) || 1)
                                                                                    } : m))
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                                        lineNumber: 705,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    medicines.length > 1 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        onClick: ()=>setMedicines((list)=>list.filter((_, i)=>i !== idx)),
                                                                        "aria-label": "Remove medicine",
                                                                        className: "mt-5 p-2 text-[#BE123C] hover:bg-[#FFF1F2] rounded-[8px] cursor-pointer",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WebIcon"], {
                                                                            name: "trash",
                                                                            className: "w-4 h-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                                            lineNumber: 728,
                                                                            columnNumber: 35
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                                        lineNumber: 720,
                                                                        columnNumber: 33
                                                                    }, this) : null
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                                lineNumber: 704,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, idx, true, {
                                                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                        lineNumber: 661,
                                                        columnNumber: 27
                                                    }, this))
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 635,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex justify-end",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "primary",
                                                icon: "check",
                                                disabled: busy,
                                                onClick: async ()=>{
                                                    if (activeAppt.status === 'accepted') {
                                                        await run({
                                                            type: 'consultation.start',
                                                            appointmentId: activeAppt.id
                                                        });
                                                    }
                                                    await run({
                                                        type: 'consultation.complete',
                                                        appointmentId: activeAppt.id,
                                                        diagnosis,
                                                        advice,
                                                        medicines
                                                    });
                                                },
                                                children: t('পরামর্শ শেষ করুন ও প্রেসক্রিপশন পাঠান', 'Complete Consultation & Issue Prescription')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                lineNumber: 737,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 736,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 621,
                                    columnNumber: 21
                                }, this) : null
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                            lineNumber: 493,
                            columnNumber: 17
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                    lineNumber: 373,
                    columnNumber: 15
                }, this)
            }, void 0, false, {
                fileName: "[project]/frontend/web/src/features/vet.tsx",
                lineNumber: 313,
                columnNumber: 9
            }, this) : null,
            tab === 'patients' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SplitWorkbench"], {
                masterTitle: t('নিবন্ধিত প্রাণী ডিরেক্টরি', 'Assigned Patient Animals'),
                masterCount: linkedAnimals.length,
                masterList: linkedAnimals.map((animal)=>{
                    const selected = activePatient?.id === animal.id;
                    const owner = state.users.find((u)=>u.id === animal.ownerId);
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setSelectedAnimalId(animal.id),
                        className: `w-full rounded-[12px] border p-3.5 text-left transition-colors cursor-pointer ${selected ? 'border-[#15803D] bg-[#EBF4EE]/60' : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between gap-2",
                                children: [
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
                                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                lineNumber: 792,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs text-[#64748B]",
                                                children: [
                                                    animal.breed,
                                                    " · ",
                                                    animal.weightKg,
                                                    " kg ·",
                                                    ' ',
                                                    owner ? locale === 'bn' ? owner.nameBn : owner.name : animal.ownerId
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                lineNumber: 795,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                                        lineNumber: 791,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        tone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toneForStatus"])(animal.status),
                                        children: animal.status
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                                        lineNumber: 800,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                lineNumber: 790,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-2",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HealthScoreBar"], {
                                    score: animal.healthScore
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 803,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                lineNumber: 802,
                                columnNumber: 17
                            }, this)
                        ]
                    }, animal.id, true, {
                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                        lineNumber: 780,
                        columnNumber: 15
                    }, this);
                }),
                detailPane: !activePatient ? null : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                    className: "text-lg font-bold text-[#1F2937]",
                                                    children: [
                                                        activePatient.name,
                                                        " (",
                                                        activePatient.tag,
                                                        ") —",
                                                        ' ',
                                                        t('ক্লিনিক্যাল পাসপোর্ট', 'Clinical Passport')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                    lineNumber: 814,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-[#64748B]",
                                                    children: [
                                                        activePatient.breed,
                                                        " · ",
                                                        activePatient.weightKg,
                                                        " kg ·",
                                                        ' ',
                                                        t('মূল্যায়ন:', 'Valuation:'),
                                                        " ",
                                                        money(activePatient.value)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                    lineNumber: 818,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 813,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                            tone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toneForStatus"])(activePatient.status),
                                            children: activePatient.status
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 823,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 812,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-sm font-bold text-[#1F2937]",
                                            children: [
                                                t('চিকিৎসা ও টিকার ইতিহাস', 'Vaccination & Clinical History'),
                                                " (",
                                                patientRecords.length,
                                                ")"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 829,
                                            columnNumber: 21
                                        }, this),
                                        patientRecords.map((rec)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-3 flex items-start justify-between gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-sm font-semibold text-[#1F2937]",
                                                                children: rec.title[locale]
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                                lineNumber: 839,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-xs text-[#475569] mt-0.5",
                                                                children: rec.note
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                                lineNumber: 842,
                                                                columnNumber: 27
                                                            }, this),
                                                            rec.nextDueAt ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-[11px] font-semibold text-[#0F602D] mt-0.5",
                                                                children: [
                                                                    t('পরবর্তী তারিখ:', 'Next Due:'),
                                                                    " ",
                                                                    date(rec.nextDueAt)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                                lineNumber: 844,
                                                                columnNumber: 29
                                                            }, this) : null
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                        lineNumber: 838,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-right shrink-0",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                tone: "brand",
                                                                children: rec.kind
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                                lineNumber: 850,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-[11px] text-[#64748B] mt-1 tabular-nums",
                                                                children: date(rec.createdAt)
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                                lineNumber: 851,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                        lineNumber: 849,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, rec.id, true, {
                                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                lineNumber: 834,
                                                columnNumber: 23
                                            }, this))
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 828,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                            lineNumber: 811,
                            columnNumber: 17
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "text-base font-bold text-[#1F2937]",
                                    children: t('নতুন ক্লিনিক্যাল রেকর্ড বা টিকা যোগ করুন', 'Log New Clinical or Vaccination Record')
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 861,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectField"], {
                                            label: t('রেকর্ডের ধরন', 'Record Type'),
                                            value: recKind,
                                            onChange: (e)=>setRecKind(e.target.value),
                                            options: [
                                                {
                                                    value: 'checkup',
                                                    label: t('স্বাস্থ্য পরীক্ষা (Checkup)', 'Checkup')
                                                },
                                                {
                                                    value: 'vaccination',
                                                    label: t('টিকা (Vaccination)', 'Vaccination')
                                                },
                                                {
                                                    value: 'treatment',
                                                    label: t('চিকিৎসা (Treatment)', 'Treatment')
                                                }
                                            ]
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 865,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                            label: t('শিরোনাম (বাংলা)', 'Title (Bangla)'),
                                            value: recTitleBn,
                                            onChange: (e)=>setRecTitleBn(e.target.value)
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 875,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                            label: t('শিরোনাম (English)', 'Title (English)'),
                                            value: recTitleEn,
                                            onChange: (e)=>setRecTitleEn(e.target.value)
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 880,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                            label: t('পরবর্তী নির্ধারিত তারিখ (ঐচ্ছিক)', 'Next Due Date (Optional)'),
                                            type: "date",
                                            value: recNextDueAt,
                                            onChange: (e)=>setRecNextDueAt(e.target.value)
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 885,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 864,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextareaField"], {
                                    label: t('ক্লিনিক্যাল নোট ও পর্যবেক্ষণ', 'Clinical Notes & Observations'),
                                    value: recNote,
                                    onChange: (e)=>setRecNote(e.target.value)
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 892,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-end",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: "primary",
                                        icon: "plus",
                                        disabled: busy,
                                        onClick: ()=>void run({
                                                type: 'record.add',
                                                animalId: activePatient.id,
                                                kind: recKind,
                                                title: {
                                                    bn: recTitleBn,
                                                    en: recTitleEn
                                                },
                                                note: recNote,
                                                nextDueAt: recNextDueAt.trim() || undefined
                                            }),
                                        children: t('স্বাস্থ্য পাসপোর্টে যুক্ত করুন', 'Add to Health Passport')
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                                        lineNumber: 898,
                                        columnNumber: 21
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 897,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                            lineNumber: 860,
                            columnNumber: 17
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                    lineNumber: 810,
                    columnNumber: 15
                }, this)
            }, void 0, false, {
                fileName: "[project]/frontend/web/src/features/vet.tsx",
                lineNumber: 773,
                columnNumber: 9
            }, this) : null,
            tab === 'claims' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SplitWorkbench"], {
                masterTitle: t('বীমা দাবি পর্যালোচনা তালিকা', 'Insurance Claims Referred for Vet Review'),
                masterCount: myClaims.length,
                masterList: myClaims.map((claim)=>{
                    const animal = state.animals.find((a)=>a.id === claim.animalId);
                    const selected = activeClaim?.id === claim.id;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setSelectedClaimId(claim.id),
                        className: `w-full rounded-[12px] border p-3.5 text-left transition-colors cursor-pointer ${selected ? 'border-[#15803D] bg-[#EBF4EE]/60' : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-bold text-[#1F2937]",
                                        children: animal ? `${animal.name} (${animal.tag})` : claim.animalId
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                                        lineNumber: 942,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        tone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toneForStatus"])(claim.status),
                                        children: claim.status
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                                        lineNumber: 945,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                lineNumber: 941,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xs text-[#64748B] mt-1 tabular-nums",
                                children: [
                                    claim.kind.toUpperCase(),
                                    " · ",
                                    money(claim.amount),
                                    " · ",
                                    dateTime(claim.createdAt)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                lineNumber: 947,
                                columnNumber: 17
                            }, this)
                        ]
                    }, claim.id, true, {
                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                        lineNumber: 931,
                        columnNumber: 15
                    }, this);
                }),
                detailPane: !activeClaim ? null : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                    className: "flex flex-col gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start justify-between gap-3 border-b border-[#E2E8F0] pb-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-lg font-bold text-[#1F2937]",
                                            children: t('বীমা দাবির ক্লিনিক্যাল ফরেনসিক পর্যালোচনা', 'Clinical Claim Verification')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 958,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-[#64748B] tabular-nums",
                                            children: [
                                                "Claim ID: ",
                                                activeClaim.id,
                                                " ·",
                                                ' ',
                                                claimAnimal ? `${claimAnimal.name} (${claimAnimal.tag})` : ''
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 961,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 957,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                    tone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toneForStatus"])(activeClaim.status),
                                    children: activeClaim.status
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 966,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                            lineNumber: 956,
                            columnNumber: 17
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-[10px] border border-[#E2E8F0] p-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[#64748B] block",
                                            children: t('দাবির ধরন ও পরিমাণ', 'Claim Type & Amount')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 971,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            className: "text-sm text-[#1F2937] tabular-nums",
                                            children: [
                                                activeClaim.kind,
                                                " · ",
                                                money(activeClaim.amount)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 974,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 970,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-[10px] border border-[#E2E8F0] p-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[#64748B] block",
                                            children: t('ছবি ও জিপিএস প্রমাণ', 'Photo & GPS Evidence')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 979,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            className: "text-sm text-[#15803D]",
                                            children: [
                                                activeClaim.evidence.photo ? 'Photo ✓' : 'No Photo',
                                                " ·",
                                                ' ',
                                                activeClaim.evidence.location ? 'GPS ✓' : 'No GPS'
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 982,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 978,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-[10px] border border-[#E2E8F0] p-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[#64748B] block",
                                            children: t('আইওটি কলার টেলিমেট্রি', 'IoT Collar Telemetry')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 988,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            className: "text-sm text-[#0F602D]",
                                            children: claimAnimal && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$finance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasIoTEvidence"])(state, claimAnimal.id, activeClaim.evidence.capturedAt ?? activeClaim.createdAt) ? t('যাচাইকৃত (Verified)', 'Verified') : t('ম্যানুয়াল যাচাই', 'Manual Check')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                                            lineNumber: 991,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 987,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                            lineNumber: 969,
                            columnNumber: 17
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs font-semibold text-[#64748B] block",
                                    children: t('খামারির প্রদত্ত বিবরণ', 'Incident Evidence Description')
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 1005,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[#1F2937] mt-1",
                                    children: activeClaim.evidence.description
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 1008,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                            lineNumber: 1004,
                            columnNumber: 17
                        }, this),
                        activeClaim.vetOpinion ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "rounded-[12px] bg-[#EBF4EE] border border-[#D8E9DE] p-3.5 text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-xs font-semibold text-[#0F602D] block",
                                    children: t('পশুচিকিৎসকের জমাকৃত মতামত', 'Submitted Veterinary Opinion')
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 1013,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-[#0A401E] mt-1",
                                    children: activeClaim.vetOpinion
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 1016,
                                    columnNumber: 21
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                            lineNumber: 1012,
                            columnNumber: 19
                        }, this) : null,
                        activeClaim.status === 'vet_review' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextareaField"], {
                                    label: t('ক্লিনিক্যাল মতামত লিখুন', 'Veterinary Clinical Assessment'),
                                    value: vetOpinion,
                                    onChange: (e)=>setVetOpinion(e.target.value)
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 1022,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-end",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        variant: "primary",
                                        icon: "shield-check",
                                        disabled: busy,
                                        onClick: ()=>void run({
                                                type: 'claim.vetReview',
                                                claimId: activeClaim.id,
                                                opinion: vetOpinion
                                            }),
                                        children: t('ক্লিনিক্যাল মতামত জমা দিন', 'Submit Clinical Opinion to Insurer')
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                                        lineNumber: 1028,
                                        columnNumber: 23
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                                    lineNumber: 1027,
                                    columnNumber: 21
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                            lineNumber: 1021,
                            columnNumber: 19
                        }, this) : null
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/web/src/features/vet.tsx",
                    lineNumber: 955,
                    columnNumber: 15
                }, this)
            }, void 0, false, {
                fileName: "[project]/frontend/web/src/features/vet.tsx",
                lineNumber: 924,
                columnNumber: 9
            }, this) : null,
            tab === 'emergency' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                className: "flex flex-col gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-base font-bold text-[#1F2937]",
                                        children: t('জরুরি সতর্কতা ও ৪-ঘণ্টা SLA ট্রায়াজ কিউ (UC-001)', 'Emergency Alert & 4-Hour SLA Triage Queue (UC-001)')
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                                        lineNumber: 1055,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-[#64748B]",
                                        children: t('৪ ঘণ্টার মধ্যে সমাধান না হওয়া গুরুতর সতর্কতা স্বয়ংক্রিয়ভাবে এসকেলেট হয়।', 'Critical collar alerts unresolved after 4 hours automatically escalate here for rapid clinical intervention.')
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                                        lineNumber: 1058,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                lineNumber: 1054,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                tone: escalatedAlerts.length > 0 ? 'danger' : 'success',
                                children: [
                                    escalatedAlerts.length,
                                    " ",
                                    t('টি সক্রিয়', 'Active')
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                lineNumber: 1065,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                        lineNumber: 1053,
                        columnNumber: 11
                    }, this),
                    escalatedAlerts.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EmptyWorkspaceState"], {
                        title: t('কোনো জরুরি সতর্কতা নেই', 'No active emergency alerts'),
                        description: t('সকল নিবন্ধিত প্রাণীর কলার ভাইটালস স্বাভাবিক সীমার মধ্যে রয়েছে।', 'All monitored livestock vitals are currently within normal thresholds.')
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                        lineNumber: 1071,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                        children: escalatedAlerts.map((alert)=>{
                            const animal = state.animals.find((a)=>a.id === alert.animalId);
                            const linkedAppt = myAppointments.find((ap)=>ap.alertId === alert.id);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-[14px] border border-[#FECDD3] bg-[#FFF1F2]/70 p-4 flex flex-col gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-start justify-between gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-sm font-bold text-[#BE123C]",
                                                        children: alert.title[locale]
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                        lineNumber: 1090,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs text-[#9F1239] mt-0.5",
                                                        children: [
                                                            animal ? `${animal.name} (${animal.tag})` : alert.animalId,
                                                            " ·",
                                                            ' ',
                                                            dateTime(alert.createdAt)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                        lineNumber: 1093,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                lineNumber: 1089,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                tone: "danger",
                                                children: alert.status
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                lineNumber: 1098,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                                        lineNumber: 1088,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-[#881337]",
                                        children: alert.message[locale]
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                                        lineNumber: 1100,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap gap-2",
                                        children: [
                                            linkedAppt ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "primary",
                                                size: "sm",
                                                onClick: ()=>{
                                                    setSelectedApptId(linkedAppt.id);
                                                    setTab('consultations');
                                                },
                                                children: t('জরুরি সাক্ষাৎ খুলুন', 'Open Linked Consultation')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                lineNumber: 1103,
                                                columnNumber: 25
                                            }, this) : null,
                                            animal ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "outline",
                                                size: "sm",
                                                onClick: ()=>{
                                                    setSelectedAnimalId(animal.id);
                                                    setTab('patients');
                                                },
                                                children: t('প্রাণীর পাসপোর্ট দেখুন', 'Inspect Patient Passport')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                                lineNumber: 1115,
                                                columnNumber: 25
                                            }, this) : null
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                                        lineNumber: 1101,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, alert.id, true, {
                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                lineNumber: 1084,
                                columnNumber: 19
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                        lineNumber: 1079,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/web/src/features/vet.tsx",
                lineNumber: 1052,
                columnNumber: 9
            }, this) : null,
            tab === 'schedule' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                className: "flex flex-col gap-4 max-w-2xl",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-base font-bold text-[#1F2937]",
                                children: t('চেম্বার সময়সূচি, বিশেষত্ব ও প্রাপ্যতা', 'Clinical Specialty, Schedule & Availability')
                            }, void 0, false, {
                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                lineNumber: 1138,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-[#64748B]",
                                children: t('খামারিরা পশুচিকিৎসক ডিরেক্টরিতে আপনার এই প্রাপ্যতা ও সময়সূচি দেখতে পাবেন।', 'Farmers see your live availability and clinic hours when booking consultations.')
                            }, void 0, false, {
                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                lineNumber: 1141,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                        lineNumber: 1137,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 sm:grid-cols-2 gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                label: t('বিশেষত্ব (Specialty)', 'Clinical Specialty'),
                                value: scheduleSpecialty,
                                onChange: (e)=>setScheduleSpecialty(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                lineNumber: 1149,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                label: t('চেম্বার ও টেলিমেডিসিন সময়সূচি', 'Consultation Hours'),
                                value: scheduleHours,
                                onChange: (e)=>setScheduleHours(e.target.value)
                            }, void 0, false, {
                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                lineNumber: 1154,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                        lineNumber: 1148,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: "flex items-center gap-2.5 text-sm font-semibold text-[#1F2937] cursor-pointer",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "checkbox",
                                checked: scheduleAvailable,
                                onChange: (e)=>setScheduleAvailable(e.target.checked),
                                className: "h-4 w-4 accent-[#15803D]"
                            }, void 0, false, {
                                fileName: "[project]/frontend/web/src/features/vet.tsx",
                                lineNumber: 1161,
                                columnNumber: 13
                            }, this),
                            t('নতুন সাক্ষাৎ ও জরুরি কলের জন্য উপলব্ধ (Available)', 'Available for new bookings & emergency dispatches')
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                        lineNumber: 1160,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-end",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "primary",
                            icon: "check",
                            disabled: busy,
                            onClick: ()=>void run({
                                    type: 'profile.update',
                                    name: user?.name ?? 'Dr. Farhana Rahman',
                                    district: user?.district ?? 'Sirajganj',
                                    specialty: scheduleSpecialty,
                                    schedule: scheduleHours,
                                    available: scheduleAvailable
                                }),
                            children: t('সময়সূচি সংরক্ষণ করুন', 'Save Clinic Schedule')
                        }, void 0, false, {
                            fileName: "[project]/frontend/web/src/features/vet.tsx",
                            lineNumber: 1170,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/vet.tsx",
                        lineNumber: 1169,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/web/src/features/vet.tsx",
                lineNumber: 1136,
                columnNumber: 9
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/web/src/features/vet.tsx",
        lineNumber: 203,
        columnNumber: 5
    }, this);
}
_s(VetWebFeature, "sDWEZsiNmpqE99T7ya3PrTmEgl4=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$providers$2f$web$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWebApp"]
    ];
});
_c = VetWebFeature;
var _c;
__turbopack_context__.k.register(_c, "VetWebFeature");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=frontend_web_src_features_vet_tsx_131g9zvgsdccb._.js.map