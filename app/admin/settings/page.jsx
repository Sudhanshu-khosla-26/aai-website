'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Save, Bell, Shield, Clock, MapPin, Mail, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);

  const [generalSettings, setGeneralSettings] = useState({
    organizationName: 'Airport Authority of India',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    language: 'en',
  });

  const [attendanceSettings, setAttendanceSettings] = useState({
    checkInTime: '09:00',
    checkOutTime: '18:00',
    gracePeriod: 15,
    halfDayAfter: 13,
    workHours: 8,
    allowRemoteCheckIn: false,
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    dailyReport: true,
    lateArrivalAlert: true,
    leaveApproval: true,
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      toast.success('Settings saved successfully');
      setIsSaving(false);
    }, 1000);
  };

  const tabs = [
    { id: 'general', label: 'General', icon: User },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500">Manage system settings and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <Card className="lg:col-span-1 h-fit">
          <div className="p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <Card>
              <CardHeader title="General Settings" />
              <CardBody>
                <div className="space-y-4">
                  <Input
                    label="Organization Name"
                    value={generalSettings.organizationName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, organizationName: e.target.value })}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Timezone"
                      value={generalSettings.timezone}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                      options={[
                        { value: 'Asia/Kolkata', label: 'IST (UTC+5:30)' },
                        { value: 'UTC', label: 'UTC' },
                      ]}
                    />
                    <Select
                      label="Date Format"
                      value={generalSettings.dateFormat}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                      options={[
                        { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                        { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                        { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                      ]}
                    />
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'attendance' && (
            <Card>
              <CardHeader title="Attendance Settings" />
              <CardBody>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Check-in Time"
                      type="time"
                      value={attendanceSettings.checkInTime}
                      onChange={(e) => setAttendanceSettings({ ...attendanceSettings, checkInTime: e.target.value })}
                    />
                    <Input
                      label="Check-out Time"
                      type="time"
                      value={attendanceSettings.checkOutTime}
                      onChange={(e) => setAttendanceSettings({ ...attendanceSettings, checkOutTime: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input
                      label="Grace Period (minutes)"
                      type="number"
                      value={attendanceSettings.gracePeriod}
                      onChange={(e) => setAttendanceSettings({ ...attendanceSettings, gracePeriod: parseInt(e.target.value) })}
                    />
                    <Input
                      label="Half Day After (hours)"
                      type="number"
                      value={attendanceSettings.halfDayAfter}
                      onChange={(e) => setAttendanceSettings({ ...attendanceSettings, halfDayAfter: parseInt(e.target.value) })}
                    />
                    <Input
                      label="Work Hours"
                      type="number"
                      value={attendanceSettings.workHours}
                      onChange={(e) => setAttendanceSettings({ ...attendanceSettings, workHours: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="allowRemote"
                      checked={attendanceSettings.allowRemoteCheckIn}
                      onChange={(e) => setAttendanceSettings({ ...attendanceSettings, allowRemoteCheckIn: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label htmlFor="allowRemote" className="text-sm text-gray-700">
                      Allow Remote Check-in
                    </label>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'notifications' && (
            <Card>
              <CardHeader title="Notification Settings" />
              <CardBody>
                <div className="space-y-4">
                  {[
                    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive notifications via email' },
                    { key: 'pushNotifications', label: 'Push Notifications', description: 'Receive push notifications in browser' },
                    { key: 'dailyReport', label: 'Daily Report', description: 'Receive daily attendance summary' },
                    { key: 'lateArrivalAlert', label: 'Late Arrival Alert', description: 'Get notified when employees are late' },
                    { key: 'leaveApproval', label: 'Leave Approval', description: 'Notify when leave requests need approval' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between py-2">
                      <div>
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={notificationSettings[item.key]}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, [item.key]: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {activeTab === 'security' && (
            <Card>
              <CardHeader title="Security Settings" />
              <CardBody>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Password Policy</h4>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600" />
                        <span className="text-sm text-gray-700">Minimum 8 characters</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600" />
                        <span className="text-sm text-gray-700">Require uppercase letter</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-primary-600" />
                        <span className="text-sm text-gray-700">Require number</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" className="rounded border-gray-300 text-primary-600" />
                        <span className="text-sm text-gray-700">Require special character</span>
                      </label>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Session Settings</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Session Timeout (minutes)"
                        type="number"
                        defaultValue={30}
                      />
                      <Input
                        label="Max Login Attempts"
                        type="number"
                        defaultValue={5}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Two-Factor Authentication</h4>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Require 2FA for admin accounts</p>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <Button
              variant="primary"
              size="lg"
              leftIcon={<Save className="w-5 h-5" />}
              onClick={handleSave}
              isLoading={isSaving}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
