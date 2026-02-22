/**
 * GET /api/seed
 * One-time database seeder for initial admin users and locations.
 * IMPORTANT: Remove or protect this route in production after setup!
 */

import { connectDB } from '../../../lib/db';
import User from '../../../models/User';
import Location from '../../../models/Location';
import LeaveBalance from '../../../models/LeaveBalance';

const SEED_SECRET = process.env.SEED_SECRET || 'aai_seed_2024';

const SEED_USERS = [
    {
        employeeId: 'AA100001',
        email: 'admin@aai.aero',
        password: 'Admin@123',
        fullName: 'Rajesh Kumar',
        firstName: 'Rajesh',
        lastName: 'Kumar',
        phone: '9876543210',
        department: 'OPS',
        designation: 'MANAGER',
        role: 'admin',
        status: 'active',
        isEmailVerified: true,
        isPhotoVerified: true,
    },
    {
        employeeId: 'AA100002',
        email: 'priya.sharma@aai.aero',
        password: 'User@123',
        fullName: 'Priya Sharma',
        firstName: 'Priya',
        lastName: 'Sharma',
        phone: '9876543211',
        department: 'ATC',
        designation: 'EXEC',
        role: 'employee',
        status: 'active',
        isEmailVerified: true,
        isPhotoVerified: true,
    },
    {
        employeeId: 'AA100003',
        email: 'amit.patel@aai.aero',
        password: 'User@123',
        fullName: 'Amit Patel',
        firstName: 'Amit',
        lastName: 'Patel',
        phone: '9876543212',
        department: 'ENG',
        designation: 'EXEC',
        role: 'employee',
        status: 'active',
        isEmailVerified: true,
        isPhotoVerified: true,
    },
    {
        employeeId: 'SA100001',
        email: 'super.admin@aai.aero',
        password: 'Super@123',
        fullName: 'Super Administrator',
        firstName: 'Super',
        lastName: 'Administrator',
        phone: '9999999999',
        department: 'IT',
        designation: 'GM',
        role: 'super_admin',
        status: 'active',
        isEmailVerified: true,
        isPhotoVerified: true,
    },
];

