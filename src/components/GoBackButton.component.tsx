import React, { FC } from "react";

// Assets
import { ArrowLeftIcon } from "../assets/icons";

// Components
import IconButton from "./IconButton.component";

interface IProps {
  onGoBack: (event: any) => void;
}

const GoBackButton: FC<IProps> = ({ onGoBack }) => {
  return (
    <IconButton
      onClick={onGoBack}
      icon={<ArrowLeftIcon className="text-black text-2xl" />}
      className="bg-lightgray"
      noShadow
    />
  );
};

export default GoBackButton;
