import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, targetCorpus, monthlyExpenses, targetYears, monthlySIP } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const fireGoal = await prisma.fIREGoal.create({
      data: {
        userId,
        targetCorpus: targetCorpus || 0,
        monthlyExpenses: monthlyExpenses || 0,
        targetYears: targetYears || 0,
        monthlySIP: monthlySIP || 0,
      },
    })

    return NextResponse.json({ fireGoal }, { status: 201 })
  } catch (error: any) {
    console.error('Save FIRE error:', error)
    return NextResponse.json({ error: 'Failed to save: ' + error.message }, { status: 500 })
  }
}
