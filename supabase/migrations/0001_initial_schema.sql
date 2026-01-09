-- Create users table
create table "public"."users" (
    "id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "username" text not null,
    "nickname" text,
    "avatar_url" text,
    "role" text not null default 'sales'::text,
    "is_suspended" boolean not null default false,
    "can_edit_inventory" boolean not null default false,
    "can_confirm_delivery" boolean not null default false
);

alter table "public"."users" enable row level security;

-- Create sales_reps table
create table "public"."sales_reps" (
    "id" uuid not null,
    "user_id" uuid not null,
    "total_commission" numeric not null default 0,
    "pending_commission" numeric not null default 0,
    "max_discount_allowed" numeric not null default 5,
    "custom_commission_rate" numeric not null default 0.05
);

alter table "public"."sales_reps" enable row level security;

-- Create products table
create table "public"."products" (
    "id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "grade" text not null,
    "price_per_mg" numeric not null,
    "stock" integer not null default 0
);

alter table "public"."products" enable row level security;

-- Create customers table
create table "public"."customers" (
    "id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "name" text not null,
    "phone" text not null,
    "address" text,
    "total_spent" numeric not null default 0,
    "classification" text not null default 'عادي'::text,
    "last_order_date" timestamp with time zone
);

alter table "public"."customers" enable row level security;

-- Create orders table
create table "public"."orders" (
    "id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "customer_name" text not null,
    "customer_phone" text not null,
    "customer_address" text not null,
    "customer_notes" text,
    "sales_rep_id" uuid not null,
    "items" jsonb not null,
    "subtotal" numeric not null,
    "discount_percentage" numeric not null,
    "shipping_cost" numeric not null,
    "total_amount" numeric not null,
    "status" text not null default 'قيد التنفيذ'::text,
    "commission" numeric not null
);

alter table "public"."orders" enable row level security;

-- Set primary keys
alter table "public"."users" add constraint "users_pkey" primary key ("id");
alter table "public"."sales_reps" add constraint "sales_reps_pkey" primary key ("id");
alter table "public"."products" add constraint "products_pkey" primary key ("id");
alter table "public"."customers" add constraint "customers_pkey" primary key ("id");
alter table "public"."orders" add constraint "orders_pkey" primary key ("id");

-- Set foreign keys
alter table "public"."sales_reps" add constraint "sales_reps_user_id_fkey" foreign key ("user_id") references "public"."users" ("id") on delete cascade;
alter table "public"."orders" add constraint "orders_sales_rep_id_fkey" foreign key ("sales_rep_id") references "public"."sales_reps" ("id") on delete set null;

-- Set unique constraints
alter table "public"."users" add constraint "users_username_key" unique ("username");
alter table "public"."customers" add constraint "customers_phone_key" unique ("phone");

-- Grant permissions for users
grant delete on table "public"."users" to anon;
grant insert on table "public"."users" to anon;
grant references on table "public"."users" to anon;
grant select on table "public"."users" to anon;
grant trigger on table "public"."users" to anon;
grant truncate on table "public"."users" to anon;
grant update on table "public"."users" to anon;
grant delete on table "public"."users" to authenticated;
grant insert on table "public"."users" to authenticated;
grant references on table "public"."users" to authenticated;
grant select on table "public"."users" to authenticated;
grant trigger on table "public"."users" to authenticated;
grant truncate on table "public"."users" to authenticated;
grant update on table "public"."users" to authenticated;
grant delete on table "public"."users" to service_role;
grant insert on table "public"."users" to service_role;
grant references on table "public"."users" to service_role;
grant select on table "public"."users" to service_role;
grant trigger on table "public"."users" to service_role;
grant truncate on table "public"."users" to service_role;
grant update on table "public"."users" to service_role;


