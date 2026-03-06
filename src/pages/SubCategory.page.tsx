import React, {
  ChangeEvent,
  FC,
  FormEvent,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { NavigateFunction, useNavigate, useParams } from "react-router";

// Api
import { CATEGORY_API, SUB_CATEGORY_API } from "../api";

// Assets
import { CreateIcon, SaveIcon } from "../assets/icons";

// Components
import { Autocomplete, Button, Input, ShadowBox } from "../components";

// Contexts
import { PopupContext, TPopupContext } from "../providers/popup.provider";
import { LoaderContext, TLoaderContext } from "../providers/loader.provider";
import { AuthContext, TAuthContext } from "../providers/auth.provider";

// Types
import { THTTPResponse, TCategory, TSubcategory } from "../types";
import { TValidation } from "../utils/validation.util";
import { IAutocompleteValue } from "../components/Autocomplete.component";

// Utils
import { setPageTitle, validateFormField } from "../utils";

interface IFormData {
  label: string;
  category: TCategory | null;
}

const DEFAULT_FORM_DATA: IFormData = {
  label: "",
  category: null,
};

type TErrors = {
  label: TValidation;
  category: TValidation;
};

const ERRORS_DEFAULT_STATE: TErrors = {
  label: {
    isValid: true,
  },
  category: {
    isValid: true,
  },
};

const Subcategory: FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<IFormData>(DEFAULT_FORM_DATA);
  const [errors, setErrors] = useState<TErrors>(ERRORS_DEFAULT_STATE);
  const { onOpen: openPopup }: TPopupContext = useContext(
    PopupContext,
  ) as TPopupContext;
  const { setState: setIsLoading }: TLoaderContext = useContext(
    LoaderContext,
  ) as TLoaderContext;
  const { categoryId } = useParams();
  const navigate: NavigateFunction = useNavigate();
  const [subcategories, setSubcategories] = useState<TSubcategory[] | null>(
    null,
  );
  const [categories, setCategories] = useState<TCategory[]>([]);
  const { userData }: TAuthContext = useContext(AuthContext) as TAuthContext;

  const isEditMode: boolean = categoryId ? true : false;
  const titleLabel: string = isEditMode
    ? t("editSubcategory")
    : t("newSubcategory");

  setPageTitle(titleLabel);

  async function getData(): Promise<void> {
    setIsLoading(true);

    await Promise.all([
      SUB_CATEGORY_API.getAll(userData?.id as string),
      CATEGORY_API.getAll(userData?.id as string),
    ]).then(async (response: THTTPResponse[]) => {
      if (response[0] && response[0].hasSuccess)
        setSubcategories(response[0].data);
      else openPopup(t("unableLoadSubcategories"), "error");

      if (response[1] && response[1].hasSuccess)
        setCategories(response[1].data);
      else openPopup(t("unableLoadCategories"), "error");

      if (isEditMode && response[1] && response[1].hasSuccess)
        await Promise.resolve(SUB_CATEGORY_API.get(categoryId as string)).then(
          (subcategoryRes: THTTPResponse) => {
            if (subcategoryRes && subcategoryRes.hasSuccess) {
              const category: TCategory = response[1].data.find(
                (category: TCategory) =>
                  category.id === subcategoryRes.data?.category_id,
              ) as TCategory;

              setFormData({
                ...subcategoryRes.data,
                category,
              });
            } else openPopup(t("unableLoadSubcategory"), "error");
          },
        );
    });

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
      formData.label as string,
    );
    const isCategoryValid: TValidation = validateFormField(
      formData.category?.label as string,
    );

    const isFormValid: boolean =
      isLabelValid.isValid && isCategoryValid.isValid;

    if (isFormValid) return true;
    else {
      setErrors((prevState: any) => ({
        ...prevState,
        label: {
          isValid: isLabelValid.isValid,
          message: isLabelValid.message ? t(isLabelValid.message) : null,
        },
        category: {
          isValid: isCategoryValid.isValid,
          message: isCategoryValid.message ? t(isCategoryValid.message) : null,
        },
      }));

      return false;
    }
  }

  async function onSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();

    const isFormValid: boolean = validateForm();
    const subcategoryAlreadyExists: boolean = subcategories?.find(
      (subcategory: TSubcategory) =>
        subcategory.label?.toLowerCase().trim() ===
          formData.label?.toLowerCase().trim() &&
        subcategory.category_id === formData.category?.id,
    )
      ? true
      : false;

    if (!isFormValid) openPopup(t("invalidData"), "warning");
    else if (subcategoryAlreadyExists && !isEditMode)
      openPopup(t("subcategoryAlreadyExists"), "warning");
    else {
      setIsLoading(true);

      const payload: Partial<TSubcategory> = {
        label: formData.label,
        category_id: (formData.category as TCategory)?.id as string,
        user_id: userData?.id,
      };

      if (isEditMode)
        await Promise.resolve(
          SUB_CATEGORY_API.update(payload, categoryId as string),
        ).then(async (response: THTTPResponse) => {
          if (response && response.hasSuccess)
            openPopup(t("subcategorySuccessfullyUpdated"), "success");
          else openPopup(t("unableUpdateSubcategory"), "error");
        });
      else
        await Promise.resolve(SUB_CATEGORY_API.create(payload)).then(
          async (response: THTTPResponse) => {
            if (response && response.hasSuccess) {
              openPopup(t("subcategorySuccessfullyCreated"), "success");
              navigate(`/subcategories/edit/${response.data}`);
            } else openPopup(t("unableCreateSubcategory"), "error");
          },
        );

      await getData();

      setIsLoading(false);
    }
  }

  const category = (
    <Autocomplete
      value={formData.category as IAutocompleteValue}
      onChange={(value: IAutocompleteValue) => onInputChange("category", value)}
      placeholder={t("insertCategory")}
      error={errors.category}
      data={categories as IAutocompleteValue[]}
    />
  );

  const title = (
    <span className="text-black text-[2.5em] mobile:text-2xl">
      {titleLabel}
    </span>
  );

  const description = (
    <div className="w-full flex justify-start">
      <span className="text-lg text-black mobile:text-center">
        {t(
          isEditMode
            ? "compileFormToUpdateSubcategory"
            : "compileFormToCreateSubcategory",
        )}
      </span>
    </div>
  );

  const input = (
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

  const button = (
    <Button
      type="submit"
      text={t(isEditMode ? "save" : "create")}
      onClick={onSubmit}
      className="bg-primary"
      icon={
        isEditMode ? (
          <SaveIcon className="text-xl text-white" />
        ) : (
          <CreateIcon className="text-xl text-white" />
        )
      }
    />
  );

  const form = (
    <form
      onSubmit={onSubmit}
      className="w-full flex flex-col gap-5 justify-center items-center"
    >
      <ShadowBox className="w-[40%] px-20 py-20 mobile:px-10 mobile:py-10 mobile:w-full flex flex-col justify-center items-center gap-10">
        {input}
        {category}
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

export default Subcategory;
