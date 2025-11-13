export type THTTPResponse = {
  data?: any;
  hasSuccess: boolean;
  totalRecords?: number | null;
};

export type TLoginPayload = { email: string; password: string };
