export type THTTPResponse = {
  data?: any;
  hasSuccess: boolean;
  totalRecords?: number | null;
};

export type TLoginPayload = { email: string; password: string };

export type { TProfile } from "./profile.type";

export type { TPassword, TPasswordPayload } from "./password.type";

export type { TCategory } from "./category.type";

export type { TSubCategory } from "./sub-category.type";

export type { TItemType, TItem } from "./item.type";

export type { TSetting } from "./settings.type";
