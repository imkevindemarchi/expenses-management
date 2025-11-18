// Assets
import { supabase } from "../supabase";

// Types
import { THTTPResponse, TProfile } from "../types";

export const PROFILE_API = {
  get: async (): Promise<THTTPResponse> => {
    try {
      const res: any = await supabase.auth.getUser();

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
      console.error("🚀 ~ get - error:", error);
      return {
        hasSuccess: false,
      };
    }
  },

  update: async (profile: TProfile): Promise<THTTPResponse> => {
    try {
      const res: any = await supabase.auth.updateUser({
        data: profile,
      });

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
