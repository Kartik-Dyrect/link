-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create links table
create table public.links (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  url text not null,
  title text,
  description text,
  favicon text,
  site_name text,
  category text default 'General',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create collections table
create table public.collections (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  share_id text unique not null,
  name text not null default 'My Collection',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create collection_links junction table
create table public.collection_links (
  collection_id uuid references public.collections(id) on delete cascade not null,
  link_id uuid references public.links(id) on delete cascade not null,
  primary key (collection_id, link_id)
);

-- Enable Row Level Security (RLS)
alter table public.links enable row level security;
alter table public.collections enable row level security;
alter table public.collection_links enable row level security;

-- Create policies for links table
create policy "Users can view their own links" on public.links
  for select using (auth.uid() = user_id);

create policy "Users can insert their own links" on public.links
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own links" on public.links
  for update using (auth.uid() = user_id);

create policy "Users can delete their own links" on public.links
  for delete using (auth.uid() = user_id);

-- Create policies for collections table
create policy "Users can view their own collections" on public.collections
  for select using (auth.uid() = user_id);

create policy "Anyone can view collections by share_id" on public.collections
  for select using (true);

create policy "Users can insert their own collections" on public.collections
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own collections" on public.collections
  for update using (auth.uid() = user_id);

create policy "Users can delete their own collections" on public.collections
  for delete using (auth.uid() = user_id);

-- Create policies for collection_links table
create policy "Users can view collection links they own" on public.collection_links
  for select using (
    exists (
      select 1 from public.collections
      where collections.id = collection_links.collection_id
      and collections.user_id = auth.uid()
    )
  );

create policy "Anyone can view collection links for public collections" on public.collection_links
  for select using (true);

create policy "Users can manage their collection links" on public.collection_links
  for all using (
    exists (
      select 1 from public.collections
      where collections.id = collection_links.collection_id
      and collections.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
create index links_user_id_idx on public.links(user_id);
create index links_created_at_idx on public.links(created_at desc);
create index links_category_idx on public.links(category);
create index collections_user_id_idx on public.collections(user_id);
create index collections_share_id_idx on public.collections(share_id);
create index collection_links_collection_id_idx on public.collection_links(collection_id);
create index collection_links_link_id_idx on public.collection_links(link_id); 