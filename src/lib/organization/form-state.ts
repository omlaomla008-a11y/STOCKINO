export type OrganizationFormState = {
  status: "success" | "error" | null;
  message: string | null;
};

export const organizationDefaultState: OrganizationFormState = {
  status: null,
  message: null,
};

