import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  QrCode,
  Camera,
  CameraOff,
  CheckCircle,
  XCircle,
  Users,
  Search,
  RefreshCw,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { inviteApi } from '../../services/inviteApi';
import { DigitalInvite, Guest, CheckIn } from '../../types/invite.types';

interface CheckInScannerProps {
  inviteId: string;
  onBack: () => void;
}

interface CheckInRecord {
  guest: Guest;
  checkIn: CheckIn | null;
  checkedIn: boolean;
  checkedInAt?: string;
}

export const CheckInScanner: React.FC<CheckInScannerProps> = ({ inviteId, onBack }) => {
  const [invite, setInvite] = useState<DigitalInvite | null>(null);
  const [guests, setGuests] = useState<CheckInRecord[]>([]);
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannedGuestId, setScannedGuestId] = useState<string | null>(null);
  const [manualSearch, setManualSearch] = useState('');
  const [showManualCheckIn, setShowManualCheckIn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    loadData();
    return () => {
      stopCamera();
    };
  }, [inviteId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load invite details
      const inviteData = await inviteApi.getInvite(inviteId);
      setInvite(inviteData);

      // Load guests
      const guestsData = await inviteApi.listGuests(inviteId);

      // Load check-ins
      const checkInsData = await inviteApi.getCheckIns ? inviteApi.getCheckIns(inviteId) : [];
      setCheckIns(checkInsData);

      // Combine data
      const records = guestsData.map(guest => {
        const checkIn = checkInsData.find(c => c.guestId === guest.id) || null;
        return {
          guest,
          checkIn,
          checkedIn: !!checkIn,
          checkedInAt: checkIn?.checkedInAt
        };
      });

      setGuests(records);

    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      streamRef.current = stream;
      setScanning(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Start QR code scanning simulation
      // In a real implementation, you'd use a library like react-qr-reader
      simulateQRScan();

    } catch (error: any) {
      setCameraError(error.message || 'Unable to access camera');
      console.error('Camera error:', error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  };

  const simulateQRScan = () => {
    // Simulate QR code detection
    // In production, use a proper QR scanning library
    setTimeout(() => {
      if (scanning && guests.length > 0) {
        // Find first unchecked-in guest for demo
        const nextGuest = guests.find(g => !g.checkedIn);
        if (nextGuest) {
          handleQRScanned(nextGuest.guest.id);
        }
        stopCamera();
      }
    }, 3000);
  };

  const handleQRScanned = async (guestId: string) => {
    setScannedGuestId(guestId);

    try {
      await inviteApi.checkInGuest(inviteId, guestId);
      await loadData(); // Refresh data
    } catch (error) {
      console.error('Check-in failed:', error);
    }

    setTimeout(() => setScannedGuestId(null), 3000);
  };

  const handleManualCheckIn = async (guestId: string) => {
    try {
      await inviteApi.checkInGuest(inviteId, guestId);
      await loadData();
      setShowManualCheckIn(false);
    } catch (error) {
      console.error('Check-in failed:', error);
    }
  };

  const handleUndoCheckIn = async (guestId: string) => {
    // Implement undo check-in if API supports it
    console.log('Undo check-in:', guestId);
  };

  const stats = {
    total: guests.length,
    checkedIn: guests.filter(g => g.checkedIn).length,
    pending: guests.filter(g => !g.checkedIn).length,
    expectedWithPlusOnes: guests.reduce((sum, g) => sum + g.guest.plusOnes + 1, 0),
    checkedInWithPlusOnes: guests
      .filter(g => g.checkedIn)
      .reduce((sum, g) => sum + g.guest.plusOnes + 1, 0)
  };

  const filteredGuests = guests.filter(record => {
    if (!manualSearch) return true;
    const search = manualSearch.toLowerCase();
    return (
      record.guest.name.toLowerCase().includes(search) ||
      record.guest.email.toLowerCase().includes(search) ||
      record.guest.phone?.includes(search)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading check-in system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <h1 className="text-2xl font-bold text-gray-800">Check-In Scanner</h1>

          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>

        {/* Event Info */}
        {invite && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{invite.hostName}</h2>
            <p className="text-gray-600">{invite.eventType} Invitation</p>
            <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(invite.date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {invite.venue}
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
                <p className="text-sm text-gray-600">Total Guests</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.checkedIn}</p>
                <p className="text-sm text-gray-600">Checked In</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.checkedInWithPlusOnes}</p>
                <p className="text-sm text-gray-600">Total Arrived</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scanner Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* QR Scanner */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">QR Code Scanner</h3>

            {scanning ? (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full aspect-square bg-black rounded-lg object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border-4 border-white rounded-lg" />
                </div>
                <button
                  onClick={stopCamera}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500 text-white rounded-full flex items-center gap-2 hover:bg-red-600 transition-colors"
                >
                  <CameraOff className="w-5 h-5" />
                  Stop Camera
                </button>
              </div>
            ) : (
              <div className="text-center py-12">
                {cameraError ? (
                  <div className="text-red-500 mb-4">
                    <AlertCircle className="w-16 h-16 mx-auto mb-2" />
                    <p>{cameraError}</p>
                  </div>
                ) : (
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                )}
                <button
                  onClick={startCamera}
                  className="px-6 py-3 bg-purple-500 text-white rounded-full flex items-center gap-2 hover:bg-purple-600 transition-colors mx-auto"
                >
                  <Camera className="w-5 h-5" />
                  Start Camera
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  Point camera at guest QR code to check in
                </p>
              </div>
            )}

            {scannedGuestId && (
              <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-6 h-6" />
                <span className="font-medium">Guest checked in successfully!</span>
              </div>
            )}
          </div>

          {/* Manual Check-In */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Manual Check-In</h3>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search guest name, email, or phone..."
                  value={manualSearch}
                  onChange={(e) => setManualSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {filteredGuests.map(record => (
                <div
                  key={record.guest.id}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    record.checkedIn
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">{record.guest.name}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          record.guest.status === 'Accepted'
                            ? 'bg-green-100 text-green-700'
                            : record.guest.status === 'Declined'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {record.guest.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {record.guest.email}
                        </span>
                        {record.guest.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {record.guest.phone}
                          </span>
                        )}
                      </div>
                      {record.guest.plusOnes > 0 && (
                        <div className="text-xs text-purple-600 mt-1">
                          +{record.guest.plusOnes} guest{record.guest.plusOnes > 1 ? 's' : ''} expected
                        </div>
                      )}
                    </div>

                    {record.checkedIn ? (
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                          <span className="text-sm font-medium">Checked In</span>
                        </div>
                        {record.checkedInAt && (
                          <span className="text-xs text-gray-500">
                            {new Date(record.checkedInAt).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => handleManualCheckIn(record.guest.id)}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        Check In
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {filteredGuests.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No guests found matching your search
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Check-Ins */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Check-Ins</h3>

          <div className="space-y-2">
            {guests
              .filter(g => g.checkedIn)
              .sort((a, b) => {
                const dateA = a.checkedInAt ? new Date(a.checkedInAt).getTime() : 0;
                const dateB = b.checkedInAt ? new Date(b.checkedInAt).getTime() : 0;
                return dateB - dateA;
              })
              .slice(0, 5)
              .map(record => (
                <div
                  key={record.guest.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{record.guest.name}</div>
                      <div className="text-sm text-gray-600">
                        {record.guest.plusOnes > 0 && `+${record.guest.plusOnes} guests`}
                      </div>
                    </div>
                  </div>
                  {record.checkedInAt && (
                    <div className="text-sm text-gray-500">
                      {new Date(record.checkedInAt).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              ))}

            {checkIns.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No check-ins yet. Start scanning QR codes or check in guests manually.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInScanner;
