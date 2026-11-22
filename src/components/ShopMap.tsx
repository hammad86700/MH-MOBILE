import React, { useEffect, useState } from 'react';
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  Map as GoogleMap,
  Pin,
  useMapsLibrary,
} from '@vis.gl/react-google-maps';
import { ExternalLink, Loader2, MapPin, Navigation } from 'lucide-react';

interface ShopMapProps {
  businessName: string;
  locationAddress: string;
}

interface ResolvedPlace {
  lat: number;
  lng: number;
  formattedAddress: string;
  googleMapsURI: string;
  displayName: string;
}

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

function ShopMapCanvas({ businessName, locationAddress }: ShopMapProps) {
  const placesLib = useMapsLibrary('places');
  const [resolvedPlace, setResolvedPlace] = useState<ResolvedPlace | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [infoOpen, setInfoOpen] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (!placesLib) return;

    async function lookupLocation() {
      setLoading(true);
      setMapError(null);
      try {
        const queryText = locationAddress.trim() || 'Main Auto Market, Rahim Yar Khan, Pakistan';
        const { places } = await placesLib!.Place.searchByText({
          textQuery: queryText,
          fields: ['displayName', 'formattedAddress', 'location', 'googleMapsURI'],
          region: 'PK',
          language: 'en',
          maxResultCount: 1,
        });

        if (cancelled) return;

        const first = places?.[0];
        if (first && first.location) {
          setResolvedPlace({
            lat: first.location.lat(),
            lng: first.location.lng(),
            formattedAddress: first.formattedAddress || queryText,
            googleMapsURI:
              first.googleMapsURI ||
              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(queryText)}`,
            displayName: first.displayName || businessName,
          });
        } else {
          setMapError('Exact pin not yet found via Places search. Open Google Maps directly for navigation.');
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        if (
          msg.includes('OVER_QUERY_LIMIT') ||
          msg.includes('RESOURCE_EXHAUSTED') ||
          msg.includes('Quota')
        ) {
          window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        }
        setMapError('Unable to resolve live map pin right now. You can still open directions in Google Maps.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void lookupLocation();
    return () => {
      cancelled = true;
    };
  }, [placesLib, businessName, locationAddress]);

  const fallbackMapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${businessName}, ${locationAddress}`
  )}`;

  if (loading) {
    return (
      <div className="h-[380px] w-full flex flex-col items-center justify-center gap-3 bg-slate-100 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400">
        <Loader2 className="w-5 h-5 animate-spin text-blue-700 dark:text-blue-400" />
        <p className="text-sm">Locating {locationAddress} on Google Maps...</p>
      </div>
    );
  }

  if (!resolvedPlace || mapError) {
    return (
      <div className="h-[380px] w-full flex flex-col items-center justify-center gap-4 p-6 text-center bg-slate-100 dark:bg-slate-900/60">
        <div className="w-11 h-11 rounded-lg bg-white dark:bg-[#131A26] border border-slate-200 dark:border-slate-800 flex items-center justify-center text-blue-700 dark:text-blue-400">
          <MapPin className="w-5 h-5" />
        </div>
        <div className="max-w-md space-y-1">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
            {businessName} — {locationAddress}
          </p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            {mapError || 'Open Google Maps for turn-by-turn directions.'}
          </p>
        </div>
        <a
          href={fallbackMapsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors"
        >
          <Navigation className="w-4 h-4" />
          Open in Google Maps
        </a>
      </div>
    );
  }

  const center = { lat: resolvedPlace.lat, lng: resolvedPlace.lng };

  return (
    <div className="relative h-[380px] w-full">
      <GoogleMap
        defaultCenter={center}
        defaultZoom={16}
        mapId="DEMO_MAP_ID"
        gestureHandling="cooperative"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        className="h-full w-full"
      >
        <AdvancedMarker
          position={center}
          title={businessName}
          onClick={() => setInfoOpen(true)}
        >
          <Pin background="#1D4ED8" borderColor="#1E3A8A" glyphColor="#FFFFFF" />
        </AdvancedMarker>
        {infoOpen && (
          <InfoWindow position={center} onCloseClick={() => setInfoOpen(false)}>
            <div className="p-1 max-w-[240px] text-slate-900 space-y-1.5">
              <p className="font-semibold text-sm">{businessName}</p>
              <p className="text-xs text-slate-600 leading-relaxed">
                {resolvedPlace.formattedAddress}
              </p>
              <a
                href={resolvedPlace.googleMapsURI}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:underline"
              >
                Get Directions
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}

export function ShopMap({ businessName, locationAddress }: ShopMapProps) {
  const directionsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${businessName}, ${locationAddress}`
  )}`;

  if (!MAPS_API_KEY) {
    return (
      <div className="h-[380px] w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#131A26] flex flex-col items-center justify-center p-6 text-center gap-4">
        <MapPin className="w-6 h-6 text-blue-700 dark:text-blue-400" />
        <div className="space-y-1 max-w-md">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {businessName}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{locationAddress}</p>
        </div>
        <a
          href={directionsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors"
        >
          <Navigation className="w-4 h-4" />
          View Location on Google Maps
        </a>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131A26]">
      <APIProvider apiKey={MAPS_API_KEY} language="en" region="PK">
        <ShopMapCanvas businessName={businessName} locationAddress={locationAddress} />
      </APIProvider>
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
        <span className="truncate">{locationAddress}</span>
        <a
          href={directionsHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium text-blue-700 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0"
        >
          Open Directions
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
