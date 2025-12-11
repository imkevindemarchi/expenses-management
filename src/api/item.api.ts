// Assets
import { supabase } from "../supabase";

// Types
import { THTTPResponse, TItem } from "../types";

const TABLE = "items";

export const ITEM_API = {
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
