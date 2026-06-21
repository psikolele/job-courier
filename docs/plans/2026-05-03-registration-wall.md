# Registration Wall Implementation Plan

> **For Antigravity:** REQUIRED WORKFLOW: Use `.agent/workflows/execute-plan.md` to execute this plan in single-flow mode.

**Goal:** Implementare un sistema di blocco (Registration Wall) dopo 3 clic sugli annunci nella sezione "Ultime Inserite", con persistenza di 24 ore.

**Architecture:** Gestione dello stato locale tramite `localStorage` e intercettazione dei clic nel componente `Filters.jsx`. Popup cinematico con animazioni GSAP.

**Tech Stack:** React, Tailwind CSS, GSAP, Lucide React, localStorage API.

---

### Task 1: Creazione della logica di tracking (LocalStorage)

**Files:**
- Modify: `webapp/src/components/Filters.jsx`

**Step 1: Definire la funzione di utility per il tracking**
Aggiungere una funzione `checkClickLimit` che gestisce la logica di conteggio e scadenza 24h.

```javascript
const checkClickLimit = () => {
    const STORAGE_KEY = 'jc_click_tracker';
    const LIMIT = 3;
    const EXPIRY_MS = 24 * 60 * 60 * 1000;

    const stored = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    if (!stored) {
        const initialData = { count: 1, expiry: now + EXPIRY_MS };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
        return false; // Limite non raggiunto
    }

    const data = JSON.parse(stored);

    if (now > data.expiry) {
        // Reset se scaduto
        const resetData = { count: 1, expiry: now + EXPIRY_MS };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resetData));
        return false;
    }

    if (data.count >= LIMIT) {
        return true; // Limite raggiunto
    }

    // Incrementa
    data.count += 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return false;
};
```

**Step 2: Commit**
```bash
git add webapp/src/components/Filters.jsx
git commit -m "feat: add click tracking logic with 24h expiry"
```

---

### Task 2: Creazione del Componente RegistrationModal

**Files:**
- Modify: `webapp/src/components/Filters.jsx`

**Step 1: Definire il componente UI all'interno di Filters.jsx**
Creare un componente `RegistrationModal` con stile cinematico.

```jsx
const RegistrationModal = ({ isOpen, onClose }) => {
    const modalRef = useRef(null);
    const overlayRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            const ctx = gsap.context(() => {
                gsap.fromTo(overlayRef.current, 
                    { opacity: 0 }, 
                    { opacity: 1, duration: 0.5, ease: "power2.out" }
                );
                gsap.fromTo(modalRef.current, 
                    { scale: 0.9, opacity: 0, y: 20 }, 
                    { scale: 1, opacity: 1, y: 0, duration: 0.6, delay: 0.1, ease: "back.out(1.7)" }
                );
            });
            return () => ctx.revert();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div 
                ref={overlayRef}
                className="absolute inset-0 bg-[#01498C]/90 backdrop-blur-2xl" 
                onClick={onClose} 
            />
            
            <div 
                ref={modalRef}
                className="relative bg-white rounded-[3rem] p-8 md:p-12 max-w-lg w-full shadow-2xl overflow-hidden group"
            >
                {/* Noise Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-repeat" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/p6.png")' }}></div>
                
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors"
                >
                    <X className="w-6 h-6 text-slate-400" />
                </button>

                <div className="flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-[#01498C]/5 rounded-full flex items-center justify-center mb-8">
                        <UserPlus className="w-10 h-10 text-[#01498C]" />
                    </div>
                    
                    <h2 className="text-3xl font-bold text-slate-900 mb-4 tracking-tight">
                        Accesso Limitato
                    </h2>
                    
                    <p className="text-slate-500 mb-10 leading-relaxed text-lg">
                        Per continuare a visualizzare gli annunci, iscriviti gratuitamente al portale.
                    </p>
                    
                    <a 
                        href="https://jobroom.jobcourier.ch/job-seekers-login.php"
                        className="w-full bg-[#01498C] text-white py-5 rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#01498C]/20"
                    >
                        Iscriviti Ora
                        <ArrowRight className="w-5 h-5" />
                    </a>
                </div>
            </div>
        </div>
    );
};
```

**Step 2: Commit**
```bash
git commit -m "feat: add cinematic RegistrationModal component"
```

---

### Task 3: Integrazione Click Interceptor

**Files:**
- Modify: `webapp/src/components/Filters.jsx`

**Step 1: Aggiungere lo stato e gestire il clic sulle card**
Utilizzare lo stato `isModalOpen` e modificare l'evento `onClick` delle card.

```jsx
const [isModalOpen, setIsModalOpen] = useState(false);

const handleJobClick = (e) => {
    if (checkClickLimit()) {
        e.preventDefault();
        setIsModalOpen(true);
    }
};
```

**Step 2: Applicare il trigger alle card degli annunci**
Passare `handleJobClick` ai componenti card o applicarlo direttamente nell'iterazione.

**Step 3: Commit**
```bash
git commit -m "feat: intercept job clicks and trigger modal"
```

---

### Task 4: Verifica Finale e Deploy

**Step 1: Test manuale**
- Verificare che i primi 3 clic funzionino normalmente.
- Verificare che il 4° clic apra il popup.
- Verificare che ricaricando la pagina il blocco persista.
- Verificare che cliccando "Iscriviti" si venga reindirizzati correttamente.

**Step 2: Deploy su Vercel**
```bash
npx vercel --prod --yes
```
