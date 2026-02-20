import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { FileUpload } from "./ui/file-upload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "./ui/form";
import { useUpdateProfile } from "@/hooks/use-update-profile";
import { ApiError } from "@/lib/api";
import { QueryProvider } from "./query-provider";

const profileFormSchema = z.object({
  image: z.string().optional(),
  email: z.string().email("Invalid email address"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface Props {
  email: string;
  name: string;
  profilePic?: string;
}

export const CreateProfileForm = ({ email, name, profilePic }: Props) => {
  return (
    <QueryProvider>
      <CreateProfileFormInner email={email} name={name} profilePic={profilePic} />
    </QueryProvider>
  );
};

const CreateProfileFormInner = ({ email, name, profilePic }: Props) => {
  const [error, setError] = useState<string | null>(null);
  const updateProfile = useUpdateProfile();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
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
        window.location.href = "/profile";
      },
      onError: (err) => {
        if (err instanceof ApiError) {
          setError(err.message || "Failed to create profile");
        } else {
          setError("Network error. Please try again.");
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
              <FormLabel>Profile Picture</FormLabel>
              <FormControl>
                <FileUpload value={field.value} disabled={updateProfile.isPending} />
              </FormControl>
              <FormDescription>
                Upload a profile picture (this is a placeholder for now)
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input {...field} type="email" disabled value={email} />
              </FormControl>
              <FormDescription>
                Your email from the authentication token
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
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter your name"
                  disabled={updateProfile.isPending}
                />
              </FormControl>
              <FormDescription>This will be your display name</FormDescription>
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
          {updateProfile.isPending ? "Creating Profile..." : "Create Profile"}
        </Button>
      </form>
    </Form>
  );
};
