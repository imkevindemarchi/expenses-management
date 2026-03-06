import React, { FC, ReactNode, RefObject } from "react";

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
  borderColor = "rgba(0, 0, 0, 0.04)",
  borderSize = 1,
  borderRadius = 50,
  ...props
}) => {
  return (
    <div
      ref={ref}
      onClick={onClick && onClick}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{
        border: noBorder ? "" : `${borderSize}px solid ${borderColor}`,
        zIndex,
        boxShadow: noShadow ? "" : "0 10px 30px rgba(0, 0, 0, 0.06)",
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
