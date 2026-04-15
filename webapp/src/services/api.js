/**
 * API Service Configuration Mapping
 * Maps all the API endpoints for Jobs, Companies, and Cantons.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.jobcourier.ch/v1';
const LOCAL_API_URL = '/api'; // For Vercel serverless functions

export const API_ENDPOINTS = {
  jobs: {
    getAll: () => `${API_BASE_URL}/jobs`,
    getById: (id) => `${API_BASE_URL}/jobs/${id}`,
    featured: () => `${API_BASE_URL}/jobs/featured`, // For the 'Vetrini' section
    search: (query) => `${API_BASE_URL}/jobs/search?q=${query}`,
    latest: () => `${LOCAL_API_URL}/jobs`
  },
  companies: {
    getAll: () => `${API_BASE_URL}/companies`,
    getById: (id) => `${API_BASE_URL}/companies/${id}`
  },
  cantons: {
    getAll: () => `${API_BASE_URL}/cantons`
  },
  sectors: {
    getAll: () => `${API_BASE_URL}/sectors`
  }
};

// Simple fetch wrappers or axios interceptors could be added here
export async function fetchJobs(params = {}) {
  // Convert params to query string
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_ENDPOINTS.jobs.getAll()}?${query}`);
  return res.json();
}

export async function fetchCantons() {
  const res = await fetch(API_ENDPOINTS.cantons.getAll());
  return res.json();
}

export async function fetchSectors() {
  const res = await fetch(API_ENDPOINTS.sectors.getAll());
  return res.json();
}

export async function fetchFeaturedJobs() {
  const res = await fetch(API_ENDPOINTS.jobs.featured());
  return res.json();
}

export async function fetchLatestJobs() {
  try {
    const res = await fetch(API_ENDPOINTS.jobs.latest());
    if (!res.ok) throw new Error('API server unavailable');
    return await res.json();
  } catch (error) {
    console.error('Error in fetchLatestJobs:', error);
    return null; // Return null to trigger fallback in components
  }
}
