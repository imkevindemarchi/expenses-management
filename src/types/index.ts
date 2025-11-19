export type THTTPResponse = {
  data?: any;
  hasSuccess: boolean;
  totalRecords?: number | null;
};

export type TLoginPayload = { email: string; password: string };

export type { TProfile } from "./profile.type";

export type { TPassword, TPasswordPayload } from "./password.type";

export type { TCategory } from "./category.type";
