'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { GoogleMap, useLoadScript, Polygon, Marker } from '@react-google-maps/api';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Table, { TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../../components/ui/Table';
import { Search, Plus, Edit2, Trash2, Eye, MapPin, Navigation, CheckCircle, X } from 'lucide-react';
import { getLocations, createLocation, updateLocation, deleteLocation, validateGeofence } from '../../../services/locationService';
import { DEPARTMENTS } from '../../../lib/constants';
import { isPointInPolygon } from '../../../lib/utils';
import toast from 'react-hot-toast';

// Default center (AAI HQ - New Delhi)
const DEFAULT_CENTER = { lat: 28.5562, lng: 77.1 };

const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true,
};

export default function LocationsPage() {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['drawing', 'geometry'],
  });

  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [map, setMap] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

  const [formData, setFormData] = useState({
    name: '',
    airportCode: '',
    address: '',
    latitude: '',
    longitude: '',
    radius: 100,
    allowedDepartments: [],
    isActive: true,
    geofence: [],
  });

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    filterLocations();
  }, [locations, searchQuery]);

  const fetchLocations = async () => {
    try {
      setIsLoading(true);
      const data = await getLocations();
      setLocations(data);
      setFilteredLocations(data);
    } catch (error) {
      toast.error('Failed to fetch locations');
    } finally {
      setIsLoading(false);
    }
  };

  const filterLocations = () => {
    let filtered = [...locations];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        loc =>
          loc.name.toLowerCase().includes(query) ||
          loc.address.toLowerCase().includes(query) ||
          loc.airportCode.toLowerCase().includes(query)
      );
    }

    setFilteredLocations(filtered);
  };

  const handleAddLocation = () => {
    setSelectedLocation(null);
    setFormData({
      name: '',
      airportCode: '',
      address: '',
      latitude: '',
      longitude: '',
      radius: 100,
      allowedDepartments: [],
      isActive: true,
      geofence: [],
    });
    setPolygonPoints([]);
    setViewMode(false);
    setIsModalOpen(true);
  };

  const handleEditLocation = (location) => {
    setSelectedLocation(location);
    setFormData({
      name: location.name,
      airportCode: location.airportCode,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude,
      radius: location.radius,
      allowedDepartments: location.allowedDepartments || [],
      isActive: location.isActive,
      geofence: location.geofence || [],
    });
    setPolygonPoints(location.geofence || []);
    setViewMode(false);
    setIsModalOpen(true);
  };

  const handleViewLocation = (location) => {
    setSelectedLocation(location);
    setFormData(location);
    setPolygonPoints(location.geofence || []);
    setViewMode(true);
    setIsModalOpen(true);
  };

  const handleDeleteLocation = async (locationId) => {
    if (!confirm('Are you sure you want to delete this location?')) return;

    try {
      await deleteLocation(locationId);
      toast.success('Location deleted successfully');
      fetchLocations();
    } catch (error) {
      toast.error('Failed to delete location');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate geofence if provided
    if (polygonPoints.length > 0) {
      const validation = validateGeofence(polygonPoints);
      if (!validation.valid) {
        toast.error(validation.error);
        return;
      }
    }

    const locationData = {
      ...formData,
      geofence: polygonPoints.length >= 3 ? polygonPoints : [],
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      radius: parseInt(formData.radius),
    };

    try {
      if (selectedLocation) {
        await updateLocation(selectedLocation.id, locationData);
        toast.success('Location updated successfully');
      } else {
        await createLocation(locationData);
        toast.success('Location created successfully');
      }
      setIsModalOpen(false);
      fetchLocations();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleOpenMap = () => {
    setIsMapModalOpen(true);
    setPolygonPoints(formData.geofence || []);
    setDrawingMode(false);
    
    // Set map center based on existing coordinates or default
    if (formData.latitude && formData.longitude) {
      setMapCenter({
        lat: parseFloat(formData.latitude),
        lng: parseFloat(formData.longitude),
      });
    } else {
      setMapCenter(DEFAULT_CENTER);
    }
  };

  const handleMapClick = useCallback((e) => {
    if (drawingMode && e.latLng) {
      const newPoint = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      };
      setPolygonPoints(prev => [...prev, newPoint]);
      toast.success(`Point added: ${newPoint.lat.toFixed(6)}, ${newPoint.lng.toFixed(6)}`);
    }
  }, [drawingMode]);

  const onMapLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  const toggleDrawingMode = () => {
    const newMode = !drawingMode;
    setDrawingMode(newMode);
    if (newMode) {
      toast.success('Click on the map to add polygon points');
    } else {
      toast.success('Drawing mode disabled');
    }
  };

  const clearPolygon = () => {
    setPolygonPoints([]);
    toast.success('Polygon cleared');
  };

  const savePolygon = () => {
    if (polygonPoints.length < 3) {
      toast.error('Please draw at least 3 points to form a polygon');
      return;
    }
    setFormData(prev => ({ ...prev, geofence: polygonPoints }));
    setIsMapModalOpen(false);
    toast.success('Geofence saved successfully');
  };

  const departmentOptions = DEPARTMENTS.map(d => ({ value: d.id, label: d.name }));

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Location Management</h1>
          <p className="text-gray-500">Manage workplace locations and geofences</p>
        </div>
        <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={handleAddLocation}>
          Add Location
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-4">
          <Input
            placeholder="Search by name, airport code, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-5 h-5" />}
            fullWidth
          />
        </div>
      </Card>

      {/* Locations Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Location</TableHeader>
                <TableHeader>Airport Code</TableHeader>
                <TableHeader>Coordinates</TableHeader>
                <TableHeader>Radius</TableHeader>
                <TableHeader>Geofence</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredLocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No locations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLocations.map((location) => (
                  <TableRow key={location.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{location.name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{location.address}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm font-medium">{location.airportCode}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">
                        <p>{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{location.radius}m</span>
                    </TableCell>
                    <TableCell>
                      {location.geofence && location.geofence.length >= 3 ? (
                        <Badge variant="success" dot dotColor="success">
                          {location.geofence.length} points
                        </Badge>
                      ) : (
                        <Badge variant="default">Circular</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={location.isActive ? 'success' : 'danger'}>
                        {location.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewLocation(location)}
                          className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditLocation(location)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteLocation(location.id)}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={viewMode ? 'Location Details' : selectedLocation ? 'Edit Location' : 'Add Location'}
        size="lg"
        footer={!viewMode && (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {selectedLocation ? 'Update' : 'Create'}
            </Button>
          </div>
        )}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Location Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={viewMode}
              required
            />
            <Input
              label="Airport Code"
              value={formData.airportCode}
              onChange={(e) => setFormData({ ...formData, airportCode: e.target.value.toUpperCase() })}
              disabled={viewMode}
              required
              placeholder="e.g., DEL"
            />
          </div>

          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            disabled={viewMode}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Latitude"
              type="number"
              step="any"
              value={formData.latitude}
              onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
              disabled={viewMode}
              required
            />
            <Input
              label="Longitude"
              type="number"
              step="any"
              value={formData.longitude}
              onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
              disabled={viewMode}
              required
            />
            <Input
              label="Radius (meters)"
              type="number"
              value={formData.radius}
              onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
              disabled={viewMode}
              required
            />
          </div>

          {!viewMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Geofence (Polygon)
              </label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  leftIcon={<MapPin className="w-4 h-4" />}
                  onClick={handleOpenMap}
                >
                  {polygonPoints.length >= 3 ? 'Edit Geofence' : 'Draw Geofence'}
                </Button>
                {polygonPoints.length >= 3 && (
                  <Badge variant="success">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {polygonPoints.length} points set
                  </Badge>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Draw a polygon on the map to define the exact work area boundary
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Allowed Departments
            </label>
            <div className="flex flex-wrap gap-2">
              {DEPARTMENTS.map((dept) => (
                <label
                  key={dept.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                    formData.allowedDepartments.includes(dept.id)
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.allowedDepartments.includes(dept.id)}
                    onChange={(e) => {
                      if (viewMode) return;
                      const newDepts = e.target.checked
                        ? [...formData.allowedDepartments, dept.id]
                        : formData.allowedDepartments.filter(d => d !== dept.id);
                      setFormData({ ...formData, allowedDepartments: newDepts });
                    }}
                    disabled={viewMode}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm">{dept.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              disabled={viewMode}
              className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active Location
            </label>
          </div>
        </form>
      </Modal>

      {/* Map Modal for Geofence Drawing */}
      <Modal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        title="Draw Geofence"
        size="xl"
        footer={
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                {polygonPoints.length} points
              </span>
              {polygonPoints.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearPolygon} leftIcon={<X className="w-4 h-4" />}>
                  Clear
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsMapModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={savePolygon} disabled={polygonPoints.length < 3}>
                Save Geofence
              </Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Button
              variant={drawingMode ? 'primary' : 'outline'}
              size="sm"
              onClick={toggleDrawingMode}
              leftIcon={<Navigation className="w-4 h-4" />}
            >
              {drawingMode ? 'Stop Drawing' : 'Start Drawing'}
            </Button>
            <p className="text-sm text-gray-500">
              {drawingMode ? 'Click on the map to add points' : 'Click "Start Drawing" to begin'}
            </p>
          </div>

          <div className="w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden">
            {loadError ? (
              <div className="w-full h-full flex items-center justify-center bg-red-50">
                <div className="text-center">
                  <p className="text-red-600 font-medium">Error loading Google Maps</p>
                  <p className="text-sm text-red-500 mt-1">Please check your API key</p>
                </div>
              </div>
            ) : !isLoaded ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
              </div>
            ) : (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={mapCenter}
                zoom={13}
                options={mapOptions}
                onClick={handleMapClick}
                onLoad={onMapLoad}
              >
                {/* Center marker */}
                <Marker
                  position={mapCenter}
                  icon={{
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    fillColor: '#003366',
                    fillOpacity: 1,
                    strokeColor: '#ffffff',
                    strokeWeight: 2,
                  }}
                />

                {/* Polygon */}
                {polygonPoints.length >= 3 && (
                  <Polygon
                    paths={polygonPoints}
                    options={{
                      fillColor: '#003366',
                      fillOpacity: 0.2,
                      strokeColor: '#003366',
                      strokeOpacity: 0.8,
                      strokeWeight: 2,
                    }}
                  />
                )}

                {/* Polygon point markers */}
                {polygonPoints.map((point, index) => (
                  <Marker
                    key={index}
                    position={point}
                    label={{
                      text: String(index + 1),
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: 'bold',
                    }}
                    icon={{
                      path: window.google.maps.SymbolPath.CIRCLE,
                      scale: 6,
                      fillColor: '#FF9933',
                      fillOpacity: 1,
                      strokeColor: '#ffffff',
                      strokeWeight: 2,
                    }}
                  />
                ))}
              </GoogleMap>
            )}
          </div>

          {polygonPoints.length > 0 && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Polygon Points:</p>
              <div className="max-h-32 overflow-y-auto">
                {polygonPoints.map((point, index) => (
                  <div key={index} className="text-xs text-gray-600 font-mono">
                    Point {index + 1}: {point.lat?.toFixed ? point.lat.toFixed(6) : point.lat}, 
                    {point.lng?.toFixed ? point.lng.toFixed(6) : point.lng}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  );
}
