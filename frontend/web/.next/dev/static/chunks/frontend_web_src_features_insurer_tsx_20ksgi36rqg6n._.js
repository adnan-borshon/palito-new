(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/frontend/web/src/features/insurer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "InsurerWebFeature",
    ()=>InsurerWebFeature
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
function InsurerWebFeature({ screen, id }) {
    _s();
    const { state, locale, t, money, date, dateTime, run, busy, openMobileHandoff, user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$providers$2f$web$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWebApp"])();
    const myClaims = state.claims.filter((c)=>!user?.id || user.role !== 'insurer' || c.insurerId === user.id);
    const myPolicies = state.policies.filter((p)=>!user?.id || user.role !== 'insurer' || p.insurerId === user.id);
    const initialTab = screen === 'applications' || screen === 'policies' || screen === 'policy' ? 'policies' : screen === 'passport' ? 'passport' : 'claims';
    const [tab, setTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialTab);
    const [selectedClaimId, setSelectedClaimId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialTab === 'claims' && id ? id : myClaims[0]?.id ?? '');
    const [selectedPolicyId, setSelectedPolicyId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialTab === 'policies' && id ? id : myPolicies[0]?.id ?? '');
    const [selectedPassportAnimalId, setSelectedPassportAnimalId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(initialTab === 'passport' && id ? id : '');
    const vets = state.users.filter((u)=>u.role === 'vet' && u.status === 'active');
    const [referVetId, setReferVetId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(vets[0]?.id ?? '');
    const [claimNote, setClaimNote] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Verified telemetry, GPS coordinates, and veterinary clinical report.');
    const [policyNote, setPolicyNote] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Approved after digital health passport and vaccination check.');
    const activeClaim = myClaims.find((c)=>c.id === selectedClaimId) ?? myClaims[0];
    const claimAnimal = activeClaim ? state.animals.find((a)=>a.id === activeClaim.animalId) : undefined;
    const claimFarmer = activeClaim ? state.users.find((u)=>u.id === activeClaim.farmerId) : undefined;
    const securedLoan = activeClaim ? state.loans.find((l)=>l.animalId === activeClaim.animalId && [
            'active',
            'approved'
        ].includes(l.status) && l.outstanding > 0) : undefined;
    const estimatedDebtCut = activeClaim && securedLoan ? Math.min(activeClaim.amount, securedLoan.outstanding) : 0;
    const estimatedFarmerNet = activeClaim ? Math.max(0, activeClaim.amount - estimatedDebtCut) : 0;
    const activePolicy = myPolicies.find((p)=>p.id === selectedPolicyId) ?? myPolicies[0];
    const policyAnimal = activePolicy ? state.animals.find((a)=>a.id === activePolicy.animalId) : undefined;
    const policyFarmer = activePolicy ? state.users.find((u)=>u.id === activePolicy.farmerId) : undefined;
    const passportAnimal = state.animals.find((a)=>a.id === selectedPassportAnimalId) ?? policyAnimal ?? claimAnimal ?? state.animals[0];
    const totalCoverage = myPolicies.filter((p)=>p.status === 'active').reduce((sum, p)=>sum + p.coverage, 0);
    const pendingClaimsCount = myClaims.filter((c)=>[
            'submitted',
            'manual_review',
            'vet_review',
            'approved'
        ].includes(c.status)).length;
    const totalPaidClaims = myClaims.filter((c)=>c.status === 'paid').reduce((sum, c)=>sum + (c.payout ?? c.amount), 0);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KpiCard"], {
                        label: t('অপেক্ষমাণ বীমা দাবি', 'Pending Claims Queue'),
                        value: pendingClaimsCount,
                        hint: t('যাচাই ও পেআউটের অপেক্ষায়', 'Awaiting verification or payout'),
                        tone: pendingClaimsCount > 0 ? 'warning' : 'brand',
                        icon: "shield-check"
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                        lineNumber: 116,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KpiCard"], {
                        label: t('সক্রিয় পলিসি কভারেজ', 'Active Policy Coverage'),
                        value: money(totalCoverage),
                        hint: `${myPolicies.filter((p)=>p.status === 'active').length} ${t('টি সক্রিয় পলিসি', 'active policies')}`,
                        tone: "brand",
                        icon: "landmark"
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                        lineNumber: 123,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KpiCard"], {
                        label: t('পলিসি আবেদন কিউ', 'Policy Applications'),
                        value: myPolicies.filter((p)=>p.status === 'submitted').length,
                        hint: t('আন্ডাররাইটিং সিদ্ধান্তের অপেক্ষায়', 'Awaiting underwriting decision'),
                        tone: "info",
                        icon: "file-check"
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                        lineNumber: 130,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KpiCard"], {
                        label: t('পরিশোধিত দাবি (ডেট-ফার্স্ট)', 'Total Claims Paid'),
                        value: money(totalPaidClaims),
                        hint: t('UC-002 স্বয়ংক্রিয় ঋণ সমন্বয়সহ', 'Includes automatic bank debt routing'),
                        tone: "success",
                        icon: "check"
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                        lineNumber: 137,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                lineNumber: 115,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsBar"], {
                ariaLabel: t('বীমা ওয়ার্কবেঞ্চ ট্যাব', 'Insurer workbench tabs'),
                active: tab,
                onChange: setTab,
                tabs: [
                    {
                        id: 'claims',
                        label: t('দাবি যাচাই, ভেট রেফারেল ও ডেট-ফার্স্ট পেআউট (UC-002)', 'Claims Verification & Debt-First Payouts'),
                        count: myClaims.length
                    },
                    {
                        id: 'policies',
                        label: t('পলিসি আবেদন ও সক্রিয় পলিসি ডিরেক্টরি', 'Policy Underwriting & Active Policies'),
                        count: myPolicies.length
                    },
                    {
                        id: 'passport',
                        label: t('ডিজিটাল স্বাস্থ্য পাসপোর্ট', 'Insured Animal Health Passport'),
                        count: state.animals.length
                    }
                ]
            }, void 0, false, {
                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                lineNumber: 146,
                columnNumber: 7
            }, this),
            tab === 'claims' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SplitWorkbench"], {
                masterTitle: t('বীমা দাবি ফাইল তালিকা', 'Insurance Claims Queue'),
                masterCount: myClaims.length,
                masterToolbar: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-end",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "outline",
                        size: "sm",
                        icon: "smartphone",
                        onClick: ()=>openMobileHandoff({
                                role: 'insurer',
                                screen: 'claims',
                                id: activeClaim?.id
                            }),
                        children: t('মোবাইল ভিউ', 'Mobile Link')
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                        lineNumber: 175,
                        columnNumber: 15
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/frontend/web/src/features/insurer.tsx",
                    lineNumber: 174,
                    columnNumber: 13
                }, this),
                masterList: myClaims.map((claim)=>{
                    const animal = state.animals.find((a)=>a.id === claim.animalId);
                    const farmer = state.users.find((u)=>u.id === claim.farmerId);
                    const selected = activeClaim?.id === claim.id;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setSelectedClaimId(claim.id),
                        className: `w-full rounded-[12px] border p-3.5 text-left transition-colors cursor-pointer ${selected ? 'border-[#15803D] bg-[#EBF4EE]/60' : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-start justify-between gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm font-bold text-[#1F2937]",
                                                children: animal ? `${animal.name} (${animal.tag})` : claim.animalId
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 208,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs text-[#64748B]",
                                                children: [
                                                    farmer ? locale === 'bn' ? farmer.nameBn : farmer.name : claim.farmerId,
                                                    " ·",
                                                    ' ',
                                                    claim.kind.toUpperCase()
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 211,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 207,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        tone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toneForStatus"])(claim.status),
                                        children: claim.status
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 216,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                lineNumber: 206,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-2 flex items-center justify-between text-xs font-semibold tabular-nums",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[#0F602D]",
                                        children: money(claim.amount)
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 219,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[#64748B]",
                                        children: dateTime(claim.createdAt)
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 220,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                lineNumber: 218,
                                columnNumber: 17
                            }, this)
                        ]
                    }, claim.id, true, {
                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                        lineNumber: 196,
                        columnNumber: 15
                    }, this);
                }),
                detailPane: !activeClaim ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EmptyWorkspaceState"], {
                    title: t('একটি দাবি নির্বাচন করুন', 'Select a claim'),
                    description: t('বাম পাশের তালিকা থেকে দাবি ফাইল নির্বাচন করুন।', 'Select a claim from the queue to inspect evidence and execute payout.')
                }, void 0, false, {
                    fileName: "[project]/frontend/web/src/features/insurer.tsx",
                    lineNumber: 227,
                    columnNumber: 15
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-4",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                        className: "flex flex-col gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap items-start justify-between gap-3 border-b border-[#E2E8F0] pb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "text-lg font-bold text-[#1F2937]",
                                                        children: t('বীমা দাবি ও ফরেনসিক প্রমাণ যাচাই', 'Claim Evidence & Settlement Inspector')
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                        lineNumber: 240,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                        tone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toneForStatus"])(activeClaim.status),
                                                        children: activeClaim.status
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                        lineNumber: 243,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 239,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-[#64748B] tabular-nums mt-0.5",
                                                children: [
                                                    "Claim ID: ",
                                                    activeClaim.id,
                                                    " · Policy: ",
                                                    activeClaim.policyId,
                                                    " ·",
                                                    ' ',
                                                    dateTime(activeClaim.createdAt)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 247,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 238,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-right tabular-nums",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-[#64748B] block",
                                                children: t('দাবিকৃত অর্থ', 'Claimed Amount')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 253,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                className: "text-2xl text-[#0F602D]",
                                                children: money(activeClaim.amount)
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 256,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 252,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                lineNumber: 237,
                                columnNumber: 19
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-[12px] border border-[#E2E8F0] p-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[#64748B] block",
                                                children: t('খামারি ও প্রাণী', 'Farmer & Insured Animal')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 265,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                className: "text-sm text-[#1F2937] block mt-0.5",
                                                children: claimAnimal ? `${claimAnimal.name} (${claimAnimal.tag})` : activeClaim.animalId
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 268,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[#475569]",
                                                children: claimFarmer ? locale === 'bn' ? claimFarmer.nameBn : claimFarmer.name : activeClaim.farmerId
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 271,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 264,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-[12px] border border-[#E2E8F0] p-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[#64748B] block",
                                                children: t('ছবি ও জিপিএস অবস্থান', 'Photo & Geo-Timestamp')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 281,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                className: "text-sm text-[#15803D] block mt-0.5",
                                                children: [
                                                    activeClaim.evidence.photo ? 'Photo ✓' : 'Missing Photo',
                                                    " ·",
                                                    ' ',
                                                    activeClaim.evidence.location ? 'GPS ✓' : 'Missing GPS'
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 284,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[#475569] tabular-nums",
                                                children: activeClaim.evidence.latitude ? `${activeClaim.evidence.latitude.toFixed(4)}, ${activeClaim.evidence.longitude?.toFixed(4)}` : t('জিও-ট্যাগ সংযুক্ত', 'Geo-tagged metadata')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 288,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 280,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-[12px] border border-[#E2E8F0] p-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[#64748B] block",
                                                children: t('আইওটি কলার টেলিমেট্রি', 'IoT Biometric Evidence')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 296,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                className: "text-sm text-[#0F602D] block mt-0.5",
                                                children: claimAnimal && (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$finance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasIoTEvidence"])(state, claimAnimal.id, activeClaim.evidence.capturedAt ?? activeClaim.createdAt) ? t('স্বয়ংক্রিয় যাচাইকৃত', 'Telemetry Verified') : t('ম্যানুয়াল পর্যালোচনা প্রয়োজন', 'Manual Review Required')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 299,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-[#475569]",
                                                children: [
                                                    t('ঘটনার ধরন:', 'Incident type:'),
                                                    " ",
                                                    activeClaim.kind
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 309,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 295,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                lineNumber: 263,
                                columnNumber: 19
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] p-3.5 text-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-semibold text-[#64748B] block",
                                        children: t('ঘটনার বিবরণ', 'Submitted Incident Description')
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 316,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[#1F2937] mt-1",
                                        children: activeClaim.evidence.description
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 319,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                lineNumber: 315,
                                columnNumber: 19
                            }, this),
                            activeClaim.vetOpinion ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-[12px] bg-[#EFF6FF] border border-[#BFDBFE] p-3.5 text-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs font-semibold text-[#1D4ED8] block",
                                        children: t('পশুচিকিৎসকের ক্লিনিক্যাল মতামত', 'Veterinary Clinical Opinion')
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 324,
                                        columnNumber: 23
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-[#1E3A8A] mt-1",
                                        children: activeClaim.vetOpinion
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 327,
                                        columnNumber: 23
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                lineNumber: 323,
                                columnNumber: 21
                            }, this) : null,
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-[12px] border border-[#D8E9DE] bg-[#EBF4EE]/60 p-4 flex flex-col gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm font-bold text-[#0A401E]",
                                        children: t('স্বয়ংক্রিয় জামানত ঋণ সমন্বয় ও পেআউট বিভাজন (UC-002)', 'Debt-First Collateral Settlement Routing (UC-002)')
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 333,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-3 gap-3 text-xs tabular-nums pt-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[#64748B] block",
                                                        children: t('মোট দাবি পেআউট', 'Gross Claim Payout')
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                        lineNumber: 341,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        className: "text-base text-[#1F2937]",
                                                        children: money(activeClaim.payout ?? activeClaim.amount)
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                        lineNumber: 344,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 340,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[#64748B] block",
                                                        children: t('ব্যাংক ঋণ সমন্বয়', 'Bank Debt Settlement')
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                        lineNumber: 349,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        className: "text-base text-[#15803D]",
                                                        children: money(activeClaim.debtSettlement ?? estimatedDebtCut)
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                        lineNumber: 352,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 348,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[#64748B] block",
                                                        children: t('খামারির নিট প্রাপ্য', 'Net Farmer Wallet Credit')
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                        lineNumber: 357,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        className: "text-base text-[#0F602D]",
                                                        children: money(activeClaim.farmerPayout ?? estimatedFarmerNet)
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                        lineNumber: 360,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 356,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 339,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                lineNumber: 332,
                                columnNumber: 19
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border-t border-[#E2E8F0] pt-4 flex flex-col gap-3",
                                children: [
                                    activeClaim.status === 'submitted' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-wrap gap-2.5",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "primary",
                                            icon: "shield-check",
                                            disabled: busy,
                                            onClick: ()=>void run({
                                                    type: 'claim.autoReview',
                                                    claimId: activeClaim.id
                                                }),
                                            children: t('স্বয়ংক্রিয় আইওটি ও প্রমাণ যাচাই চালান (Auto-Review)', 'Run Automated Evidence & IoT Check')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                            lineNumber: 371,
                                            columnNumber: 25
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 370,
                                        columnNumber: 23
                                    }, this) : null,
                                    [
                                        'submitted',
                                        'manual_review'
                                    ].includes(activeClaim.status) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 sm:grid-cols-3 gap-3 items-end rounded-[12px] border border-[#E2E8F0] p-3.5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "sm:col-span-2",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectField"], {
                                                    label: t('ক্লিনিক্যাল যাচাইয়ের জন্য পশুচিকিৎসক নির্বাচন করুন', 'Refer Complex Claim to Veterinarian'),
                                                    value: referVetId,
                                                    onChange: (e)=>setReferVetId(e.target.value),
                                                    options: vets.map((v)=>({
                                                            value: v.id,
                                                            label: `${locale === 'bn' ? v.nameBn : v.name} (${v.district})`
                                                        }))
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                    lineNumber: 393,
                                                    columnNumber: 27
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 392,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "secondary",
                                                icon: "stethoscope",
                                                disabled: busy || !referVetId,
                                                onClick: ()=>void run({
                                                        type: 'claim.refer',
                                                        claimId: activeClaim.id,
                                                        vetId: referVetId
                                                    }),
                                                children: t('ভেটের কাছে পাঠান', 'Refer to Vet')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 406,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 391,
                                        columnNumber: 23
                                    }, this) : null,
                                    activeClaim.status === 'vet_review' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "rounded-[12px] border border-[#BFDBFE] bg-[#EFF6FF] p-3.5 text-xs text-[#1E3A8A]",
                                        children: t('এই দাবিটি বর্তমানে রেফারকৃত পশুচিকিৎসকের ক্লিনিক্যাল মতামতের (claim.vetReview) অপেক্ষায় রয়েছে। মতামত জমা দেওয়ার পর চূড়ান্ত সিদ্ধান্ত সক্রিয় হবে।', 'This claim is currently awaiting the referred veterinarian’s clinical opinion (claim.vetReview). Final decision controls unlock once the opinion is submitted.')
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 424,
                                        columnNumber: 23
                                    }, this) : null,
                                    [
                                        'submitted',
                                        'manual_review'
                                    ].includes(activeClaim.status) && (!activeClaim.vetId || Boolean(activeClaim.vetOpinion)) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextareaField"], {
                                                label: t('চূড়ান্ত দাবি সিদ্ধান্ত নোট', 'Claim Decision Note'),
                                                value: claimNote,
                                                onChange: (e)=>setClaimNote(e.target.value)
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 435,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap gap-2.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        variant: "primary",
                                                        icon: "check",
                                                        disabled: busy,
                                                        onClick: ()=>void run({
                                                                type: 'claim.decide',
                                                                claimId: activeClaim.id,
                                                                approve: true,
                                                                note: claimNote
                                                            }),
                                                        children: t('দাবি অনুমোদন করুন', 'Approve Claim')
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                        lineNumber: 441,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        variant: "danger",
                                                        icon: "close",
                                                        disabled: busy,
                                                        onClick: ()=>void run({
                                                                type: 'claim.decide',
                                                                claimId: activeClaim.id,
                                                                approve: false,
                                                                note: claimNote
                                                            }),
                                                        children: t('দাবি প্রত্যাখ্যান করুন', 'Reject Claim')
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                        lineNumber: 456,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 440,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 434,
                                        columnNumber: 23
                                    }, this) : null,
                                    activeClaim.status === 'approved' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between gap-3 rounded-[12px] bg-[#EBF4EE] border border-[#D8E9DE] p-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-sm font-bold text-[#0A401E]",
                                                        children: t('পেআউট ও ঋণ সমন্বয়ের জন্য প্রস্তুত', 'Ready for Atomic Payout')
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                        lineNumber: 478,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-xs text-[#0F602D]",
                                                        children: t('এক ক্লিকে ব্যাংকের বকেয়া ঋণ পরিশোধ ও অবশিষ্ট অর্থ খামারির ওয়ালেটে পাঠান।', 'Settle any secured bank debt first and credit the net payout to the farmer.')
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                        lineNumber: 481,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 477,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                variant: "primary",
                                                icon: "wallet",
                                                disabled: busy,
                                                onClick: ()=>void run({
                                                        type: 'claim.pay',
                                                        claimId: activeClaim.id
                                                    }),
                                                children: t('পেআউট সম্পন্ন করুন (Execute Payout)', 'Execute Atomic Payout')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 488,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 476,
                                        columnNumber: 23
                                    }, this) : null
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                lineNumber: 368,
                                columnNumber: 19
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                        lineNumber: 236,
                        columnNumber: 17
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/frontend/web/src/features/insurer.tsx",
                    lineNumber: 235,
                    columnNumber: 15
                }, this)
            }, void 0, false, {
                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                lineNumber: 170,
                columnNumber: 9
            }, this) : null,
            tab === 'policies' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SplitWorkbench"], {
                masterTitle: t('পলিসি আবেদন ও সক্রিয় পলিসি', 'Insurance Policies'),
                masterCount: myPolicies.length,
                masterList: myPolicies.map((pol)=>{
                    const animal = state.animals.find((a)=>a.id === pol.animalId);
                    const farmer = state.users.find((u)=>u.id === pol.farmerId);
                    const selected = activePolicy?.id === pol.id;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setSelectedPolicyId(pol.id),
                        className: `w-full rounded-[12px] border p-3.5 text-left transition-colors cursor-pointer ${selected ? 'border-[#15803D] bg-[#EBF4EE]/60' : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-sm font-bold text-[#1F2937]",
                                        children: animal ? `${animal.name} (${animal.tag})` : pol.animalId
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 528,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        tone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toneForStatus"])(pol.status),
                                        children: pol.status
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 531,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                lineNumber: 527,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xs text-[#64748B] mt-1",
                                children: farmer ? locale === 'bn' ? farmer.nameBn : farmer.name : pol.farmerId
                            }, void 0, false, {
                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                lineNumber: 533,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-2 flex items-center justify-between text-xs font-semibold tabular-nums",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[#0F602D]",
                                        children: [
                                            t('কভারেজ:', 'Coverage:'),
                                            " ",
                                            money(pol.coverage)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 537,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[#475569]",
                                        children: [
                                            t('প্রিমিয়াম:', 'Premium:'),
                                            " ",
                                            money(pol.premium)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 540,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                lineNumber: 536,
                                columnNumber: 17
                            }, this)
                        ]
                    }, pol.id, true, {
                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                        lineNumber: 517,
                        columnNumber: 15
                    }, this);
                }),
                detailPane: !activePolicy ? null : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                    className: "flex flex-col gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-start justify-between border-b border-[#E2E8F0] pb-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-lg font-bold text-[#1F2937]",
                                            children: t('পলিসি আন্ডাররাইটিং বিবরণ', 'Policy Underwriting File')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                            lineNumber: 552,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-[#64748B] tabular-nums",
                                            children: [
                                                "Policy ID: ",
                                                activePolicy.id,
                                                " · ",
                                                date(activePolicy.submittedAt)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                            lineNumber: 555,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                    lineNumber: 551,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        policyAnimal ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "outline",
                                            size: "sm",
                                            onClick: ()=>{
                                                setSelectedPassportAnimalId(policyAnimal.id);
                                                setTab('passport');
                                            },
                                            children: t('স্বাস্থ্য পাসপোর্ট দেখুন', 'Open Health Passport')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                            lineNumber: 561,
                                            columnNumber: 23
                                        }, this) : null,
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                            tone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toneForStatus"])(activePolicy.status),
                                            children: activePolicy.status
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                            lineNumber: 572,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                    lineNumber: 559,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/web/src/features/insurer.tsx",
                            lineNumber: 550,
                            columnNumber: 17
                        }, this),
                        policyAnimal ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between text-sm",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-bold text-[#1F2937]",
                                            children: [
                                                policyAnimal.name,
                                                " (",
                                                policyAnimal.tag,
                                                ") — ",
                                                policyAnimal.breed
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                            lineNumber: 579,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs text-[#64748B]",
                                            children: policyFarmer ? locale === 'bn' ? policyFarmer.nameBn : policyFarmer.name : activePolicy.farmerId
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                            lineNumber: 582,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                    lineNumber: 578,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HealthScoreBar"], {
                                    score: policyAnimal.healthScore
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                    lineNumber: 590,
                                    columnNumber: 21
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/web/src/features/insurer.tsx",
                            lineNumber: 577,
                            columnNumber: 19
                        }, this) : null,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-3 gap-3 text-xs tabular-nums",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-[10px] border border-[#E2E8F0] p-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[#64748B] block",
                                            children: t('কভারেজ', 'Coverage')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                            lineNumber: 596,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            className: "text-sm text-[#1F2937]",
                                            children: money(activePolicy.coverage)
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                            lineNumber: 597,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                    lineNumber: 595,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-[10px] border border-[#E2E8F0] p-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[#64748B] block",
                                            children: t('প্রিমিয়াম', 'Annual Premium')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                            lineNumber: 602,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            className: "text-sm text-[#0F602D]",
                                            children: money(activePolicy.premium)
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                            lineNumber: 603,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                    lineNumber: 601,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-[10px] border border-[#E2E8F0] p-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-[#64748B] block",
                                            children: t('আইওটি ছাড়', 'IoT Tier')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                            lineNumber: 608,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            className: "text-sm text-[#15803D]",
                                            children: activePolicy.enhanced ? 'IoT Verified ✓' : 'Standard'
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                            lineNumber: 609,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                    lineNumber: 607,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/web/src/features/insurer.tsx",
                            lineNumber: 594,
                            columnNumber: 17
                        }, this),
                        activePolicy.status === 'submitted' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col gap-3 border-t border-[#E2E8F0] pt-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextareaField"], {
                                    label: t('আন্ডাররাইটিং নোট', 'Underwriting Note'),
                                    value: policyNote,
                                    onChange: (e)=>setPolicyNote(e.target.value)
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                    lineNumber: 617,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap gap-2.5",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "primary",
                                            icon: "check",
                                            disabled: busy,
                                            onClick: ()=>void run({
                                                    type: 'policy.decide',
                                                    policyId: activePolicy.id,
                                                    approve: true,
                                                    note: policyNote
                                                }),
                                            children: t('পলিসি অনুমোদন ও ইস্যু করুন', 'Approve & Issue Policy')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                            lineNumber: 623,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "danger",
                                            icon: "close",
                                            disabled: busy,
                                            onClick: ()=>void run({
                                                    type: 'policy.decide',
                                                    policyId: activePolicy.id,
                                                    approve: false,
                                                    note: policyNote
                                                }),
                                            children: t('প্রত্যাখ্যান করুন', 'Reject Policy')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                            lineNumber: 638,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                    lineNumber: 622,
                                    columnNumber: 21
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/web/src/features/insurer.tsx",
                            lineNumber: 616,
                            columnNumber: 19
                        }, this) : null
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/web/src/features/insurer.tsx",
                    lineNumber: 549,
                    columnNumber: 15
                }, this)
            }, void 0, false, {
                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                lineNumber: 509,
                columnNumber: 9
            }, this) : null,
            tab === 'passport' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                className: "flex flex-col gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap items-center justify-between gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-base font-bold text-[#1F2937]",
                                        children: t('বীমাকৃত প্রাণীর ডিজিটাল স্বাস্থ্য পাসপোর্ট', 'Insured Animal Digital Health Passport')
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 666,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-[#64748B]",
                                        children: t('পলিসি আন্ডাররাইটিং ও দাবি যাচাইয়ের জন্য প্রাণীর সম্পূর্ণ ক্লিনিক্যাল পাসপোর্ট ও টিকার ইতিহাস।', 'Full clinical history and vaccination records for policy underwriting and claim forensics.')
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 669,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                lineNumber: 665,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-2",
                                children: state.animals.map((a)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>setSelectedPassportAnimalId(a.id),
                                        className: `rounded-full px-3 py-1.5 text-xs font-semibold cursor-pointer ${passportAnimal?.id === a.id ? 'bg-[#15803D] text-white' : 'border border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]'}`,
                                        children: [
                                            a.name,
                                            " (",
                                            a.tag,
                                            ")"
                                        ]
                                    }, a.id, true, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 678,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                lineNumber: 676,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                        lineNumber: 664,
                        columnNumber: 11
                    }, this),
                    passportAnimal ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 md:grid-cols-3 gap-4 rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] p-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-base font-bold text-[#1F2937]",
                                                children: [
                                                    passportAnimal.name,
                                                    " (",
                                                    passportAnimal.tag,
                                                    ")"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 698,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs text-[#64748B]",
                                                children: [
                                                    passportAnimal.breed,
                                                    " · ",
                                                    passportAnimal.sex,
                                                    " · ",
                                                    passportAnimal.weightKg,
                                                    " kg"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 701,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm font-bold text-[#0F602D] mt-1 tabular-nums",
                                                children: [
                                                    t('বাজারমূল্য:', 'Valuation:'),
                                                    " ",
                                                    money(passportAnimal.value)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 704,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 697,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "md:col-span-2 flex flex-col justify-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HealthScoreBar"], {
                                                score: passportAnimal.healthScore,
                                                label: t('ক্লিনিক্যাল স্বাস্থ্য স্কোর', 'Clinical Health Score')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 709,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                        tone: state.records.some((r)=>r.animalId === passportAnimal.id && r.kind === 'vaccination') ? 'success' : 'warning',
                                                        children: state.records.some((r)=>r.animalId === passportAnimal.id && r.kind === 'vaccination') ? t('টিকাপ্রাপ্ত', 'Vaccinated') : t('টিকা বাকি', 'Unvaccinated')
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                        lineNumber: 714,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                        tone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$finance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasIoTEvidence"])(state, passportAnimal.id, state.now) ? 'brand' : 'neutral',
                                                        children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$finance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasIoTEvidence"])(state, passportAnimal.id, state.now) ? t('আইওটি টেলিমেট্রি যাচাইকৃত', 'IoT Telemetry Verified') : t('কলার অফলাইন', 'No Live Collar')
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                        lineNumber: 729,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 713,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 708,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                lineNumber: 696,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "divide-y divide-[#E2E8F0] rounded-[12px] border border-[#E2E8F0]",
                                children: state.records.filter((r)=>r.animalId === passportAnimal.id).map((rec)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-3 flex items-start justify-between gap-3 text-xs",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "font-bold text-[#1F2937]",
                                                        children: [
                                                            rec.title[locale],
                                                            " (",
                                                            rec.kind,
                                                            ")"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                        lineNumber: 750,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-[#475569] mt-0.5",
                                                        children: rec.note
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                        lineNumber: 753,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 749,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-[#64748B] tabular-nums shrink-0",
                                                children: date(rec.createdAt)
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                                lineNumber: 755,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, rec.id, true, {
                                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                        lineNumber: 748,
                                        columnNumber: 21
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                                lineNumber: 744,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/web/src/features/insurer.tsx",
                        lineNumber: 695,
                        columnNumber: 13
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/web/src/features/insurer.tsx",
                lineNumber: 663,
                columnNumber: 9
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/web/src/features/insurer.tsx",
        lineNumber: 114,
        columnNumber: 5
    }, this);
}
_s(InsurerWebFeature, "OmHhMGyzdw9d+Q2uOX2fqdWL5BY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$providers$2f$web$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWebApp"]
    ];
});
_c = InsurerWebFeature;
var _c;
__turbopack_context__.k.register(_c, "InsurerWebFeature");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=frontend_web_src_features_insurer_tsx_20ksgi36rqg6n._.js.map