'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';
import Badge from '../../../components/ui/Badge';
import { useAuth } from '../../../context/AuthContext';
import {
  Clock,
  Calendar,
  MapPin,
  TrendingUp,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { getMyAttendance, getAttendanceStats } from '../../../services/attendanceService';
import { getMyLeaves } from '../../../services/leaveService';
import { formatDate, formatTime } from '../../../lib/utils';
import toast from 'react-hot-toast';

const weeklyData = [
  { day: 'Mon', hours: 8.5 },
  { day: 'Tue', hours: 9 },
  { day: 'Wed', hours: 8 },
  { day: 'Thu', hours: 8.5 },
  { day: 'Fri', hours: 7.5 },
  { day: 'Sat', hours: 4 },
  { day: 'Sun', hours: 0 },
];

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const greetingName = user?.firstName || user?.fullName?.split(/\s+/)[0] || 'Employee';
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [leaveBalance, setLeaveBalance] = useState({
    casual: 12,
    sick: 10,
    earned: 20,
  });
  const [stats, setStats] = useState({
    presentDays: 0,
    absentDays: 0,
    lateDays: 0,
    attendanceRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      const [attendanceData, statsData, leavesData] = await Promise.all([
        getMyAttendance(),
        getAttendanceStats(),
        getMyLeaves(),
      ]);

      // Get today's attendance
      const today = new Date().toISOString().split('T')[0];
      const todayRecord = attendanceData.find(a => a.date === today);
      setTodayAttendance(todayRecord);

      // Get last 5 attendance records
      setAttendanceHistory(attendanceData.slice(0, 5));

      // Calculate stats
      setStats({
        presentDays: attendanceData.filter(a => a.status === 'PRESENT').length,
        absentDays: attendanceData.filter(a => a.status === 'ABSENT').length,
        lateDays: attendanceData.filter(a => a.status === 'LATE').length,
        attendanceRate: statsData.summary?.attendanceRate || 94,
      });

      // Calculate leave balance from leaves data
      const approvedLeaves = leavesData.filter(l => l.status === 'APPROVED');
      const casualUsed = approvedLeaves.filter(l => l.leaveType === 'CASUAL').reduce((sum, l) => sum + l.days, 0);
      const sickUsed = approvedLeaves.filter(l => l.leaveType === 'SICK').reduce((sum, l) => sum + l.days, 0);
      
      setLeaveBalance({
        casual: 12 - casualUsed,
        sick: 10 - sickUsed,
        earned: 20,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {greetingName}!
        </h1>
        <p className="text-gray-500">Here&apos;s your attendance overview for today.</p>
      </div>

      {/* Today's Status Card */}
      <Card className="mb-6 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-primary-100 mb-1">{formatDate(new Date().toISOString())}</p>
              <h2 className="text-2xl font-bold">
                {todayAttendance?.status === 'PRESENT' 
                  ? 'You are checked in' 
                  : todayAttendance?.status === 'LATE'
                  ? 'You are checked in (Late)'
                  : 'Not checked in yet'}
              </h2>
              {todayAttendance?.checkIn && (
                <p className="text-primary-100 mt-1">
                  Check-in time: {formatTime(todayAttendance.checkIn.time)}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              {!todayAttendance?.checkIn ? (
                <Button variant="secondary" size="lg" leftIcon={<Clock className="w-5 h-5" />}>
                  Check In
                </Button>
              ) : !todayAttendance?.checkOut ? (
                <Button variant="white" size="lg" leftIcon={<Clock className="w-5 h-5" />}>
                  Check Out
                </Button>
              ) : (
                <Badge variant="success" className="px-4 py-2 text-base">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Day Complete
                </Badge>
              )}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Present Days</p>
                <p className="text-xl font-bold text-gray-900">{stats.presentDays}</p>
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
                <p className="text-sm text-gray-500">Absent Days</p>
                <p className="text-xl font-bold text-gray-900">{stats.absentDays}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Late Days</p>
                <p className="text-xl font-bold text-gray-900">{stats.lateDays}</p>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Attendance Rate</p>
                <p className="text-xl font-bold text-gray-900">{stats.attendanceRate}%</p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Hours Chart */}
        <Card className="lg:col-span-2">
          <CardHeader title="Weekly Hours" subtitle="Your working hours this week" />
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="hours" name="Hours" fill="#003366" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Leave Balance */}
        <Card>
          <CardHeader title="Leave Balance" />
          <CardBody>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Casual Leave</p>
                    <p className="text-sm text-gray-500">Available</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-600">{leaveBalance.casual}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Sick Leave</p>
                    <p className="text-sm text-gray-500">Available</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-red-600">{leaveBalance.sick}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Earned Leave</p>
                    <p className="text-sm text-gray-500">Available</p>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-600">{leaveBalance.earned}</span>
              </div>

              <Button variant="outline" fullWidth rightIcon={<ArrowRight className="w-4 h-4" />}>
                Apply for Leave
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Recent Attendance */}
      <Card className="mt-6">
        <CardHeader 
          title="Recent Attendance" 
          subtitle="Your last 5 attendance records"
          action={
            <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
              View All
            </Button>
          }
        />
        <CardBody>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Check In</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Check Out</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Location</th>
                </tr>
              </thead>
              <tbody>
                {attendanceHistory.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">
                      No attendance records found
                    </td>
                  </tr>
                ) : (
                  attendanceHistory.map((record) => (
                    <tr key={record.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4">{formatDate(record.date)}</td>
                      <td className="py-3 px-4">
                        {record.checkIn ? (
                          <span className="text-green-600 font-medium">
                            {formatTime(record.checkIn.time)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {record.checkOut ? (
                          <span className="text-blue-600 font-medium">
                            {formatTime(record.checkOut.time)}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant={
                            record.status === 'PRESENT' ? 'success' :
                            record.status === 'ABSENT' ? 'danger' :
                            record.status === 'LATE' ? 'warning' : 'default'
                          }
                        >
                          {record.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {record.checkIn?.location ? (
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            {record.checkIn.location.name}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </DashboardLayout>
  );
}
