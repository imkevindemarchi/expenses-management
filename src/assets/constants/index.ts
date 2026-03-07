export const Z_INDEX = {
  NAVBAR: 100,
  AUTOCOMPLETE: 20,
  SIDEBAR: 200,
  POPUP: 150,
};

export const DEFAULT_LIGHT_BORDER_COLOR: string = "rgba(0, 0, 0, 0.04)";
export const DEFAULT_DARK_BORDER_COLOR: string = "rgba(255, 255, 255, 0.1)";

export const DEFAULT_LIGHT_BOX_SHADOW_COLOR: string = "rgba(0, 0, 0, 0.04)";
export const DEFAULT_DARK_BOX_SHADOW_COLOR: string = "rgba(255, 255, 255, 0.1)";
export const DEFAULT_DARK_BOX_SHADOW_COLOR2: string = "rgba(255, 255, 255, 0.08)";

export const DEFAULT_DARK_BORDER_COLOR2: string = "rgba(255, 255, 255, 0.1)";

export const isMobile: boolean =
  window.matchMedia("(max-width: 768px)").matches;
