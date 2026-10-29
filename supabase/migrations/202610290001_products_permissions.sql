-- Product inserts omit the identity column, so the service role needs
-- privileges on the identity sequence in addition to table privileges.
grant select, insert, update, delete on table public.products to service_role;
grant usage, select, update on sequence public.products_id_seq to service_role;
