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
import { Plus, Calendar, Clock, Eye, XCircle, CheckCircle } from 'lucide-react';
import { getMyLeaves, applyForLeave } from '../../../services/leaveService';
import { LEAVE_TYPES } from '../../../lib/constants';
import { formatDate, calculateDaysBetween } from '../../../lib/utils';
import toast from 'react-hot-toast';

export default function MyLeavesPage() {
  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState({
    casual: 12,
    sick: 10,
    earned: 20,
    total: 42,
  });

  const [formData, setFormData] = useState({
    leaveType: '',
    fromDate: '',
    toDate: '',
    reason: '',
  });

  useEffect(() => {
    fetchLeaves();
  }, []);

  const fetchLeaves = async () => {
    try {
      setIsLoading(true);
      const data = await getMyLeaves();
      setLeaves(data);
      
      // Calculate leave balance
      const approvedLeaves = data.filter(l => l.status === 'APPROVED');
      const casualUsed = approvedLeaves.filter(l => l.leaveType === 'CASUAL').reduce((sum, l) => sum + l.days, 0);
      const sickUsed = approvedLeaves.filter(l => l.leaveType === 'SICK').reduce((sum, l) => sum + l.days, 0);
      const earnedUsed = approvedLeaves.filter(l => l.leaveType === 'EARNED').reduce((sum, l) => sum + l.days, 0);
      
      setLeaveBalance({
        casual: 12 - casualUsed,
        sick: 10 - sickUsed,
        earned: 20 - earnedUsed,
        total: 42 - (casualUsed + sickUsed + earnedUsed),
      });
    } catch (error) {
      toast.error('Failed to fetch leave applications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewLeave = (leave) => {
    setSelectedLeave(leave);
    setIsModalOpen(true);
  };

  const handleApplyLeave = async (e) => {
    e.preventDefault();

    if (!formData.leaveType || !formData.fromDate || !formData.toDate || !formData.reason) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      toast.error('From date cannot be after to date');
      return;
    }

    try {
      await applyForLeave(formData);
      toast.success('Leave application submitted successfully');
      setIsApplyModalOpen(false);
      setFormData({ leaveType: '', fromDate: '', toDate: '', reason: '' });
      fetchLeaves();
    } catch (error) {
      toast.error(error.message || 'Failed to submit leave application');
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
          <h1 className="text-2xl font-bold text-gray-900">My Leaves</h1>
          <p className="text-gray-500">Manage your leave applications and balance</p>
        </div>
        <Button 
          variant="primary" 
          leftIcon={<Plus className="w-4 h-4" />} 
          onClick={() => setIsApplyModalOpen(true)}
        >
          Apply for Leave
        </Button>
      </div>

      {/* Leave Balance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Casual Leave</p>
                <p className="text-xl font-bold text-gray-900">{leaveBalance.casual} <span className="text-sm font-normal text-gray-500">/ 12</span></p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Calendar className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Sick Leave</p>
                <p className="text-xl font-bold text-gray-900">{leaveBalance.sick} <span className="text-sm font-normal text-gray-500">/ 10</span></p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Earned Leave</p>
                <p className="text-xl font-bold text-gray-900">{leaveBalance.earned} <span className="text-sm font-normal text-gray-500">/ 20</span></p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Balance</p>
                <p className="text-xl font-bold text-gray-900">{leaveBalance.total}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Pending Alert */}
      {pendingCount > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 flex items-center gap-3">
          <Clock className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="font-medium text-yellow-800">
              You have {pendingCount} pending leave application{pendingCount > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Leaves Table */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
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
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : leaves.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No leave applications found
                  </TableCell>
                </TableRow>
              ) : (
                leaves.map((leave) => (
                  <TableRow key={leave.id}>
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

      {/* View Leave Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Leave Application Details"
        size="md"
      >
        {selectedLeave && (
          <div className="space-y-4">
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

            <div className="text-sm text-gray-500 pt-2 border-t">
              <p>Applied on: {formatDate(selectedLeave.appliedOn)}</p>
              {selectedLeave.approvedOn && <p>Approved on: {formatDate(selectedLeave.approvedOn)}</p>}
            </div>
          </div>
        )}
      </Modal>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title="Apply for Leave"
        size="md"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApplyLeave}>
              Submit Application
            </Button>
          </div>
        }
      >
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <Select
            label="Leave Type"
            value={formData.leaveType}
            onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
            options={leaveTypeOptions}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="From Date"
              type="date"
              value={formData.fromDate}
              onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
              required
            />
            <Input
              label="To Date"
              type="date"
              value={formData.toDate}
              onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
              required
            />
          </div>

          {formData.fromDate && formData.toDate && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-700">
                Total days: <span className="font-bold">
                  {calculateDaysBetween(formData.fromDate, formData.toDate)}
                </span>
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Enter reason for leave..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-200 focus:border-primary-500 outline-none resize-none"
              rows={4}
              required
            />
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
