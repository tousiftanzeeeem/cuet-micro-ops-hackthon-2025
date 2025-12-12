# ARCHITECTURE.md

## 1. Architecture Diagram

The system utilizes a **Hybrid Asynchronous Architecture** designed to handle variable download times. It separates the "Control Plane" (API/Status) from the "Data Plane" (File Download) and dynamically selects the best communication protocol (WebSocket vs. Polling) based on the estimated job size.

[![](https://mermaid.ink/img/pako:eNqNVGtv4zYQ_CsLHu5iA478UJxIAtrCj_iSq5u4UQIDZ_cDLW1sxTRpUNSlaZD_3qUeruq0uCNgyCRndmd2V3plkYqRBWyt-X4D9-OlBFofP8INnafFbiQSlGZRPKANE62kQRn_UVxPh4up4jEMueAyQk2IkVBZ_Ci4xhIzmF0v6Ach6m-EuFJSOU9peXmHcZIuGvkDRjzaIHyCWbZqh9mqWWLmSm9RL4Y82q61ymRcnlQhstRMwkXxgNCF0CjN1zb9wdFEqGfoBHCDa2USbhIl6_7g9BSWrOvA7Da8hzamJtlxg0tGFz-TycpsviUvB2Nw6hCx58AV8vh29YSRgcZvaHjMDYfRBqNtk6I4RCv01Zg2petQBUymZQAn88theDv69fL-BJSGk9ntdHp98_mkFFEIPbY0CGCOq1BFW6TE4Y4L0Z7w1MAkEZg2_-3RSj3jDsxDGCkprdb2c_rLk1pdxz85jlMKrdu1lIc9DUiMFceWrgC-LwQ1DYyCspsbTgRR2bdnx_KHAcyUEIlcQ2PK9RrboT3-L_G2WmerqkOJTGwbf6hDljnL0g18Ubm63zPMKmKp6jhRnxJ9vqQ8qeEmS2Gq1L6W6mCiNpIzrSJM09zKYC0VjVDUrM14qUPtrYwyVjHG9SEvUGP1LIV9re54WYxKbm2G6oSHfQ4f6GiTfMPvgAeOfcGonbu9QNtOaMzD5vuC1DlDBx72NNMIV5wq2Si7dsT6p7mJ5ALGKEiNfnlf33MHxom2A3iw2phpTJO1xBge7qbNIw-HyKF5sYmLfUobrAI_JkIEHx7taqVGqy0GH1zXrSPLT0SF9P1O53-hec8qZJ9WHcla9NFMYhYYnWGL7VDvuN2yVxtjycwGd9SGgP7GXG-XbCnfiLPn8qtSu4pGg7PesOCRi5R2WV7fccLpbdsdTjV9a1GPaMQMC87P3TwIC17Znyy4cB3P7XXP3L7X6Xhd32uxFxZ0Xc_pd-nEP_cu-t7ZxcVbi_2Vp-04vtfp-W6v5_l-v-f3_be_ATywy_w?type=png)](https://mermaid.live/edit#pako:eNqNVGtv4zYQ_CsLHu5iA478UJxIAtrCj_iSq5u4UQIDZ_cDLW1sxTRpUNSlaZD_3qUeruq0uCNgyCRndmd2V3plkYqRBWyt-X4D9-OlBFofP8INnafFbiQSlGZRPKANE62kQRn_UVxPh4up4jEMueAyQk2IkVBZ_Ci4xhIzmF0v6Ach6m-EuFJSOU9peXmHcZIuGvkDRjzaIHyCWbZqh9mqWWLmSm9RL4Y82q61ymRcnlQhstRMwkXxgNCF0CjN1zb9wdFEqGfoBHCDa2USbhIl6_7g9BSWrOvA7Da8hzamJtlxg0tGFz-TycpsviUvB2Nw6hCx58AV8vh29YSRgcZvaHjMDYfRBqNtk6I4RCv01Zg2petQBUymZQAn88theDv69fL-BJSGk9ntdHp98_mkFFEIPbY0CGCOq1BFW6TE4Y4L0Z7w1MAkEZg2_-3RSj3jDsxDGCkprdb2c_rLk1pdxz85jlMKrdu1lIc9DUiMFceWrgC-LwQ1DYyCspsbTgRR2bdnx_KHAcyUEIlcQ2PK9RrboT3-L_G2WmerqkOJTGwbf6hDljnL0g18Ubm63zPMKmKp6jhRnxJ9vqQ8qeEmS2Gq1L6W6mCiNpIzrSJM09zKYC0VjVDUrM14qUPtrYwyVjHG9SEvUGP1LIV9re54WYxKbm2G6oSHfQ4f6GiTfMPvgAeOfcGonbu9QNtOaMzD5vuC1DlDBx72NNMIV5wq2Si7dsT6p7mJ5ALGKEiNfnlf33MHxom2A3iw2phpTJO1xBge7qbNIw-HyKF5sYmLfUobrAI_JkIEHx7taqVGqy0GH1zXrSPLT0SF9P1O53-hec8qZJ9WHcla9NFMYhYYnWGL7VDvuN2yVxtjycwGd9SGgP7GXG-XbCnfiLPn8qtSu4pGg7PesOCRi5R2WV7fccLpbdsdTjV9a1GPaMQMC87P3TwIC17Znyy4cB3P7XXP3L7X6Xhd32uxFxZ0Xc_pd-nEP_cu-t7ZxcVbi_2Vp-04vtfp-W6v5_l-v-f3_be_ATywy_w)

## 1. Data Flow Explanation



### Negotiation
- API checks RustFS metadata using `HeadObject`.
- If total size is **<50MB** and estimated time **<60s**, system assigns **WebSocket** mode.
- Larger jobs automatically switch to **Polling** mode.





[![](https://mermaid.ink/img/pako:eNqFkm1r2zAQx7_Kca8ycF0_1LMjRiD1kta0i8NsGGzeCzW-Jm5tK5PltUnId6-UhzEobHoh6Y7f_3-nhx0uREnIsKNfPbUL-lzxpeRN0YIeay5VtajWvFUQA-8grivS-8FUilZRW354z43niSHNkpH8TfI9kvmG-Np3aprpoGiPyEwoAqEVEFs6zWB-O84m4DKYTW7SPBnnSTo7ovHFaKQraCTNcrikTlUN1-odPFY1JWXH4Idt2z9hf-Q1qxXG85Z4mT480UKfIl7R4hkkf4Gu2lJ3OkzmX5zdM5OGAdlL2wLPcb5cgxKK1yfyOPNaQW6yBxw-QWC4wZR36sSdO9C2MdM9NvrKGRT4bXKdpfHdJC_QgifxcEcbk37dbAs8d051R3_bj072WS1e_mM_T-_vk9nNv8zbEi1cyqpEpmRPFjYkG25C3BmkQLWihgo00pLL5wKLdq81-h2_C9GcZVL0yxWyR667tbBfl_oxTj_pD6KLkYxF3ypkQ-dggWyHr8hcL7Rdz_FcP4yCKAqC0MINsjCyfdeLgo9OFAZe6AZ7C7eHoo4dRkPP913HvfI9dzi82r8B4OTSag?type=png)](https://mermaid.live/edit#pako:eNqFkm1r2zAQx7_Kca8ycF0_1LMjRiD1kta0i8NsGGzeCzW-Jm5tK5PltUnId6-UhzEobHoh6Y7f_3-nhx0uREnIsKNfPbUL-lzxpeRN0YIeay5VtajWvFUQA-8grivS-8FUilZRW354z43niSHNkpH8TfI9kvmG-Np3aprpoGiPyEwoAqEVEFs6zWB-O84m4DKYTW7SPBnnSTo7ovHFaKQraCTNcrikTlUN1-odPFY1JWXH4Idt2z9hf-Q1qxXG85Z4mT480UKfIl7R4hkkf4Gu2lJ3OkzmX5zdM5OGAdlL2wLPcb5cgxKK1yfyOPNaQW6yBxw-QWC4wZR36sSdO9C2MdM9NvrKGRT4bXKdpfHdJC_QgifxcEcbk37dbAs8d051R3_bj072WS1e_mM_T-_vk9nNv8zbEi1cyqpEpmRPFjYkG25C3BmkQLWihgo00pLL5wKLdq81-h2_C9GcZVL0yxWyR667tbBfl_oxTj_pD6KLkYxF3ypkQ-dggWyHr8hcL7Rdz_FcP4yCKAqC0MINsjCyfdeLgo9OFAZe6AZ7C7eHoo4dRkPP913HvfI9dzi82r8B4OTSag)

### Processing
- Background Worker performs compression, merging, packaging.
- Completely decoupled from API.

### Synchronization
- Worker sends updates to:
  - **Redis Pub/Sub** → WebSocket users
  - **Redis Hash** → Polling users

[![](https://mermaid.ink/img/pako:eNqdlO9T2jAYx_-V57Lz1BtiW-jA3s2dluqYCMzi2O36Ji2xZJaGpalTOf73PWnRygRvt74INM_n-flNuiCRmDDikJ2dBU-5cmCxq6ZsxnYd2A1pxnZrUG58o5LTMGEZWha4x-6VKxIhNfjOKB7NZjxOaTLaYk2FYttsNFJCbjMmQsw32pawXO7sBGnGfuUsjViH01jSWZACPnMqFY_4nKYKXKAZuAln-H_vTIpUsXSy_5o7GXY1qX98Ju-YfI10TjVxxSY8g72vOcvZ4TAP_TzcEG6s0bGQt5sC-Y0iUJ6pMx9fgrRE-jglEJga3BpuOzD8fOJ7YDngfffc61F30Ic9f55wBT0R82iVtlwlixTIONyzDKMGlm3jYhgr5Dm65PFUgbgB1wHf9fonV90BnDgw9k79gXvhjXBGNFMv3NyD42McCiI-HEYiTTHPp58ivGAPH-8fHisQIUQ7pxg4D7NI8pCBEhBNKfokEBB0crQHqXw6pwfoM3ZghIXF2PgXEVbWcWkbShGxDEduZ_vrRj2j63ki6ARVyfJErZt1LShQwrMppncHl8OeN_I6AYH3cH3VWytj1aR3p8_JGrzeIYJuMYtLLInGDO9ELhMHXer1OkZeljiesSdVK2EKTSyjWP5JGF3_oNfr9s9R90T83iTLcOCP4FDfYU4xTnku9RxfwPoW6dbkAzSyanstzjlqf5gpqvK_iEpXd8qiW_C3MOVkArKSi6dxMZEKLGayTVvTMv5D3ev5RDddlvS2xm83WjWwVU9SI7HkE-IombMamTE5o_qVLDQSkOJrGRDtOqHyVne-RB-88D-EmD25SZHHU-Lc0CTDt7yof_Xtet6VmI1JV-SpIo7VLmIQZ0HuiWPajXrbaDbbVvvINOyWadXIA3Earbp91Gralm1ZjdYH82hZI49FVqN-ZFsNw2rZpmmYZrtpLf8A93CxJQ?type=png)](https://mermaid.live/edit#pako:eNqdlO9T2jAYx_-V57Lz1BtiW-jA3s2dluqYCMzi2O36Ji2xZJaGpalTOf73PWnRygRvt74INM_n-flNuiCRmDDikJ2dBU-5cmCxq6ZsxnYd2A1pxnZrUG58o5LTMGEZWha4x-6VKxIhNfjOKB7NZjxOaTLaYk2FYttsNFJCbjMmQsw32pawXO7sBGnGfuUsjViH01jSWZACPnMqFY_4nKYKXKAZuAln-H_vTIpUsXSy_5o7GXY1qX98Ju-YfI10TjVxxSY8g72vOcvZ4TAP_TzcEG6s0bGQt5sC-Y0iUJ6pMx9fgrRE-jglEJga3BpuOzD8fOJ7YDngfffc61F30Ic9f55wBT0R82iVtlwlixTIONyzDKMGlm3jYhgr5Dm65PFUgbgB1wHf9fonV90BnDgw9k79gXvhjXBGNFMv3NyD42McCiI-HEYiTTHPp58ivGAPH-8fHisQIUQ7pxg4D7NI8pCBEhBNKfokEBB0crQHqXw6pwfoM3ZghIXF2PgXEVbWcWkbShGxDEduZ_vrRj2j63ki6ARVyfJErZt1LShQwrMppncHl8OeN_I6AYH3cH3VWytj1aR3p8_JGrzeIYJuMYtLLInGDO9ELhMHXer1OkZeljiesSdVK2EKTSyjWP5JGF3_oNfr9s9R90T83iTLcOCP4FDfYU4xTnku9RxfwPoW6dbkAzSyanstzjlqf5gpqvK_iEpXd8qiW_C3MOVkArKSi6dxMZEKLGayTVvTMv5D3ev5RDddlvS2xm83WjWwVU9SI7HkE-IombMamTE5o_qVLDQSkOJrGRDtOqHyVne-RB-88D-EmD25SZHHU-Lc0CTDt7yof_Xtet6VmI1JV-SpIo7VLmIQZ0HuiWPajXrbaDbbVvvINOyWadXIA3Earbp91Gralm1ZjdYH82hZI49FVqN-ZFsNw2rZpmmYZrtpLf8A93CxJQ)

### Delivery
- Final file is provided via **RustFS Presigned 
[![](https://mermaid.ink/img/pako:eNplkNFPgzAQxv-V5p40YYwVGKyJM8qYmhhjhjHR8FLhZM2gxVLUbdn_btmiL97T9_V-3zV3eyhUicCgw48eZYELwSvNm1wSWy3XRhSi5dKQhPCOJLVAq8-WWkmDsjz_z2X-AK76ziwza3J5Qh6UQaI-UZPEsc-MPN5eZSmxYpHe3z2nq5cTl4zm86F9kz6R8VtfbNCMS_Ula8VLdyfay05Ukpte44XruqdM5o9sKmEkMxp5Q66F5HpLlqJGcKDSogRmdI8ONKgbPljYD9EczBobzIFZWXK9ySGXB5uxm7wq1fzGtOqrNbB3XnfW9W3Jze-h_hB7DdSJ6qUBNjtOALaHb2ATSt3ID7ypT8PYC4J44sAWWOS5cRTQGQ0jj1IahwcHdsc_PTcKp4EfTyMaBrZNDz_3goFG?type=png)](https://mermaid.live/edit#pako:eNplkNFPgzAQxv-V5p40YYwVGKyJM8qYmhhjhjHR8FLhZM2gxVLUbdn_btmiL97T9_V-3zV3eyhUicCgw48eZYELwSvNm1wSWy3XRhSi5dKQhPCOJLVAq8-WWkmDsjz_z2X-AK76ziwza3J5Qh6UQaI-UZPEsc-MPN5eZSmxYpHe3z2nq5cTl4zm86F9kz6R8VtfbNCMS_Ula8VLdyfay05Ukpte44XruqdM5o9sKmEkMxp5Q66F5HpLlqJGcKDSogRmdI8ONKgbPljYD9EczBobzIFZWXK9ySGXB5uxm7wq1fzGtOqrNbB3XnfW9W3Jze-h_hB7DdSJ6qUBNjtOALaHb2ATSt3ID7ypT8PYC4J44sAWWOS5cRTQGQ0jj1IahwcHdsc_PTcKp4EfTyMaBrZNDz_3goFG)
**URL**.
- API bandwidth avoided for large binary responses.

---

## 2. Technical Approach

### Selected Pattern: Option D — Hybrid Approach  
**Strategy:** *Estimation-Based Routing with Fallback*

Use **WebSockets for fast jobs**, **Polling for long tasks**.

### Justification

#### Solving Proxy Timeout Limits (100s)
- Cloudflare / AWS ALB terminate requests after 100s.
- Long jobs must use Polling.
- Small jobs (<60s) use WebSockets for real-time experience.

#### User Experience
- Small jobs → **Smooth WS updates (60fps)**
- Large jobs → **Polling every 3s** (acceptable for long tasks)

#### Resource Efficiency
- Avoids long-running WebSocket connections.
- Avoids wasteful polling for 5s jobs.


#### Prevention of Retry Storms
- The Risk: 
 If a user’s connection drops or they impatiently refresh the page, they typically trigger a new request, duplicating the server workload.
- The Fix: 
 The architecture relies on Unique Job IDs (UUIDs).
- Outcome:
  If a connection breaks, the client reconnects using the existing jobId. The server simply returns the status of the running job rather than spawning a new background worker. This ensures 1 Job = 1 Worker process, regardless of how many times the client disconnects or retries.
---

## 3. Implementation Details

### A. API Contract Changes

#### 1. `/v1/download/estimate` — New Endpoint
**Method:** POST  
**Purpose:** Size estimation + mode selection.

**Response Example:**
```json
{
  "jobId": "uuid-1234",
  "mode": "WEBSOCKET",
  "estimatedSeconds": 45,
  "websocketUrl": "wss://api.domain.com/v1/download/ws?jobId=uuid-1234"
}
```


## A. API Contract Changes & New Endpoints

We need to introduce a "Negotiation Phase" and split the execution logic.

### 1. New Endpoint: Negotiation (The Brain)

**Path:** `POST /v1/download/estimate`

**Purpose:** Calculates job complexity using RustFS metadata to decide the protocol.

**Request:**
```json
{
  "file_ids": [1001, 1002, 1005]
}
```

**Response:**
```json
{
  "jobId": "uuid-550e-8400...",
  "mode": "WEBSOCKET", // or "POLLING"
  "estimatedDuration": 15,
  "websocketUrl": "wss://api.yoursite.com/v1/download/ws?jobId=uuid-550e...",
  "pollingUrl": "/v1/download/initiate" // if POLLING
}
```

### 2. New Endpoint: WebSocket Connection (Fast Lane)

**Path:** `GET /v1/download/ws` (Upgrade Request)

**Query Param:** `?jobId={uuid}`

**Protocol:** WebSocket (WS/WSS)

**Behavior:**

- **On Connect:** Subscribes API to Redis Channel `job:{uuid}`
- **On Message (Server → Client):**
  ```json
  {
    "status": "processing",
    "progress": 45
  }
  ```


- **On Completion (Server → Client):**
  ```json
  {
    "status": "completed",
    "downloadUrl": "https://rustfs.bucket..."
  }
  ```

### 3. Modified Endpoint: Initiate Polling (Slow Lane)

**Path:** `POST /v1/download/initiate`

**Change:** Now requires the `jobId` generated by the `/estimate` endpoint to ensure state consistency.

**Request:**
```json
{
  "jobId": "uuid-550e..."
}
```

**Response:** `202 Accepted`

### 4. Existing Endpoint: Check Status (Polling Loop)

**Path:** `GET /v1/download/status/:jobId`

**Response:** Returns standard JSON status (Queue position, Progress, or Final RustFS URL).

---

## B. Database & Cache Schema (Redis)

We use Redis for Queue, State Persistence, and Real-time Messaging.

### 1. Job State (Hash)

**Key:** `job:{jobId}`

**TTL:** 3600 seconds (1 hour)

**Fields:**
- `status`: `queued` | `processing` | `completed` | `failed`
- `mode`: `websocket` | `polling`
- `s3Key`: `downloads/{jobId}.zip`
- `downloadUrl`: (Presigned URL string)
- `error`: (Error message string)

### 2. Message Queue (List/Stream via BullMQ)

**Key:** `queue:download-processing`

**Payload:**
```json
{
  "jobId": "...",
  "fileIds": [...]
}
```

### 3. Pub/Sub Channel (For WebSockets)

**Channel Name:** `events:{jobId}`

**Payload:** JSON string of status updates.

---

## C. Background Job Processing Strategy

We decouple the Frontend Mode from the Backend Work. The Worker is "agnostic"—it doesn't care if the user is polling or using sockets; it updates both channels.

### Worker Logic (Node.js + BullMQ):

1. Pop Job from `queue:download-processing`
2. **Process:** Download files from RustFS → Zip
3. **Upload:** Put `.zip` back to RustFS
4. **Sign:** Generate Presigned URL (valid for 15 mins)
5. **Broadcast (The Hybrid Glue):**
   - **Action A:** Update Redis Hash (For Polling users)
   - **Action B:** Publish to Redis Channel `events:{jobId}` (For WebSocket users)

**Result:** Whichever method the client is using, they get the update.

---

## D. Error Handling & Retry Logic

| Failure Scenario | Component | Strategy |
|-----------------|-----------|----------|
| Worker fails to Zip | Worker | **BullMQ Retry:** Auto-retry 3 times with exponential backoff. If 4th fail, mark Redis status as `failed`. |
| WebSocket disconnects | Frontend | **Fallback:** Client JS catches `onclose`. If status is not "completed", immediately switch to Polling logic. |
| Redis Down | API | **Fail Fast:** Return HTTP 503. Frontend waits 5s and retries `/estimate`. |
| RustFS 500 Error | Worker | **Retry:** The AWS SDK S3Client has built-in retries. If exhausted, throw error to BullMQ. |

---

## E. Timeout Configuration

| Component | Timeout | Notes |
|-----------|---------|-------|
| **Load Balancer / Cloudflare** | 100 Seconds | Hard limit |
| **API HTTP Endpoints** | 30 Seconds | Fail fast if Redis is slow |
| **WebSocket Connection** | 90 Seconds | Keep-alive. Intentionally slightly lower than Cloudflare to trigger a clean disconnect/fallback before the proxy hard-kills it. |
| **Worker Job** | 300 Seconds (5 Minutes) | If a zip takes longer, kill it to prevent zombie processes. |

---

## 4. Proxy Configuration

### A. Cloudflare Configuration

Cloudflare requires specific settings to allow WebSockets and to prevent caching of our status endpoints.

#### WebSockets:
1. Go to **Network settings**
2. Ensure **WebSockets** is toggled **ON**

#### Page Rules (Caching):
We must ensure Cloudflare doesn't cache the API responses.

**Rule:** `api.yourdomain.com/v1/download/*`
- **Cache Level:** Bypass
- **Origin Cache Control:** On

#### Timeouts:
- Cloudflare Enterprise allows >100s timeouts. On Free/Pro, you are stuck with 100s.
- **Our Architecture Fix:** The Hybrid Fallback logic on the client handles this. If Cloudflare kills the WS at 100s, the client switches to Polling automatically.

---

### B. Nginx Configuration

If you are using Nginx as an ingress controller or reverse proxy, you need to manually handle the WebSocket "Upgrade" headers.

```nginx
http {
    # Map for WebSocket Upgrade
    map $http_upgrade $connection_upgrade {
        default upgrade;
        '' close;
    }

    server {
        listen 80;
        server_name api.delineate.io;

        # 1. REST API (Polling & Estimate)
        location /v1/download/ {
            proxy_pass http://backend_upstream;
            proxy_http_version 1.1;
            
            # Short timeouts for REST
            proxy_read_timeout 30s;
            
            # Disable caching for status checks
            add_header Cache-Control "no-store, no-cache, must-revalidate";
            proxy_cache off;
        }

        # 2. WebSocket Endpoint
        location /v1/download/ws {
            proxy_pass http://backend_upstream;
            proxy_http_version 1.1;
            
            # KEY: Upgrade headers for WebSocket
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection $connection_upgrade;
            
            # Increase timeout for WS connections
            # We set 110s to allow our app's 90s timeout to trigger first
            proxy_read_timeout 110s;
            proxy_send_timeout 110s;
            
            # Disable buffering so messages arrive instantly
            proxy_buffering off;
        }
    }
}
```

## 1. Initiation (Negotiation Phase)

When the user clicks "Download":

1. **Call API:** `POST /v1/download/estimate` with selected file IDs.
2. **Receive Decision:** Server returns `{ mode, jobId, ... }`.
3. **Branching:**
   - If `mode === 'WEBSOCKET'`: Open a connection to `/ws?jobId={jobId}`.
   - If `mode === 'POLLING'`: Call `POST /initiate` (to queue the job) and start the Polling Loop.

## 2. Progress & Updates

### Via WebSocket:
The server pushes JSON `{ status: 'processing', progress: 45 }`. The hook updates React state immediately (Real-time 60fps).

### Via Polling:
The hook calls `GET /status/:jobId` every 3 seconds. React state updates in chunks.

## 3. Completion & Download

When either protocol returns `status: 'completed'`:

1. **Extract the downloadUrl** (Presigned RustFS S3 URL).
2. **Trigger Download:** Create a temporary invisible `<a>` tag with the URL and programmatically `.click()` it.

> **Note:** We do not use `fetch(url)` for the final file. We let the browser handle the binary stream directly from RustFS to ensure resume capability and native behavior.

---

---

