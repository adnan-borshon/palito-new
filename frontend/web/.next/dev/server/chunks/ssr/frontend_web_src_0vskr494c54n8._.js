module.exports = [
"[project]/frontend/web/src/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>HomePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$providers$2f$web$2d$provider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/web/src/providers/web-provider.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$navigation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/frontend/web/src/navigation.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function HomePage() {
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const { ready, role } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$providers$2f$web$2d$provider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useWebApp"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (!ready) return;
        if (role) {
            router.replace((0, __TURBOPACK__imported__module__$5b$project$5d2f$frontend$2f$web$2f$src$2f$navigation$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["webHref"])(role, 'home'));
        } else {
            router.replace('/login');
        }
    }, [
        ready,
        role,
        router
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-dvh flex items-center justify-center bg-[#F8FAFC] text-[#1F2937]",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "rounded-[16px] border border-[#E2E8F0] bg-white px-6 py-4 text-sm font-semibold text-[#0F602D]",
            children: "পালিতো লোড হচ্ছে · Loading Palito Workspace..."
        }, void 0, false, {
            fileName: "[project]/frontend/web/src/app/page.tsx",
            lineNumber: 23,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/frontend/web/src/app/page.tsx",
        lineNumber: 22,
        columnNumber: 5
    }, this);
}
}),
"[project]/frontend/web/src/navigation.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "COMMON_WEB_SCREENS",
    ()=>COMMON_WEB_SCREENS,
    "canonicalSidebarScreen",
    ()=>canonicalSidebarScreen,
    "isCommonWebScreen",
    ()=>isCommonWebScreen,
    "isRole",
    ()=>isRole,
    "mobileDeepLink",
    ()=>mobileDeepLink,
    "roleNames",
    ()=>roleNames,
    "roleNavItems",
    ()=>roleNavItems,
    "roleSubtitles",
    ()=>roleSubtitles,
    "webHref",
    ()=>webHref
]);
const roleNames = {
    farmer: {
        bn: 'খামারি',
        en: 'Farmer'
    },
    vet: {
        bn: 'পশুচিকিৎসক',
        en: 'Veterinarian'
    },
    bank: {
        bn: 'ব্যাংক',
        en: 'Bank'
    },
    insurer: {
        bn: 'বীমা প্রতিষ্ঠান',
        en: 'Insurer'
    },
    admin: {
        bn: 'প্রশাসক',
        en: 'Administrator'
    }
};
const roleSubtitles = {
    bank: {
        bn: 'কৃষি ঋণ যাচাই ও পোর্টফোলিও ডেস্ক',
        en: 'Livestock Credit Underwriting & Loan Portfolio Desk'
    },
    vet: {
        bn: 'ক্লিনিক্যাল ট্রায়াজ, টেলিমেডিসিন ও প্রেসক্রিপশন ডেস্ক',
        en: 'Clinical Triage, Telemedicine & Prescription Desk'
    },
    admin: {
        bn: 'প্ল্যাটফর্ম গভর্ন্যান্স, শিক্ষা ও অপারেশনস কনসোল',
        en: 'Platform Governance, CMS & Operations Console'
    },
    insurer: {
        bn: 'পলিসি অনুমোদন, দাবি যাচাই ও সেটেলমেন্ট ডেস্ক',
        en: 'Policy Underwriting, Claim Verification & Settlement Desk'
    },
    farmer: {
        bn: 'খামার ব্যবস্থাপনা, স্বাস্থ্য পাসপোর্ট ও আর্থিক সেবা পোর্টাল',
        en: 'Herd Management, Health Passport & Financial Services Portal'
    }
};
const roleNavItems = {
    bank: [
        {
            screen: 'home',
            label: {
                bn: 'ওভারভিউ ও কিউ',
                en: 'Overview & Queue'
            },
            icon: 'layout-dashboard',
            group: 'primary'
        },
        {
            screen: 'applications',
            label: {
                bn: 'ঋণ আবেদন যাচাই',
                en: 'Loan Underwriting'
            },
            icon: 'file-check',
            group: 'primary'
        },
        {
            screen: 'loans',
            label: {
                bn: 'সক্রিয় ঋণ ও সেটেলমেন্ট',
                en: 'Active Loans & Settlements'
            },
            icon: 'landmark',
            group: 'primary'
        },
        {
            screen: 'notifications',
            label: {
                bn: 'বিজ্ঞপ্তি',
                en: 'Notifications'
            },
            icon: 'bell',
            group: 'secondary'
        },
        {
            screen: 'profile',
            label: {
                bn: 'প্রোফাইল ও সেটিংস',
                en: 'Profile & Settings'
            },
            icon: 'user',
            group: 'secondary'
        }
    ],
    vet: [
        {
            screen: 'home',
            label: {
                bn: 'ক্লিনিক্যাল ডেস্ক',
                en: 'Clinical Desk'
            },
            icon: 'layout-dashboard',
            group: 'primary'
        },
        {
            screen: 'appointments',
            label: {
                bn: 'সাক্ষাৎ ও পরামর্শ',
                en: 'Consultations & Rx'
            },
            icon: 'calendar',
            group: 'primary'
        },
        {
            screen: 'animals',
            label: {
                bn: 'প্রাণী ডিরেক্টরি ও রেকর্ড',
                en: 'Patient Registry'
            },
            icon: 'paw',
            group: 'primary'
        },
        {
            screen: 'reviews',
            label: {
                bn: 'বীমা দাবি পর্যালোচনা',
                en: 'Claim Reviews'
            },
            icon: 'shield-check',
            group: 'primary'
        },
        {
            screen: 'notifications',
            label: {
                bn: 'বিজ্ঞপ্তি',
                en: 'Notifications'
            },
            icon: 'bell',
            group: 'secondary'
        },
        {
            screen: 'profile',
            label: {
                bn: 'প্রোফাইল ও সময়সূচি',
                en: 'Clinician Profile'
            },
            icon: 'user',
            group: 'secondary'
        }
    ],
    admin: [
        {
            screen: 'home',
            label: {
                bn: 'সিস্টেম ওভারভিউ',
                en: 'System Overview'
            },
            icon: 'layout-dashboard',
            group: 'primary'
        },
        {
            screen: 'users',
            label: {
                bn: 'ব্যবহারকারী ও অ্যাক্সেস',
                en: 'Users & Access'
            },
            icon: 'users',
            group: 'primary'
        },
        {
            screen: 'content',
            label: {
                bn: 'শিক্ষামূলক কন্টেন্ট (CMS)',
                en: 'Educational CMS'
            },
            icon: 'book-open',
            group: 'primary'
        },
        {
            screen: 'reports',
            label: {
                bn: 'অডিট ও অপারেশনস রিপোর্ট',
                en: 'Audit & Reports'
            },
            icon: 'bar-chart-3',
            group: 'primary'
        },
        {
            screen: 'notifications',
            label: {
                bn: 'বিজ্ঞপ্তি',
                en: 'Notifications'
            },
            icon: 'bell',
            group: 'secondary'
        },
        {
            screen: 'profile',
            label: {
                bn: 'প্রোফাইল ও সেটিংস',
                en: 'Profile & Settings'
            },
            icon: 'user',
            group: 'secondary'
        }
    ],
    insurer: [
        {
            screen: 'home',
            label: {
                bn: 'আন্ডাররাইটিং ওভারভিউ',
                en: 'Underwriting Overview'
            },
            icon: 'layout-dashboard',
            group: 'primary'
        },
        {
            screen: 'applications',
            label: {
                bn: 'পলিসি আবেদন',
                en: 'Policy Applications'
            },
            icon: 'file-check',
            group: 'primary'
        },
        {
            screen: 'claims',
            label: {
                bn: 'দাবি যাচাই ও পেআউট',
                en: 'Claims & Payouts'
            },
            icon: 'shield-check',
            group: 'primary'
        },
        {
            screen: 'policies',
            label: {
                bn: 'সক্রিয় পলিসি',
                en: 'Active Policies'
            },
            icon: 'landmark',
            group: 'primary'
        },
        {
            screen: 'notifications',
            label: {
                bn: 'বিজ্ঞপ্তি',
                en: 'Notifications'
            },
            icon: 'bell',
            group: 'secondary'
        },
        {
            screen: 'profile',
            label: {
                bn: 'প্রোফাইল ও সেটিংস',
                en: 'Profile & Settings'
            },
            icon: 'user',
            group: 'secondary'
        }
    ],
    farmer: [
        {
            screen: 'home',
            label: {
                bn: 'খামার ড্যাশবোর্ড',
                en: 'Farm Dashboard'
            },
            icon: 'layout-dashboard',
            group: 'primary'
        },
        {
            screen: 'animals',
            label: {
                bn: 'আমার প্রাণী ও পাসপোর্ট',
                en: 'My Animals & Passport'
            },
            icon: 'paw',
            group: 'primary'
        },
        {
            screen: 'devices',
            label: {
                bn: 'ডিভাইস, ভাইটালস ও সতর্কতা',
                en: 'IoT Vitals & Alerts'
            },
            icon: 'radio',
            group: 'primary'
        },
        {
            screen: 'care',
            label: {
                bn: 'পশুচিকিৎসক ও প্রেসক্রিপশন',
                en: 'Vet Care & Reminders'
            },
            icon: 'stethoscope',
            group: 'primary'
        },
        {
            screen: 'ai',
            label: {
                bn: 'স্ক্যান ও AI পরামর্শ',
                en: 'Scan & AI Advisor'
            },
            icon: 'scan',
            group: 'primary'
        },
        {
            screen: 'wallet',
            label: {
                bn: 'ওয়ালেট, ঋণ ও বীমা',
                en: 'Wallet, Loans & Insurance'
            },
            icon: 'wallet',
            group: 'primary'
        },
        {
            screen: 'market',
            label: {
                bn: 'ওষুধ ও খাদ্য বাজার',
                en: 'Marketplace & Orders'
            },
            icon: 'shopping-bag',
            group: 'primary'
        },
        {
            screen: 'education',
            label: {
                bn: 'খামার শিক্ষা',
                en: 'Knowledge Hub'
            },
            icon: 'book-open',
            group: 'secondary'
        },
        {
            screen: 'notifications',
            label: {
                bn: 'বিজ্ঞপ্তি',
                en: 'Notifications'
            },
            icon: 'bell',
            group: 'secondary'
        },
        {
            screen: 'support',
            label: {
                bn: 'সহায়তা কেন্দ্র',
                en: 'Support Desk'
            },
            icon: 'help-circle',
            group: 'secondary'
        },
        {
            screen: 'profile',
            label: {
                bn: 'প্রোফাইল ও খামার তথ্য',
                en: 'Profile & Farm Setup'
            },
            icon: 'user',
            group: 'secondary'
        }
    ]
};
function webHref(role, screen = 'home', id) {
    return id ? `/${role}/${screen}/${encodeURIComponent(id)}` : `/${role}/${screen}`;
}
function mobileDeepLink(role, screen = 'home', id) {
    return id ? `palito://${role}/${screen}/${encodeURIComponent(id)}` : `palito://${role}/${screen}`;
}
function isRole(value) {
    return typeof value === 'string' && Object.hasOwn(roleNames, value);
}
const COMMON_WEB_SCREENS = [
    'notifications',
    'profile',
    'profile-edit',
    'settings',
    'support',
    'demo'
];
function isCommonWebScreen(screen) {
    return COMMON_WEB_SCREENS.includes(screen);
}
function canonicalSidebarScreen(role, screen) {
    if (screen === 'profile-edit' || screen === 'settings') return 'profile';
    if (screen === 'demo') return 'profile';
    if (isCommonWebScreen(screen)) return screen;
    switch(role){
        case 'bank':
            if (screen === 'loan' || screen === 'loans' || screen === 'settlements') return 'loans';
            if (screen === 'applications' || screen === 'passport') return 'applications';
            return 'home';
        case 'vet':
            if (screen === 'appointment' || screen === 'appointments' || screen === 'emergency') return 'appointments';
            if (screen === 'animal' || screen === 'animals' || screen === 'passport') return 'animals';
            if (screen === 'reviews' || screen === 'claims' || screen === 'claim' || screen === 'review-overdue') return 'reviews';
            if (screen === 'schedule') return 'profile';
            return 'home';
        case 'insurer':
            if (screen === 'applications' || screen === 'passport') return 'applications';
            if (screen === 'policies' || screen === 'policy') return 'policies';
            if (screen === 'claims' || screen === 'claim' || screen === 'review-overdue') return 'claims';
            return 'home';
        case 'admin':
            if (screen === 'users' || screen === 'user') return 'users';
            if (screen === 'content' || screen === 'article') return 'content';
            if (screen === 'reports' || screen === 'audit') return 'reports';
            return 'home';
        case 'farmer':
            if ([
                'animals',
                'animal',
                'animal-add',
                'animal-edit',
                'record-add',
                'farm'
            ].includes(screen)) return 'animals';
            if ([
                'devices',
                'device',
                'vitals',
                'alerts',
                'alert'
            ].includes(screen)) return 'devices';
            if ([
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
            ].includes(screen)) return 'care';
            if (screen === 'ai') return 'ai';
            if ([
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
            ].includes(screen)) return 'wallet';
            if ([
                'market',
                'shop',
                'orders',
                'order'
            ].includes(screen)) return 'market';
            if ([
                'education',
                'article'
            ].includes(screen)) return 'education';
            return 'home';
    }
}
}),
];

//# sourceMappingURL=frontend_web_src_0vskr494c54n8._.js.map