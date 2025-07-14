
# All-in-One Frontend Specification

This document provides a comprehensive guide for building the Vue.js frontend for the Beverage Management System. It is derived entirely from the Java JEE backend API.

---

## 1. Product Requirements Document (PRD)

### Purpose of the Application
The application is a **Beverage Inventory and Stock Management System**. Its primary purpose is to track the lifecycle of beverages within a business, including inventory levels, stock movements (entries, exits, adjustments), and user management. It aims to provide a centralized platform for managing beverage products, monitoring stock quantities, and maintaining a log of all related activities.

### Core Features and User Capabilities
- **User Authentication:** Users can register, log in, and manage their passwords.
- **User Management:** Administrators (Gérants) can create, view, and delete user accounts.
- **Role-Based Access Control (RBAC):** The system supports three user roles with distinct permissions:
    - `GERANT`: Full access to all features, including user and beverage management.
    - `EMPLOYE`: Standard access for daily operations, likely involving stock movements.
    - `LIVREUR`: Restricted access, likely for viewing delivery-related information.
- **Beverage (Boisson) Management:**
    - Create new beverage products with details like name, description, price, volume, and stock alert threshold (`seuil`).
    - View a list of all beverages.
- **Lot Management:**
    - Create, view, and update lots of beverages.
    - Track lot-specific information like lot number, quantity, entry date, and expiration date.
- **Stock Management:**
    - View the current stock level for each beverage.
    - The stock is calculated based on the available lots.
- **Stock Movement (Mouvement) Tracking:**
    - Record stock entries (`ENTREE`), exits (`SORTIE`), and adjustments (`AJUSTEMENT`).
    - Log adjustments for specific reasons like breakage (`CASSE`), theft (`VOL`), loss (`PERTE`), or returns (`RETOUR_CLIENT`).
    - Record movements individually or in batches.
    - View movement history by user.

### High-Level Goals and Scope
- **Goal:** To create a robust and intuitive interface for managing beverage inventory.
- **Scope:** The frontend will cover all functionalities exposed by the API: user authentication, user management, beverage product management, lot management, stock management, and stock movement tracking.
- **Out of Scope:** The current API does not suggest features like supplier management, customer orders, or advanced reporting dashboards. These are considered out of scope for the initial version.

### Success Criteria
- **Functionality:** All API endpoints are integrated and functional within the UI.
- **Usability:** The application is easy to navigate for all user roles. A `GERANT` can manage users and beverages without friction, and an `EMPLOYE` can record stock movements efficiently.
- **Security:** The frontend correctly implements token-based authentication and respects the API's authorization rules.

### Assumptions
- The term "Boisson" translates to "Beverage" and represents the core product entity.
- "Mouvement" translates to "Movement" and represents a stock transaction.
- "Utilisateur" translates to "User".
- The `GERANT` role is the system administrator.
- The application is intended for internal business use, not for public customers.
- The API is the single source of truth for all data.

---

## 2. UX Flowchart (Text Description)

### A. Authentication Flow
1.  **Initial View:** User sees a **Login Page**.
2.  **Action:** User enters email and password.
    - **Success:**
        - User is redirected to the main **Dashboard/Home Page**.
        - A JWT token is stored in the browser's local storage or a secure cookie.
        - User information (email, role) is stored in the state.
    - **Failure (Invalid Credentials):** An error message "Authentication failed" is displayed on the **Login Page**.
3.  **Navigation:** A "Register" link on the **Login Page** takes the user to the **Registration Page**.
4.  **Registration:**
    - User fills out a form with email, password, and role.
    - **Success:** User is redirected to the **Login Page** with a success message.
    - **Failure:** An error message is displayed on the **Registration Page**.

### B. Beverage Management Flow (GERANT Role)
1.  **Navigation:** From the main navigation, `GERANT` clicks on "Beverages".
2.  **Screen:** User is taken to the **Beverage List Page**, which displays a table of all beverages.
3.  **Action (Create):**
    - User clicks a "Add New Beverage" button.
    - A **Create Beverage Modal/Form** appears.
    - User fills in the beverage details (name, price, etc.) and submits.
    - **Success:** The modal closes, the table refreshes, and a success notification appears.
    - **Failure:** An error message is shown within the modal.

