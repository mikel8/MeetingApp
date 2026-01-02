# Extension Setup & Testing Guide

## Prerequisites

1.  **Build the Extension**:
    The extension now uses modern ES modules and `@supabase/supabase-js`. You must build it before loading.
    ```bash
    cd asimplescreenrecorderv2
    npm install
    npm run build
    ```

2.  **Supabase Auth Configuration**:
    *   Go to your [Supabase Dashboard](https://supabase.com/dashboard) -> Authentication -> URL Configuration.
    *   You need to add the Redirect URL for your extension.
    *   Format: `https://<EXTENSION_ID>.chromiumapp.org/**`
    *   **How to get <EXTENSION_ID>**:
        1.  Load the `asimplescreenrecorderv2/dist` folder in `chrome://extensions`.
        2.  Copy the ID (e.g., `abcdefghijkl...`).
        3.  Add `https://abcdefghijkl....chromiumapp.org/**` to Supabase Redirect URLs.

## usage

1.  **Open Extension**: Click the extension icon. It will open the Options page (or click "Open Recorder" in popup).
2.  **Sign In**: Click "Sign in with Google".
    *   A Chrome Identity popup will appear.
    *   Sign in.
    *   If successful, you will see your email and the "Start Capture" button.
3.  **Record**: 
    *   Click "Start Capture".
    *   Select screen.
    *   Record specific content.
    *   Click "Stop Capture".
4.  **Upload**:
    *   The extension will automatically:
        *   Create a "meeting" in Supabase.
        *   Upload the video to `meeting-media` bucket.
        *   Create a "meeting_artifact" record.
        *   Open the Web App meeting page (`http://localhost:3000/meetings/<id>`).

## Troubleshooting

*   **Auth Error**: Ensure your Supabase URL and Anon Key in `asimplescreenrecorderv2/src/options.js` are correct.
*   **Redirect Error**: Ensure you added the exact `https://<ID>.chromiumapp.org/**` to Supabase.
*   **Permissions**: Ensure `manifest.json` has `identity` and host permissions for your Supabase project.

## Development

*   Source code is in `src/`.
*   Run `npm run build` after any changes to `src/options.js`.
