'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Table, { TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../../components/ui/Table';
import { Search, Calendar, MapPin, Clock, Eye, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { getMyAttendance } from '../../../services/attendanceService';
import { formatDate, formatTime } from '../../../lib/utils';
import toast from 'react-hot-toast';

export default function MyAttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    filterAttendance();
  }, [attendance, searchQuery, dateFilter]);

  const fetchAttendance = async () => {
    try {
      setIsLoading(true);
      const data = await getMyAttendance();
      setAttendance(data);
      setFilteredAttendance(data);
    } catch (error) {
      toast.error('Failed to fetch attendance records');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAttendance = () => {
    let filtered = [...attendance];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record =>
        record.date.toLowerCase().includes(query) ||
        record.status.toLowerCase().includes(query)
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(record => record.date === dateFilter);
    }

    setFilteredAttendance(filtered);
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const getStatusBadge = (status) => {
    const variants = {
      PRESENT: 'success',
      ABSENT: 'danger',
      LATE: 'warning',
      'HALF_DAY': 'info',
      ON_LEAVE: 'default',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return '-';
    const start = new Date(`2000-01-01T${checkIn.time}`);
    const end = new Date(`2000-01-01T${checkOut.time}`);
    const diff = (end - start) / (1000 * 60 * 60);
    return `${diff.toFixed(1)} hrs`;
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const changeMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  // Calculate monthly stats
  const monthlyStats = {
    present: attendance.filter(a => a.status === 'PRESENT' && new Date(a.date).getMonth() === currentMonth.getMonth()).length,
    absent: attendance.filter(a => a.status === 'ABSENT' && new Date(a.date).getMonth() === currentMonth.getMonth()).length,
    late: attendance.filter(a => a.status === 'LATE' && new Date(a.date).getMonth() === currentMonth.getMonth()).length,
    halfDay: attendance.filter(a => a.status === 'HALF_DAY' && new Date(a.date).getMonth() === currentMonth.getMonth()).length,
  };

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-gray-500">View your attendance history and records</p>
        </div>
        <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
          Download Report
        </Button>
      </div>

      {/* Monthly Stats */}
      <Card className="mb-6">
        <CardBody className="p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>
            <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">{monthlyStats.present}</p>
              <p className="text-sm text-green-700">Present</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-red-600">{monthlyStats.absent}</p>
              <p className="text-sm text-red-700">Absent</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-600">{monthlyStats.late}</p>
              <p className="text-sm text-yellow-700">Late</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">{monthlyStats.halfDay}</p>
              <p className="text-sm text-blue-700">Half Day</p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 p-4">
          <div className="flex-1">
            <Input
              placeholder="Search by date or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
              fullWidth
            />
          </div>
          <div>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-40"
            />
          </div>
        </div>
      </Card>

      {/* Attendance Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Date</TableHeader>
                <TableHeader>Check In</TableHeader>
                <TableHeader>Check Out</TableHeader>
                <TableHeader>Work Hours</TableHeader>
                <TableHeader>Status</TableHeader>
                <TableHeader>Location</TableHeader>
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
              ) : filteredAttendance.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No attendance records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAttendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {formatDate(record.date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {record.checkIn ? (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-green-500" />
                          <span className="text-green-600 font-medium">
                            {formatTime(record.checkIn.time)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.checkOut ? (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <span className="text-blue-600 font-medium">
                            {formatTime(record.checkOut.time)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Not checked out</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {calculateWorkHours(record.checkIn, record.checkOut)}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      {record.checkIn?.location ? (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {record.checkIn.location.name}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleViewRecord(record)}
                        className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* View Record Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Attendance Details"
        size="md"
      >
        {selectedRecord && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{formatDate(selectedRecord.date)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div className="mt-1">{getStatusBadge(selectedRecord.status)}</div>
              </div>
            </div>

            {selectedRecord.checkIn && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Check In</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">Time:</span> {formatTime(selectedRecord.checkIn.time)}</p>
                  <p><span className="text-gray-600">Location:</span> {selectedRecord.checkIn.location?.name}</p>
                  <p><span className="text-gray-600">Device:</span> {selectedRecord.checkIn.deviceInfo?.deviceName}</p>
                </div>
              </div>
            )}

            {selectedRecord.checkOut && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Check Out</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">Time:</span> {formatTime(selectedRecord.checkOut.time)}</p>
                  <p><span className="text-gray-600">Location:</span> {selectedRecord.checkOut.location?.name}</p>
                </div>
              </div>
            )}

            {selectedRecord.checkIn?.photoUrl && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Check-in Photo</p>
                <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2 flex items-center justify-center">
                      <span className="text-2xl">👤</span>
                    </div>
                    <p className="text-sm">Photo Preview</p>
                  </div>
                </div>
              </div>
            )}

            {selectedRecord.notes && (
              <div>
                <p className="text-sm text-gray-500">Notes</p>
                <p className="text-sm text-gray-700 mt-1">{selectedRecord.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