### C. Lot Management Flow (GERANT Role)
1.  **Navigation:** From the main navigation, `GERANT` clicks on "Lots".
2.  **Screen:** User is taken to the **Lot List Page**, which displays a table of all lots.
3.  **Action (Create):**
    - User clicks a "Add New Lot" button.
    - A **Create Lot Modal/Form** appears.
    - User fills in the lot details (beverage, quantity, etc.) and submits.
    - **Success:** The modal closes, the table refreshes, and a success notification appears.
    - **Failure:** An error message is shown within the modal.

### D. Stock Viewing Flow (EMPLOYE/GERANT Role)
1.  **Navigation:** From the main navigation, user clicks on "Stocks".
2.  **Screen:** User is taken to the **Stock List Page**, which displays a table of all beverages and their current stock levels.

### E. Stock Movement Flow (EMPLOYE/GERANT Role)
1.  **Navigation:** From the main navigation, user clicks on "Stock Movements".
2.  **Screen:** User is taken to the **Stock Movement Page**.
3.  **Action (Record Movement):**
    - The page contains a form to "Record a New Movement".
    - User selects the beverage, movement type (`ENTREE`, `SORTIE`), and quantity.
    - **Success:** The form clears, and the movement is added to a "Recent Movements" log on the same page. A success notification appears.
    - **Failure:** An error message is shown on the form.
4.  **Action (Record Adjustment):**
    - A separate form or a conditional field in the main form allows for "Adjustments".
    - If `TypeMouvement` is `AJUSTEMENT`, a dropdown for `TypeAjustement` (e.g., `CASSE`, `VOL`) and a "Reason" text field appear.
    - User fills in the details and submits.
    - **Success:** The adjustment is logged.

### F. User Management Flow (GERANT Role)
1.  **Navigation:** From the main navigation, `GERANT` clicks on "Users".
2.  **Screen:** User is taken to the **User List Page**, displaying a table of all users.
3.  **Action (Delete):**
    - Each row in the user table has a "Delete" button.
    - Clicking it prompts a confirmation modal ("Are you sure?").
    - On confirmation, the user is deleted, the table refreshes, and a success notification appears.
4.  **Action (Change Password - Self):**
    - User navigates to their **Profile/Settings Page**.
    - A "Change Password" form is available.
    - User enters their old and new passwords.
    - **Success:** A success notification appears.
    - **Failure:** An error message is displayed.

---

## 3. Feature Map by Entity

### Entity: Utilisateur (User)
- **CRUD:**
    - **Create (Register):** A public-facing registration form (`/register`).
    - **Read:** A table view for `GERANT` to see all users (`/utilisateurs`).
    - **Update:** No direct user update endpoint exists, but there is a `PATCH` for changing one's own password (`/change-password`).
    - **Delete:** A `GERANT` can delete users by ID (`/utilisateurs/{id}`).
- **Related Actions:**
    - **Login:** `POST /utilisateurs/login`
- **Frontend Representation:**
    - **User List:** A data table with columns for Email, Role, and Created At. Each row should have a delete icon/button.
    - **Registration Form:** A form with fields for Email, Password, and a dropdown for Role.
    - **Login Form:** A simple form for Email and Password.
    - **Change Password Form:** A form in a user profile/settings page with fields for Old Password and New Password.

### Entity: Boisson (Beverage)
- **CRUD:**
    - **Create:** `POST /boissons`
    - **Read:** `GET /boissons` (Get all)
    - **Update/Delete:** Not exposed in the controller, but the service interface suggests they might exist (`modifierBoisson`, `supprimerBoisson`). The frontend should be built with placeholders for this functionality.
- **Frontend Representation:**
    - **Beverage List:** A data table with columns for Name, Description, Price, Volume, Unit, and Stock Threshold.
    - **Create/Edit Form:** A modal or dedicated page with input fields for all `BoissonDto` properties.

### Entity: Lot
- **CRUD:**
    - **Create:** `POST /lots`
    - **Read:** `GET /lots` (Get all)
    - **Update:** `PUT /lots`
- **Related Actions:**
    - `GET /lots/{lotId}/is-available`
    - `GET /lots/{lotId}/is-expired`
    - `GET /lots/boisson/{boissonId}/ordre-peremption`
    - `POST /lots/{lotId}/remove-quantity?quantity={quantity}`
- **Frontend Representation:**
    - **Lot List:** A data table with columns for Lot Number, Beverage, Initial Quantity, Current Quantity, Entry Date, and Expiration Date.
    - **Create/Edit Form:** A modal or dedicated page with input fields for all `LotDto` properties.

