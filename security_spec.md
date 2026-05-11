# Security Spec: Nayela AI — Vacay Vogue AI

## Data Invariants
1. `outfit_sessions` can only be created by the owner (`userId`).
2. `outfit_results` must belong to a valid `outfit_session`.
3. `conversations` can only be read/written by the owner (`userId`).
4. `messages` must belong to a valid `conversation`.
5. All IDs must be valid string formats.
6. Timestamps must be server-generated.

## The Dirty Dozen Payloads
1. **Identity Spoofing**: Attempt to create an `outfit_session` with a different `userId`.
2. **Access Violation**: User A tries to read User B's `outfit_session`.
3. **ID Poisoning**: Injecting 1.5MB junk string as a `sessionId`.
4. **Field Injection**: Adding `isVerified: true` to a session document.
5. **Timestamp Spoofing**: Sending a manual `createdAt` string instead of `request.time`.
6. **Relational Break**: Creating a `message` for a `conversationId` that doesn't exist.
7. **Size Attack**: Sending a 2MB `styling_breakdown` text.
8. **Unauthorized Update**: User tries to change `destination` of an existing session.
9. **Role Escalation**: Attempting to set `role: "admin"` in a message (if system had admin).
10. **State Corruption**: Deleting a session result without parent access.
11. **Query Scrape**: Listing all sessions without a `userId` filter.
12. **PII Leak**: Accessing another user's email if stored in profile.

## Test Runner (Draft)
The `firestore.rules.test.ts` will verify these denials.
