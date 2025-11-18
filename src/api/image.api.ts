// Assets
import { supabase } from "../supabase";

// Types
import { THTTPResponse } from "../types";

const TABLE = "images";

export const IMAGE_API = {
  add: async (id: string, file: File): Promise<THTTPResponse> => {
    try {
      const { data, error } = await supabase.storage
        .from(TABLE)
        .upload(id, file, { contentType: "image/jpg" });

      if (!data || error)
        return {
          hasSuccess: false,
        };

      return {
        hasSuccess: true,
      };
    } catch (error) {
      console.error("🚀 ~ add -  error:", error);
      return {
        hasSuccess: false,
      };
    }
  },

  delete: async (id: string): Promise<THTTPResponse> => {
    try {
      const { data, error } = await supabase.storage.from(TABLE).remove([id]);

      if (!data || error)
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
