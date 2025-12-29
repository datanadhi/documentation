# API Key Management

The **API Key system** in Data Nadhi makes sure only valid SDKs or clients can send logs to the Data Nadhi Server.  
It uses **three layers of AES-GCM encryption** to tightly bind each key to its **org** and **project**.

---

## Overview

Each API Key is unique to a specific **org** and **project**.  
It's built using:
- **Project secret** (unique per project)  
- **Org secret** (unique per org)  
- **Global secret (SEC_GLOBAL)** (shared across the system)  
- A fixed **default token string** used for validation  

> Both the *org secret* and *project secret* are stored **encrypted** in MongoDB and only get decrypted when needed.

---

## Step-by-Step Key Creation

Here's how an API Key gets created:

1. **Start with a fixed internal token string** (used later for validation).  
```
token = DEFAULT_TOKEN_STRING
```
2. **First Encryption (enc1)**  
- Encrypt the token using the **Project Secret**.  
- This binds the key to a specific project.  
```
enc1 = AES-GCM(token, projectSecret)
```
3. **Second Encryption (enc2)**  
- Combine `enc1` and the `projectId`, then encrypt using the **Org Secret**.  
- This step connects the project to its org.  
```
enc2 = AES-GCM(enc1 | projectId, orgSecret)
```
4. **Third Encryption (enc3)**  
- Combine `enc2` and the `orgId`, then encrypt using the **Global Secret (SEC_GLOBAL)**.  
- This final step ties the key to the overall system.  
```
enc3 = AES-GCM(enc2 | orgId, SEC_GLOBAL)
```
5. **Encode as Base64**  
- Convert the encrypted text to Base64 to form the final **API Key**.  
```
apiKey = base64(enc3)
```
---

## Step-by-Step Key Validation

When the SDK sends a request with the header `x-datanadhi-api-key`:

1. **Cache Lookup**  
- Redis gets checked first.  
- If there's a valid or invalid result, it gets returned immediately.

2. **Decryption (Reverse Order)**  
- Decrypt `enc3` with **Global Secret** → get `enc2` and `orgId`.  
- Decrypt `enc2` with **Org Secret** → get `enc1` and `projectId`.  
- Decrypt `enc1` with **Project Secret** → get the original **token**.

3. **Validate Token**  
- The decrypted token must match the fixed internal token.  
- If it doesn’t, the key is invalid and gets temporarily cached as a failed key.

4. **Cache the Result**  
- Valid results get cached with their `orgId` and `projectId` for faster lookups later.

---

## 🔐 About AES-GCM

Data Nadhi uses **AES-GCM (Advanced Encryption Standard – Galois/Counter Mode)** for all encryption and decryption.

**Learn more:** [AES-GCM Explained (Wikipedia)](https://en.wikipedia.org/wiki/Galois/Counter_Mode)

### How It Works (In Simple Terms)
- Think of AES-GCM as a **safe box** with a **unique key** (the secret) and a **seal** (the GCM part).  
- When you encrypt something, AES locks it using the key and stamps it with a verification tag.  
- When decrypting, it checks that stamp — if even a single character was changed, decryption fails.  
- This means AES-GCM not only hides your data but also makes sure it hasn’t been tampered with.  
- Every secret (global, org, project) acts as a different key to a different safe.

---

## Error Handling

If the API Key:
- Is missing  
- Can't be decrypted  
- Has a wrong token  
- Or points to a missing org/project  

…the server returns **401 Unauthorized** with a clear validation failure message.  
No sensitive info gets exposed.

---

## Caching Behavior

- **Valid API Keys** get cached with their org/project IDs for quick access.  
- **Invalid keys** get cached briefly to prevent repeated validation attempts.  
- This heavy use of caching significantly reduces database reads and crypto operations.

---

## Summary

- Multi-layer AES-GCM encryption secures every API Key.  
- Org and project secrets are stored encrypted.  
- The system is both **secure** (through encryption) and **fast** (through caching).  
- All invalid keys cleanly return 401s without breaking SDK flow.



