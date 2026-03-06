// Assets
import { supabase } from "../supabase";

// Types
import { THTTPResponse, TItem, TItemType } from "../types";

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

  getAllWithFilters: async (
    from: number,
    to: number,
    subcategoryId: string,
    year: number,
    type: TItemType | string,
    month: string,
    value: number,
    userId: string,
  ): Promise<THTTPResponse> => {
    try {
      let query = supabase
        .from(TABLE)
        .select("*", { count: "exact" })
        .range(from, to)
        .eq("year", year.toString())
        .eq("user_id", userId);

      if (subcategoryId?.trim() !== "")
        query = query.eq("sub_category_id", subcategoryId);
      if (type?.trim() !== "") query = query.eq("type", type);
      if (month?.trim() !== "") query = query.eq("month_id", month);
      if (value !== 0) query = query.eq("value", value);

      const { data, count: totalRecords, error } = await query;

      if (!data || error)
        return {
          hasSuccess: false,
        };

      return {
        data,
        hasSuccess: true,
        totalRecords: totalRecords && totalRecords,
      };
    } catch (error) {
      console.error("🚀 ~ getAllWithFilters - error:", error);
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

  update: async (data: Partial<TItem>, id: string): Promise<THTTPResponse> => {
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

  delete: async (id: string): Promise<THTTPResponse> => {
    try {
      const { error } = await supabase.from(TABLE).delete().eq("id", id);

      if (error)
        return {
          hasSuccess: false,
        };

      return {
        hasSuccess: true,
      };
    } catch (error) {
      console.error("🚀 ~ delete - error:", error);
      return {
        hasSuccess: false,
      };
    }
  },
};
