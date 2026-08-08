import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'
import './i18n.js'

// index.html carries a generic <title> and Open Graph set, and for /offerta and /azienda
// the SSR functions rewrite them per page before the HTML is served (see api/_ssr.js).
// Either way they are what a client that never executes this bundle reads — social
// scrapers included, since none of them run JavaScript.
//
// From here on the page's own Helmet owns the head, and this version of
// react-helmet-async appends rather than replacing tags it did not create: left in place,
// these produced two <title> on every page and two og:title wherever a page set its own.
// Removing them before the first render keeps the no-JS fallback intact and leaves exactly
// one of each afterwards.
document
  .querySelectorAll('head > title, head > meta[property^="og:"]')
  .forEach((el) => el.remove())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
