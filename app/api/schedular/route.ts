import { globalPrismaClient } from "@/lib/prisma";
import { NextResponse } from "next/server";

// CRITICAL: This route should only be called by a trusted internal scheduler (e.g., a cron job).
// Protect it with a secret token passed as Authorization header.
export async function GET(req: Request) {
    const authHeader = req.headers.get('authorization');
    const schedulerSecret = process.env.SCHEDULER_SECRET;

    if (!schedulerSecret || authHeader !== `Bearer ${schedulerSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const prisma = globalPrismaClient;
        const currentDate = new Date()
        const yesterday = new Date(Date.UTC(currentDate.getUTCFullYear(), currentDate.getUTCMonth(), currentDate.getUTCDate() - 1));

        const users = await prisma.user.findMany({
            select: {
                id: true,
                currentStreak: true,
                maxStreak: true
            }
        });

        for (const user of users) {
            const dailyActivity = await prisma.dailyActivity.findUnique({
                where: {
                    userId_date: { userId: user.id, date: yesterday }
                }
            })
            const maxStreak = user.currentStreak > user.maxStreak ? user.currentStreak : user.maxStreak;
            if (!dailyActivity) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { currentStreak: 0, maxStreak: maxStreak }
                })
            } else {
                await prisma.user.update({ where: { id: user.id }, data: { maxStreak: maxStreak } })
            }
        }
        return NextResponse.json({ message: 'Reset successful' })
    } catch {
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
    }
}
