"use server";
import { createClient } from "@/lib/supabase/admin/server";
import { cache } from "react";

export const getSession = cache(async () => {
  const supabase = await createClient();

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) return error;

  return session;
});

export const getUser = cache(async () => {
  const supabase = await createClient();

  let {
    data: { user },
    error,
  }: any = await supabase.auth.getUser();

  if (error) return error;

  return user;
});

export const getUserById = cache(async (id: string) => {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.admin.getUserById(id);

  if (userError) return { error: userError };

  return { user: user };
});

export const getUsers = cache(async () => {
  const supabase = await createClient();
  const {
    data: { users },
    error: usersError,
  }: any = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (usersError) return usersError;

  return users;
});
