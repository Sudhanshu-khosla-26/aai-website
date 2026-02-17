# AAI Attendance Management System

A comprehensive web-based attendance management system for the Airport Authority of India (AAI), built with Next.js, React, and Tailwind CSS.

## Features

### Authentication & User Management
- Login/Signup with role-based access control
- Forgot password with OTP verification
- Profile management
- Employee registration and management

### Attendance Tracking
- Real-time attendance monitoring
- GPS-based check-in/check-out with geofence validation
- Photo capture for verification
- Attendance history and reports

### Leave Management
- Online leave application
- Approval workflow for managers
- Leave balance tracking
- Leave history

### Location Management
- Workplace location management
- Polygon geofence drawing on Google Maps
- Department-based location access

### Admin Dashboard
- Analytics and statistics
- Employee management
- Attendance reports
- System settings

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: JavaScript (ES6+)
- **Styling**: Tailwind CSS 3.4
- **UI Components**: Custom components with shadcn/ui patterns
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Maps**: Google Maps JavaScript API (optional)

## Project Structure

```
aai-attendance-web/
├── app/                          # Next.js App Router
│   ├── api/                      # API route placeholders
│   │   ├── auth/
│   │   ├── users/
│   │   ├── attendance/
│   │   ├── leaves/
│   │   └── locations/
│   ├── admin/                    # Admin pages
│   │   ├── dashboard/
│   │   ├── employees/
│   │   ├── attendance/
│   │   ├── leaves/
│   │   ├── locations/
│   │   ├── reports/
│   │   └── settings/
│   ├── employee/                 # Employee pages
│   │   ├── dashboard/
│   │   ├── attendance/
│   │   ├── leaves/
│   │   └── profile/
│   ├── login/
│   ├── signup/
│   ├── forgot-password/
│   ├── globals.css
│   ├── layout.jsx
│   └── page.jsx                  # Landing page
├── components/                   # React components
│   ├── ui/                       # UI components (Button, Input, Card, etc.)
│   └── layout/                   # Layout components (Sidebar, Header, etc.)
├── context/                      # React Context
│   └── AuthContext.js
├── lib/                          # Utility functions and constants
│   ├── utils.js
│   ├── constants.js
│   └── mockData.js
├── services/                     # API service functions
│   ├── authService.js
│   ├── userService.js
│   ├── attendanceService.js
│   ├── leaveService.js
│   └── locationService.js
├── public/                       # Static assets
├── .env.example
├── next.config.js
├── package.json
├── tailwind.config.js
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository or navigate to the project directory:
```bash
cd aai-attendance-web
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. (Optional) Add your Google Maps API key to `.env.local`:
```
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Demo Credentials

- **Admin**: admin@aai.gov.in / admin123
- **Employee**: employee@aai.gov.in / employee123

## Building for Production

```bash
npm run build
```

The static files will be generated in the `dist` folder.

## Key Features Implementation

### Mock Data System
All data is currently stored in-memory using mock data. This allows the application to run fully on the frontend without a backend. To connect to a real backend:

1. Update the service files in `/services/` to make actual API calls
2. Implement the API routes in `/app/api/`
3. Add authentication middleware

### Role-Based Access Control
- `SUPER_ADMIN`: Full system access
- `ADMIN`: Admin dashboard access, employee management
- `EMPLOYEE`: Employee portal access only

### Geofence System
- Circular geofence using radius
- Polygon geofence using Google Maps drawing tools
- Point-in-polygon validation

## Customization

### Colors
The AAI brand colors are configured in `tailwind.config.js`:
- Primary (Navy): `#003366`
- Secondary (Saffron): `#FF9933`
- Green: `#138808`

### Departments
Departments can be customized in `lib/constants.js`.

## Future Enhancements

- [ ] Backend API integration
- [ ] Real-time notifications with WebSockets
- [ ] Mobile app (React Native)
- [ ] Biometric authentication
- [ ] Advanced analytics and reporting
- [ ] Multi-language support
- [ ] Dark mode

## License

This project is built for the Airport Authority of India.

## Support

For support, contact the AAI IT Department or email support@aai.gov.in.
