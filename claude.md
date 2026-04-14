# Job_Courier — Marketplace Platform Guide

**Parent:** ../../claude.md  
**Category:** Website Development > Marketplace  
**Status:** 🔴 CRITICAL - Active Development  
**Updated:** 2026-04-13  
**Model:** Haiku 4.5 (default) | Sonnet 4.6 (architecture/debug)  
**Budget:** 50,000 tokens/session (highest allocation)

---

## ⚡ Quick Summary

**What:** Job marketplace with filtering, search, and job matching  
**Where:** React app with git tracking, multiple meeting notes, video recordings  
**Why Critical:** Urgent deadline (meetings from March 27, April 10), complex filtering logic  
**Challenge:** Token explosion from filter combinations + sequential API calls

---

## 🎯 Critical Token Optimizations

### Problem 1: Filter Combinations

**Current cost:** 3,000 tokens/session per filter change (re-evaluate all combinations)

**Solution:**
```
1. Cache filter combinations
   - Key: JSON.stringify(filters)
   - Store: React state + localStorage
   - TTL: Until new job posted (WebSocket)

2. Only pass changed filters to API
   - Not: Full filters object
   - Yes: Diff of what changed
   
3. Batch similar filters together
   - Not: location, then salary, then role (3 API calls)
   - Yes: All 3 at once (1 API call)
```

**Savings:** -2,000 to -3,000 tokens/session

---

### Problem 2: Search Input Debounce

**Current cost:** 500+ tokens per keystroke (API call on every change)

**Solution:**
```javascript
// WRONG: API call per keystroke
const handleSearch = (e) => {
  setSearch(e.target.value);  // Triggers useEffect → API call
}

// RIGHT: Debounce 500ms
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 500);

useEffect(() => {
  if (debouncedSearch) {
    callSearchAPI(debouncedSearch);
  }
}, [debouncedSearch]);
```

**Savings:** -1,000 to -1,500 tokens/session

---

### Problem 3: Pagination

**Current cost:** 2,000+ tokens if loading all 1,000 jobs at once

**Solution:**
```
1. Load 20 jobs initially
2. Load 20 more on scroll
3. Store in state (not re-fetch unless filters change)

Savings: Only transmit jobs shown to user
```

**Savings:** -1,000 to -1,500 tokens/session

---

### Problem 4: Sequential API Calls

**Current:** Apply filter → Wait → Get results → Show loading  
**Better:** Parallel calls if possible

**Savings:** -500 tokens/session

---

**Total potential savings:** -5,500 tokens/session (11% reduction from budget)

---

## 📊 Token Budget Allocation

| Component | Budget | Details |
|-----------|--------|---------|
| **Filtering logic** | 15,000 | Complex matching algorithm |
| **Search + pagination** | 10,000 | Typeahead, results, infinite scroll |
| **Matching algorithm** | 12,000 | Job recommendations |
| **UI/UX improvements** | 8,000 | Components, styling |
| **Testing** | 3,000 | Test cases, validation |
| **Buffer** | 2,000 | Emergency optimizations |

---

## 🏗️ Architecture Overview

```
Job_Courier/
├── src/
│   ├── components/
│   │   ├── JobList.tsx (main results + infinite scroll)
│   │   ├── FilterBar.tsx (filters with caching)
│   │   ├── JobCard.tsx (individual job display)
│   │   ├── SearchBox.tsx (debounced search)
│   │   └── Filters_old.jsx (legacy, replace)
│   │
│   ├── pages/
│   │   ├── Browse.tsx (job listing page)
│   │   ├── [jobId].tsx (job detail)
│   │   └── MyApplications.tsx (user's applications)
│   │
│   ├── hooks/
│   │   ├── useFilters.ts (filter cache logic) ← CRITICAL
│   │   ├── useSearch.ts (debounced search)
│   │   └── useJobMatching.ts (matching algorithm)
│   │
│   └── utils/
│       └── cacheManager.ts (filter cache)
│
├── api/
│   └── /jobs (job search + filtering)
│
└── .git/ (active development tracking)
```

---

## 🔍 Decision Tree: Job_Courier Specific

Before EVERY tool call:

```
1. Touching filter logic?
   → Check cache strategy
   → Verify debounce in place
   → Look for batch API opportunities

2. Adding search feature?
   → Implement debounce first
   → Then API call
   → Then display

3. Performance issue?
   → Chrome DevTools Network tab (find slow endpoint)
   → React Profiler (find re-renders)
   → Show timing data before asking for fix

4. Token budget exceeded?
   → Aggressive: Reduce scope to core features
   → Defer: Nice-to-have features to next session
   → Optimize: Use ANTI_PATTERNS.md to find savings
```

---

## 🚀 Urgent Fixes (Priority Order)

### P0: Filter Caching
**Impact:** -3k tokens/session  
**Effort:** Medium  
**Status:** Not implemented  
**Action:** Implement useFilters hook with localStorage

### P1: Search Debounce  
**Impact:** -1.5k tokens/session  
**Effort:** Low  
**Status:** Maybe partial (old Filters component?)  
**Action:** Add debounce to SearchBox

### P2: Pagination
**Impact:** -1.5k tokens/session  
**Effort:** Medium  
**Status:** Unclear (check old component)  
**Action:** Implement infinite scroll in JobList

### P3: Parallel APIs
**Impact:** -0.5k tokens/session  
**Effort:** Low  
**Status:** Unknown  
**Action:** Use Promise.all for parallel calls

---

## 📚 References

- **[PROMPT_ENGINEERING.md](../../PROMPT_ENGINEERING.md)** — Optimize prompts for marketplace features
- **[TOKEN_POLICIES.md](../../TOKEN_POLICIES.md)** — Per-task budgets
- **[ANTI_PATTERNS.md](../../ANTI_PATTERNS.md)** — Marketplace anti-patterns
- **Meeting notes:** "Meeting Gabriele 27 03.txt" + "analisi_Job_Courier.md"
- **SKILL.md** — Product requirements and feature list
- **Video recordings:** Track progress and identify blockers

---

## ✅ Session Checklist

- [ ] Cache strategy enabled for filters
- [ ] Debounce added to search input
- [ ] Pagination working (no loading all jobs)
- [ ] API calls parallelized where possible
- [ ] Token usage tracked (stayed under 50k?)
- [ ] No console.log/debugger in production code
- [ ] Tests written for critical paths

---

**Model:** Haiku 4.5  
**Status:** 🔴 CRITICAL  
**Deadline:** URGENT  
**Last Updated:** 2026-04-13
