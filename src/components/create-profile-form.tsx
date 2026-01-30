import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
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
import { authClient, AuthSession } from "@/lib/auth-client";

const profileFormSchema = z.object({
  profile_picture_url: z.string().optional(),
  email: z.string().email("Invalid email address"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const CreateProfileForm = () => {
  const [session, setSession] = useState<AuthSession | null>();
  const [nickname, setNickname] = useState<string>();
  const [profilePic, setProfilePic] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    authClient.getSession().then((data) => {
      setSession(data.data);
      setNickname(data.data?.user.name || "");
      setProfilePic(data.data?.user.image || "");
    });
  }, []);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      profile_picture_url: profilePic,
      email: session?.user.email,
      name: nickname,
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/api/user/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for httpOnly cookies
        body: JSON.stringify(data),
      });

      if (response.status === 201) {
        window.location.href = "/profile";
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create profile");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Error creating profile:", err);
    } finally {
      setIsSubmitting(false);
    }
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
          name="profile_picture_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Profile Picture</FormLabel>
              <FormControl>
                <FileUpload
                  value={field.value}
                  onChange={(file) => {
                    // For now, just set a placeholder
                    field.onChange(file ? "uploaded-file-placeholder" : "");
                  }}
                  disabled={isSubmitting}
                />
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
                <Input {...field} type="email" disabled />
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
                  disabled={isSubmitting}
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
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating Profile..." : "Create Profile"}
        </Button>
      </form>
    </Form>
  );
};
