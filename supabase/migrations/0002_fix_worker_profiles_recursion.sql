-- Fixes "infinite recursion detected in policy for relation worker_profiles".
--
-- The "admins can manage all profiles" policy checked admin status by
-- querying worker_profiles from within a policy ON worker_profiles itself —
-- evaluating that subquery re-triggers RLS on worker_profiles, which
-- re-evaluates the same policy, forever. A SECURITY DEFINER function breaks
-- the cycle: it runs as the function owner (the table owner), which bypasses
-- RLS entirely (tables aren't FORCE ROW LEVEL SECURITY here), so the check
-- inside never re-enters policy evaluation.

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.worker_profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "admins can manage all profiles" on public.worker_profiles;

create policy "admins can manage all profiles"
  on public.worker_profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
