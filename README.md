# NEW GULLY — Men's & Kids' Vintage Fashion Store

> **Established 2016** • **Palikkal Bazar, Malappuram, Kerala, India**  
> **Brand Tagline:** *Timeless Style. Everyday Comfort.*  
> **Currency:** Indian Rupees (₹)

A modern, responsive e-commerce platform with a curated vintage fashion aesthetic designed for **NEW GULLY**, an independent boutique clothing store established in 2016.

---

## 🌟 Brand Identity & Aesthetic Direction

- **Primary Backgrounds:** Warm cream (`#FBF8F2`) and vintage ivory (`#F4ECE1`).
- **Secondary Colors:** Dark heritage brown (`#281A14`, `#1C120D`) and charcoal (`#171413`).
- **Accent Tones:** Royal burgundy (`#731C28`) and antique brass gold (`#C49C4C`).
- **Nature Accents:** Muted olive green (`#4D5D46`) for outdoor, casual, and kids' play wear.
- **Typography:**
  - Headings: Bold vintage serif fonts (`Playfair Display`, `Cormorant Garamond`, `Cinzel`).
  - Body & UI: Clean modern sans-serif (`Plus Jakarta Sans`).
- **Decorations:** Subtle grain texture overlays, vintage double-borders, retro postal badges ("EST. 2016"), and refined rectangular buttons.
- **Brand Logo:** Original high-resolution NEW GULLY brand mark preserved in `public/images/new-gully-logo.png`.

---

## 🚀 Key Features

### 1. Top Promotional Marquee
- Continuous smooth scrolling ticker with diamond and sparkle separators.
- Announcements: *"WELCOME TO NEW GULLY"*, *"THE STYLE SALE"*, *"FREE DELIVERY ON ORDERS ABOVE ₹999"*, and *"EST. 2016 PALIKKAL BAZAR"*.
- Automatically pauses on hover and respects `prefers-reduced-motion`.
- Fully customizable via `src/data/marqueeMessages.ts`.