### Entity: Stock
- **CRUD:**
    - **Read:** `GET /stocks/boisson/{boissonId}` (hypothetical, based on service)
- **Frontend Representation:**
    - **Stock List:** A data table with columns for Beverage Name and Total Quantity.

### Entity: Mouvement (Stock Movement)
- **CRUD:**
    - **Create:**
        - `POST /mouvements` (for `ENTREE`, `SORTIE`)
        - `POST /mouvements/batch` (for multiple movements)
        - `POST /mouvements/retour` (for returns)
        - `POST /mouvements/ajustement` (for adjustments)
    - **Read:** `GET /mouvements/utilisateur/{utilisateurId}`
- **Frontend Representation:**
    - **Movement Logging Form:** A form with fields:
        - Dropdown for Beverage (populated from `GET /boissons`).
        - Dropdown for Movement Type (`ENTREE`, `SORTIE`, `AJUSTEMENT`).
        - Number input for Quantity.
        - Conditional dropdown for Adjustment Type if `AJUSTEMENT` is selected.
        - Conditional text input for Reason if it's a return or adjustment.
    - **Movement History:** A data table showing past movements, with columns for Date, Beverage, Type, Quantity, and User.

---

## 4. API Contract Summary

### Authentication
- **Endpoint:** `POST /utilisateurs/login`
- **Request Body:**
  ```json
  {
    "email": "user@example.com",
    "motDePasse": "password123"
  }
  ```
- **Response (Success - 200 OK):**
  ```json
  {
    "email": "user@example.com",
    "token": "ey..."
  }
  ```
- **Response (Failure - 401 Unauthorized):**
  ```json
  {
    "message": "Authentication failed: ..."
  }
  ```
- **Token Handling:** The returned JWT must be sent in the `Authorization` header for all subsequent requests to protected endpoints: `Authorization: Bearer <token>`.

### UtilisateurController (`/utilisateurs`)
- **`GET /`**
    - **Description:** Get all users.
    - **Access:** Protected (Requires token).
    - **Response (200 OK):**
      ```json
      [
        {
          "id": 1,
          "email": "gerant@example.com",
          "role": "GERANT",
          "createdAt": "2023-10-27T10:00:00"
        }
      ]
      ```
- **`POST /register`**
    - **Description:** Register a new user.
    - **Access:** Public.
    - **Request Body:** `UtilisateurDto`
      ```json
      {
        "email": "newuser@example.com",
        "motDePasse": "securepassword",
        "role": "EMPLOYE"
      }
      ```
    - **Response (201 Created):** `UtilisateurDto` (without password).
- **`DELETE /{id}`**
    - **Description:** Delete a user by ID.
    - **Access:** Protected.
    - **Response (204 No Content):** Success.
    - **Response (404 Not Found):** User not found.
- **`PATCH /change-password?id={id}`**
    - **Description:** Change a user's password.
    - **Access:** Protected.
    - **Request Body:** `PasswordRequest`
      ```json
      {
        "ancienMotDePasse": "oldPassword",
        "nouveauMotDePasse": "newPassword"
      }
      ```
    - **Response (200 OK):** Success.
    - **Response (400 Bad Request):** Failure.

### BoissonController (`/boissons`)
- **`GET /`**
    - **Description:** Get all beverages.
    - **Access:** Protected.
    - **Response (200 OK):** `List<BoissonDto>`
      ```json
      [
        {
          "id": 1,
          "nom": "Coca-Cola",
          "description": "Classic soda",
          "prix": 1.5,
          "volume": 330,
          "unite": "ml",
          "seuil": 50,
          "isActive": true
        }
      ]
      ```
- **`POST /`**
    - **Description:** Add a new beverage.
    - **Access:** Protected.
    - **Request Body:** `BoissonDto`
    - **Response (201 Created):** `BoissonDto`.

### LotController (`/lots`)
- **`GET /`**
    - **Description:** Get all available lots.
    - **Access:** Protected.
    - **Response (200 OK):** `List<LotDto>`
- **`POST /`**
    - **Description:** Add a new lot.
    - **Access:** Protected.
    - **Request Body:** `LotDto`
    - **Response (201 Created):** `LotDto`
- **`PUT /`**
    - **Description:** Update an existing lot.
    - **Access:** Protected.
    - **Request Body:** `LotDto`
    - **Response (200 OK):** Success
- **`GET /{lotId}/is-available`**
    - **Description:** Checks if a lot is available.
    - **Access:** Protected.
    - **Response (200 OK):** `boolean`