-- Grant permissions for sales_reps
grant delete on table "public"."sales_reps" to anon;
grant insert on table "public"."sales_reps" to anon;
grant references on table "public"."sales_reps" to anon;
grant select on table "public"."sales_reps" to anon;
grant trigger on table "public"."sales_reps" to anon;
grant truncate on table "public"."sales_reps" to anon;
grant update on table "public"."sales_reps" to anon;
grant delete on table "public"."sales_reps" to authenticated;
grant insert on table "public"."sales_reps" to authenticated;
grant references on table "public"."sales_reps" to authenticated;
grant select on table "public"."sales_reps" to authenticated;
grant trigger on table "public"."sales_reps" to authenticated;
grant truncate on table "public"."sales_reps" to authenticated;
grant update on table "public"."sales_reps" to authenticated;
grant delete on table "public"."sales_reps" to service_role;
grant insert on table "public"."sales_reps" to service_role;
grant references on table "public"."sales_reps" to service_role;
grant select on table "public"."sales_reps" to service_role;
grant trigger on table "public"."sales_reps" to service_role;
grant truncate on table "public"."sales_reps" to service_role;
grant update on table "public"."sales_reps" to service_role;

-- Grant permissions for products
grant delete on table "public"."products" to anon;
grant insert on table "public"."products" to anon;
grant references on table "public"."products" to anon;
grant select on table "public"."products" to anon;
grant trigger on table "public"."products" to anon;
grant truncate on table "public"."products" to anon;
grant update on table "public"."products" to anon;
grant delete on table "public"."products" to authenticated;
grant insert on table "public"."products" to authenticated;
grant references on table "public"."products" to authenticated;
grant select on table "public"."products" to authenticated;
grant trigger on table "public"."products" to authenticated;
grant truncate on table "public"."products" to authenticated;
grant update on table "public"."products" to authenticated;
grant delete on table "public"."products" to service_role;
grant insert on table "public"."products" to service_role;
grant references on table "public"."products" to service_role;
grant select on table "public"."products" to service_role;
grant trigger on table "public"."products" to service_role;
grant truncate on table "public"."products" to service_role;
grant update on table "public"."products" to service_role;

-- Grant permissions for customers
grant delete on table "public"."customers" to anon;
grant insert on table "public"."customers" to anon;
grant references on table "public"."customers" to anon;
grant select on table "public"."customers" to anon;
grant trigger on table "public"."customers" to anon;
grant truncate on table "public"."customers" to anon;
grant update on table "public"."customers" to anon;
grant delete on table "public"."customers" to authenticated;
grant insert on table "public"."customers" to authenticated;
grant references on table "public"."customers" to authenticated;
grant select on table "public"."customers" to authenticated;
grant trigger on table "public"."customers" to authenticated;
grant truncate on table "public"."customers" to authenticated;
grant update on table "public"."customers" to authenticated;
grant delete on table "public"."customers" to service_role;
grant insert on table "public"."customers" to service_role;
grant references on table "public"."customers" to service_role;
grant select on table "public"."customers" to service_role;
grant trigger on table "public"."customers" to service_role;
grant truncate on table "public"."customers" to service_role;
grant update on table "public"."customers" to service_role;


-- Grant permissions for orders
grant delete on table "public"."orders" to anon;
grant insert on table "public"."orders" to anon;
grant references on table "public"."orders" to anon;
grant select on table "public"."orders" to anon;
grant trigger on table "public"."orders" to anon;
grant truncate on table "public"."orders" to anon;
grant update on table "public"."orders" to anon;
grant delete on table "public"."orders" to authenticated;
grant insert on table "public"."orders" to authenticated;
grant references on table "public"."orders" to authenticated;
grant select on table "public"."orders" to authenticated;
grant trigger on table "public"."orders" to authenticated;
grant truncate on table "public"."orders" to authenticated;
grant update on table "public"."orders" to authenticated;
grant delete on table "public"."orders" to service_role;
grant insert on table "public"."orders" to service_role;
grant references on table "public"."orders" to service_role;
grant select on table "public"."orders" to service_role;
grant trigger on table "public"."orders" to service_role;
grant truncate on table "public"."orders" to service_role;
grant update on table "public"."orders" to service_role;
