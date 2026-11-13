/** Bundled original assets. Provenance and geometry: docs/design-system.md. */
export const palitoFonts = {
  AnekBanglaRegular: require('./fonts/AnekBangla-Regular.ttf'),
  AnekBanglaMedium: require('./fonts/AnekBangla-Medium.ttf'),
  AnekBanglaSemiBold: require('./fonts/AnekBangla-SemiBold.ttf'),
  AnekBanglaBold: require('./fonts/AnekBangla-Bold.ttf'),
  PlusJakartaSansRegular: require('./fonts/PlusJakartaSans-Regular.ttf'),
  PlusJakartaSansSemiBold: require('./fonts/PlusJakartaSans-SemiBold.ttf'),
  PlusJakartaSansBold: require('./fonts/PlusJakartaSans-Bold.ttf'),
} as const;

export type PalitoFontName = keyof typeof palitoFonts;

export const palitoImages = {
  mark: require('./images/palito-mark.png'),
  onboarding: require('./images/onboarding-orbit.png'),
  cow: require('./images/cow.jpg'),
  farmerAvatar: require('./images/farmer-avatar.png'),
  vetAvatar1: require('./images/vet-avatar-1.png'),
  vetAvatar2: require('./images/vet-avatar-2.jpg'),
  vetAvatar3: require('./images/vet-avatar-3.jpg'),
  vetAvatar4: require('./images/vet-avatar-4.jpg'),
  vetAvatar5: require('./images/vet-avatar-5.jpg'),
  vetConsultation: require('./images/vet-consultation.png'),
  medication: require('./images/medication.png'),
  diseaseAwareness: require('./images/disease-awareness.png'),
  support: require('./images/support.png'),
  articleFarm: require('./images/article-farm.jpg'),
  articleCattle: require('./images/article-cattle.jpg'),
  articleAuthor: require('./images/article-author.png'),
} as const;

export type PalitoImageName = keyof typeof palitoImages;