### 2. Editorial Hero & Featured Categories
- Bold headline: *"TIMELESS STYLE. EVERYDAY COMFORT."* with dual CTAs: **Shop Men's** and **Shop Kids'**.
- Curated category cards for Men's and Kids' collections with direct links to subcategories (Shirts, T-Shirts, Jeans, Trousers, Traditional Kasavu sets, Boys' Shirts, and Festive Wear).

### 3. Dedicated Collections with Advanced Filtering
- **Men's Collection (`/mens`):** Subcategory filter pills, price range slider (`₹400` to `₹2,000`), size selectors (`S` to `XXL`, `30` to `42`), discount toggle, search bar, and a compact expandable mobile filter drawer.
- **Kids' Collection (`/kids`):** Playful vintage touches with age filters (`2-3Y`, `4-5Y`, `6-7Y`, `8-9Y`, `10-11Y`, `12-13Y`).

### 4. Product Details & Quick View
- **Product Details (`/product/:id`):** Multi-angle gallery with thumbnail switcher, color swatches, size selector with validation, live stock indicator, measurement size guide modal, and coordinating recommendations.
- **Quick View Modal:** Accessible from any product card for instant size selection and fast checkout.

### 5. Interactive Cart & Demonstration Checkout
- Persistent cart state across refreshes via `localStorage`.
- Real-time free delivery calculation (Kerala free shipping threshold: `₹999`).
- Promotional vouchers: `VINTAGE20` (20% off above ₹999) and `GULLY10` (10% off).
- **Checkout (`/checkout`):** Form validation for customer name, phone, address, city, and 6-digit Indian PIN code.
- Immediate demonstration order placement with celebration confetti, unique reference code (`NG-2026-XXXXX`), and printable invoice preview.

### 6. Physical Boutique Details & Google Maps
- Showcases physical boutique at **Palikkal Bazar, Malappuram, Kerala, India**.
- Embedded responsive Google Maps iframe with a fallback 1-click directions link.
- Store hours: 9:30 AM – 9:30 PM (All 7 days of the week).
- Configurable WhatsApp chat integration in `src/data/storeConfig.ts`.

---

## 🛠️ Project Structure

```
new gully2.0/
├── public/
│   ├── favicon.png                  # Brand favicon
│   └── images/
│       └── new-gully-logo.png       # Original NEW GULLY brand logo
├── src/
│   ├── types/
│   │   └── index.ts                 # Product, Category, Cart, Offer & Order TypeScript types
│   ├── data/
│   │   ├── storeConfig.ts           # Store address, contact, hours, WhatsApp & Google Map URLs
│   │   ├── marqueeMessages.ts       # Centralized top marquee announcements
│   │   ├── categories.ts            # Men's and Kids' category definitions
│   │   ├── products.ts              # Catalog of Men's & Kids' items with INR pricing & images
│   │   ├── offers.ts                # Promotional vouchers and seasonal sales
│   │   └── reviews.ts               # Sample customer testimonials (demonstration)
│   ├── context/
│   │   └── CartContext.tsx          # LocalStorage cart, wishlist, modal states, promo code logic
│   ├── components/
│   │   ├── PromoMarquee.tsx         # Top continuous horizontal scrolling banner
│   │   ├── Navbar.tsx               # Sticky vintage navigation, badge counts, mobile drawer
│   │   ├── HeroSection.tsx          # Editorial hero with dual CTAs and heritage stamp
│   │   ├── FeaturedCategories.tsx   # Men's & Kids' highlight cards with subcategory pills
│   │   ├── ProductCard.tsx          # Vintage product cards with quick-view and INR pricing
│   │   ├── ProductGrid.tsx          # Responsive 4-column layout with empty states
│   │   ├── ProductQuickView.tsx     # Accessible modal with gallery, size picker & instant add
│   │   ├── SizeGuideModal.tsx       # Measurement tables for Men's & Kids' clothing
│   │   ├── SearchModal.tsx          # Live search modal with ⌘K keyboard shortcut
│   │   ├── CartDrawer.tsx           # Slide-over cart with free delivery progress bar
│   │   ├── SpecialOffersSection.tsx # "THE STYLE SALE" with real countdown timer
│   │   ├── WhyChooseUs.tsx          # Four core brand value cards
│   │   ├── AboutSnippet.tsx         # Brand story highlight on homepage
│   │   ├── ReviewsSection.tsx       # Testimonials with demonstration disclaimer
│   │   ├── LocationSection.tsx      # Palikkal Bazar Google Maps embed & directions
│   │   ├── Newsletter.tsx           # "STAY IN STYLE" email subscription form
│   │   ├── Footer.tsx               # Dark brown footer with policies, hours & links
│   │   └── PageTransition.tsx       # Framer Motion smooth page transition wrapper
│   ├── pages/
│   │   ├── Home.tsx                 # Complete landing page
│   │   ├── MensCollection.tsx       # Men's catalog with price sort, sizes, and subcategories
│   │   ├── KidsCollection.tsx       # Playful kids' catalog with age filtering (2-13Y)
│   │   ├── ProductDetails.tsx       # Dedicated item page with gallery & fit specifications
│   │   ├── Offers.tsx               # Active vouchers, promo codes, and terms
│   │   ├── About.tsx                # Heritage, craftsmanship, and Palikkal Bazar boutique story
│   │   ├── Contact.tsx              # Validated inquiry form, store details, and WhatsApp
│   │   ├── Cart.tsx                 # Full shopping bag with delivery thresholds
│   │   ├── Checkout.tsx             # Validated checkout with printable order invoice & confetti
│   │   ├── Wishlist.tsx             # Saved favorite styles
│   │   └── NotFound.tsx             # Custom vintage 404 navigation screen
│   ├── styles/
│   │   └── index.css                # Vintage utilities, scrollbar, and marquee animations
│   ├── App.tsx                      # Root component with routing and modal containers
│   └── main.tsx                     # Application entry point
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── index.html                       # SEO meta tags, Google Fonts & JSON-LD structured data
```

---

## 💻 Development & Deployment Commands

```bash
# Install dependencies
npm install

# Start local development server (http://localhost:5173/)
npm run dev

# Run TypeScript type-check and create production build
npm run build

# Preview production build locally
npm run preview
```

---

## 📜 License & Copyright

© 2016–2026 **NEW GULLY**. All rights reserved.  
Palikkal Bazar, Malappuram, Kerala, India.
