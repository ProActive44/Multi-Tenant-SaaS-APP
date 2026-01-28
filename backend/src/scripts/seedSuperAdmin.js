import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function seedSuperAdmin() {
    try {
        // Validate environment variables
        if (!process.env.SUPER_ADMIN_EMAIL || !process.env.SUPER_ADMIN_PASSWORD) {
            throw new Error('SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set in .env file');
        }

        // Check if Super Admin already exists
        const existing = await prisma.user.findFirst({
            where: { role: 'SUPER_ADMIN' },
        });

        if (existing) {
            console.log('✅ Super Admin already exists');
            console.log(`   Email: ${existing.email}`);
            return;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD, 10);

        // Create Super Admin
        const superAdmin = await prisma.user.create({
            data: {
                email: process.env.SUPER_ADMIN_EMAIL,
                passwordHash: passwordHash,
                firstName: 'Super',
                lastName: 'Admin',
                role: 'SUPER_ADMIN',
                organizationId: null,
                isActive: true,
            },
        });

        console.log('🚀 Super Admin created successfully');
        console.log(`   Email: ${superAdmin.email}`);
        console.log(`   ID: ${superAdmin.id}`);
    } catch (error) {
        console.error('❌ Failed to seed Super Admin:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seedSuperAdmin();

