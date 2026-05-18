
# Admin-UI för kurskatalog, program och förkunskaper

Bygger ett komplett administratörsverktyg som låter en behörig användare hantera den nya databasstrukturen vi just förberett (`courses_catalog`, `programs_catalog`, `program_courses`, `course_prerequisites`) — inbäddat i Inställningar, med engångsimport från de befintliga statiska programmallarna.

## 1. Åtkomst & säkerhet

- Migration: tilldela `admin`-rollen i `user_roles` till användaren med e-post `moneebi.saifi@gmail.com` (om kontot finns).
- Klient: hook `useIsAdmin()` som läser från `user_roles` via `has_role`-mönstret.
- Admin-fliken i `SettingsPage` renderas endast om `useIsAdmin()` returnerar `true`. Alla skrivoperationer skyddas dessutom av befintliga RLS-policies ("Admins manage …").

## 2. Placering i UI

Ny flik **"Administration"** i `SettingsPage` (shadcn `Tabs`). Fliken innehåller tre under-sektioner:

- **Kurskatalog**
- **Program**
- **Import & verktyg**

Förkunskaper redigeras inifrån varje kurs i Kurskatalogen (inte som egen sektion) — det är där det är naturligast.

## 3. Sektion: Kurskatalog

Visar `courses_catalog` i en tabell med:

- Sökfält (kod/namn)
- Filter på huvudområde och nivå
- Toggle "Visa arkiverade" (`active = false`)
- Knapp "Ny kurs" → öppnar `Sheet` från höger

Rader visar: kod, namn, HP, huvudområde, nivå, antal förkunskaper, status. Klick på rad → samma Sheet i redigeringsläge.

**Kursformulär (Sheet):**
- Fält: `course_code` (unik, valideras), `course_name`, `hp`, `subject_area`, `level`, `original_prerequisite_text`, `active`.
- Zod-validering.
- Längst ner: **Förkunskaper** — lista med rader. Varje rad är en `course_prerequisites`-post:
  - Select för `requirement_type` (de 6 typerna)
  - Dynamiska fält baserat på typ:
    - `completed_course` / `attended_course`: combobox över kurser i katalogen
    - `completed_hp_in_course`: combobox + HP-input
    - `completed_hp_in_subject`: select över huvudområden + HP-input
    - `completed_total_hp`: HP-input
    - `custom_text`: textfält
  - `original_text` och `logic_group` som kollapsbara avancerade fält
- "+ Lägg till krav" och radera-ikon per rad.
- Spara: upsertar kurs + ersätter förkunskapsraderna i en transaktionslik följd (delete-then-insert per kurs).
- "Arkivera" istället för hård DELETE (sätter `active = false`).

## 4. Sektion: Program

Lista över `programs_catalog` med namn, total HP, antal kurser, status. "Nytt program"-knapp.

Klick på program → detaljvy (egen route `/admin/program/:id` eller intern state):

- Header med programnamn, total HP (redigerbart).
- Tabell över `program_courses` grupperad per år och termin (HT/VT) och period.
- Per rad: kurs (combobox från katalogen), år, termin, period, obligatorisk (switch), sort_order (pilar upp/ner).
- "+ Lägg till kurs" längst ned i varje termin-grupp.
- Sammanfattning: HP per år, total HP, varning om obligatorisk HP ≠ programmets total_hp.
- "Arkivera program" sätter `active = false`.

## 5. Sektion: Import & verktyg

- **Importera från statiska mallar**: knapp som läser alla `ProgramTemplate` från `src/lib/programs.ts` och upsertar till databasen.
  - Visar förhandsgranskning: vilka program som kommer att skapas/uppdateras, antal kurser, antal förkunskaper.
  - Bekräftelsedialog innan körning.
  - Använder `course_code` som naturlig nyckel för kurser → ingen duplicering om samma kurs finns i flera program.
  - Skriver `course_prerequisites` från `requirements` (eller faller tillbaka på legacy `prerequisites: string[]` som `completed_course`).
  - Idempotent: kan köras flera gånger utan att skapa dubletter.
  - Progress-toast under körning, slutsammanfattning (X program, Y kurser, Z förkunskaper).
- **Exportera katalog som JSON** (bonus, lätt att bygga): för backup.
- **Statistik**: antal kurser, program, kurser utan huvudområde, kurser utan förkunskaper definierade men med originaltext (för att se vad som återstår att strukturera).

## 6. UX-detaljer

- shadcn-komponenter: `Tabs`, `Table`, `Sheet`, `Dialog`, `AlertDialog`, `Select`, `Combobox` (cmdk), `Switch`, `Badge`, `Input`, `Textarea`.
- `sonner`-toast för feedback. Optimistic updates där det är säkert.
- Bekräftelsedialog (`AlertDialog`) på alla destruktiva åtgärder.
- Mobil: Sheet och Dialog är redan responsiva; tabeller får horisontell scroll med en kompakt vy.
- Behåller dagens navy/blå-stil — inga nya färger.

## 7. Filer som skapas/ändras

**Migration:**
- Ny migration som inserterar admin-rollen för `moneebi.saifi@gmail.com` (slår upp `user_id` från `auth.users` via `email`; gör inget om kontot inte finns ännu).

**Nya filer:**
- `src/lib/admin.ts` — write-helpers: `upsertCourse`, `archiveCourse`, `replacePrerequisites`, `upsertProgram`, `upsertProgramCourse`, `removeProgramCourse`, `importFromStaticTemplates`.
- `src/hooks/useIsAdmin.ts` — läser admin-status.
- `src/components/admin/AdminPanel.tsx` — wrapper med under-tabs.
- `src/components/admin/CourseCatalogTab.tsx` — listan + filter.
- `src/components/admin/CourseEditorSheet.tsx` — kursformulär inkl. förkunskaper.
- `src/components/admin/PrerequisiteRow.tsx` — en rad i förkunskapslistan.
- `src/components/admin/ProgramsTab.tsx` — programlista.
- `src/components/admin/ProgramEditor.tsx` — detaljvy med kurser per år/termin.
- `src/components/admin/ImportTab.tsx` — importknapp + statistik.

**Ändrade filer:**
- `src/components/SettingsPage.tsx` — lägger till "Administration"-fliken bakom `useIsAdmin()`.

## 8. Inte med i denna plan

- Ingen ändring av läsvägen i resten av appen — `programs.ts` läser fortfarande statiska mallar. Vi kan i en senare runda byta till `buildProgramTemplateFromCatalog()` med fallback, när du verifierat att importen ser bra ut.
- Ingen revisionslogg / historik (kan läggas till senare).
- Ingen bulk-CSV-import (importknappen täcker det vi har idag).

## 9. Teknisk not

- Alla skrivningar går via supabase-klienten; RLS-policyerna ("Admins manage …") gör att icke-admins inte kan skriva även om UI:t skulle exponeras av misstag.
- För `program_courses` använder vi `UNIQUE(program_id, course_id)` som finns i schemat för upsert-konflikt.
- För `course_prerequisites` gör vi `delete + insert` per kurs vid spar — enklare än diff och tillräckligt snabbt (typiskt < 10 rader per kurs).
- Importen körs helt klient-sida i en async loop med progress; ingen edge function behövs.

Säg till om du vill att jag ändrar omfattning eller delar upp i mindre steg innan jag bygger.
