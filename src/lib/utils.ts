import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const checkIfProfileCompleted = (
  createdAt: number,
  updatedAt: number,
) => {
  const THRESHOLD_MS = 5000;
  return (
    new Date(updatedAt).getTime() - new Date(createdAt).getTime() > THRESHOLD_MS
  );
};
