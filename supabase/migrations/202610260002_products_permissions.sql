-- The product importer uses the table's identity column. The server-side
-- service-role client needs sequence privileges as well as table privileges
-- for inserts that omit the id.
grant select, insert, update, delete on table public.products to service_role;
grant usage, select, update on all sequences in schema public to service_role;

-- Ensure future sequences created in public are usable by service_role too.
alter default privileges in schema public
  grant usage, select, update on sequences to service_role;
