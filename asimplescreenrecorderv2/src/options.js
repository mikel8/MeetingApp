
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://hqcklghtagnlihrccyqo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_62VlwOdM2EdbgEjyndfD1g_dW2WvWm5'; // Ensure this key is correct!
const WEB_APP_ORIGIN = 'http://localhost:3000';

// Chrome Storage Adapter for Supabase
const chromeStorageAdapter = {
  getItem: (key) => {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] || null)
      })
    })
  },
  setItem: (key, value) => {
    return new Promise((resolve) => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve()
      })
    })
  },
  removeItem: (key) => {
    return new Promise((resolve) => {
      chrome.storage.local.remove([key], () => {
        resolve()
      })
    })
  },
}

// Initialize Supabase Client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: chromeStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// UI Elements
const els = {
  signInBtn: document.getElementById('signInBtn'),
  signOutBtn: document.getElementById('signOutBtn'),
  userInfo: document.getElementById('userInfo'),
  userEmail: document.getElementById('userEmail'),
  startCapture: document.getElementById('startCapture'),
  stopCapture: document.getElementById('stopCapture'),
  download: document.getElementById('download'),
  status: document.getElementById('status'),
  authSection: document.getElementById('authSection'),
  recordSection: document.getElementById('recordSection'),
}

// State
let mediaRecorder;
let recordedChunks = [];

// Helper: Update Status
function updateStatus(msg, type = 'normal') {
  if (els.status) {
    els.status.textContent = msg;
    els.status.className = 'status ' + (type === 'error' ? 'error' : (type === 'success' ? 'success' : ''));
  }
  console.log('[Recorder Status]', msg);
}

// Helper: Toggle UI based on session
async function updateUI() {
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    els.authSection.style.display = 'none';
    els.recordSection.style.display = 'block';
    els.userInfo.style.display = 'block';
    els.userEmail.textContent = session.user.email;
    els.signOutBtn.style.display = 'inline-block';
  } else {
    els.authSection.style.display = 'block';
    els.recordSection.style.display = 'none'; // Or keep visible but disable? User said "Not signed in: show Sign in"
    // Let's hide recording controls if not signed in to force auth, or just disable them. 
    // User goal: "user signs in... extension stores session... uploads work". 
    // IMPLIED: Auth is prerequisite.
    els.userInfo.style.display = 'none';
    els.signOutBtn.style.display = 'none';
  }
}

// Auth: Sign In
if (els.signInBtn) {
  els.signInBtn.addEventListener('click', async () => {
    try {
      updateStatus("Starting Google Sign-In...");

      const redirectTo = `https://${chrome.runtime.id}.chromiumapp.org/auth/callback`;

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          skipBrowserRedirect: true // distinct from 'redirectTo' usage in some versions, but strictly we need the URL
        }
      });

      if (error) throw error;

      // supabase-js v2 signInWithOAuth returns { data: { url } } if preventRedirect is not standard, or just url. 
      // Actually with skipBrowserRedirect: true, we get data.url.

      if (!data.url) throw new Error("No OAuth URL returned");

      chrome.identity.launchWebAuthFlow({
        url: data.url,
        interactive: true
      }, async (callbackUrl) => {
        if (chrome.runtime.lastError) {
          updateStatus("Auth Error: " + chrome.runtime.lastError.message, 'error');
          return;
        }

        if (!callbackUrl) {
          updateStatus("Auth failed: No callback URL", 'error');
          return;
        }

        console.log("Callback URL received:", callbackUrl);

        // Parse code/hash from callbackUrl
        const urlObj = new URL(callbackUrl);

        // Try getting code from query params first
        let code = urlObj.searchParams.get('code');
        const errorDesc = urlObj.searchParams.get('error_description');

        if (errorDesc) {
          updateStatus("Auth Error from params: " + errorDesc, 'error');
          return;
        }

        // If no code in query params, check hash (implicit/fragment flow)
        if (!code && urlObj.hash) {
          // Remove leading '#'
          const hashStr = urlObj.hash.substring(1);
          const hashParams = new URLSearchParams(hashStr);
          code = hashParams.get('code');

          if (!code) {
            // Sometimes access_token comes directly in implicit flow
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');

            if (accessToken && refreshToken) {
              updateStatus("Setting session from tokens...");
              const { error: setSessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken
              });

              if (setSessionError) throw setSessionError;

              updateStatus("Signed in successfully!", 'success');
              updateUI();
              return;
            }
          }

          if (hashParams.get('error_description')) {
            updateStatus("Auth Error from hash: " + hashParams.get('error_description'), 'error');
            return;
          }
        }

        if (code) {
          updateStatus("Exchanging code for session...");
          const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
          if (sessionError) throw sessionError;

          updateStatus("Signed in successfully!", 'success');
          updateUI();
        } else {
          console.warn("No code found. URL:", callbackUrl);
          updateStatus("No code found in callback. Check console.", 'error');
        }
      });

    } catch (err) {
      console.error(err);
      updateStatus("Sign in failed: " + err.message, 'error');
    }
  });
}

