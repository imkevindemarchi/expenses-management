// Assets
import { supabase } from "../supabase";

// Types
import { THTTPResponse, TSetting } from "../types";

const TABLE = "settings";

export const SETTING_API = {
  get: async (userId: string): Promise<any> => {
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select()
        .eq("user_id", userId);

      if (!data || error)
        return {
          hasSuccess: false,
        };

      return {
        hasSuccess: true,
        data: data[0],
      };
    } catch (error) {
      console.error("🚀 ~ get - error:", error);
    }
  },

  create: async (payload: Partial<TSetting>): Promise<THTTPResponse> => {
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

  update: async (
    data: Partial<TSetting>,
    id: string
  ): Promise<THTTPResponse> => {
    try {
      const { data: response, error } = await supabase
        .from(TABLE)
        .update(data)
        .eq("id", id)
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
      console.error("🚀 ~ update - error:", error);
      return {
        hasSuccess: false,
      };
    }
  },
};
