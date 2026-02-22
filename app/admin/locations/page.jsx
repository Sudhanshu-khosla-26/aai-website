'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  GoogleMap,
  useLoadScript,
  Polygon,
  Circle,
  Marker,
  DrawingManager,
} from '@react-google-maps/api';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import {
  Search, Plus, Edit2, Trash2, Eye, MapPin, Navigation,
  CheckCircle, X, Loader2, Building2, Radio, Globe,
  Pencil, Trash, RotateCcw, Save, Map,
} from 'lucide-react';
import { DEPARTMENTS } from '../../../lib/constants';
import toast from 'react-hot-toast';

// ─── Google Maps config ───────────────────────────────────────────────────────
const LIBRARIES = ['drawing', 'geometry'];
const DEFAULT_CENTER = { lat: 28.5562, lng: 77.1000 }; // AAI HQ – New Delhi
const MAP_CONTAINER = { width: '100%', height: '100%' };
const MAP_OPTIONS = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
  mapTypeId: 'roadmap',
};

// ─── API helpers ──────────────────────────────────────────────────────────────
async function apiFetch(path, opts = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('aai_token') : null;
  const res = await fetch(path, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });
  return res.json();
}

// ─── Haversine distance ───────────────────────────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ active }) => (
  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${active ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
    }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-red-400'}`} />
    {active ? 'Active' : 'Inactive'}
  </span>
);

// ─── Empty state ──────────────────────────────────────────────────────────────
const EmptyState = ({ search, onAdd }) => (
  <div className="text-center py-16">
    <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
      <MapPin className="w-10 h-10 text-blue-300" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900">
      {search ? 'No locations found' : 'No locations yet'}
    </h3>
    <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto">
      {search
        ? `Nothing matched "${search}". Try a different name or code.`
        : 'Add your first workplace location to get started.'}
    </p>
    {!search && (
      <button
        onClick={onAdd}
        className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
      >
        <Plus className="w-4 h-4" /> Add First Location
      </button>
    )}
  </div>
);

// ─── Page-level modal overlay ─────────────────────────────────────────────────
const EMPTY_FORM = {
  name: '', code: '', address: '',
  latitude: '', longitude: '',
  radius: 200,
  allowedDepartments: [],
  isActive: true,
  timezone: 'Asia/Kolkata',
  geofence: [],
};

