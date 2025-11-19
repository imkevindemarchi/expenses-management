// Types
import { TCategory } from "./category.type";

export type TSubCategory = {
  id: string | null;
  label: string;
  category: TCategory | null;
};
