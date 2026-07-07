# Future Mobile App Roadmap

## Recommendation: React Native (Expo)

**Why Expo over bare React Native:**
1. Over-the-air updates via EAS Update
2. Managed workflow handles 90% of native config
3. Excellent libraries for SMS reading (`expo-sms` APIs, `react-native-sms-android`)
4. Cross-platform (iOS + Android) from one codebase
5. Shared TypeScript types and Zod schemas with web app

## Shared Code Strategy

```
packages/
  shared/                    # npm workspace
    src/
      types/                 # Shared TypeScript interfaces
      schemas/               # Shared Zod validation schemas
      constants/             # Shared constants (modules, providers, etc.)
  web/                       # Current React + Vite app
  mobile/                    # Future Expo app
```

## SMS Integration (Future Sprint)

```
User receives SMS from bank → Mobile SMS listener
  → Parses SMS content → Extracts: amount, merchant, date, type
  → POST /api/finance → Creates finance entry (auto-tagged)
```

**Required native permissions:** `READ_SMS`

**Implementation approach:**
1. `expo-sms` for sending; `react-native-sms-android` for reading inbox
2. SMS parsing service (Regex + AI fallback)
3. User configures which senders to trust (e.g., "HDFC Bank", "ICICI")
4. Manual confirmation flow before auto-creating entries

## Notification Reading (Future Sprint)

```
App reads notifications → Detects payment/UPSI messages
  → Optionally creates finance entries
  → Requires: NOTIFICATION_LISTENER permission (Android)
```

## Mobile-Specific UI Considerations
- Bottom tab navigation (Notes, Finance, Nutrition, Settings)
- Pull-to-refresh on lists
- Haptic feedback on actions
- Biometric auth (fingerprint/face) for app unlock
- Offline-first with local SQLite sync (WatermelonDB)

## Migration Path
1. Phase 1: Package shared code into `packages/shared` workspace
2. Phase 2: Create Expo project in `packages/mobile`
3. Phase 3: Implement core screens (matching web routes)
4. Phase 4: SMS reading module
5. Phase 5: Notification reading module
