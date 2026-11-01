-- Run once in the Supabase SQL Editor. All new accounts require approval.
begin;
create table public.enginex_profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 email text not null, full_name text not null default '',
 role text not null default 'user' check(role in ('admin','user')),
 status text not null default 'pending' check(status in ('pending','active','suspended')),
 created_at timestamptz not null default now()
);
create table public.enginex_workspaces (
 user_id uuid primary key references public.enginex_profiles(id) on delete cascade,
 data jsonb not null default '{}'::jsonb check(jsonb_typeof(data)='object' and octet_length(data::text)<=5000000),
 updated_at timestamptz not null default now()
);
create table public.enginex_audit (
 id bigint generated always as identity primary key, actor uuid references auth.users(id),
 target uuid references auth.users(id), action text not null, created_at timestamptz not null default now()
);
alter table public.enginex_profiles enable row level security;
alter table public.enginex_workspaces enable row level security;
alter table public.enginex_audit enable row level security;
create function public.enginex_is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.enginex_profiles where id=auth.uid() and role='admin' and status='active');
$$;
create function public.enginex_is_active() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.enginex_profiles where id=auth.uid() and status='active');
$$;
create function public.enginex_on_signup() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.enginex_profiles(id,email,full_name) values(new.id,new.email,left(coalesce(new.raw_user_meta_data->>'full_name',''),100));
 return new;
end; $$;
create trigger enginex_signup after insert on auth.users for each row execute function public.enginex_on_signup();
insert into public.enginex_profiles(id,email,full_name) select id,email,left(coalesce(raw_user_meta_data->>'full_name',''),100) from auth.users on conflict do nothing;
create policy profile_read on public.enginex_profiles for select to authenticated using(id=auth.uid() or public.enginex_is_admin());
create policy workspace_read on public.enginex_workspaces for select to authenticated using(user_id=auth.uid() and public.enginex_is_active());
create policy workspace_insert on public.enginex_workspaces for insert to authenticated with check(user_id=auth.uid() and public.enginex_is_active());
create policy workspace_update on public.enginex_workspaces for update to authenticated using(user_id=auth.uid() and public.enginex_is_active()) with check(user_id=auth.uid() and public.enginex_is_active());
create policy audit_read on public.enginex_audit for select to authenticated using(public.enginex_is_admin());
-- No direct profile writes: role and status updates go through an authorized, audited RPC.
create function public.enginex_manage_user(target_id uuid,new_role text,new_status text) returns void language plpgsql security definer set search_path='' as $$
begin
 -- Serialize role changes so concurrent requests cannot remove the last active admin.
 perform pg_advisory_xact_lock(194855420);
 if not public.enginex_is_admin() then raise exception 'Administrator access required'; end if;
 if new_role not in ('admin','user') or new_status not in ('pending','active','suspended') or new_role is null or new_status is null then raise exception 'Invalid role or status'; end if;
 if target_id=auth.uid() then raise exception 'Use another administrator to change your own access'; end if;
 if not exists(select 1 from public.enginex_profiles where id=target_id) then raise exception 'Account not found'; end if;
 update public.enginex_profiles set role=new_role,status=new_status where id=target_id;
 insert into public.enginex_audit(actor,target,action) values(auth.uid(),target_id,'role='||new_role||'; status='||new_status);
end; $$;
revoke all on public.enginex_profiles,public.enginex_workspaces,public.enginex_audit from anon,authenticated;
grant select on public.enginex_profiles,public.enginex_audit to authenticated;
grant select,insert,update on public.enginex_workspaces to authenticated;
revoke execute on function public.enginex_is_admin(),public.enginex_is_active(),public.enginex_on_signup(),public.enginex_manage_user(uuid,text,text) from public,anon;
grant execute on function public.enginex_is_admin(),public.enginex_is_active(),public.enginex_manage_user(uuid,text,text) to authenticated;
commit;
