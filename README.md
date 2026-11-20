# TAWAKKAL — Raw Seafood Storefront (Pakistan)

Premium minimal, dark-mode storefront with **HTML5, CSS3, Bootstrap 5.3 CDN and Vanilla JavaScript**. No React, jQuery or build tool.

## Run locally

Open `index.html` in a modern browser, or run `python -m http.server 8000` from this folder and visit `http://localhost:8000`. An internet connection is required for Bootstrap CDN, Google Fonts, Bootstrap Icons and Unsplash example images.

## Important — customize before launch

1. **Original logo:** add the client's unmodified logo at `assets/images/logo.png`. The site uses this filename for navbar, preloader, favicon and footer. If unavailable, the wordmark text remains visible.
2. **WhatsApp:** set `CONFIG.whatsappNumber` in `js/main.js` to the real number in international format without `+` or spaces (e.g., `923XXXXXXXXX`). Example number is *not real business contact information*.
3. **Prices and products:** update `PRODUCTS` in `js/main.js` with the current items, local names, images and authorized **PKR per kg** prices. Values in this demo are not verified market prices.
4. **Images:** replace each `images.unsplash.com` URL in `index.html` and `js/main.js` with photographed *raw* seafood actually stocked. Do not use cooked, plated or restaurant food photography.
5. **Delivery areas and processing promises:** confirm cities, timings, handling, cut availability, delivery charges, returns/refunds and payment methods with the business before public launch.
6. **Product cutting:** `CUT_OPTIONS` in `js/main.js` defines options by category. Remove options you cannot fulfill and consider different yield / cleaning fees by species as necessary.
7. **Business identity:** add the real business address, telephone, website canonical URL, verified reviews and social URLs. Update structured data in `index.html`. Do not invent review ratings.
8. **Newsletter:** front-end demo only — no email is stored or sent. Integrate a compliant mail provider and privacy notice before accepting subscribers.
9. **Checkout:** an itemized WhatsApp *enquiry draft*, not a payment gateway. The user still needs to send the message and the merchant needs to confirm price, actual raw weight, cut yield, stock and delivery.
10. **Performance:** self-host compressed product WebP/AVIF files when ready (replace placeholder URLs), implement caching and test image loading.

## Features

- Responsive sections: nav, hero, ticker, raw seafood categories, searchable product grid, choice-driven product quick-view, basket, brand promise, four-step ordering guide, seafood spotlight, counters, trust carousel, delivery, contact form, newsletter layout, footer.
- Per-kg price estimates, selectable weight (500 g–5 kg), species-specific cutting preferences, separate basket lines per combination and basket persistence using `localStorage`.
- WhatsApp ordering and validated customer enquiries, client-side newsletter validation, accessible toast feedback, scroll animations, Bootstrap mobile offcanvas, Bootstrap modal, Bootstrap carousel, reduced-motion fallback.
- Local names and Pakistani rupees, with explicit distinction between **raw/pre-cleaning** and net weight.

## Folder structure

```text
TAWAKKAL-Raw-Seafood/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
└── assets/
    └── images/
        └── logo.png  <- add the exact original file
```

All food photography, sample testimonials/ordering principles, example rates and business service wording must be independently verified before the site is published.
