import React, {
  ChangeEvent,
  FormEvent,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";

// Api
import { SETTING_API } from "../api";

// Assets
import { EuroIcon, SaveIcon } from "../assets/icons";

// Components
import { Button, Input, ShadowBox } from "../components";

// Contexts
import { AuthContext, TAuthContext } from "../providers/auth.provider";
import { LoaderContext, TLoaderContext } from "../providers/loader.provider";
import { PopupContext, TPopupContext } from "../providers/popup.provider";
import { ThemeContext, TThemeContext } from "../providers/theme.provider";

// Types
import { THTTPResponse } from "../types";
import { TSetting } from "../types/settings.type";

// Utils
import { setPageTitle, TValidation, validateFormField } from "../utils";

interface IFormData {
  goal: number;
  id: string;
}

const DEFAULT_STATE: IFormData = {
  goal: 0,
  id: "",
};

type TErrors = {
  password: TValidation;
  password2: TValidation;
};

const ERRORS_DEFAULT_STATE: TErrors = {
  password: {
    isValid: true,
  },
  password2: {
    isValid: true,
  },
};

const Settings = () => {
  const { t } = useTranslation();
  const { setState: setIsLoading }: TLoaderContext = useContext(
    LoaderContext,
  ) as TLoaderContext;
  const [formData, setFormData] = useState<IFormData>(DEFAULT_STATE);
  const [errors, setErrors] = useState<TErrors>(ERRORS_DEFAULT_STATE);
  const { userData }: TAuthContext = useContext(AuthContext) as TAuthContext;
  const { onOpen: openPopup }: TPopupContext = useContext(
    PopupContext,
  ) as TPopupContext;
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const { isLightMode }: TThemeContext = useContext(
    ThemeContext,
  ) as TThemeContext;

  const titleLabel: string = t("settings");

  setPageTitle(titleLabel);

  async function getData(): Promise<void> {
    setIsLoading(true);

    await Promise.resolve(SETTING_API.get(userData?.id as string)).then(
      (response: THTTPResponse) => {
        if (response && response.hasSuccess && response.data) {
          setFormData({
            goal: response.data?.month_goal,
            id: response.data?.id,
          });
          setIsEdit(true);
        }
      },
    );

    setIsLoading(false);
  }

  function validateForm(): boolean {
    const isGoalValid: TValidation = validateFormField(
      formData.goal.toString(),
    );

    const isFormValid: boolean = isGoalValid.isValid;

    if (isFormValid) return true;
    else {
      setErrors((prevState: any) => ({
        ...prevState,
        goal: {
          isValid: isGoalValid.isValid,
          message: isGoalValid.message ? t(isGoalValid.message) : null,
        },
      }));

      return false;
    }
  }

  async function onSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setIsLoading(true);

    const isFormValid: boolean = validateForm();

    const payload: Partial<TSetting> = {
      month_goal: formData.goal,
      user_id: userData?.id,
    };

    if (isFormValid) {
      if (isEdit)
        await Promise.resolve(
          SETTING_API.update(payload, formData.id).then(
            (res: THTTPResponse) => {
              if (res.hasSuccess)
                openPopup(t("settingsSuccessfullySaved"), "success");
              else openPopup(t("unableSaveSettings"), "error");
            },
          ),
        );
      else
        await Promise.resolve(
          SETTING_API.create(payload).then((res: THTTPResponse) => {
            if (res.hasSuccess)
              openPopup(t("settingsSuccessfullySaved"), "success");
            else openPopup(t("unableSaveSettings"), "error");
          }),
        );
    } else openPopup(t("invalidData"), "error");

    setIsLoading(false);
  }

  function onInputChange(propLabel: keyof IFormData, value: any): void {
    setFormData((prevState: any) => {
      return { ...prevState, [propLabel]: value };
    });
    setErrors((prevState: any) => {
      return { ...prevState, [propLabel]: { isValid: true, message: null } };
    });
  }

  const title = (
    <span
      className={`text-[2em] mobile:text-2xl mobile:text-center transition-all duration-300 ${isLightMode ? "text-black" : "text-white"}`}
    >
      {titleLabel}
    </span>
  );

  const description = (
    <div className="w-full flex justify-start">
      <span
        className={`text-lg mobile:text-center transition-all duration-300 ${isLightMode ? "text-black" : "text-white"}`}
      >
        {t("insertMonthGoal")}
      </span>
    </div>
  );

  const input = (
    <div className="w-full flex justify-center items-center">
      <div>
        <Input
          type="number"
          autoFocus
          value={formData.goal}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onInputChange("goal", event.target.value)
          }
          error={errors.password}
          startIcon={<EuroIcon className="text-darkgray text-lg" />}
          className="w-fit"
          noShadow={!isLightMode}
        />
      </div>
    </div>
  );

  const formDescription = (
    <span className="text-lg text-darkgray text-center">
      {t("insertMonthGoalDescription")}
    </span>
  );

  const button = (
    <Button
      type="submit"
      text={t("save")}
      onClick={onSubmit}
      className="bg-primary"
      icon={<SaveIcon className="text-xl text-white" />}
    />
  );

  const form = (
    <form
      onSubmit={onSubmit}
      className="w-full flex flex-col gap-5 justify-center items-center"
    >
      <ShadowBox className="w-[40%] px-20 py-20 mobile:px-10 mobile:py-10 mobile:w-full flex flex-col justify-center items-center gap-10">
        {formDescription}
        {input}
        {button}
      </ShadowBox>
    </form>
  );

  useEffect(() => {
    userData?.id && getData();

    // eslint-disable-next-line
  }, [userData?.id]);

  return (
    <div className="flex flex-col gap-5 justify-center items-center">
      {title}
      {description}
      {form}
    </div>
  );
};

export default Settings;
