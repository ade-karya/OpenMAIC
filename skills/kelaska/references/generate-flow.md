# Generate Flow

## Preconditions

- Repo path is confirmed and on branch `Sekolah`
- Startup mode has been chosen
- KelasKA is healthy at the selected `url`
- Provider keys are configured

> **Hosted mode**: If using hosted KelasKA (kelas-ka.riau.ai), all
> preconditions (repo, startup, provider keys) are already satisfied.
> Include `Authorization: Bearer <access-code>` header on all requests below.
> See [hosted-mode.md](hosted-mode.md) for details.

## Requirement-Only Generation

If the user has already clearly asked to generate the classroom and the preconditions are satisfied, submit the generation job immediately. Do not ask for a second confirmation just before calling `/api/generate-classroom`.

Submit the job with:

```text
POST {url}/api/generate-classroom
```

Request body:

```json
{
  "requirement": "Buat kelas pengantar mekanika kuantum untuk siswa SMA"
}
```

Only send supported content fields:

- `requirement` (required)
- optional `pdfContent` — object with `text` (string) and `images` (array of base64 strings)
- optional `language` (`"id-ID"` | `"en-US"` | `"ar-SA"`) — defaults to `"id-ID"` when omitted or unrecognized
- optional `enableWebSearch` (boolean) — enriches outlines with real-time Tavily web search context
- optional `enableImageGeneration` (boolean) — allow image generation metadata in outlines
- optional `enableVideoGeneration` (boolean) — allow video generation metadata in outlines
- optional `enableTTS` (boolean) — enable server-side TTS audio generation for speech actions
- optional `agentMode` (`"default"` | `"generate"`) — controls agent profile strategy:
  - `"default"` (or omitted): uses built-in default agents
  - `"generate"`: uses LLM to generate custom agent profiles tailored to the course content (3-5 agents, exactly 1 teacher)
- optional `pinToken` — session token for PIN-authenticated users; grants access to per-PIN provider configs

All optional boolean fields default to `false` when omitted. Omitting them preserves backward compatibility.
