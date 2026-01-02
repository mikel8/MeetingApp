async function transcribeAudio(audioFile) {
  const apiKey = 'AIzaSyAAacotNio4tzSqgiosoB9So4oOm0UbmYk'; // Your Google Cloud API key
  const url = `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`;

  console.log("Uploading audio file:", audioFile);


  // Show loading message
  document.getElementById('loadingMessage').style.display = 'block';

  // Convert audio file to base64
  const audioBytes = await fileToBase64(audioFile);
  console.log("Base64 audio bytes:", audioBytes.substring(0, 30) + "..."); // Log a snippet of base64 for brevity

  // Get audio config
  const { encoding, sampleRateHertz } = getAudioConfig(audioFile);
  console.log("Audio Config:", { encoding, sampleRateHertz });

  const selectedLanguage = document.getElementById('languageSelect').value;

  const requestBody = {
      config: {
          encoding,
          sampleRateHertz,
          // languageCode: "en-US",
          languageCode: selectedLanguage,
      },
      audio: {
          content: audioBytes,
      }
  };

  try {
      // Send audio to Google Cloud for transcription
      const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      console.log("API Response:", result); // Log the full API response

      // Display the transcription result
      displayTranscriptionResult(result);
  } catch (error) {
      console.error("Error during transcription:", error);
  }
}

// Function to display the transcription result
function displayTranscriptionResult(result) {
  const transcriptionOutputElement = document.getElementById('transcriptionOutput');
  const copyBtn = document.getElementById('copyBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  if (result.results && result.results.length > 0) {
      const transcriptions = result.results.map(res => res.alternatives[0].transcript).join('\n');
      console.log("Transcriptions found:", transcriptions); // Log the transcriptions
      transcriptionOutputElement.value = transcriptions; // Set the value of the textarea

        // Show buttons when transcription is available
        copyBtn.style.display = 'inline';
        downloadBtn.style.display = 'inline';
  } else {
      transcriptionOutputElement.value = 'No transcription available.';
      console.log("No transcription available."); // Log when no transcription is found
  }
}

// Helper function to convert audio file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]); // Get base64 content
      reader.onerror = reject;
  });
}

// Function to get audio configuration based on file type
function getAudioConfig(file) {
  const extension = file.name.split('.').pop().toLowerCase();

  switch (extension) {
      case 'wav':
          // return { encoding: "LINEAR16", sampleRateHertz: 16000 };
          return { encoding: "LINEAR16", sampleRateHertz: 44100 };
      case 'wav':
          // return { encoding: "LINEAR16", sampleRateHertz: 16000 };
          return { encoding: "LINEAR16", sampleRateHertz: 16000 };
      case 'flac':
          return { encoding: "FLAC", sampleRateHertz: 16000 };
      case 'mp3':
          return { encoding: "MP3", sampleRateHertz: 44100 };
      case 'opus':
          return { encoding: "ENCODING_UNSPECIFIED", sampleRateHertz: 48000 };
      case 'webm':
          return { encoding: "ENCODING_UNSPECIFIED", sampleRateHertz: 48000 };
      case 'm4a':
          return { encoding: "AAC", sampleRateHertz: 44100 };
      default:
          throw new Error(`Unsupported audio format: ${extension}`);
  }
}

// Function to copy text to clipboard
function copyToClipboard() {
  const transcriptionOutputElement = document.getElementById('transcriptionOutput');
  transcriptionOutputElement.select();
  document.execCommand('copy');
  alert("Transcription copied to clipboard!");
}

// Function to download the transcription output as a text file
function downloadTranscription() {
  const transcriptionOutputElement = document.getElementById('transcriptionOutput');
  const transcriptionText = transcriptionOutputElement.value;
  
  const blob = new Blob([transcriptionText], { type: 'text/plain' });
  const link = document.createElement('a');
  link.href = window.URL.createObjectURL(blob);
  link.download = 'transcription.txt';
  
  // Append to the body and trigger the download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


// Event listener for DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  console.log("Document loaded. Setting up event listener.");

  const transcribeButton = document.getElementById('transcribeBtn');
  const audioInput = document.getElementById('audioFileInput');

  transcribeButton.addEventListener('click', async () => {
      if (audioInput.files.length > 0) {
          const audioFile = audioInput.files[0];
          console.log("Selected audio file:", audioFile);
          await transcribeAudio(audioFile);
      } else {
          console.error("No audio file selected.");
      }
  });

  
});


// Event listeners for buttons
document.getElementById('transcribeBtn').addEventListener('click', () => {
  const audioFileInput = document.getElementById('audioFileInput');
  if (audioFileInput.files.length > 0) {
      // Hide buttons initially when a new transcription starts
      document.getElementById('copyBtn').style.display = 'none';
      document.getElementById('downloadBtn').style.display = 'none';
      transcribeAudio(audioFileInput.files[0]);
  } else {
      alert("Please select an audio file first.");
  }
});

document.getElementById('copyBtn').addEventListener('click', copyToClipboard);
document.getElementById('downloadBtn').addEventListener('click', downloadTranscription);