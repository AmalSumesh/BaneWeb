import { useState, useEffect } from "react";

interface DispensaryFacility {
  id: number | string;
  name: string;
  address: string;
  city: string;
  distanceKm: number;
  latitude: number;
  longitude: number;
  phone?: string | null;
  website?: string | null;
}

interface DispensariesViewProps {
  onNavigate?: (to: string) => void;
}

export function DispensariesView({ onNavigate }: DispensariesViewProps) {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [facilities, setFacilities] = useState<DispensaryFacility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<DispensaryFacility | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [mapZoom, setMapZoom] = useState(13);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Auto-detect user's current location on mount
  useEffect(() => {
    detectLocation();
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setApiError("Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude);
        setLongitude(pos.coords.longitude);
        setIsLocating(false);
      },
      () => {
        setApiError("Unable to retrieve your location. Please allow location access and refresh.");
        setIsLocating(false);
      },
      { timeout: 10000 }
    );
  };

  // Fetch from the backend API when coordinates are available
  useEffect(() => {
    if (latitude === null || longitude === null) return;

    async function fetchNearbyFacilities() {
      setLoading(true);
      setApiError(null);
      setApiMessage(null);
      try {
        const url = `http://localhost:8000/api/pharmaceutical-companies/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radiusKm * 1000}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();

          if (data.message) {
            setApiMessage(data.message);
          }

          const list: DispensaryFacility[] = (data.companies || []).map((c: any, index: number) => {
            const dLat = (c.latitude - latitude!) * 111;
            const dLon = (c.longitude - longitude!) * 111 * Math.cos((latitude! * Math.PI) / 180);
            const dist = Math.sqrt(dLat * dLat + dLon * dLon);

            return {
              id: c.id || `fac-${index + 1}`,
              name: c.name || "Unnamed Facility",
              address: c.address || "N/A",
              city: c.city || "N/A",
              distanceKm: Number(dist.toFixed(1)),
              latitude: c.latitude,
              longitude: c.longitude,
              phone: c.phone || null,
              website: c.website || null,
            };
          });

          setFacilities(list);
          setSelectedFacility(list.length > 0 ? list[0] : null);
        } else {
          setFacilities([]);
          setSelectedFacility(null);
          setApiError(`API returned status ${res.status}`);
        }
      } catch (err: any) {
        setFacilities([]);
        setSelectedFacility(null);
        setApiError(err?.message || "Failed to reach the API. Make sure the backend is running.");
      } finally {
        setLoading(false);
      }
    }

    fetchNearbyFacilities();
  }, [latitude, longitude, radiusKm]);

  const filteredFacilities = facilities.filter((f) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.address.toLowerCase().includes(q) ||
      f.city.toLowerCase().includes(q)
    );
  });

  // Calculate bounding box for OpenStreetMap iframe
  const mapLat = latitude ?? 0;
  const mapLon = longitude ?? 0;
  const delta = (radiusKm * 1.5) / 111;
  const bbox = `${mapLon - delta},${mapLat - delta},${mapLon + delta},${mapLat + delta}`;
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(
    bbox
  )}&layer=mapnik&marker=${encodeURIComponent(`${mapLat},${mapLon}`)}`;

  return (
    <div className="flex flex-col h-full space-y-6 pb-12">
      {/* Top Header & Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent">
            07 // CLINICAL DISPENSARIES • LOCAL PHARMACOLOGY NETWORK
          </span>
          <h1 className="text-xl md:text-2xl font-bold font-sans text-foreground mt-1">
            Dispensaries & Biomedical Localities
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Geographic mapping of pharmaceutical dispensaries, investigational compound depots, and clinical supply nodes.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={detectLocation}
            disabled={isLocating}
            className="px-3 py-1.5 border border-accent/60 bg-accent/10 hover:bg-accent/20 text-accent transition-all text-xs font-mono flex items-center gap-2 rounded-sm shadow-sm"
            title="Locate via GPS"
          >
            <svg className={`w-3.5 h-3.5 ${isLocating ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
            </svg>
            <span>{isLocating ? "DETECTING GPS..." : "DETECT MY LOCATION"}</span>
          </button>

          {latitude !== null && longitude !== null && (
            <a
              href={`https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=${mapZoom}/${latitude}/${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 border border-border bg-background-elevated hover:bg-background-subtle text-foreground text-xs font-mono flex items-center gap-1.5 rounded-sm transition-colors"
            >
              <span>FULL OSM VIEW ↗</span>
            </a>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-background-elevated p-3.5 border border-border rounded-sm">
        {/* Search Field */}
        <div className="space-y-1">
          <label className="text-[0.65rem] font-mono text-muted uppercase">Search Facilities</label>
          <input
            type="text"
            placeholder="Filter by name, address, city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-border px-2.5 py-1.5 text-xs text-foreground font-sans placeholder:text-muted focus:outline-none focus:border-accent"
          />
        </div>

        {/* Radius Slider */}
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[0.65rem] font-mono">
            <span className="text-muted uppercase">Search Radius:</span>
            <span className="text-accent font-semibold">{radiusKm} KM</span>
          </div>
          <input
            type="range"
            min="2"
            max="30"
            step="1"
            value={radiusKm}
            onChange={(e) => setRadiusKm(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer h-1.5 bg-background-subtle rounded-lg"
          />
        </div>
      </div>

      {/* Main Grid: Interactive Map + Facilities List + Details Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Columns: OpenStreetMap Embed & View Controls */}
        <div className="lg:col-span-7 flex flex-col space-y-3">
          <div className="relative border border-border bg-background-elevated rounded-sm overflow-hidden shadow-sm">
            {/* Map Status Overlay Bar */}
            {latitude !== null && longitude !== null && (
              <div className="absolute top-2 left-2 z-10 bg-background-elevated/90 backdrop-blur-md px-2.5 py-1 border border-border/80 text-[0.65rem] font-mono text-foreground flex items-center gap-2 rounded-xs shadow">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>OSM LAT: {latitude.toFixed(4)}, LON: {longitude.toFixed(4)}</span>
                <span className="text-muted">|</span>
                <span className="text-accent">{filteredFacilities.length} NODES MAPPED</span>
              </div>
            )}

            {/* Map Zoom / Recenter Buttons */}
            <div className="absolute bottom-2 right-2 z-10 flex gap-1 bg-background-elevated/90 backdrop-blur-md p-1 border border-border rounded-xs shadow">
              <button
                onClick={() => setMapZoom((prev) => Math.min(prev + 1, 18))}
                className="px-2 py-1 bg-background hover:bg-background-subtle text-foreground text-xs font-mono border border-border"
                title="Zoom In"
              >
                +
              </button>
              <button
                onClick={() => setMapZoom((prev) => Math.max(prev - 1, 5))}
                className="px-2 py-1 bg-background hover:bg-background-subtle text-foreground text-xs font-mono border border-border"
                title="Zoom Out"
              >
                -
              </button>
            </div>

            {/* Embedded OpenStreetMap Iframe */}
            {latitude !== null && longitude !== null ? (
              <iframe
                title="OpenStreetMap Biomedical Locality View"
                src={osmUrl}
                className="w-full h-[420px] md:h-[500px] border-0"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-[420px] md:h-[500px] flex items-center justify-center text-muted text-sm font-mono">
                {isLocating ? "Detecting your location..." : "Allow location access to view the map."}
              </div>
            )}
          </div>
        </div>

        {/* Right 5 Columns: Facilities List & Active Inspector */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          {/* API Error / Message Banner */}
          {apiError && (
            <div className="p-3 border border-rose-500/40 bg-rose-500/10 rounded-sm text-xs font-mono text-rose-400">
              ⚠ API ERROR: {apiError}
            </div>
          )}
          {apiMessage && !apiError && facilities.length === 0 && (
            <div className="p-3 border border-amber-500/40 bg-amber-500/10 rounded-sm text-xs font-mono text-amber-400">
              ℹ {apiMessage}
            </div>
          )}

          {/* Active Facility Card */}
          {selectedFacility ? (
            <div className="p-4 border border-accent/60 bg-accent/5 rounded-sm space-y-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[0.6rem] font-mono px-2 py-0.5 uppercase rounded-xs bg-accent/20 text-accent font-semibold">
                    PHARMACEUTICAL
                  </span>
                  <h3 className="text-base font-bold font-sans text-foreground mt-1.5">
                    {selectedFacility.name}
                  </h3>
                  <p className="text-xs text-foreground-muted flex items-center gap-1 mt-0.5">
                    <svg className="w-3 h-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {selectedFacility.address}, {selectedFacility.city}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold font-mono text-accent">
                    {selectedFacility.distanceKm} km
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 bg-background border border-border">
                  <div className="text-[0.6rem] text-muted uppercase">PHONE</div>
                  <div className="text-foreground text-xs">{selectedFacility.phone || "Not Listed"}</div>
                </div>
                <div className="p-2 bg-background border border-border">
                  <div className="text-[0.6rem] text-muted uppercase">WEBSITE</div>
                  {selectedFacility.website ? (
                    <a
                      href={selectedFacility.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent hover:underline text-xs truncate block"
                    >
                      {selectedFacility.website.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    <span className="text-foreground text-xs">Not Listed</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedFacility.latitude},${selectedFacility.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 bg-accent text-background text-center text-xs font-mono uppercase font-semibold hover:opacity-90 transition-opacity rounded-xs"
                >
                  GET DIRECTIONS ↗
                </a>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate("/pipeline")}
                    className="px-3 py-1.5 border border-border bg-background hover:bg-background-subtle text-xs font-mono uppercase transition-colors rounded-xs"
                  >
                    RUN PIPELINE
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-6 border border-border bg-background-elevated text-center text-muted text-xs">
              {isLocating
                ? "Detecting your location..."
                : loading
                  ? "Fetching nearby pharmaceutical companies..."
                  : latitude === null
                    ? "Allow location access to find nearby pharmaceutical companies."
                    : facilities.length === 0
                      ? "No pharmaceutical companies found in this area. Try increasing the search radius."
                      : "Select any facility from the list to inspect details."}
            </div>
          )}

          {/* Facilities List */}
          <div className="border border-border bg-background-elevated rounded-sm overflow-hidden flex flex-col">
            <div className="p-2.5 border-b border-border bg-background-subtle/60 flex items-center justify-between text-[0.65rem] font-mono text-muted uppercase">
              <span>FACILITY DIRECTORY ({filteredFacilities.length})</span>
              <span>{loading ? "SEARCHING..." : "LIVE SYNC"}</span>
            </div>

            <div className="max-h-[280px] overflow-y-auto divide-y divide-border/60">
              {filteredFacilities.length === 0 ? (
                <div className="p-6 text-center text-muted text-xs">
                  {latitude === null
                    ? "Waiting for location access..."
                    : `No facilities found matching your criteria in this ${radiusKm}km radius.`}
                </div>
              ) : (
                filteredFacilities.map((fac) => (
                  <button
                    key={fac.id}
                    onClick={() => {
                      setSelectedFacility(fac);
                    }}
                    className={`w-full text-left p-3 flex items-start justify-between gap-2 hover:bg-background-subtle transition-colors ${selectedFacility?.id === fac.id ? "bg-accent/10 border-l-2 border-l-accent" : ""
                      }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold font-sans text-foreground">
                          {fac.name}
                        </span>
                      </div>
                      <p className="text-[0.65rem] text-muted truncate max-w-[260px]">
                        {fac.address}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="text-xs font-mono font-bold text-accent">{fac.distanceKm} km</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