- **`GET /{lotId}/is-expired`**
    - **Description:** Checks if a lot is expired.
    - **Access:** Protected.
    - **Response (200 OK):** `boolean`
- **`GET /boisson/{boissonId}/ordre-peremption`**
    - **Description:** Retrieves all lots for a given beverage, ordered by expiration date.
    - **Access:** Protected.
    - **Response (200 OK):** `List<LotDto>`
- **`POST /{lotId}/remove-quantity`**
    - **Description:** Removes a given quantity from a lot.
    - **Access:** Protected.
    - **Query Params:** `quantity` (integer)
    - **Response (200 OK):** Success

### MouvementController (`/mouvements`)
- **`POST /`**
    - **Description:** Record a single stock movement.
    - **Access:** Protected.
    - **Request Body:** `MouvementDto`
      ```json
      {
        "type": "ENTREE",
        "quantite": 100,
        "boissonId": 1,
        "utilisateurId": 1
      }
      ```
    - **Response (201 Created):** `MouvementDto`.
- **`POST /batch`**
    - **Description:** Record multiple movements at once.
    - **Access:** Protected.
    - **Request Body:** `List<MouvementDto>`
    - **Response (201 Created):** `List<MouvementDto>`.
- **`POST /retour?raison={raison}`**
    - **Description:** Record a customer return.
    - **Access:** Protected.
    - **Request Body:** `MouvementDto` (type should be `AJUSTEMENT`)
    - **Response (201 Created):** `MouvementDto`.
- **`POST /ajustement?raison={raison}`**
    - **Description:** Record a stock adjustment.
    - **Access:** Protected.
    - **Request Body:** `MouvementDto` (type should be `AJUSTEMENT`)
    - **Response (201 Created):** `MouvementDto`.
- **`GET /utilisateur/{utilisateurId}`**
    - **Description:** Get all movements recorded by a specific user.
    - **Access:** Protected.
    - **Response (200 OK):** `List<MouvementDto>`.

---

## 5. Suggested Frontend Architecture

### Folder Structure
```
src/
├── api/
│   ├── index.js         # Axios instance and interceptors
│   ├── auth.js          # Auth endpoints (login, register)
│   ├── users.js         # User endpoints
│   ├── beverages.js     # Beverage endpoints
│   ├── lots.js          # Lot endpoints
│   ├── stocks.js        # Stock endpoints
│   └── movements.js     # Movement endpoints
├── assets/
├── components/
│   ├── common/          # Reusable UI components
│   │   ├── AppButton.vue
│   │   ├── AppTable.vue
│   │   ├── AppModal.vue
│   │   └── AppInput.vue
│   ├── layout/
│   │   ├── TheNavbar.vue
│   │   └── TheSidebar.vue
│   └── specific/        # Components for specific features
│       ├── UserTable.vue
│       ├── BeverageForm.vue
│       ├── LotForm.vue
│       └── MovementLogger.vue
├── pages/
│   ├── LoginPage.vue
│   ├── RegisterPage.vue
│   ├── DashboardPage.vue
│   ├── UsersPage.vue
│   ├── BeveragesPage.vue
│   ├── LotsPage.vue
│   ├── StocksPage.vue
│   └── MovementsPage.vue
├── router/
│   └── index.js         # Vue Router configuration
├── stores/
│   ├── auth.js          # Pinia store for auth state (user, token)
│   ├── users.js         # Pinia store for user management
│   ├── beverages.js     # Pinia store for beverage data
│   ├── lots.js          # Pinia store for lot data
│   ├── stocks.js        # Pinia store for stock data
│   └── movements.js     # Pinia store for movement data
└── App.vue
```

### Component Hierarchy
- **`App.vue`** (Root)
    - **`TheNavbar.vue`**
    - **`TheSidebar.vue`**
    - **`router-view`**
        - **`LoginPage.vue`**
        - **`DashboardPage.vue`**
        - **`UsersPage.vue`**
            - `AppTable.vue` (configured for users)
        - **`BeveragesPage.vue`**
            - `AppButton.vue` ("Add Beverage")
            - `AppTable.vue` (configured for beverages)
            - `AppModal.vue`
                - `BeverageForm.vue`
        - **`LotsPage.vue`**
            - `AppButton.vue` ("Add Lot")
            - `AppTable.vue` (configured for lots)
            - `AppModal.vue`
                - `LotForm.vue`
        - **`StocksPage.vue`**
            - `AppTable.vue` (configured for stocks)
        - **`MovementsPage.vue`**
            - `MovementLogger.vue` (form)
            - `AppTable.vue` (configured for movement history)

