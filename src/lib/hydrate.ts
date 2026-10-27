// Loads live store data from the server BEFORE the first render and swaps it into the existing
// data modules, so every existing component keeps working unchanged. If the API is unreachable
// (e.g. plain `vite dev` without the server) the original static data is used as a fallback.
import { ALL_PRODUCTS } from '../data/products';
import { PROMOTIONAL_OFFERS } from '../data/offers';
import { PROMOTIONAL_MESSAGES } from '../data/marqueeMessages';
import { STORE_CONFIG } from '../data/storeConfig';

export const marqueeSettings = { enabled: true, speed: 35, direction: 'left' as 'left' | 'right' };
export const liveData = { fromServer: false };

async function getJson(url: string, ms = 4000) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal });
    if (!r.ok) throw new Error(String(r.status));
    return await r.json();
  } finally { clearTimeout(timer); }
}

export async function hydrateStore(): Promise<void> {
  try {
    const [boot, prod] = await Promise.all([getJson('/api/public/bootstrap'), getJson('/api/public/products')]);
    const s = boot.store || {};
    const phone = String(s.phone || '').trim();
    const wa = String(s.whatsapp || '').replace(/\D/g, '');
    Object.assign(STORE_CONFIG, {
      name: s.name || STORE_CONFIG.name, tagline: s.tagline || STORE_CONFIG.tagline, location: s.location || STORE_CONFIG.location,
      email: s.email || STORE_CONFIG.email,
      phoneDisplay: phone || 'Contact number coming soon', realPhoneConfigured: !!phone, realPhoneNumber: phone.replace(/[^\d+]/g, ''),
      whatsappDisplay: wa ? `+${wa}` : 'WhatsApp coming soon', realWhatsAppConfigured: !!wa, realWhatsAppNumber: wa,
      businessHours: { weekdays: s.hoursWeekdays ?? '', weekends: s.hoursWeekends ?? '', note: s.hoursNote ?? '' },
      maps: { searchUrl: s.mapsSearchUrl || STORE_CONFIG.maps.searchUrl, directionsUrl: s.mapsDirectionsUrl || STORE_CONFIG.maps.directionsUrl,
        embedUrl: s.mapsEmbedUrl || STORE_CONFIG.maps.embedUrl, placeLabel: s.mapsLabel || STORE_CONFIG.maps.placeLabel },
      social: { instagram: s.instagram || '', facebook: s.facebook || '' },
      delivery: { freeDeliveryThreshold: s.freeDeliveryThreshold ?? 999, standardDeliveryCharge: s.deliveryCharge ?? 60, estimatedDays: s.deliveryEstimate || STORE_CONFIG.delivery.estimatedDays },
    });
    ALL_PRODUCTS.splice(0, ALL_PRODUCTS.length, ...prod.products);
    PROMOTIONAL_OFFERS.splice(0, PROMOTIONAL_OFFERS.length, ...boot.offers);
    PROMOTIONAL_MESSAGES.splice(0, PROMOTIONAL_MESSAGES.length, ...boot.marquee.messages);
    Object.assign(marqueeSettings, { enabled: boot.marquee.enabled, speed: boot.marquee.speed, direction: boot.marquee.direction });
    liveData.fromServer = true;
  } catch (e) {
    console.warn('Live store data unavailable — using bundled catalogue.', e);
  }
}
