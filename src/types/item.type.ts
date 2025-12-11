export type TItemType = "income" | "exit";

export type TItem = {
  id: string | null;
  value: number;
  type: TItemType;
  month_id: number;
  user_id: string;
  category_id: string;
  sub_category_id: string;
};
