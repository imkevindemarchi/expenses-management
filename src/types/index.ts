export type THTTPResponse = {
  data?: any;
  hasSuccess: boolean;
  totalRecords?: number | null;
};

export type TLoginPayload = { email: string; password: string };

export type { TProfile } from "./profile.type";
