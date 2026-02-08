# JavaScript → TypeScript Refactoring Strategy

This document is a **step-by-step instruction** for fixing TypeScript errors and warnings that arise when converting JavaScript/JSX to TypeScript/TSX. Follow the order below for efficient, batch fixes.

---

## Copy-paste prompt (for AI or self)

Use this condensed instruction when asking an assistant or working through the refactor:

```
Refactor JS→TS in this project. Fix TypeScript errors in this order:

1. **Shared types** – Ensure api/types.ts has Application, AuthUserData, ApiResponse. Extend from @taiger-common/core where applicable.

2. **Event handler parameter `e`** – Replace (e) => with typed e:
   - onChange (input): React.ChangeEvent<HTMLInputElement>
   - onChange (input|textarea): React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
   - onSubmit: React.FormEvent<HTMLFormElement>
   - onClick: React.MouseEvent<HTMLElement> or React.MouseEvent<HTMLButtonElement>
   - MUI Select onChange: SelectChangeEvent<unknown>

3. **Array callback parameters** – Type (app), (item), (student), etc.:
   - student.applications items → (app: Application) from api/types
   - user/auth → AuthUserData or UserProps from api/types or @taiger-common/core
   - Define local interface if no shared type exists.

4. **Component `props`** – Add Props interface and type (props: ComponentNameProps).

5. **State** – For useState({ ... }) that later gets new keys, add State interface and useState<State>(...).

6. **API/callbacks** – Type res/result in .then() with ApiResponse<T> or AxiosResponse<T>.

7. **unknown** – Use String(x ?? ''), optional chaining (?.), and avoid (x as any).

8. **React/MUI** – Use correct prop names (e.g. Dialog maxWidth not size). For AuthUserData | null passed where UserProps required, add null check.

Fix one category across the repo, then run npx tsc --noEmit before the next. Prefer batch fixes by pattern.
```

---

## Prerequisites

- Run the type checker to see all errors: `npx tsc --noEmit`
- Use your IDE’s “Problems” panel or linter to list errors by file
- Prefer fixing **one category of error across the repo** before moving to the next (batch by pattern)

---

## 0. Shared interfaces and where to add them

**Location:** `src/api/types.ts`

Use these when typing components, API callbacks, and auth:

| Use case | Interface / type |
|----------|------------------|
| User from `useAuth()` | `AuthContextValue` (full context), `AuthUserData` (user object) |
| Items in `student.applications` | `Application` (from api/types or @taiger-common/core) |
| API response shape | `ApiResponse<T>`, or response types like `GetStudentsResponse`, `GetProgramResponse` |
| Login/credentials | `LoginCredentials`, `ResetPasswordPayload`, `ForgotPasswordPayload` |
| Component props | Prefer `ComponentNameProps` in the component file; extend or reuse api types when the prop is an API entity |

**When you need a new shared type:** Add it to `src/api/types.ts` if it is used by more than one module or matches an API/domain concept. Keep component-specific props in the component file (e.g. `ProgramListProps` in `ProgramList.tsx`).

---

## 1. Implicit `any` on callback/function parameters

### 1.1 Event handlers – parameter `e` (and similar)

**Error:** `Parameter 'e' implicitly has an 'any' type.`

**Where:** `onChange`, `onClick`, `onSubmit`, `onBlur`, etc.

**Fix:** Give `e` an explicit event type. Use the narrowest type that matches the handler.

| Handler usage | Parameter | Type to use |
|---------------|-----------|-------------|
| `<input onChange={…} />`, `<TextField onChange={…} />` | `e` | `React.ChangeEvent<HTMLInputElement>` |
| `<textarea onChange={…} />` | `e` | `React.ChangeEvent<HTMLTextAreaElement>` |
| Input or textarea (shared) | `e` | `React.ChangeEvent<HTMLInputElement \| HTMLTextAreaElement>` |
| `<form onSubmit={…} />` | `e` | `React.FormEvent<HTMLFormElement>` |
| `<button onClick={…} />`, `<div onClick={…} />` | `e` | `React.MouseEvent<HTMLButtonElement>` or `React.MouseEvent<HTMLElement>` |
| MUI `<Select onChange={…} />` | `e` | `SelectChangeEvent<unknown>` (import from `@mui/material`) |
| Generic click/UI | `e` | `React.SyntheticEvent` or `React.MouseEvent<HTMLElement>` |

**Pattern:**

```ts
// Before
const handleChange = (e) => { setValue(e.target.value); };

// After
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { setValue(e.target.value); };
```

**Search:** `(e)\s*=>`, `(e)\s*=>\s*{`, `(event)\s*=>` and add the correct type.

---

### 1.2 Array callback parameters – `app`, `item`, `student`, etc.

