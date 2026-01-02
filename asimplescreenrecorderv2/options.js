const SUPABASE_URL = 'https://hqcklghtagnlihrccyqo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_62VlwOdM2EdbgEjyndfD1g_dW2WvWm5';
const WEB_APP_ORIGIN = 'http://localhost:3000';
// In production, this might change.
const EXCHANGE_API_URL = `${WEB_APP_ORIGIN}/api/exchange-pair-code`;

let mediaRecorder;
let recordedChunks = [];
let lastRecordedBlob = null;

function updateStatus(msg, type = 'normal') {
  const el = document.getElementById('status');
  if (el) {
    el.textContent = msg;
    el.className = 'status ' + (type === 'error' ? 'error' : (type === 'success' ? 'success' : ''));
  }
  console.log('[Recorder Status]', msg);
}

function updatePairingStatus(msg, type = 'normal') {
  const el = document.getElementById('pairingStatus');
  if (el) {
    el.textContent = msg;
    el.className = 'status ' + (type === 'error' ? 'error' : (type === 'success' ? 'success' : ''));
  }
}

function showPairingUI() {
  document.getElementById('pairingUI').style.display = 'block';
  updateStatus('Authentication required. Please connect your account.', 'error');
}

// --- Recording & UI Event Listeners ---

document.getElementById('startCapture').addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
    handleStream(stream);
    document.getElementById('stopCapture').disabled = false;
    document.getElementById('startCapture').disabled = true;
    recordedChunks = [];
    updateStatus("Recording...");
  } catch (error) {
    console.error('Error capturing screen:', error);
    updateStatus("Error starting capture: " + error.message, 'error');
  }
});

document.getElementById('stopCapture').addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
});

document.getElementById('download').addEventListener('click', () => {
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

// --- Pairing Logic ---

document.getElementById('submitCodeBtn').addEventListener('click', async () => {
  const codeInput = document.getElementById('pairingCodeInput');
  const code = codeInput.value.trim();
  if (!code) return;

  updatePairingStatus('Connecting...');

  try {
    // Exchange logic
    const res = await fetch(EXCHANGE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to exchange code');
    }

    if (!data.refresh_token) {
      throw new Error('No refresh token received');
    }

    // Save token
    await chrome.storage.local.set({ 'sb_refresh_token': data.refresh_token });

    updatePairingStatus('Connected successfully!', 'success');
    document.getElementById('pairingUI').style.display = 'none';
    codeInput.value = '';

    // Retry upload if pending
    if (lastRecordedBlob) {
      handleUploadFlow(lastRecordedBlob);
    }

  } catch (err) {
    console.error(err);
    updatePairingStatus(err.message, 'error');
  }
});

// --- Auth & Upload Logic ---

function handleStream(stream) {
  mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });

  mediaRecorder.ondataavailable = event => {
    if (event.data.size > 0) {
      recordedChunks.push(event.data);
    }
  };

  mediaRecorder.onstop = async () => {
    stream.getTracks().forEach(track => track.stop());
    document.getElementById('stopCapture').disabled = true;
    document.getElementById('startCapture').disabled = false;
    document.getElementById('download').disabled = false;

    const blob = new Blob(recordedChunks, { type: 'video/webm' });
    await handleUploadFlow(blob);
  };

  mediaRecorder.start();
}

async function handleUploadFlow(blob) {
  lastRecordedBlob = blob;
  try {
    updateStatus("Authenticating...");
    const accessToken = await getValidToken();

    if (!accessToken) {
      showPairingUI();
      return;
    }

    updateStatus("Fetching User Profile...");
    const user = await getUser(accessToken);
    if (!user || !user.id) throw new Error("Could not retrieve user details.");

    const meetingId = crypto.randomUUID();
    const artifactId = crypto.randomUUID();
    const fileName = `${artifactId}.webm`;
    const storagePath = `${user.id}/${meetingId}/${fileName}`;

    updateStatus("Creating Meeting...");
    await createMeeting(accessToken, meetingId, user.id);

    updateStatus("Uploading Video...");
    await uploadFile(accessToken, blob, storagePath);

    updateStatus("Linking Artifact...");
    await createArtifact(accessToken, meetingId, user.id, storagePath, blob.size);

    updateStatus("Done! Opening Meeting...", 'success');
    chrome.tabs.create({ url: `${WEB_APP_ORIGIN}/meetings/${meetingId}` });

  } catch (err) {
    console.error(err);
    updateStatus("Failed: " + err.message, 'error');
    // If it was an auth error (401), we might want to trigger pairing UI
    if (err.message.includes('401') || err.message.includes('Unauthorized')) {
      showPairingUI();
    }
  }
}

async function getValidToken() {
  // 1. Check storage
  const stored = await chrome.storage.local.get(['sb_refresh_token']);
  if (!stored.sb_refresh_token) return null;

  // 2. Exchange Refresh Token for Access Token
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token: stored.sb_refresh_token })
    });

    if (!res.ok) {
      // If invalid refresh token, clear it
      if (res.status === 400 || res.status === 401) {
        await chrome.storage.local.remove(['sb_refresh_token']);
      }
      return null;
    }

    const data = await res.json();

    // Update stored refresh token
    if (data.refresh_token) {
      await chrome.storage.local.set({ 'sb_refresh_token': data.refresh_token });
    }

    return data.access_token;

  } catch (e) {
    console.warn('Token Refresh Error:', e);
    return null;
  }
}

// --- Supabase Helpers ---

async function supabaseFetch(endpoint, method, token, body = null, isStorage = false) {
  const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${token}`
  };
  if (!isStorage) {
    headers['Content-Type'] = 'application/json';
    headers['Prefer'] = 'return=minimal';
  }

  const url = `${SUPABASE_URL}${endpoint}`;
  const options = {
    method,
    headers,
    body: body ? (isStorage ? body : JSON.stringify(body)) : undefined
  };

  const res = await fetch(url, options);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`API Error (${res.status}): ${txt}`);
  }
  return res;
}

async function getUser(token) {
  const res = await supabaseFetch('/auth/v1/user', 'GET', token);
  return res.json();
}

async function createMeeting(token, id, ownerId) {
  const payload = {
    id,
    owner_id: ownerId,
    title: 'New Screen Recording',
    status: 'created',
    created_at: new Date().toISOString()
  };
  await supabaseFetch('/rest/v1/meetings', 'POST', token, payload);
}

async function createArtifact(token, meetingId, ownerId, storagePath, bytes) {
  const payload = {
    owner_id: ownerId,
    meeting_id: meetingId,
    kind: 'video',
    storage_bucket: 'meeting-media',
    storage_path: storagePath,
    mime_type: 'video/webm',
    bytes: bytes
  };
  await supabaseFetch('/rest/v1/meeting_artifacts', 'POST', token, payload);
}

async function uploadFile(token, fileBody, path) {
  await supabaseFetch(`/storage/v1/object/meeting-media/${path}`, 'POST', token, fileBody, true);
}
