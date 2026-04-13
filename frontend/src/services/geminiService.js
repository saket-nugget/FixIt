import { CONFIG } from '../config/config';

const BASE_URL = "https://generativelanguage.googleapis.com";

/**
 * Uploads a file to the Gemini File API.
 * @param {File} file 
 * @returns {Promise<string>} The URI of the uploaded file.
 */
async function uploadFile(file) {
    const uploadUrl = `${BASE_URL}/upload/v1beta/files?key=${CONFIG.API_KEY}`;

    const metadata = {
        file: {
            display_name: file.name,
        }
    };

    // 1. Start upload session
    const startUploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
            'X-Goog-Upload-Protocol': 'resumable',
            'X-Goog-Upload-Command': 'start',
            'X-Goog-Upload-Header-Content-Length': file.size,
            'X-Goog-Upload-Header-Content-Type': file.type,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(metadata),
    });

    if (!startUploadResponse.ok) {
        throw new Error(`Failed to start upload: ${startUploadResponse.statusText}`);
    }

    const uploadUrlWithId = startUploadResponse.headers.get('X-Goog-Upload-URL');

    // 2. Upload actual bytes
    const uploadResponse = await fetch(uploadUrlWithId, {
        method: 'POST',
        headers: {
            'X-Goog-Upload-Protocol': 'resumable',
            'X-Goog-Upload-Command': 'upload, finalize',
            'X-Goog-Upload-Offset': '0',
            'Content-Length': file.size,
        },
        body: file,
    });

    if (!uploadResponse.ok) {
        throw new Error(`Failed to upload file: ${uploadResponse.statusText}`);
    }

    const uploadResult = await uploadResponse.json();
    return uploadResult.file.uri;
}

/**
 * Waits for the file to be in ACTIVE state.
 * @param {string} fileUri 
 */
async function waitForFileActive(fileUri) {
    const fileName = fileUri.split('/').pop(); // Extract name from URI if needed, but the API usually takes the full name resource
    // Actually fileUri is like https://generativelanguage.googleapis.com/v1beta/files/NAME
    // We need to GET that URL.

    // The fileUri returned by upload is the full resource URL.
    // We need to append key to it.
    const checkUrl = `${fileUri}?key=${CONFIG.API_KEY}`;



    let attempts = 0;
    const maxAttempts = 30; // Wait up to 60 seconds (2s interval)

    while (attempts < maxAttempts) {
        const response = await fetch(checkUrl);
        if (!response.ok) {
            throw new Error(`Failed to check file state: ${response.statusText}`);
        }
        const data = await response.json();
        const state = data.state; // e.g., PROCESSING, ACTIVE, FAILED



        if (state === 'ACTIVE') {
            return;
        }

        if (state === 'FAILED') {
            throw new Error("File processing failed on server.");
        }

        // Wait 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts++;
    }

    throw new Error("File processing timed out.");
}

/**
 * Analyzes a video file to diagnose the issue.
 * @param {File} videoFile 
 * @returns {Promise<Object>} The diagnosis result.
 */
export async function analyzeVideo(videoFile) {
    try {

        const fileUri = await uploadFile(videoFile);


        // Wait for file to be ACTIVE
        await waitForFileActive(fileUri);


        const generateUrl = `${BASE_URL}/v1beta/models/${CONFIG.MODEL_NAME}:generateContent?key=${CONFIG.API_KEY}`;

        const prompt = `
      You are an expert mechanic AI. Analyze this media (image or video).
      If it shows a broken machine or mechanical component, identify the issue, root cause, and recommend fixes.
      If it does NOT show a machine (e.g., it shows a person, animal, or random object), diagnose it as "Unknown Object" or "No Machine Detected" and explain why in the rootCause.
      
      Return the result as a JSON object with the following structure:
      {
        "diagnosis": "Short title of the diagnosis (or 'No Machine Detected')",
        "confidence": 95,
        "rootCause": "Detailed explanation of the root cause or why this is not a machine",
        "fixes": ["Fix step 1", "Fix step 2", "Fix step 3"] (or general advice if not a machine),
        "visualEvidence": ["Observation 1", "Observation 2"] (List specific visual cues seen in the media, e.g. 'Rust on chain', 'Smoke', 'Loose wire')
      }
      ONLY return the JSON object, no markdown formatting.
    `;

        const response = await fetch(generateUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { file_data: { mime_type: videoFile.type, file_uri: fileUri } }
                    ]
                }]
            })
        });

        if (!response.ok) {
            let errorMessage = response.statusText;
            try {
                const errorData = await response.json();
                errorMessage = errorData.error?.message || JSON.stringify(errorData);
            } catch (e) { /* ignore */ }
            throw new Error(`Analysis failed (${response.status}): ${errorMessage}`);
        }

        const data = await response.json();
        const text = data.candidates[0].content.parts[0].text;

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Error in analyzeVideo:", error);
        throw error;
    }
}

/**
 * Sends a message to the chat model.
 * @param {Array} history 
 * @param {string} message 
 * @param {string} systemPrompt 
 * @returns {Promise<string>} The model's response.
 */
export async function chatWithGemini(history, message, systemPrompt) {
    const generateUrl = `${BASE_URL}/v1beta/models/${CONFIG.MODEL_NAME}:generateContent?key=${CONFIG.API_KEY}`;

    const contents = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
    }));

    contents.push({
        role: 'user',
        parts: [{ text: message }]
    });

    const response = await fetch(generateUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            system_instruction: {
                parts: [{ text: systemPrompt }]
            },
            contents: contents
        })
    });

    if (!response.ok) {
        let errorMessage = response.statusText;
        try {
            const errorData = await response.json();
            errorMessage = errorData.error?.message || JSON.stringify(errorData);
        } catch (e) { /* ignore */ }
        throw new Error(`Chat failed (${response.status}): ${errorMessage}`);
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
}