// ── All major AAI airports + regional/zonal offices ───────────────────────────
const SEED_LOCATIONS = [
    // ── METRO AIRPORTS ──────────────────────────────────────────────────────
    {
        name: 'Indira Gandhi International Airport',
        code: 'DEL',
        airportCode: 'DEL',
        latitude: 28.5562,
        longitude: 77.1000,
        radius: 600,
        address: 'NH-8, New Delhi, Delhi 110037',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Chhatrapati Shivaji Maharaj International Airport',
        code: 'BOM',
        airportCode: 'BOM',
        latitude: 19.0896,
        longitude: 72.8656,
        radius: 600,
        address: 'Sahar, Andheri East, Mumbai, Maharashtra 400099',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Kempegowda International Airport',
        code: 'BLR',
        airportCode: 'BLR',
        latitude: 13.1986,
        longitude: 77.7066,
        radius: 600,
        address: 'Devanahalli, Bengaluru, Karnataka 560300',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Chennai International Airport',
        code: 'MAA',
        airportCode: 'MAA',
        latitude: 12.9941,
        longitude: 80.1709,
        radius: 500,
        address: 'Tirusulam, Chennai, Tamil Nadu 600027',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Netaji Subhas Chandra Bose International Airport',
        code: 'CCU',
        airportCode: 'CCU',
        latitude: 22.6547,
        longitude: 88.4467,
        radius: 500,
        address: 'Dum Dum, Kolkata, West Bengal 700052',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Rajiv Gandhi International Airport',
        code: 'HYD',
        airportCode: 'HYD',
        latitude: 17.2403,
        longitude: 78.4294,
        radius: 600,
        address: 'Shamshabad, Hyderabad, Telangana 501218',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    // ── MAJOR AAI AIRPORTS ───────────────────────────────────────────────────
    {
        name: 'Sardar Vallabhbhai Patel International Airport',
        code: 'AMD',
        airportCode: 'AMD',
        latitude: 23.0779,
        longitude: 72.6347,
        radius: 500,
        address: 'Ahmedabad, Gujarat 382475',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Jaipur International Airport',
        code: 'JAI',
        airportCode: 'JAI',
        latitude: 26.8242,
        longitude: 75.8122,
        radius: 400,
        address: 'Sanganer, Jaipur, Rajasthan 302029',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Lokpriya Gopinath Bordoloi International Airport',
        code: 'GAU',
        airportCode: 'GAU',
        latitude: 26.1061,
        longitude: 91.5859,
        radius: 400,
        address: 'Borjhar, Guwahati, Assam 781007',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Biju Patnaik International Airport',
        code: 'BBI',
        airportCode: 'BBI',
        latitude: 20.2441,
        longitude: 85.8178,
        radius: 400,
        address: 'Bhubaneswar, Odisha 751020',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Chaudhary Charan Singh International Airport',
        code: 'LKO',
        airportCode: 'LKO',
        latitude: 26.7606,
        longitude: 80.8893,
        radius: 400,
        address: 'Amausi, Lucknow, Uttar Pradesh 226009',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Lal Bahadur Shastri International Airport',
        code: 'VNS',
        airportCode: 'VNS',
        latitude: 25.4524,
        longitude: 82.8593,
        radius: 350,
        address: 'Babatpur, Varanasi, Uttar Pradesh 221006',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Jay Prakash Narayan International Airport',
        code: 'PAT',
        airportCode: 'PAT',
        latitude: 25.5913,
        longitude: 85.0878,
        radius: 350,
        address: 'Patna, Bihar 800007',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Birsa Munda Airport',
        code: 'IXR',
        airportCode: 'IXR',
        latitude: 23.3143,
        longitude: 85.3217,
        radius: 350,
        address: 'Ranchi, Jharkhand 834006',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Dr. Babasaheb Ambedkar International Airport',
        code: 'NAG',
        airportCode: 'NAG',
        latitude: 21.0922,
        longitude: 79.0472,
        radius: 400,
        address: 'Sonegaon, Nagpur, Maharashtra 440005',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Pune Airport',
        code: 'PNQ',
        airportCode: 'PNQ',
        latitude: 18.5822,
        longitude: 73.9197,
        radius: 400,
        address: 'Lohegaon, Pune, Maharashtra 411032',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Calicut International Airport',
        code: 'CCJ',
        airportCode: 'CCJ',
        latitude: 11.1368,
        longitude: 75.9552,
        radius: 350,
        address: 'Karipur, Malappuram, Kerala 673647',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Cochin International Airport',
        code: 'COK',
        airportCode: 'COK',
        latitude: 10.1520,
        longitude: 76.3916,
        radius: 500,
        address: 'Nedumbassery, Ernakulam, Kerala 683111',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Thiruvananthapuram International Airport',
        code: 'TRV',
        airportCode: 'TRV',
        latitude: 8.4821,
        longitude: 76.9198,
        radius: 400,
        address: 'Thiruvananthapuram, Kerala 695008',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Coimbatore International Airport',
        code: 'CJB',
        airportCode: 'CJB',
        latitude: 11.0300,
        longitude: 77.0434,
        radius: 350,
        address: 'Coimbatore, Tamil Nadu 641014',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Madurai Airport',
        code: 'IXM',
        airportCode: 'IXM',
        latitude: 9.8346,
        longitude: 78.0934,
        radius: 300,
        address: 'Madurai, Tamil Nadu 625007',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Sri Guru Ram Dass Jee International Airport',
        code: 'ATQ',
        airportCode: 'ATQ',
        latitude: 31.7096,
        longitude: 74.7973,
        radius: 400,
        address: 'Amritsar, Punjab 143001',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Chandigarh International Airport',
        code: 'IXC',
        airportCode: 'IXC',
        latitude: 30.6735,
        longitude: 76.7885,
        radius: 350,
        address: 'Chandigarh 160003',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Dabolim Airport (Goa)',
        code: 'GOI',
        airportCode: 'GOI',
        latitude: 15.3808,
        longitude: 73.8314,
        radius: 400,
        address: 'Dabolim, South Goa, Goa 403801',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Mangalore International Airport',
        code: 'IXE',
        airportCode: 'IXE',
        latitude: 12.9613,
        longitude: 74.8900,
        radius: 350,
        address: 'Bajpe, Mangaluru, Karnataka 574142',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Vijayawada Airport',
        code: 'VGA',
        airportCode: 'VGA',
        latitude: 16.5304,
        longitude: 80.7965,
        radius: 300,
        address: 'Gannavaram, Vijayawada, Andhra Pradesh 521101',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Visakhapatnam Airport',
        code: 'VTZ',
        airportCode: 'VTZ',
        latitude: 17.7212,
        longitude: 83.2244,
        radius: 350,
        address: 'Visakhapatnam, Andhra Pradesh 530009',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Indore Airport',
        code: 'IDR',
        airportCode: 'IDR',
        latitude: 22.7218,
        longitude: 75.8011,
        radius: 350,
        address: 'Indore, Madhya Pradesh 452016',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Bhopal Airport',
        code: 'BHO',
        airportCode: 'BHO',
        latitude: 23.2875,
        longitude: 77.3374,
        radius: 300,
        address: 'Bhopal, Madhya Pradesh 462036',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Port Blair Airport (Veer Savarkar)',
        code: 'IXZ',
        airportCode: 'IXZ',
        latitude: 11.6412,
        longitude: 92.7296,
        radius: 350,
        address: 'Port Blair, Andaman and Nicobar Islands 744101',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Agartala Airport (Maharaja Bir Bikram)',
        code: 'IXA',
        airportCode: 'IXA',
        latitude: 23.8870,
        longitude: 91.2404,
        radius: 300,
        address: 'Singarbhil, Agartala, Tripura 799009',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'Imphal International Airport',
        code: 'IMF',
        airportCode: 'IMF',
        latitude: 24.7600,
        longitude: 93.8967,
        radius: 300,
        address: 'Imphal, Manipur 795001',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    // ── AAI HEADQUARTERS & REGIONAL/ZONAL OFFICES ────────────────────────────
    {
        name: 'AAI Corporate Headquarters',
        code: 'AAIHQ',
        airportCode: 'AAIHQ',
        latitude: 28.6289,
        longitude: 77.2065,
        radius: 150,
        address: 'Rajiv Gandhi Bhawan, Safdarjung Airport, New Delhi 110003',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'AAI Northern Regional Office',
        code: 'AAINRO',
        airportCode: 'AAINRO',
        latitude: 28.5591,
        longitude: 77.1003,
        radius: 150,
        address: 'IGI Airport Complex, New Delhi 110037',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'AAI Southern Regional Office',
        code: 'AAISRO',
        airportCode: 'AAISRO',
        latitude: 12.9941,
        longitude: 80.1697,
        radius: 150,
        address: 'Chennai International Airport, Chennai 600027',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'AAI Western Regional Office',
        code: 'AAIWRO',
        airportCode: 'AAIWRO',
        latitude: 19.0876,
        longitude: 72.8652,
        radius: 150,
        address: 'CSIA Complex, Andheri East, Mumbai 400099',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'AAI Eastern Regional Office',
        code: 'AAIERO',
        airportCode: 'AAIERO',
        latitude: 22.6529,
        longitude: 88.4462,
        radius: 150,
        address: 'NSCBI Airport, Dum Dum, Kolkata 700052',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'AAI North-East Regional Office',
        code: 'AAINEРО',
        airportCode: 'AAINEРО',
        latitude: 26.1061,
        longitude: 91.5859,
        radius: 150,
        address: 'LGBI Airport, Borjhar, Guwahati 781007',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'AAI Training Institute (CATC)',
        code: 'CATC',
        airportCode: 'CATC',
        latitude: 26.2389,
        longitude: 73.0643,
        radius: 200,
        address: 'Civil Aviation Training College, Jodhpur, Rajasthan 342005',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
    {
        name: 'AAI Training Institute (NIAMAR)',
        code: 'NIAMAR',
        airportCode: 'NIAMAR',
        latitude: 28.6370,
        longitude: 77.2223,
        radius: 150,
        address: 'National Institute of Airport Management, New Delhi 110003',
        timezone: 'Asia/Kolkata',
        isActive: true,
    },
];

export async function GET(request) {
    try {
        // Protect with a secret
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');
        if (secret !== SEED_SECRET) {
            return Response.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        const results = { users: [], locations: [], errors: [] };

        // Seed locations
        for (const loc of SEED_LOCATIONS) {
            try {
                const existing = await Location.findOne({ code: loc.code });
                if (!existing) {
                    const created = await Location.create(loc);
                    results.locations.push({ code: loc.code, name: loc.name, id: created._id, status: 'created' });
                } else {
                    // Update existing with new fields
                    await Location.updateOne({ code: loc.code }, { $set: { timezone: loc.timezone, radius: loc.radius } });
                    results.locations.push({ code: loc.code, name: loc.name, id: existing._id, status: 'already_exists' });
                }
            } catch (e) {
                results.errors.push(`Location ${loc.code}: ${e.message}`);
            }
        }

        // Seed users
        for (const userData of SEED_USERS) {
            try {
                const existing = await User.findOne({ email: userData.email });
                if (!existing) {
                    const user = new User(userData);
                    await user.save();
                    await LeaveBalance.create({ userId: user._id });
                    results.users.push({ email: userData.email, id: user._id, status: 'created' });
                } else {
                    results.users.push({ email: userData.email, id: existing._id, status: 'already_exists' });
                }
            } catch (e) {
                results.errors.push(`User ${userData.email}: ${e.message}`);
            }
        }

        return Response.json({
            success: true,
            message: `Database seeded: ${results.locations.filter(l => l.status === 'created').length} locations created`,
            results,
        });
    } catch (error) {
        console.error('[GET /api/seed]', error);
        return Response.json(
            { success: false, message: 'Seed failed: ' + error.message },
            { status: 500 }
        );
    }
}
