'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Download, Calendar, FileText, BarChart3, Users, Clock, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ReportsPage() {
  const [reportType, setReportType] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [department, setDepartment] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { value: 'attendance', label: 'Attendance Report', icon: Clock },
    { value: 'leave', label: 'Leave Report', icon: Calendar },
    { value: 'employee', label: 'Employee Report', icon: Users },
    { value: 'summary', label: 'Monthly Summary', icon: BarChart3 },
  ];

  const departmentOptions = [
    { value: '', label: 'All Departments' },
    { value: 'operations', label: 'Operations' },
    { value: 'security', label: 'Security' },
    { value: 'administration', label: 'Administration' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'fire', label: 'Fire Services' },
  ];

  const handleGenerateReport = async () => {
    if (!reportType) {
      toast.error('Please select a report type');
      return;
    }

    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      toast.success('Report generated successfully');
      setIsGenerating(false);
    }, 2000);
  };

  const recentReports = [
    { name: 'Attendance Report - November 2024', date: '2024-12-01', type: 'attendance', size: '245 KB' },
    { name: 'Leave Summary - Q4 2024', date: '2024-11-30', type: 'leave', size: '180 KB' },
    { name: 'Employee Directory', date: '2024-11-28', type: 'employee', size: '520 KB' },
    { name: 'Monthly Summary - October 2024', date: '2024-11-01', type: 'summary', size: '320 KB' },
  ];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500">Generate and download attendance reports</p>
      </div>

      {/* Generate Report Card */}
      <Card className="mb-6">
        <CardHeader title="Generate New Report" />
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Select
              label="Report Type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              options={[{ value: '', label: 'Select report type' }, ...reportTypes.map(r => ({ value: r.value, label: r.label }))]}
            />
            <Input
              label="From Date"
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            />
            <Input
              label="To Date"
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            />
            <Select
              label="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              options={departmentOptions}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              variant="primary"
              leftIcon={<BarChart3 className="w-4 h-4" />}
              onClick={handleGenerateReport}
              isLoading={isGenerating}
            >
              Generate Report
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {reportTypes.map((report) => {
          const Icon = report.icon;
          return (
            <Card key={report.value} hover className="cursor-pointer" onClick={() => setReportType(report.value)}>
              <CardBody className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{report.label}</p>
                    <p className="text-sm text-gray-500">Click to select</p>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader 
          title="Recent Reports" 
          action={
            <Button variant="ghost" size="sm" leftIcon={<Filter className="w-4 h-4" />}>
              Filter
            </Button>
          }
        />
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Report Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Generated On</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Size</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report, index) => (
                  <tr key={index} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{report.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="capitalize text-gray-600">{report.type}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{report.date}</td>
                    <td className="py-3 px-4 text-gray-600">{report.size}</td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                        Download
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </DashboardLayout>
  );
}
