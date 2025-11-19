import React, {
  ChangeEvent,
  FC,
  FormEvent,
  useContext,
  useEffect,
  useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Grid } from "@mui/material";

// Api
import { IMAGE_API, PROFILE_API } from "../api";

// Assets
import { EditIcon, SaveIcon } from "../assets/icons";

// Components
import { Button, ImageSelector, Input, LiquidGlass } from "../components";

// Contexts
import { LoaderContext, TLoaderContext } from "../providers/loader.provider";
import { PopupContext, TPopupContext } from "../providers/popup.provider";
import { AuthContext, TAuthContext } from "../providers/auth.provider";

// Types
import { THTTPResponse, TProfile } from "../types";

// Utils
import {
  imageExists,
  setPageTitle,
  TValidation,
  validateFormField,
} from "../utils";

type TImage = { image: File | string | null };

type TErrors = {
  name: TValidation;
  surname: TValidation;
};

const ERRORS_DEFAULT_STATE: TErrors = {
  name: {
    isValid: true,
  },
  surname: {
    isValid: true,
  },
};

const DEFAULT_STATE: TProfile & TImage = {
  id: "",
  image: null,
  email_verified: false,
  name: "",
  surname: "",
  email: "",
};

const Profile: FC = () => {
  const { t } = useTranslation();
  const { userData }: TAuthContext = useContext(AuthContext) as TAuthContext;
  const [formData, setFormData] = useState<TProfile & TImage>(DEFAULT_STATE);
  const { setState: setIsLoading }: TLoaderContext = useContext(
    LoaderContext
  ) as TLoaderContext;
  const { onOpen: openPopup }: TPopupContext = useContext(
    PopupContext
  ) as TPopupContext;
  const [isImageUpdated, setIsImageUpdated] = useState<boolean>(false);
  const [errors, setErrors] = useState<TErrors>(ERRORS_DEFAULT_STATE);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [doesImageExists, setDoesImageExists] = useState<boolean>(false);

  setPageTitle(t("profile"));

  const imageUrl: string = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/images/${formData.id}`;
  const isImageVisible: boolean =
    formData.image && (doesImageExists || isImageUpdated) ? true : false;

  async function getData(): Promise<void> {
    setIsLoading(true);

    await Promise.resolve(PROFILE_API.get()).then((response: THTTPResponse) => {
      if (response && response.hasSuccess)
        setFormData({ ...response.data, image: response.data.id });
      else openPopup(t("unableLoadProfile"), "error");
    });

    setIsLoading(false);
  }

  function validateForm(): boolean {
    const isNameValid: TValidation = validateFormField(formData.name);
    const isSurnameValid: TValidation = validateFormField(formData.surname);

    const isFormValid: boolean = isNameValid.isValid && isSurnameValid.isValid;

    if (isFormValid) return true;
    else {
      setErrors((prevState: any) => ({
        ...prevState,
        name: {
          isValid: isNameValid.isValid,
          message: isNameValid.message ? t(isNameValid.message) : null,
        },
        surname: {
          isValid: isSurnameValid.isValid,
          message: isSurnameValid.message ? t(isSurnameValid.message) : null,
        },
      }));

      return false;
    }
  }

  async function onSubmit(event: FormEvent): Promise<void> {
    event.preventDefault();
    setIsLoading(true);

    const isFormValid: boolean = validateForm();

    const payload: TProfile = {
      email: formData?.email,
      email_verified: formData?.email_verified,
      id: formData?.id,
      name: formData?.name,
      surname: formData?.surname,
    };

    if (userData?.id && isFormValid) {
      await Promise.resolve(PROFILE_API.update(payload)).then(
        async (profileRes: THTTPResponse) => {
          if (profileRes && profileRes.hasSuccess) {
            if (isImageUpdated && formData.image)
              await Promise.resolve(IMAGE_API.delete(userData?.id)).then(
                async (deletedImageRes: THTTPResponse) => {
                  if (
                    deletedImageRes &&
                    deletedImageRes.hasSuccess &&
                    formData.image
                  ) {
                    await Promise.resolve(
                      IMAGE_API.add(payload.id, formData.image as File).then(
                        (imageRes: THTTPResponse) => {
                          if (imageRes && imageRes.hasSuccess) {
                            setFormData({
                              ...profileRes.data,
                              image: profileRes.data.id,
                            });
                            openPopup(
                              t("profileSuccessfullyUpdated"),
                              "success"
                            );
                          } else openPopup(t("unableUpdateImage"), "error");
                        }
                      )
                    );
                  } else openPopup(t("unableRemoveImage"), "error");
                }
              );
          }
        }
      );
    } else openPopup(t("invalidData"), "error");

    setIsLoading(false);
  }

  function onInputChange(
    propLabel: keyof TProfile | keyof TImage,
    value: any
  ): void {
    setFormData((prevState: any) => {
      return { ...prevState, [propLabel]: value };
    });
    setErrors((prevState: any) => {
      return { ...prevState, [propLabel]: { isValid: true, message: null } };
    });
  }

  function editModeHandler(): void {
    setIsEditMode(!isEditMode);
  }

  const image = isImageVisible ? (
    <img
      id="image"
      src={imageUrl}
      alt={t("imgNotFound")}
      className="w-60 rounded-lg object-contain"
    />
  ) : (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.1)",
        border: `1px solid rgba(255, 255, 255, 0.25)`,
        backdropFilter: "blur(2px)",
      }}
      className="w-60 h-60 bg-primary rounded-full flex justify-center items-center mobile:w-40 mobile:h-40"
    >
      <span className="text-[3em] text-white opacity-80">
        {formData.email?.charAt(0).toUpperCase()}
      </span>
    </div>
  );

  const name = (
    <Input
      autoFocus
      value={formData.name}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        let text: string = event.target.value;
        if (text.length > 0)
          text = text.charAt(0).toUpperCase() + text.slice(1);

        onInputChange("name", text);
      }}
      placeholder={t("insertName")}
      error={errors.name}
    />
  );

  const surname = (
    <Input
      value={formData.surname}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        let text: string = event.target.value;
        if (text.length > 0)
          text = text.charAt(0).toUpperCase() + text.slice(1);

        onInputChange("surname", text);
      }}
      placeholder={t("insertSurname")}
      error={errors.name}
    />
  );

  const buttons = (
    <div className="flex items-center gap-5">
      <Button
        onClick={() => {
          editModeHandler();
          setErrors(ERRORS_DEFAULT_STATE);
        }}
        type="button"
        variant="liquid-glass"
        text={t("cancel")}
      />
      <Button
        type="submit"
        variant="liquid-glass"
        text={t("save")}
        icon={<SaveIcon className="text-xl text-white" />}
      />
    </div>
  );

  const form = (
    <form
      onSubmit={onSubmit}
      className="w-full h-full flex flex-col gap-5 justify-center items-center"
    >
      <LiquidGlass className="w-fit px-20 py-20 mobile:px-10 mobile:py-10 mobile:w-full flex flex-col justify-center items-center gap-10">
        <div className="flex items-center gap-10 mobile:flex-col">
          {image}
          <ImageSelector
            onChange={(file: File) => {
              onInputChange("image", file);
              setIsImageUpdated(true);
            }}
          />
        </div>
        <div className="text-center">
          <span className="text-white font-bold">{formData?.email}</span>
        </div>
        <Grid container columnSpacing={5} rowSpacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>{name}</Grid>
          <Grid size={{ xs: 12, md: 6 }}>{surname}</Grid>
        </Grid>
        {buttons}
      </LiquidGlass>
    </form>
  );

  const profile = (
    <div className="w-full h-full flex flex-col gap-5 justify-center items-center">
      <LiquidGlass className="w-fit px-20 py-20 mobile:px-10 mobile:py-10 mobile:w-full flex flex-col justify-center items-center gap-10">
        <div className="relative">
          {image}
          <LiquidGlass
            onClick={editModeHandler}
            className="absolute top-[-2vh] right-[-2vh] w-10 h-10 flex justify-center items-center cursor-pointer hover:opacity-50 transition-all duration-300"
          >
            <EditIcon className="text-3xl text-white" />
          </LiquidGlass>
        </div>
        <div className="text-center">
          <span className="text-white font-bold">{formData?.email}</span>
        </div>
        {formData?.name && formData?.surname && (
          <div className="text-center">
            <span className="text-white font-bold">{`${formData?.name} ${formData?.surname}`}</span>
          </div>
        )}
      </LiquidGlass>
    </div>
  );

  useEffect(() => {
    if (formData.image && typeof formData.image === "object") {
      let src: string = URL.createObjectURL(formData.image);
      let imagePreview: any = document.getElementById("image");
      if (imagePreview) imagePreview.src = src;
    }
  }, [formData.image]);

  useEffect(() => {
    if (userData)
      setFormData({
        ...formData,
        email: userData.email,
        email_verified: userData.email_verified,
        id: userData.id,
        name: userData.name,
        surname: userData.surname,
        image: userData.id,
      });

    // eslint-disable-next-line
  }, [userData]);

  useEffect(() => {
    getData();

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const imageUrl: string = `${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/images/${formData.id}`;
    const _imageExists: boolean = imageExists(imageUrl);
    setDoesImageExists(_imageExists);
  }, [formData.id]);

  return (
    <div className="flex flex-col gap-10 pt-10">
      {isEditMode ? form : profile}
    </div>
  );
};

export default Profile;
