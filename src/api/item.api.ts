// Assets
import { supabase } from "../supabase";

// Types
import { THTTPResponse, TItem } from "../types";

const TABLE = "items";

export const ITEM_API = {
  getAll: async (userId: string): Promise<THTTPResponse> => {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select("*")
        .eq("user_id", userId);

      if (!data || error)
        return {
          hasSuccess: false,
        };

      return {
        data,
        hasSuccess: true,
      };
    } catch (error) {
      console.error("🚀 ~ getAll - error:", error);
      return {
        hasSuccess: false,
      };
    }
  },

  create: async (payload: Partial<TItem>): Promise<THTTPResponse> => {
    try {
      const { data: response, error } = await supabase
        .from(TABLE)
        .insert([payload])
        .select();

      if (!response || error)
        return {
          hasSuccess: false,
        };

      return {
        hasSuccess: true,
        data: response[0].id,
      };
    } catch (error) {
      console.error("🚀 ~ create - error:", error);
      return {
        hasSuccess: false,
      };
    }
  },
};