// Auth: Sign Out
if (els.signOutBtn) {
  els.signOutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
    updateStatus("Signed out.");
    updateUI();
  });
}

// Recording Logic
if (els.startCapture) {
  els.startCapture.addEventListener('click', async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
      handleStream(stream);
      els.stopCapture.disabled = false;
      els.startCapture.disabled = true;
      recordedChunks = [];
      updateStatus("Recording...");
    } catch (error) {
      console.error('Error capturing screen:', error);
      updateStatus("Error starting capture: " + error.message, 'error');
    }
  });
}

if (els.stopCapture) {
  els.stopCapture.addEventListener('click', () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
  });
}

if (els.download) {
  els.download.addEventListener('click', () => {
    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'recorded.webm';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

function handleStream(stream) {
  mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });

  mediaRecorder.ondataavailable = event => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = async () => {
    stream.getTracks().forEach(track => track.stop());
    els.stopCapture.disabled = true;
    els.startCapture.disabled = false;
    els.download.disabled = false;

    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    await handleUploadFlow(blob);
  };

  mediaRecorder.start();
}

async function handleUploadFlow(blob) {
  try {
    updateStatus("Preparing upload...");

    // Get Session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      updateStatus("Not signed in. Please sign in to upload.", 'error');
      return;
    }

    const start = Date.now();
    const user = session.user;
    const meetingId = crypto.randomUUID();
    const artifactId = crypto.randomUUID();

    // Create Meeting Row
    updateStatus("Creating meeting...");
    const { error: meetingError } = await supabase
      .from('meetings')
      .insert({
        id: meetingId,
        owner_id: user.id,
        title: `Recording ${new Date().toLocaleString()}`,
        status: 'created',
        created_at: new Date().toISOString()
      });

    if (meetingError) throw new Error("Create Meeting: " + meetingError.message);

    // Upload File
    updateStatus("Uploading video...");
    const fileName = `${artifactId}.webm`;
    const storagePath = `${user.id}/${meetingId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('meeting-media')
      .upload(storagePath, blob, {
        contentType: 'video/webm',
        upsert: false
      });

    if (uploadError) throw new Error("Upload: " + uploadError.message);

    // Create Artifact Row
    updateStatus("Finalizing...");
    const { error: artifactError } = await supabase
      .from('meeting_artifacts')
      .insert({
        owner_id: user.id,
        meeting_id: meetingId,
        kind: 'video',
        storage_bucket: 'meeting-media',
        storage_path: storagePath,
        mime_type: 'video/webm',
        bytes: blob.size
      });

    if (artifactError) throw new Error("Create Artifact: " + artifactError.message);

    updateStatus("Upload complete!", 'success');

    // Open in Web App
    chrome.tabs.create({ url: `${WEB_APP_ORIGIN}/meetings/${meetingId}` });

  } catch (err) {
    console.error("Upload Flow Error", err);
    updateStatus("Failed: " + err.message, 'error');
  }
}

// Init
updateUI();