**Error:** `Parameter 'app' implicitly has an 'any' type.` (or `item`, `student`, `row`, etc.)

**Where:** `.map()`, `.filter()`, `.find()`, `.findIndex()`, `.some()`, `.every()`, `.forEach()`.

**Fix:**

1. **Reuse existing types**  
   Prefer types from your codebase or packages:
   - `Application` / `ApplicationProps` for `student.applications` items → use `src/api/types.ts` and `@taiger-common/core`.
   - `AuthUserData` for user objects → `src/api/types.ts`.
   - React component props → define a `Props` or `ComponentNameProps` interface.

2. **Domain objects (e.g. “application”)**  
   - If the item has `_id`, `programId`, `decided`, `closed`, `admission` → use your `Application` type (e.g. from `api/types.ts`).
   - If you only need a subset of fields, still type the callback parameter (e.g. `(app: Application) => …`).

3. **Generic list item**  
   If the array is typed (e.g. `User[]`), the callback parameter will infer. If not, add a type:
   - `(item: YourItemType) => …`
   - Or a minimal type: `(item: { id: string; name?: string }) => …`

**Pattern:**

```ts
// Before
data.applications?.map((app) => app.programId._id)

// After
import type { Application } from '../../api/types';
data.applications?.map((app: Application) => app.programId?._id)
```

**Search:** `(app)\s*=>`, `(item)\s*=>`, `(student)\s*=>`, etc., and add the correct type.

---

### 1.3 Component `props` parameter

**Error:** `Parameter 'props' implicitly has an 'any' type.`

**Where:** Function components: `export const MyComponent = (props) => { ... }`.

**Fix:**

1. Define an interface (usually `ComponentNameProps` or `Props`).
2. Type the parameter as that interface.
3. If the component forwards all props to a DOM element, you can use `React.ComponentProps<'div'>` or similar.

**Pattern:**

```ts
// Before
export const StudentCard = (props) => {
    const { student, onSave } = props;
    ...
};

// After
interface StudentCardProps {
    student: StudentType;
    onSave: (id: string) => void;
}
export const StudentCard = (props: StudentCardProps) => {
    const { student, onSave } = props;
    ...
};
```

**Optional:** Use destructuring in the parameter: `({ student, onSave }: StudentCardProps)`.

---

### 1.4 Other common callback parameters

**Error:** `Parameter 'res' implicitly has an 'any' type.` (or `err`, `result`, `data`, `thread`, `doc`, etc.)

**Where:** `.then()`, `.catch()`, async callbacks, `.map()` over API/typed data.

**Fix:**

| Parameter | Typical use | Type (or approach) |
|-----------|-------------|----------------------|
| `res` | API response | Your `ApiResponse<T>` or axios `AxiosResponse<YourData>` |
| `err` | `.catch(err => …)` | `unknown` or `Error` |
| `result` | Search/query result | Type from API or a local interface |
| `data` | `res.data` | Same as `res`’s generic or a `Data` interface |
| `thread`, `doc` | Nested list items | Define a small interface or use type from API/models |

**Pattern:**

```ts
// Before
getStudent(id).then((res) => { setData(res.data); });

// After
getStudent(id).then((res: AxiosResponse<ApiResponse<Student>>) => { setData(res.data); });
// Or type the state and let inference help:
getStudent(id).then((res) => { setData(res.data as StudentData); });
```

---

## 2. State and setState

### 2.1 State object missing properties (e.g. `searchTerm`, `application_id`)

**Error:** `Property 'searchTerm' does not exist on type '{ ... }'.`

**Cause:** `useState({ ... })` is inferred; when you later set a new property (e.g. `searchTerm`), TypeScript doesn’t know about it.

**Fix:** Define a single interface for the full state shape and use it in `useState`.

**Pattern:**

```ts
// Before
const [state, setState] = useState({
    error: '',
    student: null,
    isLoaded: true
});
// later: setState(prev => ({ ...prev, searchTerm: value }));  // error: searchTerm missing

// After
interface MyComponentState {
    error: string;
    student: Student | null;
    isLoaded: boolean;
    searchTerm?: string;
    application_id?: string | null;
}
const [state, setState] = useState<MyComponentState>({
    error: '',
    student: null,
    isLoaded: true
});
```

**Strategy:** Grep for `useState({` in the file, list all properties ever assigned (including in `setState` callbacks), then add one `State` interface and type the `useState` call.

---

### 2.2 setState callback return type

**Error:** `Call signature return types '...' and '...' are incompatible.` or `Type 'X' is not assignable to type 'Y'.`

**Cause:** The updater returns an object that doesn’t match the inferred state type (e.g. optional vs required, or `string` vs `null`).

**Fix:**

