'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { assistantService } from '@/services/assistant.service';

// Fix Leaflet's default icon path issues with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Mock signals/clusters for the MVP map
const MOCK_CLUSTERS = [
  { id: '1', lat: 28.6139, lng: 77.2090, priority: 95, category: 'Roads', title: 'Severe Potholes', selected: true },
  { id: '2', lat: 28.6200, lng: 77.2150, priority: 70, category: 'Water', title: 'Broken Pipe', selected: false },
  { id: '3', lat: 28.6100, lng: 77.2200, priority: 45, category: 'Healthcare', title: 'Clinic Supply Shortage', selected: false },
];

function createCustomIcon(priority: number, category: string) {
  const size = priority > 80 ? 40 : priority > 60 ? 30 : 20;
  const color = priority > 80 ? '#D90429' : priority > 60 ? '#FF5E5B' : '#EAE6DB';
  
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}" fill="${color}" stroke="#090500" stroke-width="2">
      <circle cx="12" cy="12" r="10" />
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-leaflet-icon',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

function MapUpdater({ selectedId }: { selectedId: string | null }) {
  const map = useMap();
  useEffect(() => {
    if (selectedId) {
      const cluster = MOCK_CLUSTERS.find(c => c.id === selectedId);
      if (cluster) {
        map.flyTo([cluster.lat, cluster.lng], 16, { animate: true, duration: 1.5 });
      }
    }
  }, [selectedId, map]);
  return null;
}

export default function ConstituencyMap({ 
  onClusterSelect 
}: { 
  onClusterSelect: (id: string) => void 
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplain, setLoadingExplain] = useState(false);

  const handleMarkerClick = (id: string) => {
    setSelectedId(id);
    setExplanation(null); // Reset on new click
    onClusterSelect(id);
  };

  const getExplanation = async (cluster: any) => {
    setLoadingExplain(true);
    try {
      const q = `Why was the cluster '${cluster.title}' ${cluster.selected ? 'selected' : 'rejected'} for the budget?`;
      const res = await assistantService.query(q);
      setExplanation(res.answer);
    } catch (e) {
      setExplanation("Unable to generate AI explanation at this time.");
    } finally {
      setLoadingExplain(false);
    }
  };

  return (
    <div className="w-full h-full z-0 relative">
      <MapContainer 
        center={[28.6139, 77.2090]} 
        zoom={13} 
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {MOCK_CLUSTERS.map(cluster => (
          <Marker 
            key={cluster.id}
            position={[cluster.lat, cluster.lng]}
            icon={createCustomIcon(cluster.priority, cluster.category)}
            eventHandlers={{
              click: () => handleMarkerClick(cluster.id),
            }}
          >
            <Popup className="neo-popup">
              <div className="flex flex-col gap-2 p-1 min-w-[200px]">
                <div className="font-black text-lg">{cluster.title}</div>
                <div className="text-xs font-bold uppercase opacity-70 border-b-2 border-black pb-1">
                  Status: {cluster.selected ? 'Selected ' : 'Rejected '}
                </div>
                
                {explanation ? (
                  <div className="text-sm mt-2 bg-yellow-100 p-2 border-2 border-black">
                    <span className="font-bold block mb-1"> Jan-Setu AI:</span>
                    {explanation}
                  </div>
                ) : (
                  <button 
                    onClick={() => getExplanation(cluster)}
                    disabled={loadingExplain}
                    className="mt-2 text-xs font-bold bg-neo-accent text-white py-1 px-2 border-2 border-black hover:bg-black transition-colors"
                  >
                    {loadingExplain ? 'Analyzing...' : 'Why was this decision made?'}
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        <MapUpdater selectedId={selectedId} />
      </MapContainer>
    </div>
  );
}
