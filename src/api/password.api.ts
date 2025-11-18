// Assets
import { supabase } from "../supabase";

// Types
import { THTTPResponse, TPasswordPayload } from "../types";

export const PASSWORD_API = {
  update: async (password: TPasswordPayload): Promise<THTTPResponse> => {
    try {
      const res: any = await supabase.auth.updateUser(password);

      if (!res?.data || res?.error) {
        return {
          hasSuccess: false,
        };
      }

      return {
        data: res.data.user,
        hasSuccess: true,
      };
    } catch (error) {
      console.error("🚀 ~ update - error:", error);
      return {
        hasSuccess: false,
      };
    }
  },
};