export default function LocationsPage() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: LIBRARIES,
  });

  // ── List state ──────────────────────────────────────────────────────────────
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listSearch, setListSearch] = useState('');
  const [listStatus, setListStatus] = useState('');
  const [filtered, setFiltered] = useState([]);

  // ── Modal / form state ──────────────────────────────────────────────────────
  const [modal, setModal] = useState(null);   // null | 'add' | 'edit' | 'view'
  const [selectedLoc, setSelectedLoc] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // ── Google map state (inside modal) ─────────────────────────────────────────
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [drawingType, setDrawingType] = useState(null);  // 'polygon' | 'circle' | null
  const [polygonPaths, setPolygonPaths] = useState([]);  // [{lat,lng},…]
  const [drawnCircleRadius, setDrawnCircleRadius] = useState(null);
  const mapRef = useRef(null);
  const drawingManagerRef = useRef(null);
  const [geoQuery, setGeoQuery] = useState('');
  const [geoSearching, setGeoSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggLoading, setSuggLoading] = useState(false);
  const [showSugg, setShowSugg] = useState(false);
  const debounceRef = useRef(null);
  const searchWrapRef = useRef(null);

  // ── Map geofence view modal ─────────────────────────────────────────────────
  const [geoModal, setGeoModal] = useState(null); // location or null

  // ── Filter ───────────────────────────────────────────────────────────────────
  useEffect(() => { loadLocations(); }, []);
  useEffect(() => {
    const q = listSearch.toLowerCase();
    let d = [...locations];
    if (q) d = d.filter(l =>
      l.name?.toLowerCase().includes(q) ||
      l.address?.toLowerCase().includes(q) ||
      (l.code || l.airportCode || '').toLowerCase().includes(q)
    );
    if (listStatus !== '') d = d.filter(l => l.isActive === (listStatus === 'active'));
    setFiltered(d);
  }, [locations, listSearch, listStatus]);

  // ── Load ─────────────────────────────────────────────────────────────────────
  const loadLocations = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/locations');
      setLocations(data.locations || []);
    } catch { toast.error('Failed to load locations'); }
    finally { setLoading(false); }
  };

  // ── Open helpers ──────────────────────────────────────────────────────────────
  const openAdd = () => {
    setSelectedLoc(null);
    setForm(EMPTY_FORM);
    setPolygonPaths([]);
    setDrawnCircleRadius(null);
    setDrawingType(null);
    setMapCenter(DEFAULT_CENTER);
    setGeoQuery('');
    setSuggestions([]);
    setModal('add');
  };

  const openEdit = (loc) => {
    setSelectedLoc(loc);
    const geo = loc.geofence || [];
    setForm({
      name: loc.name || '',
      code: loc.code || loc.airportCode || '',
      address: loc.address || '',
      latitude: loc.latitude ?? '',
      longitude: loc.longitude ?? '',
      radius: loc.radius || 200,
      allowedDepartments: loc.allowedDepartments || [],
      isActive: loc.isActive !== false,
      timezone: loc.timezone || 'Asia/Kolkata',
      geofence: geo,
    });
    setPolygonPaths(geo);
    setDrawnCircleRadius(null);
    setDrawingType(null);
    const ctr = loc.latitude && loc.longitude
      ? { lat: parseFloat(loc.latitude), lng: parseFloat(loc.longitude) }
      : DEFAULT_CENTER;
    setMapCenter(ctr);
    setModal('edit');
  };

  const openView = (loc) => {
    setSelectedLoc(loc);
    setPolygonPaths(loc.geofence || []);
    const ctr = loc.latitude && loc.longitude
      ? { lat: parseFloat(loc.latitude), lng: parseFloat(loc.longitude) }
      : DEFAULT_CENTER;
    setMapCenter(ctr);
    setModal('view');
  };

  const closeModal = () => {
    setModal(null);
    setSelectedLoc(null);
    setDrawingType(null);
    setPolygonPaths([]);
    setDrawnCircleRadius(null);
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!confirm('Delete this location? This cannot be undone.')) return;
    const res = await apiFetch(`/api/locations/${id}`, { method: 'DELETE' });
    if (res.success) { toast.success('Deleted'); loadLocations(); }
    else toast.error(res.message || 'Delete failed');
  };

  // ── Save ──────────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    if (!form.code.trim()) return toast.error('Code is required');
    if (!form.latitude || !form.longitude)
      return toast.error('Use the map or place search to set coordinates.');

    setSaving(true);
    const payload = {
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
      airportCode: form.code.trim().toUpperCase(),
      address: form.address.trim(),
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      radius: parseInt(form.radius) || 200,
      allowedDepartments: form.allowedDepartments,
      isActive: form.isActive,
      timezone: form.timezone,
      geofence: polygonPaths.length >= 3 ? polygonPaths : [],
    };

    try {
      const res = selectedLoc
        ? await apiFetch(`/api/locations/${selectedLoc._id || selectedLoc.id}`, {
          method: 'PUT', body: JSON.stringify(payload),
        })
        : await apiFetch('/api/locations', {
          method: 'POST', body: JSON.stringify(payload),
        });

      if (res.success) {
        toast.success(selectedLoc ? 'Location updated!' : 'Location created!');
        closeModal();
        loadLocations();
      } else {
        toast.error(res.message || 'Failed');
      }
    } catch { toast.error('Network error'); }
    finally { setSaving(false); }
  };

  // ── Nominatim autocomplete (live suggestions as you type) ───────────────────
  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < 2) { setSuggestions([]); setShowSugg(false); return; }
    setSuggLoading(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=8&countrycodes=in`;
      const res = await fetch(url, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'AAIAttendancePortal/1.0 (aai.attendance.portal@aai.aero)',
        },
      });
      const data = await res.json();
      setSuggestions(data);
      setShowSugg(data.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setSuggLoading(false);
    }
  }, []);

  const onGeoQueryChange = (e) => {
    const val = e.target.value;
    setGeoQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 350);
    if (!val) { setSuggestions([]); setShowSugg(false); }
  };

  const selectSuggestion = (item) => {
    const lat = parseFloat(item.lat);
    const lng = parseFloat(item.lon);
    const displayName = item.display_name || '';
    const shortName = item.name || displayName.split(',')[0];
    setGeoQuery(shortName);
    setSuggestions([]);
    setShowSugg(false);
    setForm(prev => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
      address: displayName,
      name: prev.name || shortName,
    }));
    setMapCenter({ lat, lng });
    toast.success(`📍 ${shortName} — ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
  };

  // Dismiss suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setShowSugg(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fallback: Geocoder-based search (for Enter key)
  const handleGeoSearch = async () => {
    if (!geoQuery.trim()) return;
    // If suggestions visible, just pick the first one
    if (suggestions.length > 0) { selectSuggestion(suggestions[0]); return; }
    if (!window.google) return;
    setGeoSearching(true);
    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: geoQuery }, (results, status) => {
        setGeoSearching(false);
        if (status === 'OK' && results[0]) {
          const result = results[0];
          const lat = result.geometry.location.lat();
          const lng = result.geometry.location.lng();
          const name = result.address_components[0]?.long_name || '';
          setForm(prev => ({
            ...prev,
            latitude: lat.toFixed(6),
            longitude: lng.toFixed(6),
            address: result.formatted_address,
            name: prev.name || name,
          }));
          setMapCenter({ lat, lng });
          toast.success(`📍 ${name || geoQuery} — ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        } else {
          toast.error('Location not found. Try a different name.');
        }
      });
    } catch {
      setGeoSearching(false);
      toast.error('Search error');
    }
  };

  // ── Map click: place the center marker ───────────────────────────────────────
  const onMapClick = useCallback((e) => {
    if (drawingType) return; // let DrawingManager handle clicks
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    setForm(prev => ({
      ...prev,
      latitude: lat.toFixed(6),
      longitude: lng.toFixed(6),
    }));
  }, [drawingType]);

  // ── DrawingManager events ─────────────────────────────────────────────────────
  const onPolygonComplete = useCallback((polygon) => {
    const paths = polygon.getPath().getArray().map(p => ({
      lat: p.lat(), lng: p.lng(),
    }));
    setPolygonPaths(paths);
    setForm(prev => ({ ...prev, geofence: paths }));
    polygon.setMap(null); // remove drawn shape – we'll render our own
    setDrawingType(null);
    toast.success(`✅ Polygon saved — ${paths.length} points`);
  }, []);

  const onCircleComplete = useCallback((circle) => {
    const radius = Math.round(circle.getRadius());
    const center = circle.getCenter();
    setForm(prev => ({
      ...prev,
      radius,
      latitude: center.lat().toFixed(6),
      longitude: center.lng().toFixed(6),
    }));
    setDrawnCircleRadius(radius);
    circle.setMap(null);
    setDrawingType(null);
    toast.success(`✅ Radius set to ${radius}m`);
  }, []);

  const clearGeofence = () => {
    setPolygonPaths([]);
    setForm(prev => ({ ...prev, geofence: [] }));
    toast.success('Geofence cleared');
  };

  const setField = (key) => (e) =>
    setForm(prev => ({ ...prev, [key]: e.target.value }));

  const toggleDept = (id) =>
    setForm(prev => ({
      ...prev,
      allowedDepartments: prev.allowedDepartments.includes(id)
        ? prev.allowedDepartments.filter(d => d !== id)
        : [...prev.allowedDepartments, id],
    }));

  const markerPos = form.latitude && form.longitude
    ? { lat: parseFloat(form.latitude), lng: parseFloat(form.longitude) }
    : null;

  const isViewMode = modal === 'view';

  // ── Drawing manager options ───────────────────────────────────────────────────
  const drawingManagerOptions = {
    drawingControl: false,
    polygonOptions: {
      fillColor: '#1C4CA6',
      fillOpacity: 0.2,
      strokeColor: '#1C4CA6',
      strokeOpacity: 0.9,
      strokeWeight: 2,
      editable: true,
    },
    circleOptions: {
      fillColor: '#1C4CA6',
      fillOpacity: 0.15,
      strokeColor: '#1C4CA6',
      strokeOpacity: 0.9,
      strokeWeight: 2,
      editable: true,
    },
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>

      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-7 h-7 text-blue-600" />
            Location Management
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {locations.length} workplace location{locations.length !== 1 ? 's' : ''} · Google Maps powered geofencing
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-sm shadow-blue-200"
        >
          <Plus className="w-4 h-4" /> Add Location
        </button>
      </div>

      {/* ── Search / filter bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={listSearch}
            onChange={e => setListSearch(e.target.value)}
            placeholder="Search by name, code, address…"
            className="w-full pl-10 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
          />
          {listSearch && (
            <button onClick={() => setListSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={listStatus}
          onChange={e => setListStatus(e.target.value)}
          className="px-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm min-w-[150px]"
        >
          <option value="">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* active filter chips */}
      {(listSearch || listStatus) && (
        <div className="flex items-center gap-2 mb-4 flex-wrap text-sm">
          <span className="text-gray-400">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
          {listSearch && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
              "{listSearch}"
              <button onClick={() => setListSearch('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          {listStatus && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium capitalize">
              {listStatus}
              <button onClick={() => setListStatus('')}><X className="w-3 h-3" /></button>
            </span>
          )}
          <button onClick={() => { setListSearch(''); setListStatus(''); }}
            className="text-xs text-red-500 hover:text-red-700 underline">Clear all</button>
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState search={listSearch} onAdd={openAdd} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70">
                  {['Location', 'Code', 'Coordinates', 'Radius', 'Geofence', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(loc => {
                  const code = loc.code || loc.airportCode || '—';
                  return (
                    <tr key={loc._id || loc.id} className="hover:bg-blue-50/30 transition-colors group">

                      {/* Location */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                            <MapPin className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 leading-tight">{loc.name}</p>
                            <p className="text-xs text-gray-400 truncate max-w-[200px] mt-0.5">{loc.address}</p>
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="px-5 py-4">
                        <span className="font-mono text-sm font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md">{code}</span>
                      </td>

                      {/* Coordinates */}
                      <td className="px-5 py-4">
                        <div className="text-xs font-mono text-gray-600 space-y-0.5">
                          <div><span className="text-gray-400">Lat </span>{loc.latitude?.toFixed ? loc.latitude.toFixed(4) : loc.latitude}</div>
                          <div><span className="text-gray-400">Lon </span>{loc.longitude?.toFixed ? loc.longitude.toFixed(4) : loc.longitude}</div>
                        </div>
                      </td>

                      {/* Radius */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 text-sm font-semibold text-gray-700">
                          <Radio className="w-3.5 h-3.5 text-orange-500" />{loc.radius}m
                        </div>
                      </td>

                      {/* Geofence */}
                      <td className="px-5 py-4">
                        {loc.geofence?.length >= 3 ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                            <CheckCircle className="w-3 h-3" /> {loc.geofence.length} pts
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">Circular</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4"><StatusBadge active={loc.isActive} /></td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openView(loc)} title="View on map"
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => openEdit(loc)} title="Edit"
                            className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(loc._id || loc.id)} title="Delete"
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <a
                            href={`https://maps.google.com/?q=${loc.latitude},${loc.longitude}`}
                            target="_blank" rel="noreferrer" title="Open in Google Maps"
                            className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                            <Navigation className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          ADD / EDIT / VIEW MODAL
      ══════════════════════════════════════════════════════════════ */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4">
          {/* backdrop */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />

          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-6 flex flex-col max-h-[95vh]">

            {/* ── Modal header ── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                  {isViewMode ? <Map className="w-5 h-5 text-blue-600" /> : <MapPin className="w-5 h-5 text-blue-600" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {isViewMode ? 'View Location' : modal === 'edit' ? 'Edit Location' : 'Add New Location'}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {isViewMode ? selectedLoc?.name : 'Google Maps · Places search · Geofence drawing'}
                  </p>
                </div>
              </div>
              <button onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ── Modal body — 2-col grid ── */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-full">

                {/* ── LEFT: Form ─────────────────────────────────────────── */}
                <div className="p-6 space-y-4 border-r border-gray-100 overflow-y-auto">

                  {/* Autocomplete search box */}
                  {!isViewMode && (
                    <div ref={searchWrapRef} className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                        <Globe className="inline w-4 h-4 mr-1 text-blue-500" />
                        Search Place
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={geoQuery}
                            onChange={onGeoQueryChange}
                            onKeyDown={e => {
                              if (e.key === 'Enter') { e.preventDefault(); handleGeoSearch(); }
                              if (e.key === 'Escape') setShowSugg(false);
                              if (e.key === 'ArrowDown' && suggestions.length > 0) {
                                e.preventDefault();
                                document.querySelector('.sugg-item')?.focus();
                              }
                            }}
                            onFocus={() => suggestions.length > 0 && setShowSugg(true)}
                            placeholder="Type airport, city, or landmark…"
                            autoComplete="off"
                            className="w-full px-4 py-2.5 text-sm border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-blue-50/40 placeholder-gray-400"
                          />
                          {/* Live suggestions dropdown */}
                          {showSugg && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-64 overflow-y-auto">
                              {suggLoading ? (
                                <div className="flex items-center gap-2 px-4 py-3 text-sm text-gray-400">
                                  <Loader2 className="w-4 h-4 animate-spin" /> Searching…
                                </div>
                              ) : suggestions.map((item, idx) => {
                                const typeIcon = item.type === 'aeroway' || item.class === 'aeroway' ? '✈️'
                                  : item.type === 'city' || item.type === 'administrative' ? '🏙️'
                                    : item.type === 'railway' ? '🚉'
                                      : item.type === 'hotel' || item.type === 'hostel' ? '🏨'
                                        : item.type === 'hospital' ? '🏥'
                                          : '📍';
                                const short = item.display_name.split(',').slice(0, 3).join(',');
                                return (
                                  <button
                                    key={idx}
                                    className="sugg-item w-full text-left px-4 py-2.5 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-50 last:border-0 transition-colors"
                                    onMouseDown={() => selectSuggestion(item)}
                                  >
                                    <div className="flex items-start gap-2">
                                      <span className="text-base shrink-0 mt-0.5">{typeIcon}</span>
                                      <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{item.name || short.split(',')[0]}</p>
                                        <p className="text-xs text-gray-400 truncate">{short}</p>
                                        <p className="text-xs font-mono text-blue-500 mt-0.5">{parseFloat(item.lat).toFixed(4)}, {parseFloat(item.lon).toFixed(4)}</p>
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={handleGeoSearch}
                          disabled={geoSearching || suggLoading}
                          title="Search"
                          className="px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0"
                        >
                          {geoSearching
                            ? <Loader2 className="w-4 h-4 animate-spin" />
                            : <Search className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Suggestions appear as you type · Click to auto-fill map & coords
                      </p>
                    </div>
                  )}

                  {/* Name & Code */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location Name <span className="text-red-400">*</span>
                      </label>
                      <input type="text" value={form.name} onChange={setField('name')}
                        disabled={isViewMode} placeholder="e.g. IGI Airport"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Code <span className="text-red-400">*</span>
                      </label>
                      <input type="text" value={form.code}
                        onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                        disabled={isViewMode} placeholder="DEL" maxLength={10}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 font-mono uppercase" />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <textarea value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                      disabled={isViewMode} rows={2} placeholder="Auto-filled from place search"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 resize-none" />
                  </div>

                  {/* Lat / Lon — 2-col, no radius input */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude <span className="text-red-400">*</span>
                      </label>
                      <input type="number" step="any" value={form.latitude} onChange={setField('latitude')}
                        disabled={isViewMode} placeholder="28.5562"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 font-mono" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude <span className="text-red-400">*</span>
                      </label>
                      <input type="number" step="any" value={form.longitude} onChange={setField('longitude')}
                        disabled={isViewMode} placeholder="77.1000"
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 font-mono" />
                    </div>
                  </div>

                  {/* Geofence info */}
                  <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-blue-800 flex items-center gap-1.5">
                        <Radio className="w-4 h-4" />
                        Geofence Area
                      </p>
                      {polygonPaths.length >= 3 && (
                        <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          ✓ Polygon: {polygonPaths.length} pts
                        </span>
                      )}
                      {!isViewMode && polygonPaths.length < 3 && form.latitude && (
                        <span className="text-xs text-orange-600 font-semibold bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-full">
                          ○ Default circle
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-blue-600">
                      {isViewMode
                        ? polygonPaths.length >= 3
                          ? `Custom polygon with ${polygonPaths.length} boundary points`
                          : 'Circular boundary around the centre pin'
                        : 'Use Draw Polygon or Draw Circle on the map → to define the attendance boundary. Click marker to set centre.'}
                    </p>
                  </div>

                  {/* Timezone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                    <select value={form.timezone} onChange={setField('timezone')} disabled={isViewMode}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50">
                      <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
                      <option value="Asia/Dubai">Asia/Dubai (GST +4:00)</option>
                      <option value="UTC">UTC +0:00</option>
                      <option value="Asia/Singapore">Asia/Singapore (+8:00)</option>
                    </select>
                  </div>

                  {/* Departments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allowed Departments
                      <span className="ml-1 text-xs text-gray-400 font-normal">(empty = all)</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {(DEPARTMENTS || []).map(dept => {
                        const id = dept.id || dept;
                        const name = dept.name || dept;
                        const checked = form.allowedDepartments.includes(id);
                        return (
                          <label key={id}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs cursor-pointer select-none transition-all ${isViewMode ? 'cursor-default' : ''
                              } ${checked
                                ? 'bg-blue-50 border-blue-400 text-blue-700 font-semibold'
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                            <input type="checkbox" checked={checked}
                              onChange={() => !isViewMode && toggleDept(id)}
                              disabled={isViewMode}
                              className="w-3 h-3 rounded accent-blue-600" />
                            {name}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active toggle */}
                  <label className="flex items-center gap-3 cursor-pointer w-fit group">
                    <div className="relative">
                      <input type="checkbox" className="sr-only" checked={form.isActive}
                        onChange={e => !isViewMode && setForm(p => ({ ...p, isActive: e.target.checked }))}
                        disabled={isViewMode} />
                      <div className={`w-11 h-6 rounded-full transition-colors ${form.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isActive ? 'translate-x-6 left-0' : 'translate-x-1 left-0'}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Active Location</span>
                  </label>
                </div>

                {/* ── RIGHT: Google Map ──────────────────────────────────── */}
                <div className="flex flex-col">
                  {/* Drawing toolbar — only in add/edit mode */}
                  {!isViewMode && (
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/60 flex-wrap">
                      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">Draw:</span>

                      <button
                        onClick={() => setDrawingType(drawingType === 'polygon' ? null : 'polygon')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${drawingType === 'polygon'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                          }`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        {drawingType === 'polygon' ? 'Stop Drawing' : 'Draw Polygon'}
                      </button>

                      <button
                        onClick={() => setDrawingType(drawingType === 'circle' ? null : 'circle')}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${drawingType === 'circle'
                          ? 'bg-orange-500 text-white'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-orange-50 hover:text-orange-600'
                          }`}
                      >
                        <Radio className="w-3.5 h-3.5" />
                        {drawingType === 'circle' ? 'Stop Drawing' : 'Draw Circle'}
                      </button>

                      {polygonPaths.length >= 3 && (
                        <button onClick={clearGeofence}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors">
                          <Trash className="w-3.5 h-3.5" /> Clear Polygon
                        </button>
                      )}

                      {drawingType && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-lg animate-pulse">
                          {drawingType === 'polygon' ? '🖱 Click to add polygon points' : '🖱 Click & drag to draw circle'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Map */}
                  <div className="flex-1 min-h-[400px]">
                    {loadError ? (
                      <div className="w-full h-full flex items-center justify-center bg-red-50">
                        <div className="text-center p-6">
                          <p className="text-red-600 font-semibold">Failed to load Google Maps</p>
                          <p className="text-sm text-red-400 mt-1">Check your API key in .env.local</p>
                        </div>
                      </div>
                    ) : !isLoaded ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto" />
                          <p className="text-sm text-gray-500 mt-2">Loading Google Maps…</p>
                        </div>
                      </div>
                    ) : (
                      <GoogleMap
                        mapContainerStyle={MAP_CONTAINER}
                        center={mapCenter}
                        zoom={markerPos ? 15 : 12}
                        options={MAP_OPTIONS}
                        onClick={onMapClick}
                        onLoad={m => (mapRef.current = m)}
                      >
                        {/* DrawingManager */}
                        {!isViewMode && (
                          <DrawingManager
                            onLoad={dm => (drawingManagerRef.current = dm)}
                            drawingMode={
                              drawingType === 'polygon'
                                ? window.google?.maps?.drawing?.OverlayType?.POLYGON
                                : drawingType === 'circle'
                                  ? window.google?.maps?.drawing?.OverlayType?.CIRCLE
                                  : null
                            }
                            onPolygonComplete={onPolygonComplete}
                            onCircleComplete={onCircleComplete}
                            options={drawingManagerOptions}
                          />
                        )}

                        {/* Center marker */}
                        {markerPos && (
                          <Marker
                            position={markerPos}
                            title={form.name || 'Location'}
                            icon={isLoaded && window.google ? {
                              path: window.google.maps.SymbolPath.CIRCLE,
                              scale: 10,
                              fillColor: '#1C4CA6',
                              fillOpacity: 1,
                              strokeColor: '#ffffff',
                              strokeWeight: 2.5,
                            } : undefined}
                          />
                        )}

                        {/* Radius circle */}
                        {markerPos && form.radius && (
                          <Circle
                            center={markerPos}
                            radius={parseFloat(form.radius)}
                            options={{
                              fillColor: '#1C4CA6',
                              fillOpacity: 0.08,
                              strokeColor: '#1C4CA6',
                              strokeOpacity: 0.5,
                              strokeWeight: 1.5,
                              strokeDashArray: '4 4',
                            }}
                          />
                        )}

                        {/* Polygon geofence */}
                        {polygonPaths.length >= 3 && (
                          <Polygon
                            paths={polygonPaths}
                            options={{
                              fillColor: '#1C4CA6',
                              fillOpacity: 0.18,
                              strokeColor: '#1C4CA6',
                              strokeOpacity: 0.9,
                              strokeWeight: 2,
                            }}
                          />
                        )}

                        {/* Polygon point markers */}
                        {polygonPaths.map((pt, i) => (
                          <Marker
                            key={i}
                            position={pt}
                            label={{
                              text: String(i + 1),
                              color: '#fff',
                              fontSize: '11px',
                              fontWeight: 'bold',
                            }}
                            icon={isLoaded && window.google ? {
                              path: window.google.maps.SymbolPath.CIRCLE,
                              scale: 7,
                              fillColor: '#FF9933',
                              fillOpacity: 1,
                              strokeColor: '#fff',
                              strokeWeight: 2,
                            } : undefined}
                          />
                        ))}
                      </GoogleMap>
                    )}
                  </div>

                  {/* Map hint */}
                  <div className="px-4 py-2 bg-gray-50 text-xs text-gray-400 border-t border-gray-100 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {isViewMode
                      ? 'Blue circle = radius · Orange markers = polygon geofence'
                      : 'Click the map to move the centre pin · Use Draw tools for precise geofence'}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Modal footer ── */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl shrink-0">
              {/* geofence summary */}
              <div className="text-xs text-gray-500">
                {polygonPaths.length >= 3
                  ? <span className="text-emerald-600 font-semibold">✓ Polygon geofence: {polygonPaths.length} points</span>
                  : markerPos
                    ? <span className="text-orange-500">◯ Default circular area · Draw on map for precise boundary</span>
                    : <span className="text-amber-500">⚠ Click the map or search to set the location pin</span>}
              </div>

              <div className="flex items-center gap-2">
                <button onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  {isViewMode ? 'Close' : 'Cancel'}
                </button>
                {isViewMode ? (
                  <button onClick={() => setModal('edit')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors">
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={saving}
                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-all">
                    {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {saving ? 'Saving…' : selectedLoc ? '💾 Update Location' : '✅ Create Location'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