---

## 6. Suggested Design System Specification

### UI Components
- **AppButton:**
    - Props: `variant` (primary, secondary, danger), `size` (sm, md, lg), `disabled`.
    - States: default, hover, focus, loading, disabled.
- **AppInput:**
    - Props: `type` (text, password, number), `label`, `placeholder`, `error-message`.
    - States: default, focus, error, disabled.
- **AppSelect:** (for dropdowns)
    - Props: `options` (array of {value, text}), `label`, `error-message`.
- **AppTable:**
    - Props: `headers` (array of objects), `items` (array of objects), `loading`.
    - Slots: for custom cell rendering (e.g., action buttons).
    - States: loading (shows a spinner), empty (shows a message).
- **AppModal:**
    - Props: `title`, `is-open`.
    - Emits: `close`.
    - Slots: header, body, footer.
- **AppAlert/Notification:**
    - Props: `type` (success, error, info), `message`.
    - Logic: Should be globally managed and appear in a corner of the screen.

### Reusability Guidance
- Create a generic `CrudPage.vue` component that takes a Pinia store module as a prop. It could handle the logic for fetching data, displaying it in `AppTable`, and opening a modal with a form for creation/editing. This would be reusable for both Beverages and Users.

---

## 7. Design Tokens & UI Variables (Suggested)

### Color Scheme
- **Primary:** `#4F46E5` (Indigo) - For buttons, links, active states.
- **Neutral:**
    - `gray-900`: `#111827` (Dark text)
    - `gray-500`: `#6B7280` (Subtle text)
    - `gray-100`: `#F3F4F6` (Backgrounds)
    - `white`: `#FFFFFF`
- **Danger:** `#EF4444` (Red) - For delete actions, errors.
- **Success:** `#22C55E` (Green) - For success notifications.
- **Warning:** `#F97316` (Orange) - For alerts.

### Typography
- **h1:** 30px, bold
- **h2:** 24px, bold
- **h3:** 20px, semibold
- **body:** 16px, regular
- **caption:** 12px, light

### Spacing (8-point grid system)
- `space-1`: 8px
- `space-2`: 16px
- `space-3`: 24px
- `space-4`: 32px

### UI Elements
- **Border Radius:** `4px` (subtle), `8px` (standard)
- **Shadows:**
    - `sm`: `0 1px 2px 0 rgb(0 0 0 / 0.05)`
    - `md`: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`
- **Breakpoints:**
    - `sm`: 640px
    - `md`: 768px
    - `lg`: 1024px

---

## 8. Suggested State Management (Pinia)

### `auth.js`
- **State:** `user` (object), `token` (string), `isAuthenticated` (boolean).
- **Actions:**
    - `login(credentials)`: Calls API, saves token and user info on success.
    - `register(userInfo)`: Calls registration API.
    - `logout()`: Clears state and local storage.
    - `loadUserFromToken()`: Action called on app load to check for an existing token.
- **Getters:** `isAdmin` (checks if user role is `GERANT`).

### `users.js`
- **State:** `users` (array), `loading` (boolean).
- **Actions:**
    - `fetchAllUsers()`: `GET /utilisateurs`.
    - `deleteUser(id)`: `DELETE /utilisateurs/{id}`.

### `beverages.js`
- **State:** `beverages` (array), `loading` (boolean).
- **Actions:**
    - `fetchAllBeverages()`: `GET /boissons`.
    - `createBeverage(data)`: `POST /boissons`.

### `lots.js`
- **State:** `lots` (array), `loading` (boolean).
- **Actions:**
    - `fetchAllLots()`: `GET /lots`.
    - `createLot(data)`: `POST /lots`.
    - `updateLot(data)`: `PUT /lots`.

### `stocks.js`
- **State:** `stocks` (array), `loading` (boolean).
- **Actions:**
    - `fetchStocks()`: `GET /stocks` (hypothetical).

### `movements.js`
- **State:** `movements` (array), `loading` (boolean).
- **Actions:**
    - `fetchMovementsByUser(userId)`: `GET /mouvements/utilisateur/{userId}`.
    - `recordMovement(data)`: `POST /mouvements`.
    - `recordAdjustment(data)`: `POST /mouvements/ajustement`.