1. Type the state with an interface (see 2.1).
2. Make sure the updater returns exactly that type: all required keys present, optional keys only if you want them.
3. For “maybe null” fields, use `application_id: string | null` in the interface if you assign both `string` and `null`.

---

## 3. Typing “unknown” and safe access

### 3.1 `Object is of type 'unknown'`

**Error:** When you use a value typed as `unknown` (e.g. `_id` from API).

**Fix:** Narrow or cast before use:

```ts
// Option A: type guard / assertion
const id = app.programId?._id;
const idStr = id != null ? String(id) : '';

// Option B: String() for display/ids
program_ids: data.applications?.map((app: Application) => String(app.programId?._id ?? ''))
```

Avoid `(x as any)` unless necessary; prefer `String(x)`, optional chaining (`?.`), and nullish coalescing (`??`).

---

### 3.2 Optional chaining for nested API shapes

Use `?.` for optional fields (e.g. `app.programId?.uni_assist`) so that missing data doesn’t cause runtime or type errors.

---

## 4. React and MUI-specific

### 4.1 Component prop type mismatches

**Error:** `Property 'size' does not exist on type 'DialogProps'`. Or `Property 'variant' does not exist on type 'IconButton...'`.

**Fix:** Use the types the library expects:

- For MUI: prefer props that exist on the component (e.g. `maxWidth` instead of `size` for `Dialog`; avoid invalid props on `IconButton`).
- For custom components: ensure the component’s props interface includes the props you pass (e.g. `onStudentUpdate`, `application_year`).

**Strategy:** Read the MUI docs or `node_modules/@mui/material/...` for the correct prop names and types.

---

### 4.2 Event handler prop type

**Error:** `Type '(e: MouseEvent<HTMLButtonElement>) => void' is not assignable to type 'MouseEventHandler<HTMLAnchorElement>'.`

**Fix:** Use a generic handler so it works for both:

```ts
const handleClick = (e: React.MouseEvent<HTMLElement>) => { ... };
// Or
const handleClick: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement, MouseEvent> => void = (e) => { ... };
```

Prefer the first (more generic) unless you need button-specific fields.

---

### 4.3 `AuthUserData | null` vs `UserProps`

**Error:** `Argument of type 'AuthUserData | null' is not assignable to parameter of type 'UserProps'.`

**Fix:** Guard before calling:

```ts
if (user != null) {
    someFunctionExpectingUserProps(user);
}
// Or overload / separate type that allows null if the API supports it.
```

---

## 5. Modules and declarations

### 5.2 Global types (e.g. Jest, i18next)

**Fix:** Use a `.d.ts` file (e.g. `src/react-app-env.d.ts` or `src/jest-globals.d.ts`) and ensure `tsconfig.json` includes it. For Jest, `"types": ["node", "jest"]` is usually enough.

---

## 6. Recommended order of fixes

Do these in order so later steps don’t re-trigger earlier errors:

1. **Shared types**  
   Add or extend `api/types.ts` (e.g. `Application`, `ApplicationProgramId`, `AuthUserData`). Export and reuse.

2. **Event handler parameters (`e`)**  
   Batch-fix all `(e) =>` with the correct `React.*Event<...>` type (see §1.1).

3. **Array callback parameters (`app`, `item`, `student`)**  
   Batch-fix with domain types from `api/types` or local interfaces (see §1.2).

4. **Component `props`**  
   Add `Props` interfaces and type each component’s `props` (see §1.3).

5. **State interfaces**  
   For each component with complex state, add a `State` interface and type `useState<State>(...)` (see §2).

6. **API/callback parameters (`res`, `result`, etc.)**  
   Type `.then()`/`.catch()` and other callbacks (see §1.4).

7. **`unknown` and optional chaining**  
   Fix “Object is of type 'unknown'” and add `?.` where needed (see §3).

8. **React/MUI prop and event mismatches**  
   Fix component prop and event handler types (see §4).

9. **Modules and globals**  
   Fix missing module/type declarations (see §5).

---

## 7. Centralized API types and component usage

### 7.1 API types (`src/api/types.ts`)

API response interfaces are centralized in `src/api/types.ts` and reused across the codebase:

| API function | Response type | Used in |
|--------------|---------------|---------|
| `verifyV2()` | `AuthVerifyResponse` | AuthProvider |
| `getUsersOverview()` | `GetUsersOverviewResponse` | StudentDatabaseOverview |
| `getUsersCount()` | `GetUsersCountResponse` | UsersTable |
| `getStudentsV3()` | `GetStudentsResponse` | Students list, loaders |
| `getApplications()` | `GetApplicationsResponse` | AdmissionsOverview, loaders |
| `getAdmissions()` | `GetAdmissionsResponse` | Admissions |
| `getAdmissionsOverview()` | `GetAdmissionsOverviewResponse` | Admissions |
| `getProgramV2()` | `GetProgramResponse` | SingleProgram, ProgramLoader |
| `getProgramsV2()` | `GetProgramsResponse` | Programs list |
| `getProgramsOverview()` | `GetProgramsOverviewResponse` | Overviews |
| `getCommunicationThreadV2()` | `GetCommunicationThreadResponse` | Communication |
| `getMyCommunicationThreadV2()` | `GetMyCommunicationThreadResponse` | My communication |
| `getStudentMeetings()` | `GetStudentMeetingsResponse` | MeetingList, MeetingTab |
| `getStudentMeeting()` | `GetStudentMeetingResponse` | MeetingFormModal |

