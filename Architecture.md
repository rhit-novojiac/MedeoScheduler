# Antigravity IDE Directives: Project Architecture & Stack

**System Directive:** You are tasked with building a secure, local-first desktop application. Operate in **Planning Mode** to generate a Task List and Implementation Plan before executing code. You must adhere strictly to the framework constraints, architectural boundaries, and directory structures detailed below. 

## 1. Core Infrastructure & Build Tools
* **Framework:** Electron.
* **Build Pipeline:** Electron Forge utilizing the Vite plugin and TypeScript.
* **Process Architecture:** Strictly maintain Context Isolation.
* **Security:** The Main process (Node.js) and Renderer process (React) must remain entirely separate.
* **Communication:** They must communicate solely through strictly typed Inter-Process Communication (IPC) via `contextBridge`.



## 2. Database Architecture (Strict Backend Isolation)
* **Engine:** SQLite via `better-sqlite3`.
* **Environment:** The database engine must run exclusively in the Electron Main process. 
* **Renderer Constraint:** The Renderer process must never import or interact with SQLite directly.
* **Build Constraint:** `better-sqlite3` is a native C++ module. Configure Electron Forge and Vite to correctly externalize it and ensure it is unpacked (`asarUnpack`) during the packaging phase to prevent runtime module resolution errors.
* **Data Flow:** Create dedicated IPC handlers in the Main process for all CRUD operations. Expose these securely via a `preload.ts` script.

## 3. Frontend Framework & State Management
* **UI Library:** React 19.
* **State & IPC Management:** TanStack Query (React Query). Use this to wrap all asynchronous IPC calls to the Main process. 
* **State Execution:** Rely on TanStack Query's caching, loading states, and optimistic updates to manage the UI state reflecting the SQLite data.
* **Navigation:** TanStack Router.
* **Routing Constraint:** Standard browser routing will fail in an Electron file system environment (`file://`). Configure TanStack Router to use memory history (`createMemoryHistory`) or hash history.

## 4. Styling & UI Components
* **CSS Engine:** Tailwind CSS. 
* **Component Library:** shadcn/ui.
* **Implementation Rule:** Do not install monolithic component npm packages. Use the shadcn CLI to initialize the components locally.
* **Pathing:** Ensure the Vite configuration and `tsconfig.json` path aliases (e.g., `@/`) are correctly mapped between the renderer source and the shadcn configuration.

## 5. Strict Project Directory Structure
**Directory Directive:** You must adhere to the following structure. Never place database logic inside the `renderer` folder. Never place React components inside the `main` folder. Use the `@/` path alias strictly for the `src/renderer/src` directory.

my-electron-app/
├── package.json
├── forge.config.ts             
├── vite.main.config.ts         
├── vite.preload.config.ts      
├── vite.renderer.config.ts     
├── tailwind.config.js          
├── components.json             
├── tsconfig.json               
│
└── src/
    ├── main/                   
    │   ├── main.ts             
    │   ├── db/                 
    │   │   ├── connection.ts   
    │   │   ├── schema.ts       
    │   │   └── queries.ts      
    │   └── ipc/                
    │       └── handlers.ts     
    │
    ├── preload/                
    │   ├── preload.ts          
    │   └── index.d.ts          
    │
    └── renderer/               
        ├── index.html          
        └── src/
            ├── main.tsx        
            ├── App.tsx         
            ├── index.css       
            ├── routes/         
            ├── hooks/          
            ├── lib/            
            └── components/     
                ├── ui/         
                └── shared/     

## 6. Initialization Steps Expected in Implementation Plan
1. Scaffold the base Electron Forge + Vite + TypeScript template.
2. Configure Tailwind CSS and initialize the shadcn/ui environment in the Renderer.
3. Install `better-sqlite3`, configure Vite/Forge to handle the native module.
4. Set up a basic local database initialization sequence in the Main process.
5. Establish a secure IPC bridge in the Preload script mapping to the Main handlers.
6. Set up TanStack Query and TanStack Router (Memory History) providers in the React root.