'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import Card, { CardHeader, CardBody } from '../../../components/ui/Card';
import Badge from '../../../components/ui/Badge';
import {
  Users,
  Clock,
  Calendar,
  MapPin,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { getAttendanceStats } from '../../../services/attendanceService';
import { getUsers } from '../../../services/userService';
import { getLeaves } from '../../../services/leaveService';

const attendanceData = [
  { day: 'Mon', present: 145, absent: 5, late: 10 },
  { day: 'Tue', present: 150, absent: 3, late: 7 },
  { day: 'Wed', present: 148, absent: 4, late: 8 },
  { day: 'Thu', present: 152, absent: 2, late: 6 },
  { day: 'Fri', present: 140, absent: 8, late: 12 },
  { day: 'Sat', present: 80, absent: 2, late: 3 },
  { day: 'Sun', present: 15, absent: 1, late: 0 },
];

const departmentData = [
  { name: 'Operations', value: 45, color: '#003366' },
  { name: 'Security', value: 35, color: '#FF9933' },
  { name: 'Administration', value: 25, color: '#138808' },
  { name: 'Maintenance', value: 20, color: '#6366f1' },
  { name: 'Fire Services', value: 15, color: '#ec4899' },
];

const monthlyTrend = [
  { month: 'Jan', attendance: 92 },
  { month: 'Feb', attendance: 94 },
  { month: 'Mar', attendance: 91 },
  { month: 'Apr', attendance: 95 },
  { month: 'May', attendance: 93 },
  { month: 'Jun', attendance: 96 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    absentToday: 0,
    onLeave: 0,
    lateComers: 0,
    attendanceRate: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all required data
      const [usersData, attendanceStats, leaves] = await Promise.all([
        getUsers(),
        getAttendanceStats(),
        getLeaves(),
      ]);
      const users = usersData?.users || [];

      const today = new Date().toISOString().split('T')[0];
      const pendingLeaves = leaves.filter(l => l.status === 'PENDING').length;
      const approvedLeavesToday = leaves.filter(
        l => l.status === 'APPROVED' && l.fromDate <= today && l.toDate >= today
      ).length;

      setStats({
        totalEmployees: users.length,
        presentToday: attendanceStats.summary?.present || 145,
        absentToday: attendanceStats.summary?.absent || 8,
        onLeave: approvedLeavesToday,
        lateComers: attendanceStats.summary?.late || 12,
        attendanceRate: attendanceStats.summary?.attendanceRate || 94,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendValue, color }) => (
    <Card>
      <CardBody>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            {trend && (
              <div className={`flex items-center gap-1 mt-2 ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="text-sm font-medium">{trendValue}</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees || 160}
          subtitle="Active staff"
          icon={Users}
          color="bg-blue-500"
          trend="up"
          trendValue="+5 this month"
        />
        <StatCard
          title="Present Today"
          value={stats.presentToday}
          subtitle="Checked in"
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatCard
          title="Absent Today"
          value={stats.absentToday}
          subtitle="Not reported"
          icon={XCircle}
          color="bg-red-500"
        />
        <StatCard
          title="On Leave"
          value={stats.onLeave}
          subtitle="Approved leaves"
          icon={Calendar}
          color="bg-purple-500"
        />
        <StatCard
          title="Late Comers"
          value={stats.lateComers}
          subtitle="After 9:00 AM"
          icon={Clock}
          color="bg-yellow-500"
        />
        <StatCard
          title="Attendance Rate"
          value={`${stats.attendanceRate}%`}
          subtitle="This week"
          icon={TrendingUp}
          color="bg-primary-600"
          trend="up"
          trendValue="+2.3%"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly Attendance Chart */}
        <Card>
          <CardHeader title="Weekly Attendance Overview" subtitle="Present, Absent & Late employees" />
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={attendanceData}>
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
                  <Legend />
                  <Bar dataKey="present" name="Present" fill="#138808" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="absent" name="Absent" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="late" name="Late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Department Distribution */}
        <Card>
          <CardHeader title="Department Distribution" subtitle="Employees by department" />
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Monthly Trend & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Attendance Trend */}
        <Card className="lg:col-span-2">
          <CardHeader title="Monthly Attendance Trend" subtitle="Attendance percentage over time" />
          <CardBody>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis domain={[80, 100]} stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    name="Attendance %"
                    stroke="#003366"
                    strokeWidth={3}
                    dot={{ fill: '#003366', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader title="Quick Actions" />
          <CardBody>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-colors">
                <Users className="w-5 h-5" />
                <span className="font-medium">Manage Employees</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
                <Clock className="w-5 h-5" />
                <span className="font-medium">View Attendance</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Approve Leaves</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors">
                <MapPin className="w-5 h-5" />
                <span className="font-medium">Manage Locations</span>
              </button>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