**Entity types** (used in components): `MeetingResponse`, `IStudentResponse`, `Application`, `ProgramResponse`, `AgentResponse`, `CommunicationResponse`, `EventResponse`, `InterviewResponse`, `DocumentThreadResponse`, `DocumentThreadMessage`, `AdmissionsStatRow`, `OpenTaskRow`.

### 7.2 Components with typed props (API data)

| Component | Props interface | API type used |
|-----------|-----------------|---------------|
| `MeetingList` | `MeetingListProps` | `MeetingResponse[]` |
| `MeetingCard` | `MeetingCardProps` | `MeetingResponse` |
| `MeetingFormModal` | `MeetingFormModalProps` | `MeetingResponse`, `IStudentResponse` |
| `MeetingTab` | `MeetingTabProps` | `StudentId`, `IStudentResponse`, `EventResponse` |
| `SingleProgram` | loader data | `GetProgramResponse` |
| `ApplicationOverviewTabs` | `ApplicationOverviewTabsProps` | `IStudentResponse[]`, `IApplicationWithId[]` |
| `AdmissionsStat` | `AdmissionsStatProps` | `AdmissionsStatRow[]` |
| `UsersList` | `UsersListProps` | `QueryString` |
| `AddUserModal` | `AddUserModalProps` | — |
| `UsersListSubpage` | `UsersListSubpageProps` | — |
| `FileItem` | `FileItemProps` | `DocumentThreadMessage` |
| `FilesList` | `FilesListProps` | `DocumentThreadResponse` |
| `EssayOverview` | `EssayOverviewProps` | `OpenTaskRow[]` |
| `CVMLRLOverview` | `CVMLRLOverviewProps` | `OpenTaskRow[]` |
| `CVMLRLDashboard` | `CVMLRLDashboardProps` | `OpenTaskRow[]`, `AuthUserData` |
| `UserDeleteWarning` | `UserDeleteWarningProps` | — |
| `UserArchivWarning` | `UserArchivWarningProps` | — |
| `DocPageView` | `DocPageViewProps` | — |
| `ProgramList` | `ProgramListProps` | `IStudentResponse` |
| `UniAssistProgramBlock` | `UniAssistProgramBlockProps` | `Application`, `IStudentResponse` |
| `UniAssistListCard` | `UniAssistListCardProps` | `IStudentResponse` |
| `HighlightTextDiff` | `HighlightTextDiffProps` | — |
| `MessageEdit` | `MessageEditProps` | — |
| `StudentItem` | `StudentItemProps` | — |
| `ThreadItem` | `ThreadItemProps` | — |
| `StudentApplicationsAssignProgramlistPage` | `StudentApplicationsAssignProgramlistPageProps` | `IStudentResponse` |

### 7.3 Still to wire up

- `dataLoader.ts` – type loader return values with `GetProgramResponse` etc.
- `ManualFilesList` and other components with untyped props
- Other API functions in `index.ts` still using `request.get/post` – add response types where applicable

---

## 8. Quick reference – where types live in this project

| Use case | Import from / define in |
|----------|-------------------------|
| Application (student application item) | `import type { Application } from '../../api/types';` |
| ApplicationProps (decided, closed, admission) | `import { ApplicationProps } from '@taiger-common/core';` or from `api/types` if re-exported |
| Auth user | `import type { AuthUserData } from '../../api/types';` |
| API response | `import type { ApiResponse } from '../../api/types';` |
| Meeting data | `import type { MeetingResponse } from '../../api/types';` |
| Event types | `React.ChangeEvent<HTMLInputElement>`, etc. (no extra import if you use `React.` from 'react') |
| MUI Select change | `import type { SelectChangeEvent } from '@mui/material';` |

---

## 9. Commands

```bash
# List all TypeScript errors
npx tsc --noEmit

# Search for common implicit-any patterns (example: parameter e)
# Use your IDE search or: grep -R "(e) =>" src --include="*.tsx"
```

Use this strategy as a **repeatable checklist**: fix one category across the repo, run `npx tsc --noEmit`, then move to the next category. That keeps the refactor efficient and consistent.
