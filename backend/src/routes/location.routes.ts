import { Router, Request, Response } from 'express';
import { sendSuccess } from '../utils/response';

const router = Router();

// Fallback landmark database for popular tech hubs / transport hubs
const FALLBACK_LOCATIONS = [
  { display_name: 'Kempegowda International Airport (BLR), Bengaluru', lat: 13.1986, lng: 77.7066 },
  { display_name: 'Koramangala 4th Block, Bengaluru', lat: 12.9345, lng: 77.6265 },
  { display_name: 'Indiranagar 100ft Road, Bengaluru', lat: 12.9719, lng: 77.6412 },
  { display_name: 'Manyata Tech Park, Nagavara, Bengaluru', lat: 13.0494, lng: 77.6202 },
  { display_name: 'MG Road Metro Station, Bengaluru', lat: 12.9756, lng: 77.6066 },
  { display_name: 'Whitefield ITPL Main Road, Bengaluru', lat: 12.9863, lng: 77.7315 },
  { display_name: 'Electronic City Phase 1, Bengaluru', lat: 12.8399, lng: 77.6770 },
  { display_name: 'HSR Layout Sector 1, Bengaluru', lat: 12.9116, lng: 77.6389 },
  { display_name: 'Majestic City Railway Station, Bengaluru', lat: 12.9767, lng: 77.5713 },
  { display_name: 'Bellandur EcoSpace, Outer Ring Road, Bengaluru', lat: 12.9260, lng: 77.6762 },
];

router.get('/search', async (req: Request, res: Response) => {
  const query = (req.query.q as string || '').trim().toLowerCase();
  if (!query) {
    sendSuccess(res, []);
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=in`;
    const response = await fetch(nominatimUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'CabGo-UberClone/1.0',
      },
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        const results = data.map((item: any) => ({
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          place_id: item.place_id,
        }));
        sendSuccess(res, results);
        return;
      }
    }
  } catch {
    // If external geocoder is unreachable or times out, match against our local landmark directory
  }

  // Local substring match
  const matches = FALLBACK_LOCATIONS.filter((loc) =>
    loc.display_name.toLowerCase().includes(query)
  );

  sendSuccess(res, matches.length > 0 ? matches : FALLBACK_LOCATIONS.slice(0, 4));
});

router.get('/reverse', async (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string);
  const lng = parseFloat(req.query.lng as string);

  if (isNaN(lat) || isNaN(lng)) {
    res.status(400).json({ success: false, error: 'Invalid coordinates' });
    return;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const response = await fetch(nominatimUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'CabGo-UberClone/1.0',
      },
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data: any = await response.json();
      if (data && data.display_name) {
        sendSuccess(res, { address: data.display_name, lat, lng });
        return;
      }
    }
  } catch {
    // fallback
  }

  sendSuccess(res, {
    address: `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
    lat,
    lng,
  });
});

export default router;
