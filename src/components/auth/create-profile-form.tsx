import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { FileUpload } from "../ui/file-upload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "../ui/form";
import { useUpdateProfile } from "@/hooks/use-update-profile";
import { ApiError } from "@/lib/api";
import { QueryProvider } from "../query-provider";
import { t, type Locale, getLocalizedPath } from "@/i18n";

const getProfileFormSchema = (locale: Locale) =>
  z.object({
    image: z.string().optional(),
    email: z.string().email(t(locale, "createProfile.invalidEmail")),
    name: z
      .string()
      .min(2, t(locale, "createProfile.nameMinLength"))
      .max(50, t(locale, "createProfile.nameMaxLength")),
  });

type ProfileFormValues = z.infer<ReturnType<typeof getProfileFormSchema>>;

export interface CreateProfileFormProps {
  email: string;
  name: string;
  profilePic?: string;
  locale?: Locale;
}

export const CreateProfileForm = ({
  email,
  name,
  profilePic,
  locale = "en",
}: CreateProfileFormProps) => {
  return (
    <QueryProvider>
      <CreateProfileFormInner
        email={email}
        name={name}
        profilePic={profilePic}
        locale={locale}
      />
    </QueryProvider>
  );
};

const CreateProfileFormInner = ({
  email,
  name,
  profilePic,
  locale = "en",
}: CreateProfileFormProps) => {
  const [error, setError] = useState<string | null>(null);
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(getProfileFormSchema(locale)),
    defaultValues: {
      image: profilePic,
      email: email,
      name: name,
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    setError(null);

    updateProfile.mutate(data, {
      onSuccess: () => {
        window.location.href = getLocalizedPath('/profile', locale);
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          setError(err.message || t(locale, "createProfile.createError"));
        } else {
          setError(t(locale, "createProfile.networkError"));
        }
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 w-full max-w-2xl"
      >
        {error && (
          <div className="bg-danger/20 border border-danger rounded-lg p-4">
            <p className="text-danger text-sm font-medium">{error}</p>
          </div>
        )}

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t(locale, "createProfile.profilePicture")}</FormLabel>
              <FormControl>
                <FileUpload value={field.value} disabled={updateProfile.isPending} />
              </FormControl>
              <FormDescription>
                {t(locale, "createProfile.profilePictureHelp")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t(locale, "createProfile.email")}</FormLabel>
              <FormControl>
                <Input {...field} type="email" disabled value={email} />
              </FormControl>
              <FormDescription>
                {t(locale, "createProfile.emailHelp")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t(locale, "createProfile.name")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t(locale, "createProfile.namePlaceholder")}
                  disabled={updateProfile.isPending}
                />
              </FormControl>
              <FormDescription>
                {t(locale, "createProfile.nameHelp")}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={updateProfile.isPending}
        >
          {updateProfile.isPending
            ? t(locale, "createProfile.creating")
            : t(locale, "createProfile.submit")}
        </Button>
      </form>
    </Form>
  );
};
