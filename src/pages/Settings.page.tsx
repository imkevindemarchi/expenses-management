import React, {
  ChangeEvent,
  FormEvent,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Grid } from "@mui/material";

// Api
import { SETTING_API } from "../api";

// Assets
import { SaveIcon } from "../assets/icons";

// Components
import { Button, Input, LiquidGlass } from "../components";

// Contexts
import { AuthContext, TAuthContext } from "../providers/auth.provider";
import { LoaderContext, TLoaderContext } from "../providers/loader.provider";
import { PopupContext, TPopupContext } from "../providers/popup.provider";

// Types
import { THTTPResponse } from "../types";
import { TSetting } from "../types/settings.type";

// Utils
import { setPageTitle, TValidation, validateFormField } from "../utils";

interface TFormData {
  goal: number;
  id: string;
}

const DEFAULT_STATE: TFormData = {
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
    LoaderContext
  ) as TLoaderContext;
  const [formData, setFormData] = useState<TFormData>(DEFAULT_STATE);
  const [errors, setErrors] = useState<TErrors>(ERRORS_DEFAULT_STATE);
  const { userData }: TAuthContext = useContext(AuthContext) as TAuthContext;
  const { onOpen: openPopup }: TPopupContext = useContext(
    PopupContext
  ) as TPopupContext;
  const [isEdit, setIsEdit] = useState<boolean>(false);

  setPageTitle(t("settings"));

  async function getData(): Promise<void> {
    setIsLoading(true);

    await Promise.resolve(SETTING_API.get(userData?.id as string)).then(
      (response: THTTPResponse) => {
        if (response && response.hasSuccess && response.data) {
          setFormData({ goal: response.data?.goal, id: response.data?.id });
          setIsEdit(true);
        }
      }
    );

    setIsLoading(false);
  }

  function validateForm(): boolean {
    const isGoalValid: TValidation = validateFormField(
      formData.goal.toString()
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
      goal: formData.goal,
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
            }
          )
        );
      else
        await Promise.resolve(
          SETTING_API.create(payload).then((res: THTTPResponse) => {
            if (res.hasSuccess)
              openPopup(t("settingsSuccessfullySaved"), "success");
            else openPopup(t("unableSaveSettings"), "error");
          })
        );
    } else openPopup(t("invalidData"), "error");

    setIsLoading(false);
  }

  function onInputChange(propLabel: keyof TFormData, value: any): void {
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
      <LiquidGlass className="w-full px-20 py-20 mobile:px-10 mobile:py-10 mobile:w-full flex flex-col justify-center items-center gap-10">
        <Grid
          container
          sx={{ width: "100%", display: "flex", alignItems: "center" }}
          rowSpacing={2}
        >
          <Grid size={{ xs: 12, md: 3 }}>
            <span className="text-white">{t("insertGoalCurrentYear")}</span>
          </Grid>
          <Grid size={{ xs: 12, md: 9 }}>
            <Input
              type="number"
              autoFocus
              value={formData.goal}
              onChange={(event: ChangeEvent<HTMLInputElement>) =>
                onInputChange("goal", event.target.value)
              }
              error={errors.password}
              className="w-fit"
            />
          </Grid>
        </Grid>
        <Button
          type="submit"
          variant="liquid-glass"
          text={t("save")}
          icon={<SaveIcon className="text-xl text-white" />}
          className="w-fit"
        />
      </LiquidGlass>
    </form>
  );

  useEffect(() => {
    userData?.id && getData();

    // eslint-disable-next-line
  }, [userData?.id]);

  return (
    <div className="flex flex-col gap-10 pt-10">
      <span className="text-lg text-white">{t("editSettings")}</span>
      {form}
    </div>
  );
};

export default Settings;
