import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Health Check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API Route: NVIDIA NIM AI Decision Endpoint
  app.post('/api/decision', async (req, res) => {
    const apiKey = process.env.NVIDIA_API_KEY;
    const modelName = process.env.NVIDIA_NIM_MODEL || 'meta/llama-3.3-70b-instruct';

    if (!apiKey) {
      console.warn('[NIM Proxy] NVIDIA_API_KEY environment variable is missing. Activating fallback.');
      return res.status(200).json({
        ok: false,
        fallback: true,
        reason: 'NVIDIA_API_KEY environment variable is not configured. Engaging fallback rule engine.',
      });
    }

    const { incident, availableResources } = req.body || {};

    const systemPrompt = `You are the URSAI Emergency Coordination AI Decision Engine.
Analyze the simulated urban incident and determine which URSAI agents should participate.

You MUST return ONLY a valid, single raw JSON object matching this exact schema:
{
  "severity": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "requiredAgents": ["AMBULANCE", "POLICE", "TRAFFIC", "HOSPITAL"],
  "hospitalRequired": boolean,
  "greenCorridor": boolean,
  "reason": "Short concise strategic explanation (1-2 sentences)"
}

Do NOT wrap in markdown, do NOT include backticks, do NOT add introductory or concluding text. Return pure JSON only.`;

    const userPrompt = `INCIDENT DETAILS:
- ID: ${incident?.id || 'INC-UNKNOWN'}
- Type: ${incident?.type || 'ROAD ACCIDENT'}
- Severity: ${incident?.severity || 'HIGH'}
- Coordinates: ${incident?.latitude}, ${incident?.longitude}
- Description: ${incident?.description || 'Urban vehicular collision reported.'}

AVAILABLE RESOURCES:
- Ambulance: Available at T. Nagar Depot
- Police: Available at Egmore HQ
- Traffic Control: Signals ready for Green Corridor override
- Hospitals: ${availableResources?.hospitalCount || 6} emergency care centers available in Chennai`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 300,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        console.warn(`[NIM Proxy] NVIDIA NIM API returned status ${response.status}`);
        return res.status(200).json({
          ok: false,
          fallback: true,
          reason: `NVIDIA NIM API responded with status ${response.status}`,
        });
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content || '';

      // Clean possible markdown backticks from model output
      const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedJson = JSON.parse(cleaned);

      return res.status(200).json({
        ok: true,
        decision: parsedJson,
        engine: 'NVIDIA NIM',
        model: modelName,
      });
    } catch (err: any) {
      clearTimeout(timeout);
      const isAbort = err.name === 'AbortError' || err.message?.includes('aborted');
      console.warn(`[NIM Proxy] ${isAbort ? 'NVIDIA NIM call timed out (engaging fallback)' : 'Error executing NVIDIA NIM call:'}`, err.message || err);
      return res.status(200).json({
        ok: false,
        fallback: true,
        reason: isAbort ? 'NVIDIA NIM request timed out' : 'Failed to parse NIM response',
      });
    }
  });

  // API Route: NVIDIA NIM Situation Awareness & Predictive Intelligence Endpoint
  app.post('/api/predict', async (req, res) => {
    const apiKey = process.env.NVIDIA_API_KEY;
    const modelName = process.env.NVIDIA_NIM_MODEL || 'meta/llama-3.3-70b-instruct';

    if (!apiKey) {
      console.warn('[NIM Prediction Proxy] NVIDIA_API_KEY missing. Engaging rule-based fallback prediction.');
      return res.status(200).json({
        ok: false,
        fallback: true,
        reason: 'NVIDIA_API_KEY environment variable is not configured. Engaging fallback prediction engine.',
      });
    }

    const { snapshot } = req.body || {};

    const systemPrompt = `You are the URSAI Situation Awareness and Prediction Engine.

Analyze the supplied simulated city emergency state.

Predict potential traffic impact, emergency response risk, hospital demand, and approximate response time.

Use only the supplied information.

Do not invent live city data.

Do not claim access to real hospital, police, ambulance, CCTV, or traffic systems.

Return ONLY valid JSON matching the required schema.`;

    const userPrompt = `SIMULATED EMERGENCY STATE SNAPSHOT:
Incident Details:
- ID: ${snapshot?.incident?.id || 'N/A'}
- Type: ${snapshot?.incident?.type || 'N/A'}
- Severity: ${snapshot?.incident?.severity || 'N/A'}
- Coordinates: ${snapshot?.incident?.latitude}, ${snapshot?.incident?.longitude}
- Age (seconds): ${snapshot?.incident?.ageSeconds || 0}
- Status: ${snapshot?.incident?.status || 'N/A'}

Simulated City Environment:
- Traffic Level: ${snapshot?.city?.trafficLevel || 'LOW'} (Congestion Index: ${snapshot?.city?.congestionIndex ?? 0.25}, Avg Speed: ${snapshot?.city?.averageSpeedKmh ?? 45} km/h)
- Weather Condition: ${snapshot?.city?.weatherCondition || 'CLEAR'} (Temp: ${snapshot?.city?.temperatureC ?? 31}°C, Visibility: ${snapshot?.city?.visibilityKm ?? 8} km)
- Affected Roads Count: ${snapshot?.city?.affectedRoadsCount ?? 0}
- Available Emergency Resources: ${snapshot?.city?.ambulancesAvailable ?? 5} Ambulances, ${snapshot?.city?.policeUnitsAvailable ?? 5} Police Units
- Hospital Pressure: ${snapshot?.city?.hospitalPressure || 'LOW'}

Agents:
- Ambulance Status: ${snapshot?.agents?.ambulance?.status || 'N/A'} (Task: ${snapshot?.agents?.ambulance?.task || 'N/A'}, ETA: ${snapshot?.agents?.ambulance?.etaSeconds ? Math.round(snapshot?.agents?.ambulance?.etaSeconds / 60) + 'm' : 'N/A'})
- Police Status: ${snapshot?.agents?.police?.status || 'N/A'} (ETA: ${snapshot?.agents?.police?.etaSeconds ? Math.round(snapshot?.agents?.police?.etaSeconds / 60) + 'm' : 'N/A'})
- Hospital: ${snapshot?.agents?.hospital?.selectedName || 'None selected'} (Beds: ${snapshot?.agents?.hospital?.bedsAvailable ?? 'N/A'}, ICU Beds: ${snapshot?.agents?.hospital?.icuBedsAvailable ?? 'N/A'}, Emergency Ready: ${snapshot?.agents?.hospital?.emergencyReady ? 'YES' : 'NO'})

RETURN ONLY A RAW JSON OBJECT WITH THIS EXACT SCHEMA:
{
  "trafficImpact": {
    "level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    "description": "Concise explanation (1-2 sentences)"
  },
  "responseRisk": {
    "level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    "description": "Concise explanation (1-2 sentences)"
  },
  "hospitalDemand": {
    "level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    "description": "Concise explanation (1-2 sentences)"
  },
  "routeDifficulty": {
    "level": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
    "description": "Concise explanation (1-2 sentences)"
  },
  "predictedResponseTimeMinutes": number,
  "recommendedMonitoring": [
    "Short recommendation string 1",
    "Short recommendation string 2",
    "Short recommendation string 3"
  ],
  "situationSummary": "Concise situation summary string"
}

No markdown wrappers. No backticks. Pure raw JSON only.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.2,
          max_tokens: 500,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        console.warn(`[NIM Prediction Proxy] NVIDIA NIM API returned status ${response.status}`);
        return res.status(200).json({
          ok: false,
          fallback: true,
          reason: `NVIDIA NIM API responded with status ${response.status}`,
        });
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content || '';

      // Clean possible markdown backticks
      const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsedJson = JSON.parse(cleaned);

      return res.status(200).json({
        ok: true,
        prediction: parsedJson,
        engine: 'NVIDIA NIM',
        model: modelName,
      });
    } catch (err: any) {
      clearTimeout(timeout);
      const isAbort = err.name === 'AbortError' || err.message?.includes('aborted');
      console.warn(`[NIM Prediction Proxy] ${isAbort ? 'NVIDIA NIM prediction call timed out (engaging fallback)' : 'Error executing NVIDIA NIM call:'}`, err.message || err);
      return res.status(200).json({
        ok: false,
        fallback: true,
        reason: isAbort ? 'NVIDIA NIM prediction request timed out' : 'Failed to parse NIM prediction response',
      });
    }
  });

  // API Route: NVIDIA NIM Adaptive Replanning Endpoint (Phase 8)
  app.post('/api/replan', async (req, res) => {
    const apiKey = process.env.NVIDIA_API_KEY;
    const modelName = process.env.NVIDIA_NIM_MODEL || 'meta/llama-3.3-70b-instruct';

    if (!apiKey) {
      return res.status(200).json({
        ok: false,
        fallback: true,
        reason: 'NVIDIA_API_KEY not set. Using rule-based fallback replanning.',
      });
    }

    const { snapshot, currentPlan, triggers } = req.body || {};

    const systemPrompt = `You are the URSAI Adaptive Mission Coordinator AI.
Evaluate the active mission response plan against changed city emergency conditions.

RECOMMEND ONLY: "KEEP_PLAN" OR "REPLAN".
Specify targets if replanning: "AMBULANCE", "POLICE", "TRAFFIC", or "HOSPITAL".

Return ONLY raw JSON matching this schema:
{
  "recommendation": "KEEP_PLAN" | "REPLAN",
  "priority": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "reason": "Clear explanation of plan evaluation decision",
  "changes": [
    {
      "target": "AMBULANCE" | "POLICE" | "TRAFFIC" | "HOSPITAL",
      "action": "Description of recommended adaptation",
      "reason": "Justification for change"
    }
  ]
}`;

    const userPrompt = `ACTIVE MISSION STATE:
Plan Version: v${currentPlan?.version || 1}
Reasoning: ${currentPlan?.reason || 'Initial emergency plan'}
Triggers Detected: ${(triggers || []).join(', ') || 'None'}

CITY & AGENT SNAPSHOT:
Incident Severity: ${snapshot?.incident?.severity || 'STANDARD'}
City Congestion Index: ${snapshot?.city?.congestionIndex ?? 0.3}
Weather Condition: ${snapshot?.city?.weatherCondition || 'CLEAR'}
Hospital Pressure: ${snapshot?.city?.hospitalPressure || 'LOW'}
Ambulance ETA: ${snapshot?.agents?.ambulance?.etaSeconds ? Math.round(snapshot?.agents?.ambulance?.etaSeconds / 60) + 'm' : 'N/A'}
Selected Hospital ICU: ${snapshot?.agents?.hospital?.icuBedsAvailable ?? 'N/A'}

Return ONLY a JSON object. No backticks. No markdown.`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.1,
          max_tokens: 400,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        return res.status(200).json({ ok: false, fallback: true, reason: `Status ${response.status}` });
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content || '';
      const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      return res.status(200).json({
        ok: true,
        recommendation: parsed,
        engine: 'NVIDIA NIM',
      });
    } catch (err: any) {
      clearTimeout(timeout);
      const isAbort = err.name === 'AbortError' || err.message?.includes('aborted');
      return res.status(200).json({
        ok: false,
        fallback: true,
        reason: isAbort ? 'NIM replan request timed out' : 'NIM replan failed',
      });
    }
  });

  // Vite middleware for development vs static serve in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[URSAI Core] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
