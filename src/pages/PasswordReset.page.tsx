import React, { ChangeEvent, FC, FormEvent, useContext, useState } from "react";
import { useTranslation } from "react-i18next";

// Api
import { PASSWORD_API } from "../api";

// Components
import { Button, Input, LiquidGlass } from "../components";

// Contexts
import { LoaderContext, TLoaderContext } from "../providers/loader.provider";
import { PopupContext, TPopupContext } from "../providers/popup.provider";

// Icons
import { LockIcon, SaveIcon } from "../assets/icons";

// Types
import { THTTPResponse, TPassword, TPasswordPayload } from "../types";

// Utils
import { setPageTitle, TValidation, validateFormField } from "../utils";

const DEFAULT_STATE: TPassword = {
  password: "",
  password2: "",
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

const PasswordReset: FC = () => {
  const { t } = useTranslation();
  const { setState: setIsLoading }: TLoaderContext = useContext(
    LoaderContext
  ) as TLoaderContext;
  const [formData, setFormData] = useState<TPassword>(DEFAULT_STATE);
  const [errors, setErrors] = useState<TErrors>(ERRORS_DEFAULT_STATE);
  const { onOpen: openPopup }: TPopupContext = useContext(
    PopupContext
  ) as TPopupContext;

  setPageTitle(t("passwordReset"));

  function validateForm(): boolean {
    const isPasswordValid: TValidation = validateFormField(formData.password);
    const isPassword2Valid: TValidation = validateFormField(formData.password2);

    const isFormValid: boolean =
      isPasswordValid.isValid && isPassword2Valid.isValid;

    if (isFormValid) return true;
    else {
      setErrors((prevState: any) => ({
        ...prevState,
        password: {
          isValid: isPasswordValid.isValid,
          message: isPasswordValid.message ? t(isPasswordValid.message) : null,
        },
        password2: {
          isValid: isPassword2Valid.isValid,
          message: isPassword2Valid.message
            ? t(isPassword2Valid.message)
            : null,
        },
      }));

      return false;
    }
  }

  async function onSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setIsLoading(true);

    const isFormValid: boolean = validateForm();

    const payload: TPasswordPayload = {
      password: formData.password,
    };

    if (isFormValid) {
      if (formData.password !== formData.password2)
        openPopup(t("passwordNotMatch"), "warning");
      else {
        await Promise.resolve(
          PASSWORD_API.update(payload).then((res: THTTPResponse) => {
            if (res.hasSuccess)
              openPopup(t("passwordSuccessfullyUpdated"), "success");
            else openPopup(t("unableUpdatePassword"), "error");
          })
        );
      }
    } else openPopup(t("invalidData"), "error");

    setIsLoading(false);
  }

  function onInputChange(propLabel: keyof TPassword, value: any): void {
    setFormData((prevState: any) => {
      return { ...prevState, [propLabel]: value };
    });
    setErrors((prevState: any) => {
      return { ...prevState, [propLabel]: { isValid: true, message: null } };
    });
  }

  const form = (
    <form
      onSubmit={onSubmit}
      className="w-full h-full flex flex-col gap-5 justify-center items-center"
    >
      <LiquidGlass className="w-fit px-20 py-20 mobile:px-10 mobile:py-10 mobile:w-full flex flex-col justify-center items-center gap-10">
        <LockIcon className="text-[5em] text-white" />
        <Input
          autoFocus
          value={formData.password}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onInputChange("password", event.target.value)
          }
          placeholder={t("insertPassword")}
          error={errors.password}
        />
        <Input
          value={formData.password2}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            onInputChange("password2", event.target.value)
          }
          placeholder={t("repeatPassword")}
          error={errors.password2}
        />
        <Button
          type="submit"
          variant="liquid-glass"
          text={t("save")}
          icon={<SaveIcon className="text-xl text-white" />}
        />
      </LiquidGlass>
    </form>
  );

  return (
    <div className="flex flex-col gap-10 pt-10">
      <span className="text-lg text-white">
        {t("compileFormToResetPassword")}
      </span>
      {form}
    </div>
  );
};

export default PasswordReset;
