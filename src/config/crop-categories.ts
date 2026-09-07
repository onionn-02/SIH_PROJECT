import type { CropCategory } from "@/types/firestore";

/**
 * Fixed crop-category taxonomy for the Crop Prices module. A prototype
 * doesn't need a separate manageable "categories" collection — admin
 * "manages categories" by picking one of these when adding/editing a crop.
 */
export const CROP_CATEGORIES: { value: CropCategory; label: string }[] = [
  { value: "vegetable", label: "Vegetable" },
  { value: "fruit", label: "Fruit" },
  { value: "grain", label: "Grain" },
  { value: "pulses", label: "Pulses" },
  { value: "other", label: "Other" },
];
