import React, { FC, ReactNode, RefObject, useContext } from "react";

// Assets
import {
  DEFAULT_DARK_BORDER_COLOR,
  DEFAULT_DARK_BOX_SHADOW_COLOR,
  DEFAULT_DARK_BOX_SHADOW_COLOR2,
  DEFAULT_LIGHT_BORDER_COLOR,
  DEFAULT_LIGHT_BOX_SHADOW_COLOR,
  isMobile,
} from "../assets/constants";

// Contexts
import { ThemeContext, TThemeContext } from "../providers/theme.provider";

interface IProps {
  children?: ReactNode;
  className?: string;
  ref?: RefObject<HTMLDivElement | null>;
  onClick?: (event: any) => void;
  noBorder?: boolean;
  draggable?: boolean;
  onDragStart?: () => void;
  onDragOver?: (event: any) => void;
  onDrop?: () => void;
  style?: any;
  zIndex?: number;
  noShadow?: boolean;
  borderColor?: string;
  borderSize?: number;
  borderRadius?: number;
}

const ShadowBox: FC<IProps> = ({
  className,
  ref,
  onClick,
  noBorder = false,
  children,
  draggable = false,
  onDragStart,
  onDragOver,
  onDrop,
  style,
  zIndex,
  noShadow = false,
  borderColor,
  borderSize = 2,
  borderRadius = 50,
  ...props
}) => {
  const { isLightMode }: TThemeContext = useContext(
    ThemeContext,
  ) as TThemeContext;

  return (
    <div
      ref={ref}
      onClick={onClick && onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{
        border: noBorder
          ? ""
          : `${borderSize}px solid ${borderColor ? borderColor : isLightMode ? DEFAULT_LIGHT_BORDER_COLOR : DEFAULT_DARK_BORDER_COLOR}`,
        zIndex,
        boxShadow: noShadow
          ? ""
          : `0 10px 30px ${isLightMode ? DEFAULT_LIGHT_BOX_SHADOW_COLOR : isMobile ? DEFAULT_DARK_BOX_SHADOW_COLOR2 : DEFAULT_DARK_BOX_SHADOW_COLOR}`,
        borderRadius,
        ...style,
      }}
      className={`transition-all duration-300 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default ShadowBox;
