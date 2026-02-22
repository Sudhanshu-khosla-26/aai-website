'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Table, { TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../../components/ui/Table';
import { Search, Calendar, MapPin, Eye, Download, Filter, CheckCircle, XCircle, Clock } from 'lucide-react';
import { getAttendance, getAttendanceStats } from '../../../services/attendanceService';
import { getUsers } from '../../../services/userService';
import { formatDate, formatTime } from '../../../lib/utils';
import toast from 'react-hot-toast';

export default function AttendancePage() {
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    onLeave: 0,
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterAttendance();
  }, [attendance, searchQuery, dateFilter, statusFilter]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [attendanceData, employeesData, statsData] = await Promise.all([
        getAttendance(),
        getUsers(),
        getAttendanceStats(),
      ]);
      const employees = employeesData?.users || [];
      const records = attendanceData?.records || [];
      setAttendance(records);
      setFilteredAttendance(records);
      setEmployees(employees);
      setStats(statsData?.stats || { present: 0, absent: 0, late: 0, onLeave: 0 });
    } catch (error) {
      toast.error('Failed to fetch attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAttendance = () => {
    let filtered = [...attendance];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        record =>
          record.employeeName?.toLowerCase().includes(query) ||
          record.employeeId?.toLowerCase().includes(query)
      );
    }

    if (dateFilter) {
      filtered = filtered.filter(record => record.date === dateFilter);
    }

    if (statusFilter) {
      filtered = filtered.filter(record => record.status === statusFilter);
    }

    setFilteredAttendance(filtered);
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId || e.employeeId === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : employeeId;
  };

  const handleViewRecord = (record) => {
    setSelectedRecord({
      ...record,
      employeeName: getEmployeeName(record.employeeId),
    });
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

  const today = new Date().toISOString().split('T')[0];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-500">Track and manage employee attendance records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
            Export
          </Button>
          <Button variant="primary" leftIcon={<Calendar className="w-4 h-4" />}>
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Present</p>
                <p className="text-xl font-bold text-gray-900">{stats.present}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Absent</p>
                <p className="text-xl font-bold text-gray-900">{stats.absent}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Late</p>
                <p className="text-xl font-bold text-gray-900">{stats.late}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">On Leave</p>
                <p className="text-xl font-bold text-gray-900">{stats.onLeave}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col md:flex-row gap-4 p-4">
          <div className="flex-1">
            <Input
              placeholder="Search by employee name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-5 h-5" />}
              fullWidth
            />
          </div>
          <div className="flex gap-2">
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-40"
            />
            <Select
              placeholder="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Status' },
                { value: 'PRESENT', label: 'Present' },
                { value: 'ABSENT', label: 'Absent' },
                { value: 'LATE', label: 'Late' },
                { value: 'HALF_DAY', label: 'Half Day' },
                { value: 'ON_LEAVE', label: 'On Leave' },
              ]}
              className="w-36"
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
                <TableHeader>Employee</TableHeader>
                <TableHeader>Date</TableHeader>
                <TableHeader>Check In</TableHeader>
                <TableHeader>Check Out</TableHeader>
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
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-700 font-semibold text-xs">
                            {getEmployeeName(record.employeeId)?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {getEmployeeName(record.employeeId)}
                          </p>
                          <p className="text-xs text-gray-500">{record.employeeId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{formatDate(record.date)}</TableCell>
                    <TableCell>
                      {record.checkIn ? (
                        <span className="text-green-600 font-medium">
                          {formatTime(record.checkIn.time)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {record.checkOut ? (
                        <span className="text-blue-600 font-medium">
                          {formatTime(record.checkOut.time)}
                        </span>
                      ) : (
                        <span className="text-gray-400">Not checked out</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      {record.checkIn?.location ? (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate max-w-[150px]">{record.checkIn.location.name}</span>
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
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-bold text-xl">
                  {selectedRecord.employeeName?.[0]}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedRecord.employeeName}</h3>
                <p className="text-gray-500">{selectedRecord.employeeId}</p>
              </div>
            </div>

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
