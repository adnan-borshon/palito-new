(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/frontend/web/src/features/bank.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "BankWebFeature",
    ()=>BankWebFeature
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/frontend/shared/src/index.ts [app-client] (ecmascript) <locals>");
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
function BankWebFeature({ screen, id }) {
    _s();
    const { state, locale, t, money, date, dateTime, run, busy, openMobileHandoff, user } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$providers$2f$web$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWebApp"])();
    const myLoans = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "BankWebFeature.useMemo[myLoans]": ()=>state.loans.filter({
                "BankWebFeature.useMemo[myLoans]": (l)=>!user?.id || user.role !== 'bank' || l.bankId === user.id
            }["BankWebFeature.useMemo[myLoans]"])
    }["BankWebFeature.useMemo[myLoans]"], [
        state.loans,
        user?.id,
        user?.role
    ]);
    const [tab, setTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(screen === 'loans' ? 'portfolio' : screen === 'settlements' ? 'settlements' : screen === 'passport' ? 'passport' : 'underwriting');
    const [statusFilter, setStatusFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('all');
    const [searchQuery, setSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [selectedLoanId, setSelectedLoanId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(screen !== 'passport' ? id ?? myLoans[0]?.id ?? '' : myLoans[0]?.id ?? '');
    const [selectedPassportAnimalId, setSelectedPassportAnimalId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(screen === 'passport' && id ? id : '');
    const [decisionNote, setDecisionNote] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [graceDays, setGraceDays] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('14');
    const [graceNote, setGraceNote] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('Seasonal feed & milk collection cycle extension');
    const loans = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "BankWebFeature.useMemo[loans]": ()=>{
            return myLoans.filter({
                "BankWebFeature.useMemo[loans]": (loan)=>{
                    if (statusFilter !== 'all' && loan.status !== statusFilter) return false;
                    if (!searchQuery.trim()) return true;
                    const q = searchQuery.toLowerCase();
                    const animal = state.animals.find({
                        "BankWebFeature.useMemo[loans].animal": (a)=>a.id === loan.animalId
                    }["BankWebFeature.useMemo[loans].animal"]);
                    const farmer = state.users.find({
                        "BankWebFeature.useMemo[loans].farmer": (u)=>u.id === loan.farmerId
                    }["BankWebFeature.useMemo[loans].farmer"]);
                    return loan.id.toLowerCase().includes(q) || loan.purpose.toLowerCase().includes(q) || animal?.name.toLowerCase().includes(q) || animal?.tag.toLowerCase().includes(q) || farmer?.name.toLowerCase().includes(q) || farmer?.nameBn.includes(q);
                }
            }["BankWebFeature.useMemo[loans]"]);
        }
    }["BankWebFeature.useMemo[loans]"], [
        myLoans,
        state.animals,
        state.users,
        statusFilter,
        searchQuery
    ]);
    const activeLoan = myLoans.find((l)=>l.id === selectedLoanId) ?? loans[0] ?? myLoans[0];
    const collateralAnimal = activeLoan ? state.animals.find((a)=>a.id === activeLoan.animalId) : undefined;
    const passportAnimal = state.animals.find((a)=>a.id === selectedPassportAnimalId) ?? collateralAnimal ?? state.animals[0];
    const borrower = activeLoan ? state.users.find((u)=>u.id === activeLoan.farmerId) : undefined;
    const borrowerFarm = borrower ? state.farms.find((f)=>f.ownerId === borrower.id) : undefined;
    const collar = collateralAnimal ? state.devices.find((d)=>d.animalId === collateralAnimal.id) : undefined;
    const animalPolicy = collateralAnimal ? state.policies.find((p)=>p.animalId === collateralAnimal.id && p.status === 'active') : undefined;
    const animalRecords = collateralAnimal ? state.records.filter((r)=>r.animalId === collateralAnimal.id) : [];
    const loanPayments = activeLoan ? state.payments.filter((p)=>p.referenceId === activeLoan.id) : [];
    const submittedCount = myLoans.filter((l)=>l.status === 'submitted').length;
    const activeBookTotal = myLoans.filter((l)=>[
            'active',
            'approved'
        ].includes(l.status)).reduce((sum, l)=>sum + l.outstanding, 0);
    const settledClaims = state.claims.filter((c)=>c.status === 'paid' && (c.debtSettlement ?? 0) > 0 && myLoans.some((l)=>l.animalId === c.animalId));
    const totalDebtSettled = settledClaims.reduce((sum, c)=>sum + (c.debtSettlement ?? 0), 0);
    const maxAllowedLtv = collateralAnimal ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["maximumLoanAmount"])(collateralAnimal.value) : activeLoan ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$validation$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["maximumLoanAmount"])(activeLoan.collateralValue) : 0;
    const quote = collateralAnimal ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$finance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["demoLoanQuote"])(collateralAnimal) : null;
    const ltvRatio = activeLoan && activeLoan.collateralValue > 0 ? Math.round(activeLoan.amount / activeLoan.collateralValue * 100) : 0;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col gap-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KpiCard"], {
                        label: t('অপেক্ষমাণ ঋণ আবেদন', 'Pending Underwriting'),
                        value: submittedCount,
                        hint: t('সিদ্ধান্তের অপেক্ষায় থাকা আবেদন', 'Applications awaiting bank decision'),
                        tone: submittedCount > 0 ? 'warning' : 'brand',
                        icon: "file-check"
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                        lineNumber: 135,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KpiCard"], {
                        label: t('সক্রিয় ঋণ পোর্টফোলিও', 'Active Loan Book'),
                        value: money(activeBookTotal),
                        hint: t('মোট বকেয়া আসল', 'Total outstanding principal'),
                        tone: "brand",
                        icon: "landmark"
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                        lineNumber: 142,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KpiCard"], {
                        label: t('সর্বোচ্চ জামানত সীমা (UC-003)', 'Max Collateral LTV Policy'),
                        value: "70%",
                        hint: t('যাচাইকৃত প্রাণী মূল্যের ৭০% পর্যন্ত', 'Strict cap on verified livestock value'),
                        tone: "info",
                        icon: "shield-check"
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                        lineNumber: 149,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KpiCard"], {
                        label: t('বীমা থেকে স্বয়ংক্রিয় সমন্বয়', 'Insurance Debt Settlements'),
                        value: money(totalDebtSettled),
                        hint: t('UC-002 ডেট-ফার্স্ট দাবি নিষ্পত্তি', 'Settled automatically from claims'),
                        tone: "success",
                        icon: "check"
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                        lineNumber: 156,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/web/src/features/bank.tsx",
                lineNumber: 134,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "rounded-[14px] border border-[#D8E9DE] bg-[#EBF4EE]/75 px-4 py-3 flex flex-wrap items-center justify-between gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2.5 text-sm font-medium text-[#0A401E]",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WebIcon"], {
                                name: "shield-check",
                                className: "w-5 h-5 text-[#15803D] shrink-0"
                            }, void 0, false, {
                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                lineNumber: 168,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: t('স্বাস্থ্য স্কোর ৭৫+ প্রাণীর জন্য ১০% বার্ষিক সুদ (সর্বোচ্চ ৬০% LTV); ৭৫-এর নিচে হলে ৮০% সমন্বিত মূল্যায়ন ও ১৫% সুদ প্রযোজ্য।', 'Livestock with verified Health Score 75+ qualify for the 10% annual rate (up to 60% LTV); scores below 75 use 80% adjusted valuation at 15% APR.')
                            }, void 0, false, {
                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                lineNumber: 169,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                        lineNumber: 167,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                        variant: "outline",
                        size: "sm",
                        icon: "smartphone",
                        onClick: ()=>openMobileHandoff({
                                role: 'bank',
                                screen: screen || 'home',
                                id: activeLoan?.id,
                                title: t('ব্যাংক আন্ডাররাইটিং ডেস্ক', 'Bank Underwriting Desk')
                            }),
                        children: t('মোবাইল ভিউ লিংক', 'Mobile View Link')
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                        lineNumber: 176,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/web/src/features/bank.tsx",
                lineNumber: 166,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsBar"], {
                ariaLabel: t('ব্যাংক ওয়ার্কবেঞ্চ ট্যাব', 'Bank workbench sections'),
                active: tab,
                onChange: setTab,
                tabs: [
                    {
                        id: 'underwriting',
                        label: t('আন্ডাররাইটিং ও জামানত যাচাই কিউ', 'Underwriting & Collateral Queue'),
                        count: myLoans.length
                    },
                    {
                        id: 'portfolio',
                        label: t('সক্রিয় ঋণ ও কিস্তি সূচি টেবিল', 'Loan Portfolio & Grace Schedule'),
                        count: myLoans.filter((l)=>[
                                'active',
                                'approved',
                                'paid'
                            ].includes(l.status)).length
                    },
                    {
                        id: 'settlements',
                        label: t('বীমা দাবি থেকে ঋণ সমন্বয় (UC-002)', 'Collateral Insurance Settlements'),
                        count: settledClaims.length
                    },
                    {
                        id: 'passport',
                        label: t('ডিজিটাল স্বাস্থ্য পাসপোর্ট', 'Collateral Health Passport'),
                        count: state.animals.length
                    }
                ]
            }, void 0, false, {
                fileName: "[project]/frontend/web/src/features/bank.tsx",
                lineNumber: 194,
                columnNumber: 7
            }, this),
            tab === 'underwriting' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SplitWorkbench"], {
                masterTitle: t('ঋণ আবেদন ও ফাইল তালিকা', 'Loan Applications & Files'),
                masterCount: loans.length,
                masterToolbar: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-2.5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                            label: t('খামারি, প্রাণী ট্যাগ বা উদ্দেশ্য খুঁজুন', 'Search borrower, tag, or purpose'),
                            value: searchQuery,
                            onChange: (e)=>setSearchQuery(e.target.value),
                            placeholder: t('যেমন: লালু, BL-101, দুগ্ধ...', 'e.g., Lalu, BL-101, Dairy...')
                        }, void 0, false, {
                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                            lineNumber: 229,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap gap-1.5",
                            children: [
                                'all',
                                'submitted',
                                'approved',
                                'active',
                                'settled',
                                'rejected'
                            ].map((st)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>setStatusFilter(st),
                                    className: `rounded-full px-2.5 py-1 text-xs font-semibold cursor-pointer ${statusFilter === st ? 'bg-[#15803D] text-white' : 'bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0]'}`,
                                    children: st === 'all' ? t('সব', 'All') : st
                                }, st, false, {
                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                    lineNumber: 238,
                                    columnNumber: 21
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                            lineNumber: 235,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                    lineNumber: 228,
                    columnNumber: 13
                }, this),
                masterList: loans.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EmptyWorkspaceState"], {
                    title: t('কোনো ঋণ ফাইল পাওয়া যায়নি', 'No matching loan applications'),
                    description: t('ফিল্টার পরিবর্তন করে আবার দেখুন।', 'Try clearing your search or status filter.')
                }, void 0, false, {
                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                    lineNumber: 257,
                    columnNumber: 15
                }, this) : loans.map((loan)=>{
                    const animal = state.animals.find((a)=>a.id === loan.animalId);
                    const farmer = state.users.find((u)=>u.id === loan.farmerId);
                    const selected = activeLoan?.id === loan.id;
                    const itemLtv = loan.collateralValue > 0 ? Math.round(loan.amount / loan.collateralValue * 100) : 0;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        onClick: ()=>setSelectedLoanId(loan.id),
                        className: `w-full rounded-[12px] border p-3.5 text-left transition-colors cursor-pointer ${selected ? 'border-[#15803D] bg-[#EBF4EE]/60' : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'}`,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-start justify-between gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm font-bold text-[#1F2937]",
                                                children: farmer ? locale === 'bn' ? farmer.nameBn : farmer.name : loan.farmerId
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                lineNumber: 286,
                                                columnNumber: 25
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-xs text-[#64748B]",
                                                children: [
                                                    animal ? `${animal.name} (${animal.tag})` : loan.animalId,
                                                    " ·",
                                                    ' ',
                                                    loan.purpose
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                lineNumber: 293,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                        lineNumber: 285,
                                        columnNumber: 23
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        tone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toneForStatus"])(loan.status),
                                        children: loan.status
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                        lineNumber: 298,
                                        columnNumber: 23
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                lineNumber: 284,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-2.5 flex items-center justify-between text-xs font-semibold tabular-nums",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[#0F602D]",
                                        children: [
                                            t('আবেদন:', 'Principal:'),
                                            " ",
                                            money(loan.amount)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                        lineNumber: 301,
                                        columnNumber: 23
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-[#475569]",
                                        children: [
                                            "LTV: ",
                                            itemLtv,
                                            "% · ",
                                            loan.termMonths,
                                            "m"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                        lineNumber: 304,
                                        columnNumber: 23
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                lineNumber: 300,
                                columnNumber: 21
                            }, this)
                        ]
                    }, loan.id, true, {
                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                        lineNumber: 274,
                        columnNumber: 19
                    }, this);
                }),
                detailPane: !activeLoan ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EmptyWorkspaceState"], {
                    title: t('একটি ঋণ আবেদন নির্বাচন করুন', 'Select a loan application'),
                    description: t('বাম পাশের তালিকা থেকে যেকোনো ঋণ ফাইল নির্বাচন করে বিস্তারিত যাচাই করুন।', 'Choose a loan from the queue to inspect the Animal Health Passport and LTV compliance.')
                }, void 0, false, {
                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                    lineNumber: 315,
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
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                            className: "text-lg font-bold text-[#1F2937]",
                                                            children: t('ঋণ ফাইল ও জামানত মূল্যায়ন', 'Loan File & Collateral Underwriting')
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                            lineNumber: 329,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                            tone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toneForStatus"])(activeLoan.status),
                                                            children: activeLoan.status
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                            lineNumber: 332,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 328,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-[#64748B] mt-0.5 tabular-nums",
                                                    children: [
                                                        "ID: ",
                                                        activeLoan.id,
                                                        " · ",
                                                        t('তৈরির তারিখ:', 'Created:'),
                                                        ' ',
                                                        dateTime(activeLoan.createdAt)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 336,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                            lineNumber: 327,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-right tabular-nums",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-xs text-[#64748B]",
                                                    children: t('আবেদনকৃত ঋণের পরিমাণ', 'Requested Principal')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 342,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-2xl font-bold text-[#0F602D]",
                                                    children: money(activeLoan.amount)
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 345,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                            lineNumber: 341,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                    lineNumber: 326,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-[12px] border border-[#D8E9DE] bg-[#EBF4EE]/55 p-4 flex flex-col gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center justify-between text-sm font-bold text-[#0A401E]",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    children: t('৭০% জামানত সীমা যাচাই (UC-003 LTV Check)', '70% Collateral LTV Cap Verification (UC-003)')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 354,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "tabular-nums",
                                                    children: [
                                                        ltvRatio,
                                                        "% / 70% Max"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 360,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                            lineNumber: 353,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "h-2.5 w-full rounded-full bg-white overflow-hidden border border-[#D8E9DE]",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `h-full rounded-full ${activeLoan.amount <= maxAllowedLtv ? 'bg-[#15803D]' : 'bg-[#BE123C]'}`,
                                                style: {
                                                    width: `${Math.min(100, Math.round(ltvRatio / 70 * 100))}%`
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                lineNumber: 365,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                            lineNumber: 364,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs tabular-nums",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[#64748B] block",
                                                            children: t('প্রাণীর যাচাইকৃত মূল্য', 'Verified Valuation')
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                            lineNumber: 376,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            className: "text-[#1F2937] text-sm",
                                                            children: money(activeLoan.collateralValue)
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                            lineNumber: 379,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 375,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[#64748B] block",
                                                            children: t('সর্বোচ্চ অনুমোদনযোগ্য (৭০%)', 'Max Eligible (70%)')
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                            lineNumber: 384,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            className: "text-[#15803D] text-sm",
                                                            children: money(maxAllowedLtv)
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                            lineNumber: 387,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 383,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[#64748B] block",
                                                            children: t('বার্ষিক সুদ ও মেয়াদ', 'Annual Rate & Term')
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                            lineNumber: 392,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            className: "text-[#1F2937] text-sm",
                                                            children: [
                                                                activeLoan.annualRate,
                                                                "% · ",
                                                                activeLoan.termMonths,
                                                                "m"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                            lineNumber: 395,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 391,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-[#64748B] block",
                                                            children: t('মাসিক কিস্তি (প্রাক্কলিত)', 'Est. Monthly Installment')
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                            lineNumber: 400,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                            className: "text-[#1F2937] text-sm",
                                                            children: money(Math.ceil(activeLoan.amount * (1 + activeLoan.annualRate / 100 * (activeLoan.termMonths / 12)) / activeLoan.termMonths))
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                            lineNumber: 403,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 399,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                            lineNumber: 374,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                    lineNumber: 352,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-[12px] border border-[#E2E8F0] p-3.5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-xs font-semibold text-[#64748B]",
                                                    children: t('ঋণগ্রহীতা খামারির বিবরণ', 'Borrower Details')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 419,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "font-bold text-[#1F2937] mt-1",
                                                    children: borrower ? locale === 'bn' ? borrower.nameBn : borrower.name : activeLoan.farmerId
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 422,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-xs text-[#475569] mt-0.5 tabular-nums",
                                                    children: [
                                                        borrower?.phone,
                                                        " · ",
                                                        borrowerFarm?.name ?? borrower?.district
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 429,
                                                    columnNumber: 23
                                                }, this),
                                                borrowerFarm ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-xs text-[#64748B] mt-0.5",
                                                    children: [
                                                        borrowerFarm.address,
                                                        " (",
                                                        borrowerFarm.size,
                                                        ' ',
                                                        t('টি প্রাণী', 'animals'),
                                                        ")"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 433,
                                                    columnNumber: 25
                                                }, this) : null
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                            lineNumber: 418,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "rounded-[12px] border border-[#E2E8F0] p-3.5",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-xs font-semibold text-[#64748B]",
                                                    children: t('ঋণের উদ্দেশ্য ও পরিশোধের উৎস', 'Loan Purpose & Repayment Source')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 441,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "font-bold text-[#1F2937] mt-1",
                                                    children: activeLoan.purpose
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 444,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-xs text-[#475569] mt-0.5",
                                                    children: [
                                                        t('পরিশোধের উৎস:', 'Repayment source:'),
                                                        " ",
                                                        activeLoan.repaymentSource
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 445,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-xs text-[#0F602D] font-semibold mt-1 tabular-nums",
                                                    children: [
                                                        t('বর্তমান বকেয়া:', 'Current Outstanding:'),
                                                        ' ',
                                                        money(activeLoan.outstanding)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 448,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                            lineNumber: 440,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                    lineNumber: 417,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                            lineNumber: 325,
                            columnNumber: 17
                        }, this),
                        collateralAnimal ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            className: "text-base font-bold text-[#1F2937]",
                                            children: t('জামানত প্রাণীর ডিজিটাল স্বাস্থ্য পাসপোর্ট', 'Collateral Animal Digital Health Passport')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                            lineNumber: 460,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-2",
                                            children: [
                                                (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$shared$2f$src$2f$finance$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasIoTEvidence"])(state, collateralAnimal.id, state.now) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    tone: "brand",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["WebIcon"], {
                                                            name: "radio",
                                                            className: "w-3.5 h-3.5"
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                            lineNumber: 469,
                                                            columnNumber: 29
                                                        }, this),
                                                        t('আইওটি টেলিমেট্রি সক্রিয়', 'IoT Telemetry Verified')
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 468,
                                                    columnNumber: 27
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    tone: "warning",
                                                    children: t('কলার অফলাইন', 'No Live Collar')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 473,
                                                    columnNumber: 27
                                                }, this),
                                                animalPolicy ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                    tone: "success",
                                                    children: t('বীমাকৃত জামানত', 'Insured Collateral')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 478,
                                                    columnNumber: 27
                                                }, this) : null,
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    variant: "outline",
                                                    size: "sm",
                                                    onClick: ()=>{
                                                        setSelectedPassportAnimalId(collateralAnimal.id);
                                                        setTab('passport');
                                                    },
                                                    children: t('সম্পূর্ণ পাসপোর্ট দেখুন', 'Open Full Passport')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 482,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                            lineNumber: 466,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                    lineNumber: 459,
                                    columnNumber: 21
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "grid grid-cols-1 sm:grid-cols-3 gap-4 items-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                    src: "/images/cow.jpg",
                                                    alt: collateralAnimal.name,
                                                    className: "w-16 h-16 rounded-[12px] object-cover border border-[#E2E8F0]"
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 497,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-base font-bold text-[#1F2937]",
                                                            children: collateralAnimal.name
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                            lineNumber: 503,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-xs text-[#64748B] tabular-nums",
                                                            children: [
                                                                collateralAnimal.tag,
                                                                " · ",
                                                                collateralAnimal.breed
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                            lineNumber: 506,
                                                            columnNumber: 27
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-xs font-semibold text-[#0F602D] tabular-nums mt-0.5",
                                                            children: [
                                                                collateralAnimal.weightKg,
                                                                " kg · ",
                                                                money(collateralAnimal.value)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                            lineNumber: 509,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 502,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                            lineNumber: 496,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "sm:col-span-2 flex flex-col gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HealthScoreBar"], {
                                                    score: collateralAnimal.healthScore,
                                                    label: t('ক্লিনিক্যাল স্বাস্থ্য স্কোর', 'Clinical Health Score')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 516,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-wrap gap-3 text-xs text-[#475569] tabular-nums",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: [
                                                                t('টিকা ও চেকআপ রেকর্ড:', 'Health Records:'),
                                                                ' ',
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: animalRecords.length
                                                                }, void 0, false, {
                                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                                    lineNumber: 523,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                            lineNumber: 521,
                                                            columnNumber: 27
                                                        }, this),
                                                        collar && collar.readings[0] ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            children: [
                                                                t('সর্বশেষ তাপমাত্রা:', 'Last Temp:'),
                                                                ' ',
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: [
                                                                        collar.readings[0].temperature,
                                                                        "°C"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                                    lineNumber: 528,
                                                                    columnNumber: 31
                                                                }, this),
                                                                " · HR:",
                                                                ' ',
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                    children: [
                                                                        collar.readings[0].heartRate,
                                                                        " bpm"
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                                    lineNumber: 529,
                                                                    columnNumber: 31
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                            lineNumber: 526,
                                                            columnNumber: 29
                                                        }, this) : null
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 520,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                            lineNumber: 515,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                    lineNumber: 495,
                                    columnNumber: 21
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                            lineNumber: 458,
                            columnNumber: 19
                        }, this) : null,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                            className: "flex flex-col gap-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                    className: "text-base font-bold text-[#1F2937]",
                                    children: t('ব্যাংক আন্ডাররাইটিং সিদ্ধান্ত ও পদক্ষেপ', 'Bank Underwriting Actions')
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                    lineNumber: 540,
                                    columnNumber: 19
                                }, this),
                                activeLoan.status === 'submitted' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TextareaField"], {
                                            label: t('আন্ডাররাইটিং নোট / শর্তাবলি', 'Underwriting Decision Note'),
                                            value: decisionNote,
                                            onChange: (e)=>setDecisionNote(e.target.value),
                                            placeholder: t('যেমন: স্বাস্থ্য পাসপোর্ট ও ৭০% এলটিভি যাচাই সম্পন্ন...', 'e.g., Verified digital health passport and 70% collateral cap compliance...')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                            lineNumber: 546,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap gap-3",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    variant: "primary",
                                                    icon: "check",
                                                    disabled: busy,
                                                    onClick: ()=>void run({
                                                            type: 'loan.decide',
                                                            loanId: activeLoan.id,
                                                            approve: true,
                                                            note: decisionNote.trim() || 'Approved after health passport and 70% LTV verification.'
                                                        }),
                                                    children: t('ঋণ অনুমোদন করুন', 'Approve Loan Application')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 556,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    variant: "danger",
                                                    icon: "close",
                                                    disabled: busy,
                                                    onClick: ()=>void run({
                                                            type: 'loan.decide',
                                                            loanId: activeLoan.id,
                                                            approve: false,
                                                            note: decisionNote.trim() || 'Declined during collateral underwriting review.'
                                                        }),
                                                    children: t('প্রত্যাখ্যান করুন', 'Reject Application')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 573,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                            lineNumber: 555,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                    lineNumber: 545,
                                    columnNumber: 21
                                }, this) : null,
                                activeLoan.status === 'approved' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-center justify-between gap-3 rounded-[12px] bg-[#EBF4EE] border border-[#D8E9DE] p-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-sm font-bold text-[#0A401E]",
                                                    children: t('ঋণ বিতরণের জন্য প্রস্তুত', 'Ready for Disbursement')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 597,
                                                    columnNumber: 25
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "text-xs text-[#0F602D]",
                                                    children: t('অনুমোদিত অর্থ খামারির পালিতো ওয়ালেটে তাৎক্ষণিকভাবে স্থানান্তর করুন।', 'Disburse approved funds directly into the borrower’s Palito wallet.')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 600,
                                                    columnNumber: 25
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                            lineNumber: 596,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "primary",
                                            icon: "landmark",
                                            disabled: busy,
                                            onClick: ()=>void run({
                                                    type: 'loan.disburse',
                                                    loanId: activeLoan.id
                                                }),
                                            children: t('তহবিল বিতরণ করুন (Disburse)', 'Disburse Loan Funds')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                            lineNumber: 607,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                    lineNumber: 595,
                                    columnNumber: 21
                                }, this) : null,
                                activeLoan.status === 'active' ? collateralAnimal?.productionDrop && !activeLoan.graceUntil ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-1 sm:grid-cols-3 gap-3 items-end",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                    label: t('গ্রেস পিরিয়ড (দিন)', 'Grace Extension (Days)'),
                                                    type: "number",
                                                    value: graceDays,
                                                    onChange: (e)=>setGraceDays(e.target.value)
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 624,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "sm:col-span-2",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Field"], {
                                                        label: t('মেয়াদ বৃদ্ধির কারণ', 'Grace Period Reason'),
                                                        value: graceNote,
                                                        onChange: (e)=>setGraceNote(e.target.value)
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                        lineNumber: 631,
                                                        columnNumber: 29
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 630,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                            lineNumber: 623,
                                            columnNumber: 25
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex flex-wrap items-center justify-between gap-2",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "text-xs text-[#64748B] tabular-nums",
                                                    children: activeLoan.dueAt ? `${t('পরবর্তী কিস্তির তারিখ:', 'Due Date:')} ${date(activeLoan.dueAt)}` : ''
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 639,
                                                    columnNumber: 27
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                    variant: "secondary",
                                                    icon: "clock",
                                                    disabled: busy,
                                                    onClick: ()=>void run({
                                                            type: 'loan.grace',
                                                            loanId: activeLoan.id,
                                                            days: Math.max(1, Number(graceDays) || 14),
                                                            note: graceNote
                                                        }),
                                                    children: t('গ্রেস পিরিয়ড মঞ্জুর করুন (UC-003)', 'Grant Grace Period (UC-003)')
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 644,
                                                    columnNumber: 27
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                            lineNumber: 638,
                                            columnNumber: 25
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                    lineNumber: 622,
                                    columnNumber: 23
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-3 text-xs text-[#475569]",
                                    children: activeLoan.graceUntil ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: [
                                            t('গ্রেস পিরিয়ড ইতিমধ্যে সক্রিয় — মেয়াদ:', 'Grace period active until:'),
                                            ' ',
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                children: date(activeLoan.graceUntil)
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                lineNumber: 666,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                        lineNumber: 664,
                                        columnNumber: 27
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: t('কিস্তি বিরতি (UC-003) শুধুমাত্র তখনই প্রযোজ্য যখন জামানত প্রাণীর যাচাইকৃত অসুস্থতা বা দুধ উৎপাদন হ্রাস (productionDrop) শনাক্ত হয়।', 'Installment grace extension (UC-003) is unlocked only when verified illness or milk production drop (productionDrop) is active on the collateral animal.')
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                        lineNumber: 669,
                                        columnNumber: 27
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                    lineNumber: 662,
                                    columnNumber: 23
                                }, this) : null,
                                [
                                    'offered',
                                    'paid',
                                    'settled',
                                    'rejected'
                                ].includes(activeLoan.status) ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "text-sm text-[#475569]",
                                    children: [
                                        t('বর্তমান অবস্থা:', 'Current file status:'),
                                        ' ',
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            className: "text-[#1F2937]",
                                            children: activeLoan.status
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                            lineNumber: 683,
                                            columnNumber: 23
                                        }, this),
                                        activeLoan.decisionNote ? ` — ${activeLoan.decisionNote}` : ''
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                    lineNumber: 681,
                                    columnNumber: 21
                                }, this) : null,
                                loanPayments.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "border-t border-[#E2E8F0] pt-3 flex flex-col gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "text-xs font-bold uppercase tracking-wider text-[#64748B]",
                                            children: t('ঋণ লেনদেন ও পরিশোধ খতিয়ান', 'Loan Disbursement & Repayment Ledger')
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                            lineNumber: 690,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "divide-y divide-[#E2E8F0] rounded-[10px] border border-[#E2E8F0] bg-white",
                                            children: loanPayments.map((pmt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex items-center justify-between px-3 py-2 text-xs tabular-nums",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "font-semibold text-[#1F2937]",
                                                                    children: pmt.kind
                                                                }, void 0, false, {
                                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                                    lineNumber: 700,
                                                                    columnNumber: 31
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[#64748B] ml-2",
                                                                    children: [
                                                                        pmt.direction.toUpperCase(),
                                                                        " · ",
                                                                        pmt.id
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                                    lineNumber: 701,
                                                                    columnNumber: 31
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                            lineNumber: 699,
                                                            columnNumber: 29
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "font-bold text-[#0F602D]",
                                                            children: [
                                                                money(pmt.amount),
                                                                " · ",
                                                                date(pmt.createdAt)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                            lineNumber: 705,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, pmt.id, true, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 695,
                                                    columnNumber: 27
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                            lineNumber: 693,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                    lineNumber: 689,
                                    columnNumber: 21
                                }, this) : null
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                            lineNumber: 539,
                            columnNumber: 17
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                    lineNumber: 323,
                    columnNumber: 15
                }, this)
            }, void 0, false, {
                fileName: "[project]/frontend/web/src/features/bank.tsx",
                lineNumber: 224,
                columnNumber: 9
            }, this) : null,
            tab === 'portfolio' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                className: "p-0 overflow-hidden",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-base font-bold text-[#1F2937]",
                                children: t('সক্রিয় ঋণ পোর্টফোলিও ও পরিশোধ সূচি', 'Active Loan Book & Repayment Schedule')
                            }, void 0, false, {
                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                lineNumber: 723,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                tone: "brand",
                                className: "tabular-nums",
                                children: [
                                    myLoans.length,
                                    " ",
                                    t('টি ফাইল', 'Files')
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                lineNumber: 726,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                        lineNumber: 722,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        tabIndex: 0,
                        role: "region",
                        "aria-label": t('ঋণ পোর্টফোলিও টেবিল', 'Loan portfolio table'),
                        className: "palito-table-region",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
                            className: "text-left text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                        className: "border-b border-[#E2E8F0] text-xs font-semibold text-[#64748B]",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "px-5 py-3",
                                                children: t('খামারি ও প্রাণী', 'Borrower & Animal')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                lineNumber: 739,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "px-4 py-3",
                                                children: t('জামানত মূল্য', 'Collateral Value')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                lineNumber: 740,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "px-4 py-3",
                                                children: t('ঋণের পরিমাণ', 'Principal')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                lineNumber: 741,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "px-4 py-3",
                                                children: t('বকেয়া', 'Outstanding')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                lineNumber: 742,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "px-4 py-3",
                                                children: t('সুদ ও মেয়াদ', 'Rate & Term')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                lineNumber: 743,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "px-4 py-3",
                                                children: t('অবস্থা', 'Status')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                lineNumber: 744,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                className: "px-5 py-3 text-right",
                                                children: t('পদক্ষেপ', 'Action')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                lineNumber: 745,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                        lineNumber: 738,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                    lineNumber: 737,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
                                    className: "divide-y divide-[#E2E8F0]",
                                    children: myLoans.map((loan)=>{
                                        const farmer = state.users.find((u)=>u.id === loan.farmerId);
                                        const animal = state.animals.find((a)=>a.id === loan.animalId);
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
                                            className: "hover:bg-[#F8FAFC]",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
                                                    className: "px-5 py-3.5 font-semibold text-[#1F2937]",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: farmer ? locale === 'bn' ? farmer.nameBn : farmer.name : loan.farmerId
                                                        }, void 0, false, {
                                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                            lineNumber: 755,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-xs font-normal text-[#64748B]",
                                                            children: [
                                                                animal ? `${animal.name} (${animal.tag})` : loan.animalId,
                                                                " ·",
                                                                ' ',
                                                                loan.purpose
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                            lineNumber: 762,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 754,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 py-3.5 tabular-nums",
                                                    children: money(loan.collateralValue)
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 767,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 py-3.5 font-semibold text-[#0F602D] tabular-nums",
                                                    children: money(loan.amount)
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 768,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 py-3.5 font-semibold tabular-nums",
                                                    children: money(loan.outstanding)
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 771,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 py-3.5 tabular-nums",
                                                    children: [
                                                        loan.annualRate,
                                                        "% · ",
                                                        loan.termMonths,
                                                        "m"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 774,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-4 py-3.5",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                        tone: (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toneForStatus"])(loan.status),
                                                        children: loan.status
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                        lineNumber: 778,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 777,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
                                                    className: "px-5 py-3.5 text-right",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        variant: "outline",
                                                        size: "sm",
                                                        onClick: ()=>{
                                                            setSelectedLoanId(loan.id);
                                                            setTab('underwriting');
                                                        },
                                                        children: t('বিস্তারিত', 'Inspect')
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                        lineNumber: 781,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                    lineNumber: 780,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, loan.id, true, {
                                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                                            lineNumber: 753,
                                            columnNumber: 21
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                    lineNumber: 748,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                            lineNumber: 736,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                        lineNumber: 730,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/web/src/features/bank.tsx",
                lineNumber: 721,
                columnNumber: 9
            }, this) : null,
            tab === 'settlements' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                className: "flex flex-col gap-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-base font-bold text-[#1F2937]",
                                    children: t('জামানত বীমা দাবি থেকে স্বয়ংক্রিয় ঋণ সমন্বয় (UC-002)', 'Collateral Insurance Debt-First Settlements (UC-002)')
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                    lineNumber: 805,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-[#64748B]",
                                    children: t('জামানতকৃত প্রাণীর মৃত্যু বা দাবির ক্ষেত্রে প্রথমে ব্যাংকের বকেয়া ঋণ পরিশোধিত হয় এবং অবশিষ্ট অর্থ খামারির ওয়ালেটে জমা হয়।', 'When a claim is paid on a pledged animal, outstanding bank debt is settled first before crediting the remainder to the farmer.')
                                }, void 0, false, {
                                    fileName: "[project]/frontend/web/src/features/bank.tsx",
                                    lineNumber: 811,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/frontend/web/src/features/bank.tsx",
                            lineNumber: 804,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                        lineNumber: 803,
                        columnNumber: 11
                    }, this),
                    settledClaims.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EmptyWorkspaceState"], {
                        title: t('এখনো কোনো বীমা-ঋণ সমন্বয় হয়নি', 'No collateral claim settlements yet'),
                        description: t('বীমা প্রতিষ্ঠান কোনো জামানতকৃত প্রাণীর দাবি পরিশোধ করলে এখানে স্বয়ংক্রিয় হিসাব দেখা যাবে।', 'Once the insurer executes payout on a pledged animal claim, the debt-first split appears here automatically.')
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                        lineNumber: 821,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 md:grid-cols-2 gap-4",
                        children: settledClaims.map((claim)=>{
                            const animal = state.animals.find((a)=>a.id === claim.animalId);
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "rounded-[14px] border border-[#D8E9DE] bg-[#EBF4EE]/55 p-4 flex flex-col gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-sm font-bold text-[#0A401E]",
                                                children: animal ? `${animal.name} (${animal.tag})` : claim.animalId
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                lineNumber: 838,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                tone: "success",
                                                children: t('সমন্বয়কৃত', 'Settled')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                lineNumber: 841,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                        lineNumber: 837,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-3 gap-2 pt-2 text-xs tabular-nums",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[#64748B] block",
                                                        children: t('মোট বীমা পেআউট', 'Total Claim Payout')
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                        lineNumber: 845,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        className: "text-sm text-[#1F2937]",
                                                        children: money(claim.payout ?? claim.amount)
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                        lineNumber: 848,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                lineNumber: 844,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[#64748B] block",
                                                        children: t('ব্যাংক ঋণ কর্তন', 'Bank Debt Settled')
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                        lineNumber: 853,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        className: "text-sm text-[#15803D]",
                                                        children: money(claim.debtSettlement ?? 0)
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                        lineNumber: 856,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                lineNumber: 852,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-[#64748B] block",
                                                        children: t('খামারির প্রাপ্য', 'Farmer Net Credit')
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                        lineNumber: 861,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                        className: "text-sm text-[#0F602D]",
                                                        children: money(claim.farmerPayout ?? 0)
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                        lineNumber: 864,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                lineNumber: 860,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                        lineNumber: 843,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, claim.id, true, {
                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                lineNumber: 833,
                                columnNumber: 19
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                        lineNumber: 829,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/web/src/features/bank.tsx",
                lineNumber: 802,
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
                                        children: t('জামানত প্রাণীর ডিজিটাল স্বাস্থ্য পাসপোর্ট', 'Collateral Animal Digital Health Passport')
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                        lineNumber: 881,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-[#64748B]",
                                        children: t('প্রাণীর ক্লিনিক্যাল ইতিহাস, ৭-দিনের আইওটি টেলিমেট্রি এবং ভ্যাকসিনেশন রেকর্ড যাচাই করুন।', 'Inspect complete clinical history, 7-day IoT telemetry, and verified vaccination records.')
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                        lineNumber: 884,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                lineNumber: 880,
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
                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                        lineNumber: 893,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                lineNumber: 891,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                        lineNumber: 879,
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
                                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                lineNumber: 913,
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
                                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                lineNumber: 916,
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
                                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                lineNumber: 919,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                        lineNumber: 912,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "md:col-span-2 flex flex-col justify-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["HealthScoreBar"], {
                                                score: passportAnimal.healthScore,
                                                label: t('ক্লিনিক্যাল স্বাস্থ্য স্কোর', 'Clinical Health Score')
                                            }, void 0, false, {
                                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                lineNumber: 924,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-wrap gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                        tone: state.records.some((r)=>r.animalId === passportAnimal.id && r.kind === 'vaccination') ? 'success' : 'warning',
                                                        children: state.records.some((r)=>r.animalId === passportAnimal.id && r.kind === 'vaccination') ? t('টিকাপ্রাপ্ত', 'Vaccinated') : t('টিকা বাকি', 'Unvaccinated')
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                        lineNumber: 929,
                                                        columnNumber: 21
                                                    }, this),
                                                    passportAnimal.productionDrop ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$components$2f$ui$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                        tone: "danger",
                                                        children: t('দুধ উৎপাদন হ্রাস শনাক্ত (UC-003)', 'Milk Production Drop Verified (UC-003)')
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                        lineNumber: 945,
                                                        columnNumber: 23
                                                    }, this) : null
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                lineNumber: 928,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                        lineNumber: 923,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                lineNumber: 911,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-sm font-bold text-[#1F2937]",
                                        children: t('চিকিৎসা ও টিকাদান খতিয়ান', 'Clinical & Vaccination Records')
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                        lineNumber: 954,
                                        columnNumber: 17
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
                                                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                                lineNumber: 963,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "text-[#475569] mt-0.5",
                                                                children: rec.note
                                                            }, void 0, false, {
                                                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                                lineNumber: 966,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                        lineNumber: 962,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "text-[#64748B] tabular-nums shrink-0",
                                                        children: date(rec.createdAt)
                                                    }, void 0, false, {
                                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                        lineNumber: 968,
                                                        columnNumber: 25
                                                    }, this)
                                                ]
                                            }, rec.id, true, {
                                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                                lineNumber: 961,
                                                columnNumber: 23
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                                        lineNumber: 957,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/frontend/web/src/features/bank.tsx",
                                lineNumber: 953,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/frontend/web/src/features/bank.tsx",
                        lineNumber: 910,
                        columnNumber: 13
                    }, this) : null
                ]
            }, void 0, true, {
                fileName: "[project]/frontend/web/src/features/bank.tsx",
                lineNumber: 878,
                columnNumber: 9
            }, this) : null
        ]
    }, void 0, true, {
        fileName: "[project]/frontend/web/src/features/bank.tsx",
        lineNumber: 132,
        columnNumber: 5
    }, this);
}
_s(BankWebFeature, "tBUZVOuKL+A+o5m21ZDBMTvOzaI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$providers$2f$web$2d$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useWebApp"]
    ];
});
_c = BankWebFeature;
var _c;
__turbopack_context__.k.register(_c, "BankWebFeature");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=frontend_web_src_features_bank_tsx_11m5ki0ega64e._.js.map