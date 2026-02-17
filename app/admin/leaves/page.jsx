'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Badge from '../../../components/ui/Badge';
import Modal from '../../../components/ui/Modal';
import Table, { TableHead, TableBody, TableRow, TableHeader, TableCell } from '../../../components/ui/Table';
import { Search, CheckCircle, XCircle, Eye, Download, Calendar, Clock } from 'lucide-react';
import { getLeaves, updateLeaveStatus } from '../../../services/leaveService';
import { getUsers } from '../../../services/userService';
import { LEAVE_TYPES } from '../../../lib/constants';
import { formatDate, calculateDaysBetween } from '../../../lib/utils';
import toast from 'react-hot-toast';

export default function LeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterLeaves();
  }, [leaves, searchQuery, statusFilter, typeFilter]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [leavesData, employeesData] = await Promise.all([
        getLeaves(),
        getUsers(),
      ]);
      const employees = employeesData?.users || [];
      const leaves = leavesData?.applications || [];
      setLeaves(leaves);
      setFilteredLeaves(leaves);
      setEmployees(employees);
    } catch (error) {
      toast.error('Failed to fetch leave applications');
    } finally {
      setIsLoading(false);
    }
  };

  const filterLeaves = () => {
    let filtered = [...leaves];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        leave =>
          leave.employeeName?.toLowerCase().includes(query) ||
          leave.employeeId?.toLowerCase().includes(query)
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(leave => leave.status === statusFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter(leave => leave.leaveType === typeFilter);
    }

    setFilteredLeaves(filtered);
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId || e.employeeId === employeeId);
    return employee ? `${employee.firstName} ${employee.lastName}` : employeeId;
  };

  const handleViewLeave = (leave) => {
    setSelectedLeave({
      ...leave,
      employeeName: getEmployeeName(leave.employeeId),
    });
    setShowRejectForm(false);
    setRejectionReason('');
    setIsModalOpen(true);
  };

  const handleApprove = async () => {
    try {
      await updateLeaveStatus(selectedLeave.id, 'APPROVED');
      toast.success('Leave application approved');
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to approve leave');
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      await updateLeaveStatus(selectedLeave.id, 'REJECTED', rejectionReason);
      toast.success('Leave application rejected');
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to reject leave');
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: 'warning',
      APPROVED: 'success',
      REJECTED: 'danger',
      CANCELLED: 'default',
    };
    const icons = {
      PENDING: <Clock className="w-3 h-3 mr-1" />,
      APPROVED: <CheckCircle className="w-3 h-3 mr-1" />,
      REJECTED: <XCircle className="w-3 h-3 mr-1" />,
    };
    return (
      <Badge variant={variants[status] || 'default'}>
        <span className="flex items-center">
          {icons[status]}
          {status}
        </span>
      </Badge>
    );
  };

  const leaveTypeOptions = LEAVE_TYPES.map(type => ({
    value: type.id,
    label: type.name,
  }));

  const pendingCount = leaves.filter(l => l.status === 'PENDING').length;

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-500">Manage employee leave applications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
            Export
          </Button>
        </div>
      </div>

      {/* Pending Alert */}
      {pendingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <Clock className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-800">
              {pendingCount} pending leave application{pendingCount > 1 ? 's' : ''} require{pendingCount === 1 ? 's' : ''} your attention
            </p>
          </div>
        </div>
      )}

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
            <Select
              placeholder="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Status' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'APPROVED', label: 'Approved' },
                { value: 'REJECTED', label: 'Rejected' },
                { value: 'CANCELLED', label: 'Cancelled' },
              ]}
              className="w-36"
            />
            <Select
              placeholder="Leave Type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[{ value: '', label: 'All Types' }, ...leaveTypeOptions]}
              className="w-40"
            />
          </div>
        </div>
      </Card>

      {/* Leaves Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Employee</TableHeader>
                <TableHeader>Leave Type</TableHeader>
                <TableHeader>Duration</TableHeader>
                <TableHeader>Days</TableHeader>
                <TableHeader>Applied On</TableHeader>
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
              ) : filteredLeaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No leave applications found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLeaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-700 font-semibold text-xs">
                            {getEmployeeName(leave.employeeId)?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {getEmployeeName(leave.employeeId)}
                          </p>
                          <p className="text-xs text-gray-500">{leave.employeeId}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{leave.leaveType.replace('_', ' ')}</span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{formatDate(leave.fromDate)}</p>
                        <p className="text-gray-500">to {formatDate(leave.toDate)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{leave.days} days</span>
                    </TableCell>
                    <TableCell>{formatDate(leave.appliedOn)}</TableCell>
                    <TableCell>{getStatusBadge(leave.status)}</TableCell>
                    <TableCell>
                      <button
                        onClick={() => handleViewLeave(leave)}
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

      {/* View/Action Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Leave Application Details"
        size="md"
        footer={selectedLeave?.status === 'PENDING' && (
          <div className="flex justify-end gap-2">
            {!showRejectForm ? (
              <>
                <Button variant="danger" onClick={() => setShowRejectForm(true)}>
                  Reject
                </Button>
                <Button variant="success" onClick={handleApprove}>
                  Approve
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setShowRejectForm(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleReject}>
                  Confirm Rejection
                </Button>
              </>
            )}
          </div>
        )}
      >
        {selectedLeave && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b">
              <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-bold text-xl">
                  {selectedLeave.employeeName?.[0]}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{selectedLeave.employeeName}</h3>
                <p className="text-gray-500">{selectedLeave.employeeId}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Leave Type</p>
                <p className="font-medium">{selectedLeave.leaveType.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <div className="mt-1">{getStatusBadge(selectedLeave.status)}</div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Duration</span>
              </div>
              <div className="space-y-1 text-sm">
                <p><span className="text-gray-600">From:</span> {formatDate(selectedLeave.fromDate)}</p>
                <p><span className="text-gray-600">To:</span> {formatDate(selectedLeave.toDate)}</p>
                <p><span className="text-gray-600">Total Days:</span> {selectedLeave.days} days</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">Reason</p>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedLeave.reason}</p>
            </div>

            {selectedLeave.status === 'REJECTED' && selectedLeave.rejectionReason && (
              <div className="bg-red-50 p-4 rounded-lg">
                <p className="text-sm text-red-600 font-medium mb-1">Rejection Reason</p>
                <p className="text-red-700">{selectedLeave.rejectionReason}</p>
              </div>
            )}

            {showRejectForm && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-200 focus:border-red-500 outline-none resize-none"
                  rows={3}
                  required
                />
              </div>
            )}

            <div className="text-sm text-gray-500 pt-2 border-t">
              <p>Applied on: {formatDate(selectedLeave.appliedOn)}</p>
              {selectedLeave.approvedOn && <p>Approved on: {formatDate(selectedLeave.approvedOn)}</p>}
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  );
}
