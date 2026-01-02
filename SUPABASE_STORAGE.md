# Supabase Storage Configuration

This guide describes how to configure the storage bucket and policies for the Meeting App using Supabase Cloud.

## 1. Create Bucket

1.  Go to the **Storage** section in your Supabase Dashboard.
2.  Click **New Bucket**.
3.  Enter the name: `meeting-media`.
4.  **Important**: Ensure "Public bucket" is **unchecked** (OFF). It must be a **Private** bucket.
5.  Click **Save**.

## 2. Storage Policies (RLS)

Storage policies are required to allow authenticated users to upload and view their files. Since the bucket is private, even reading files requires a signed URL or an authenticated RLS policy.

Use the **SQL Editor** in the Supabase Dashboard to run the following command. This creates policies directly on the `storage.objects` table.

> **Note**: These policies ensure users can only access files in a folder matching their User ID.
> Path convention: `{userId}/{meetingId}/{artifactId}.webm`

### SQL to Run

```sql
-- 1. Enable RLS on storage.objects (if not already enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 2. Allow Insert (Upload)
create policy "Authenticated users can upload meeting media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'meeting-media' and
  name like (auth.uid()::text || '/%')
);

-- 3. Allow Select (Read/Download)
create policy "Authenticated users can read their own meeting media"
on storage.objects for select
to authenticated
using (
  bucket_id = 'meeting-media' and
  name like (auth.uid()::text || '/%')
);

-- 4. Allow Update
create policy "Authenticated users can update their own meeting media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'meeting-media' and
  name like (auth.uid()::text || '/%')
);

-- 5. Allow Delete
create policy "Authenticated users can delete their own meeting media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'meeting-media' and
  name like (auth.uid()::text || '/%')
);
```

## 3. Path Convention

When uploading files from the client, ensure the file path follows this structure:

```
{userId}/{meetingId}/{filename}
```

Example:
`a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11/123e4567-e89b-12d3-a456-426614174000/recording.webm`

This ensures the RLS policies successfully validate the `auth.uid()` prefix.
