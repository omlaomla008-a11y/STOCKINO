export type AuthFormState = {
  message: string | null;
  status: "success" | "error" | null;
};

export const authDefaultState: AuthFormState = {
  message: null,
  status: null,
};

