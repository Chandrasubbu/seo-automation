import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET all projects for current user
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const projects = await prisma.seoProject.findMany({
      where: { userId: user.id },
      include: {
        websites: true,
        audits: {
          take: 1,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, projects });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST create new project
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const { name, description, targetKeyword, clientUrl, websites } = await req.json();

    if (!name || !clientUrl) {
      return NextResponse.json(
        { error: 'Project name and client URL are required' },
        { status: 400 }
      );
    }

    // Create project with websites
    const project = await prisma.seoProject.create({
      data: {
        userId: user.id,
        name,
        description,
        targetKeyword,
        clientUrl,
        websites: {
          create: websites?.map((url: string) => ({
            url,
            type: 'competitor'
          })) || []
        }
      },
      include: {
        websites: true
      }
    });

    return NextResponse.json({ success: true, project }, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
