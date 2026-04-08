import { useAuth } from "../app/contexts/AuthContext";

export type FeatureType =
  | "facial_analysis"
  | "reminders"
  | "progress_tracker"
  | "scanner"
  | "education"
  | "rewards";

export type PremiumTier = "free" | "silver" | "gold" | "platinum";

// Define which tiers have access to which features
const FEATURE_TIERS: Record<FeatureType, PremiumTier[]> = {
  facial_analysis: ["free", "silver", "gold", "platinum"],
  reminders: ["free", "silver", "gold", "platinum"],
  progress_tracker: ["silver", "gold", "platinum"],
  scanner: ["gold", "platinum"],
  education: ["gold", "platinum"],
  rewards: ["platinum"],
};

// Photo limits by tier
const PHOTO_LIMITS: Record<PremiumTier, number> = {
  free: 1,
  silver: 2,
  gold: 3,
  platinum: 5,
};

export function useFeatureAccess(feature: FeatureType) {
  const { subscriptionTier } = useAuth();

  const currentTier = ((subscriptionTier || "FREE") as string).toLowerCase() as PremiumTier;
  const requiredTiers = FEATURE_TIERS[feature];
  const hasAccess = requiredTiers.includes(currentTier);

  // Get the minimum tier required for this feature
  const minRequiredTier = requiredTiers[0];

  // Get tier display names for UI
  const tierNames: Record<PremiumTier, string> = {
    free: "Free",
    silver: "Silver",
    gold: "Gold",
    platinum: "Platinum",
  };

  return {
    hasAccess,
    currentTier,
    requiredTier: minRequiredTier,
    requirementMet: hasAccess,
    tierName: tierNames[currentTier],
    requiredTierName: tierNames[minRequiredTier],
  };
}

export function usePhotoLimit() {
  const { subscriptionTier } = useAuth();

  const currentTier = ((subscriptionTier || "FREE") as string).toLowerCase() as PremiumTier;
  const photoLimit = PHOTO_LIMITS[currentTier];

  const tierNames: Record<PremiumTier, string> = {
    free: "Free",
    silver: "Silver",
    gold: "Gold",
    platinum: "Platinum",
  };

  return {
    maxPhotos: photoLimit,
    currentTier,
    tierName: tierNames[currentTier],
  };
}

