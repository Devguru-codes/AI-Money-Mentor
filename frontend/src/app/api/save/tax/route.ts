import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, financialYear, regime, grossIncome, deductions80C, deductions80D, taxPayable } = body

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const taxProfile = await prisma.taxProfile.create({
      data: {
        userId,
        financialYear: financialYear || '2024-25',
        regime: regime || 'new',
        grossIncome: grossIncome || 0,
        deductions80C: deductions80C || 0,
        deductions80D: deductions80D || 0,
        taxPayable: taxPayable || 0,
      },
    })

    return NextResponse.json({ taxProfile }, { status: 201 })
  } catch (error: any) {
    console.error('Save tax error:', error)
    return NextResponse.json({ error: 'Failed to save: ' + error.message }, { status: 500 })
  }
}
