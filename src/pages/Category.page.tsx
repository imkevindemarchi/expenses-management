import React, {
  ChangeEvent,
  FC,
  FormEvent,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { NavigateFunction, useNavigate, useParams } from "react-router";

// Api
import { CATEGORY_API } from "../api";

// Assets
import { CreateIcon, SaveIcon } from "../assets/icons";

// Components
import { Button, Input, LiquidGlass } from "../components";

// Contexts
import { PopupContext, TPopupContext } from "../providers/popup.provider";
import { LoaderContext, TLoaderContext } from "../providers/loader.provider";
import { AuthContext, TAuthContext } from "../providers/auth.provider";

// Types
import { THTTPResponse, TCategory } from "../types";
import { TValidation } from "../utils/validation.util";

// Utils
import { setPageTitle, validateFormField } from "../utils";

interface IFormData {
  label: string;
}

const DEFAULT_FORM_DATA: IFormData = {
  label: "",
};

type TErrors = {
  label: TValidation;
};

const ERRORS_DEFAULT_STATE: TErrors = {
  label: {
    isValid: true,
  },
};

const Category: FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<IFormData>(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<TErrors>(ERRORS_DEFAULT_STATE);
  const { onOpen: openPopup }: TPopupContext = useContext(
    PopupContext
  ) as TPopupContext;
  const { setState: setIsLoading }: TLoaderContext = useContext(
    LoaderContext
  ) as TLoaderContext;
  const { categoryId } = useParams();
  const navigate: NavigateFunction = useNavigate();
  const [categories, setCategories] = useState<TCategory[] | null>(null);
  const { userData }: TAuthContext = useContext(AuthContext) as TAuthContext;

  const isEditMode: boolean = categoryId ? true : false;

  setPageTitle(isEditMode ? t("editCategory") : t("newCategory"));

  async function getData(): Promise<void> {
    setIsLoading(true);

    await Promise.resolve(CATEGORY_API.getAll(userData?.id as string)).then(
      (response: THTTPResponse) => {
        if (response && response.hasSuccess) setCategories(response.data);
        else openPopup(t("unableLoadCategories"), "error");
      }
    );

    if (isEditMode)
      await Promise.resolve(CATEGORY_API.get(categoryId as string)).then(
        (response: THTTPResponse) => {
          if (response && response.hasSuccess)
            setFormData({ ...response.data });
          else openPopup(t("unableLoadCategory"), "error");
        }
      );

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

  function validateForm(): boolean {
    const isLabelValid: TValidation = validateFormField(
      formData.label as string
    );

    const isFormValid: boolean = isLabelValid.isValid;

    if (isFormValid) return true;
    else {
      setErrors((prevState: any) => ({
        ...prevState,
        label: {
          isValid: isLabelValid.isValid,
          message: isLabelValid.message ? t(isLabelValid.message) : null,
        },
      }));

      return false;
    }
  }

  async function onSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();

    const isFormValid: boolean = validateForm();
    const categoryAlreadyExists: boolean = categories?.find(
      (category: TCategory) =>
        category.label?.toLowerCase().trim() ===
        formData.label?.toLowerCase().trim()
    )
      ? true
      : false;

    if (!isFormValid) openPopup(t("invalidData"), "warning");
    else if (categoryAlreadyExists && !isEditMode)
      openPopup(t("categoryAlreadyExists"), "warning");
    else {
      setIsLoading(true);

      const payload: Partial<TCategory> = {
        label: formData.label,
        user_id: userData?.id,
      };

      if (isEditMode)
        await Promise.resolve(
          CATEGORY_API.update(payload, categoryId as string)
        ).then(async (response: THTTPResponse) => {
          if (response && response.hasSuccess)
            openPopup(t("categorySuccessfullyUpdated"), "success");
          else openPopup(t("unableUpdateCategory"), "error");
        });
      else
        await Promise.resolve(CATEGORY_API.create(payload)).then(
          async (response: THTTPResponse) => {
            if (response && response.hasSuccess) {
              openPopup(t("categorySuccessfullyCreated"), "success");
              navigate(`/categories/edit/${response.data}`);
            } else openPopup(t("unableCreateCategory"), "error");
          }
        );

      await getData();

      setIsLoading(false);
    }
  }

  const label: ReactNode = (
    <Input
      autoFocus
      value={formData.label}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        let text: string = event.target.value;
        if (text.length > 0)
          text = text.charAt(0).toUpperCase() + text.slice(1);

        onInputChange("label", text);
      }}
      placeholder={t("insertName")}
      error={errors.label}
    />
  );

  const button: ReactNode = (
    <Button
      type="submit"
      variant="liquid-glass"
      icon={
        isEditMode ? (
          <SaveIcon className="text-xl text-white" />
        ) : (
          <CreateIcon className="text-xl text-white" />
        )
      }
      text={t(isEditMode ? "save" : "create")}
    />
  );

  const form = (
    <form
      onSubmit={onSubmit}
      className="flex flex-col gap-5 justify-center items-center"
    >
      <LiquidGlass className="w-fit px-20 py-20 mobile:px-10 mobile:py-10 mobile:w-full flex flex-col justify-center items-center gap-10">
        {label}
        {button}
      </LiquidGlass>
    </form>
  );

  useEffect(() => {
    userData?.id && getData();

    // eslint-disable-next-line
  }, [userData?.id]);

  return (
    <div className="flex flex-col gap-10 pt-10">
      <span className="text-lg text-white">
        {t(
          isEditMode
            ? "compileFormToUpdateCategory"
            : "compileFormToCreateCategory"
        )}
      </span>
      {form}
    </div>
  );
};

export default Category;
