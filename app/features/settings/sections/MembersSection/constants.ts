import { Role } from "@api/__generated__/types";

import type { RoleValue } from "./types";

export const MEMBERS_COPY = {
  pageTitle: "Members",
  cardTitle: "User list",
  cardDescription: "Users that share this Synthseek instance.",
  createLocal: "Create Local User",
  importPlex: "Import Plex Users",
  adminOnly: "Only administrators can view members.",
  loading: "Loading members...",
  empty: "No members yet.",
} as const;

export const ROLE_OPTIONS: { value: RoleValue; label: string }[] = [
  { value: Role.enum.member, label: "User" },
  { value: Role.enum.admin, label: "Admin" },
];

export const CREATE_USER_COPY = {
  title: "Create local user",
  description: "Local users sign in with their email and password.",
  emailLabel: "Email",
  emailPlaceholder: "user@example.com",
  usernameLabel: "Username",
  usernamePlaceholder: "username",
  passwordLabel: "Password",
  passwordPlaceholder: "At least 8 characters",
  roleLabel: "Role",
  submit: "Create user",
} as const;

export const EDIT_USER_COPY = {
  title: "Edit user",
  description: "Update this member's details. Leave the password blank to keep it unchanged.",
  passwordPlaceholder: "Leave blank to keep current password",
  submit: "Save changes",
  ownerRoleNote: "The owner account must stay an admin.",
} as const;

export const IMPORT_PLEX_COPY = {
  title: "Import Plex users",
  description: "Users with access to your Plex server. Already-imported users are disabled.",
  loading: "Loading Plex users...",
  empty: "No Plex users with access to this server were found.",
  selectAll: "Select all",
  imported: "Imported",
  submit: "Import selected",
  roleLabel: "Role for imported users",
} as const;

export const DELETE_USER_COPY = {
  title: "Delete user",
  message:
    "This removes the user account and reassigns their request history to the owner. Downloaded files in Plex are not affected.",
  confirm: "Delete",
} as const;

export const BULK_COPY = {
  selectedSuffix: "selected",
  delete: "Delete selected",
  clear: "Clear",
  roleLabel: "Set role",
  deleteTitle: "Delete users",
  deleteMessage:
    "This removes the selected accounts and reassigns their request history to the owner. Downloaded files in Plex are not affected.",
} as const;
