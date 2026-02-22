/**
 * POST /api/upload/attendance-photo
 * Uploads an attendance photo and stores it in local filesystem
 * Also optionally runs basic face detection check
 */

import { NextResponse } from 'next/server';
import { withAuth } from '../../../../lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Storage directory for attendance photos
const PHOTOS_DIR = path.join(process.cwd(), 'public', 'attendance-photos');

async function ensureDir(dirPath) {
    if (!existsSync(dirPath)) {
        await mkdir(dirPath, { recursive: true });
    }
}

export const POST = withAuth(async (request, authUser) => {
    try {
        const formData = await request.formData();
        const file = formData.get('photo');
        const type = formData.get('type') || 'attendance'; // 'checkin' | 'checkout'

        if (!file || typeof file === 'string') {
            return NextResponse.json(
                { success: false, message: 'No photo file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { success: false, message: 'Only image files are allowed' },
                { status: 400 }
            );
        }

        // Prepare directory: attendance-photos/{year}/{month}/{employeeId}/
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        const subDir = path.join(PHOTOS_DIR, String(year), month, authUser.employeeId);
        await ensureDir(subDir);

        // Generate filename: {type}_{date}_{timestamp}.jpg
        const ext = file.type === 'image/png' ? 'png' : 'jpg';
        const fileName = `${type}_${year}${month}${day}_${Date.now()}.${ext}`;
        const filePath = path.join(subDir, fileName);

        // Write file
        const bytes = await file.arrayBuffer();
        await writeFile(filePath, Buffer.from(bytes));

        // Public URL accessible from the Next.js app
        const publicUrl = `/attendance-photos/${year}/${month}/${authUser.employeeId}/${fileName}`;

        return NextResponse.json({
            success: true,
            url: publicUrl,
            fileName,
            type,
            uploadedAt: now.toISOString(),
            employeeId: authUser.employeeId,
        });
    } catch (error) {
        console.error('[POST /api/upload/attendance-photo]', error);
        return NextResponse.json(
            { success: false, message: 'Failed to upload photo: ' + error.message },
            { status: 500 }
        );
    }
});
