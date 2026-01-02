# Meeting App Infrastructure

This repository contains the infrastructure for a Supabase-backed SaaS, alongside existing Chrome extensions.

## Local Development (No Docker)

Docker is optional and NOT required for this MVP. We prioritize a cloud-first workflow.

1. **Use Supabase Cloud + env vars**: Configure your application to connect directly to your managed Supabase project.
2. **Run migrations via SQL Editor**: Apply database changes by copying SQL from `/supabase/migrations` into the Supabase Cloud SQL Editor.

### Helper Scripts

The `package.json` scripts (`npm run supabase:start`, etc.) have been updated to print reminders of this cloud-only workflow rather than attempting to start Docker containers.

## Structure

- `/supabase`: Contains Supabase configuration and migrations.
- `/audiototext`: Chrome extension (Audio to Text).
- `/asimplescreenrecorderv2`: Chrome extension (Simple Screen Recorder).


