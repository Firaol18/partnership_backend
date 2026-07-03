// prisma/seed.ts
import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create permissions with resource/action format
  const permissions: Prisma.PermissionCreateManyInput[] = [
    // User permissions
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'create' },
    { resource: 'users', action: 'update' },
    { resource: 'users', action: 'delete' },
    { resource: 'users', action: 'manage' },

    // Role permissions
    { resource: 'roles', action: 'read' },
    { resource: 'roles', action: 'create' },
    { resource: 'roles', action: 'update' },
    { resource: 'roles', action: 'delete' },
    { resource: 'roles', action: 'manage' },

    // Division permissions
    { resource: 'divisions', action: 'read' },
    { resource: 'divisions', action: 'create' },
    { resource: 'divisions', action: 'update' },
    { resource: 'divisions', action: 'delete' },
    { resource: 'divisions', action: 'manage' },

    // Permission management
    { resource: 'permissions', action: 'read' },
    { resource: 'permissions', action: 'assign' },
    { resource: 'permissions', action: 'revoke' },

    // Activity log permissions
    { resource: 'activity-logs', action: 'read' },
    { resource: 'activity-logs', action: 'delete' },

    // Profile management
    { resource: 'profile', action: 'read' },
    { resource: 'profile', action: 'update' },
    { resource: 'profile', action: 'change-password' },

    // Auth permissions
    { resource: 'auth', action: 'login' },
    { resource: 'auth', action: 'register' },
    { resource: 'auth', action: 'refresh' },
    { resource: 'auth', action: 'logout' },
    { resource: 'auth', action: 'verify-email' },

    // Division permissions
    { resource: 'divisions', action: 'read' },
    { resource: 'divisions', action: 'create' },
    { resource: 'divisions', action: 'update' },
    { resource: 'divisions', action: 'delete' },
    { resource: 'divisions', action: 'manage' },
    { resource: 'divisions', action: 'assign-director' },
    { resource: 'divisions', action: 'remove-director' },

    // Event permissions
    { resource: 'events', action: 'read' },
    { resource: 'events', action: 'create' },
    { resource: 'events', action: 'update' },
    { resource: 'events', action: 'delete' },
    { resource: 'events', action: 'manage' },
    { resource: 'events', action: 'add-participant' },
    { resource: 'events', action: 'remove-participant' },
    { resource: 'events', action: 'add-eaii-participant' },
    { resource: 'events', action: 'remove-eaii-participant' },
    { resource: 'events', action: 'add-budget' },
    { resource: 'events', action: 'update-budget' },
    { resource: 'events', action: 'create-outcome' },
    { resource: 'events', action: 'read-outcomes' },
    { resource: 'events', action: 'update-outcome' },
    { resource: 'events', action: 'delete-outcome' },
    { resource: 'events', action: 'verify' },
    { resource: 'events', action: 'review' },

    // Permission permissions
    { resource: 'permissions', action: 'read' },
    { resource: 'permissions', action: 'assign' },
    { resource: 'permissions', action: 'revoke' },
    { resource: 'permissions', action: 'activate' },
    { resource: 'permissions', action: 'deactivate' },
    { resource: 'permissions', action: 'toggle-active' },
    { resource: 'permissions', action: 'permanent-delete' },

    // Role permissions
    { resource: 'roles', action: 'read' },
    { resource: 'roles', action: 'create' },
    { resource: 'roles', action: 'update' },
    { resource: 'roles', action: 'delete' },
    { resource: 'roles', action: 'manage' },
    { resource: 'roles', action: 'assign-permission' },
    { resource: 'roles', action: 'remove-permission' },
    { resource: 'roles', action: 'assign-permissions' },
    { resource: 'roles', action: 'remove-permissions' },

    // User permissions
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'create' },
    { resource: 'users', action: 'update' },
    { resource: 'users', action: 'delete' },
    { resource: 'users', action: 'manage' },
    { resource: 'users', action: 'verify-email' },
    { resource: 'users', action: 'permanent-delete' },

    // Visit permissions
    { resource: 'visits', action: 'read' },
    { resource: 'visits', action: 'create' },
    { resource: 'visits', action: 'update' },
    { resource: 'visits', action: 'delete' },
    { resource: 'visits', action: 'manage' },
    { resource: 'visits', action: 'add-delegate' },
    { resource: 'visits', action: 'remove-delegate' },
    { resource: 'visits', action: 'update-delegate-status' },
    { resource: 'visits', action: 'create-outcome' },
    { resource: 'visits', action: 'read-outcomes' },
    { resource: 'visits', action: 'update-outcome' },
    { resource: 'visits', action: 'delete-outcome' },
    { resource: 'visits', action: 'verify' },
    { resource: 'visits', action: 'review' },
  ];

  console.log('📝 Creating permissions...');

  // Create permissions one by one to handle duplicates gracefully
  for (const permission of permissions) {
    try {
      await prisma.permission.upsert({
        where: {
          resource_action: {
            resource: permission.resource,
            action: permission.action,
          },
        },
        update: {},
        create: {
          id: randomUUID(),
          resource: permission.resource,
          action: permission.action,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error(
        `Failed to create permission ${permission.resource}:${permission.action}`,
        error,
      );
    }
  }

  console.log('✅ Permissions created successfully');

  // Create admin role with explicit UUID
  console.log('👤 Creating admin role...');
  const adminRoleId = randomUUID();
  const adminRole = await prisma.role.upsert({
    where: { name: 'admin' },
    update: {
      description: 'Administrator with full access',
      updatedAt: new Date(),
    },
    create: {
      id: adminRoleId,
      name: 'admin',
      description: 'Administrator with full access',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create manager role with explicit UUID
  console.log('👤 Creating manager role...');
  const managerRoleId = randomUUID();
  const managerRole = await prisma.role.upsert({
    where: { name: 'manager' },
    update: {
      description: 'Manager with elevated access',
      updatedAt: new Date(),
    },
    create: {
      id: managerRoleId,
      name: 'manager',
      description: 'Manager with elevated access',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  // Create user role with explicit UUID
  console.log('👤 Creating user role...');
  const userRoleId = randomUUID();
  const userRole = await prisma.role.upsert({
    where: { name: 'user' },
    update: {
      description: 'Regular user with basic access',
      updatedAt: new Date(),
    },
    create: {
      id: userRoleId,
      name: 'user',
      description: 'Regular user with basic access',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Roles created successfully');

  // Assign all permissions to admin role
  console.log('🔐 Assigning permissions to roles...');
  const allPermissions = await prisma.permission.findMany();

  // Admin gets all permissions
  for (const permission of allPermissions) {
    try {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          id: randomUUID(),
          roleId: adminRole.id,
          permissionId: permission.id,
          createdAt: new Date(),
        },
      });
    } catch (error) {
      console.error(
        `Failed to assign permission ${permission.id} to admin role`,
        error,
      );
    }
  }

  // Manager gets read and update permissions for most resources
  const managerPermissions = allPermissions.filter(
    (p) =>
      p.action === 'read' || p.action === 'update' || p.action === 'create',
  );

  for (const permission of managerPermissions) {
    try {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: managerRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          id: randomUUID(),
          roleId: managerRole.id,
          permissionId: permission.id,
          createdAt: new Date(),
        },
      });
    } catch (error) {
      console.error(
        `Failed to assign permission ${permission.id} to manager role`,
        error,
      );
    }
  }

  // User gets only read permissions for limited resources
  const userPermissions = allPermissions.filter(
    (p) =>
      (p.resource === 'users' || p.resource === 'profile') &&
      (p.action === 'read' ||
        p.action === 'update' ||
        p.action === 'change-password'),
  );

  for (const permission of userPermissions) {
    try {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: userRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          id: randomUUID(),
          roleId: userRole.id,
          permissionId: permission.id,
          createdAt: new Date(),
        },
      });
    } catch (error) {
      console.error(
        `Failed to assign permission ${permission.id} to user role`,
        error,
      );
    }
  }

  console.log('✅ Permissions assigned successfully');

  // Create divisions with explicit UUIDs
  console.log('🏢 Creating divisions...');

  const headquartersId = randomUUID();
  const defaultDivision = await prisma.division.upsert({
    where: { name: 'Headquarters' },
    update: {
      updatedAt: new Date(),
    },
    create: {
      id: headquartersId,
      name: 'Headquarters',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const itDivisionId = randomUUID();
  const itDivision = await prisma.division.upsert({
    where: { name: 'Information Technology' },
    update: {
      updatedAt: new Date(),
    },
    create: {
      id: itDivisionId,
      name: 'Information Technology',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const hrDivisionId = randomUUID();
  const hrDivision = await prisma.division.upsert({
    where: { name: 'Human Resources' },
    update: {
      updatedAt: new Date(),
    },
    create: {
      id: hrDivisionId,
      name: 'Human Resources',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  console.log('✅ Divisions created successfully');

  // Create partner registration lookup tables
  console.log('🤝 Creating partner lookup tables...');
  const partnerLookupPrisma: any = prisma;

  const organizationTypes = [
    'Government',
    'University',
    'Research Institute',
    'Private Company',
    'Startup',
    'Development Partner',
    'NGO',
    'International Organization',
    'Embassy',
    'Civil Society',
    'Other',
  ];

  for (const typeName of organizationTypes) {
    await partnerLookupPrisma.organizationType.upsert({
      where: { typeName },
      update: { updatedAt: new Date() },
      create: {
        id: randomUUID(),
        typeName,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  const partnerClassifications = [
    'Strategic Partner',
    'Technical Partner',
    'Academic Partner',
    'Funding Partner',
    'Industry Partner',
    'Innovation Partner',
    'Implementing Partner',
    'Other',
  ];

  for (const classificationName of partnerClassifications) {
    await partnerLookupPrisma.partnerClassification.upsert({
      where: { classificationName },
      update: { updatedAt: new Date() },
      create: {
        id: randomUUID(),
        classificationName,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  const partnerStatuses = [
    'Prospect',
    'Under Discussion',
    'Active',
    'Dormant',
    'Expired',
    'Terminated',
  ];

  for (const statusName of partnerStatuses) {
    await partnerLookupPrisma.partnerStatus.upsert({
      where: { statusName },
      update: { updatedAt: new Date() },
      create: {
        id: randomUUID(),
        statusName,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  console.log('✅ Partner lookup tables created successfully');

  // Create event types
  console.log('📅 Creating event types...');
  const eventTypes = [
    { typeName: 'Conference', description: 'Large-scale professional gathering' },
    { typeName: 'Workshop', description: 'Interactive skill-building session' },
    { typeName: 'Seminar', description: 'Educational presentation or lecture' },
    { typeName: 'Training', description: 'Instructional program for skill development' },
    { typeName: 'Exhibition', description: 'Display or showcase of products/services' },
  ];

  for (const eventType of eventTypes) {
    await prisma.eventType.upsert({
      where: { typeName: eventType.typeName },
      update: { description: eventType.description, updatedAt: new Date() },
      create: {
        id: randomUUID(),
        typeName: eventType.typeName,
        description: eventType.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  console.log('✅ Event types created successfully');

  // Create event categories
  console.log('📁 Creating event categories...');
  const eventCategories = [
    { categoryName: 'Technology', description: 'Tech-related events' },
    { categoryName: 'Business', description: 'Business and entrepreneurship events' },
    { categoryName: 'Education', description: 'Educational events' },
    { categoryName: 'Networking', description: 'Professional networking events' },
    { categoryName: 'Government', description: 'Government and policy events' },
  ];

  for (const eventCategory of eventCategories) {
    await prisma.eventCategory.upsert({
      where: { categoryName: eventCategory.categoryName },
      update: { description: eventCategory.description, updatedAt: new Date() },
      create: {
        id: randomUUID(),
        categoryName: eventCategory.categoryName,
        description: eventCategory.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  console.log('✅ Event categories created successfully');

  // Create event modes
  console.log('🎯 Creating event modes...');
  const eventModes = [
    { modeName: 'Physical', description: 'In-person event at a venue' },
    { modeName: 'Virtual', description: 'Online/virtual event' },
    { modeName: 'Hybrid', description: 'Combination of physical and virtual' },
  ];

  for (const eventMode of eventModes) {
    await prisma.eventMode.upsert({
      where: { modeName: eventMode.modeName },
      update: { description: eventMode.description, updatedAt: new Date() },
      create: {
        id: randomUUID(),
        modeName: eventMode.modeName,
        description: eventMode.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  console.log('✅ Event modes created successfully');

  // Create visit types
  console.log('📋 Creating visit types...');
  const visitTypes = [
    { typeName: 'Official Visit', description: 'Formal visit with official delegation' },
    { typeName: 'Working Visit', description: 'Working-level visit for technical discussions' },
    { typeName: 'Fact-Finding Visit', description: 'Visit to gather information and assess conditions' },
    { typeName: 'Monitoring Visit', description: 'Visit to monitor ongoing projects or activities' },
    { typeName: 'Inspection Visit', description: 'Visit for inspection and quality assurance' },
  ];

  for (const visitType of visitTypes) {
    await prisma.visitType.upsert({
      where: { typeName: visitType.typeName },
      update: { description: visitType.description, updatedAt: new Date() },
      create: {
        id: randomUUID(),
        typeName: visitType.typeName,
        description: visitType.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  console.log('✅ Visit types created successfully');

  // Create visit categories
  console.log('📁 Creating visit categories...');
  const visitCategories = [
    { categoryName: 'Domestic', description: 'Visit within the country' },
    { categoryName: 'International', description: 'Visit to foreign countries' },
    { categoryName: 'Field', description: 'Visit to field locations or project sites' },
    { categoryName: 'Office', description: 'Visit to office locations' },
    { categoryName: 'Virtual', description: 'Virtual/remote visit' },
  ];

  for (const visitCategory of visitCategories) {
    await prisma.visitCategory.upsert({
      where: { categoryName: visitCategory.categoryName },
      update: { description: visitCategory.description, updatedAt: new Date() },
      create: {
        id: randomUUID(),
        categoryName: visitCategory.categoryName,
        description: visitCategory.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  console.log('✅ Visit categories created successfully');

  // Create communication types
  console.log('📧 Creating communication types...');
  const communicationTypes = [
    { typeName: 'Email', description: 'Email communication' },
    { typeName: 'Letter', description: 'Formal letter correspondence' },
    { typeName: 'Memo', description: 'Internal memorandum' },
    { typeName: 'Meeting Minutes', description: 'Meeting minutes and proceedings' },
    { typeName: 'Phone Call', description: 'Phone conversation record' },
  ];

  for (const commType of communicationTypes) {
    await prisma.communicationType.upsert({
      where: { typeName: commType.typeName },
      update: { description: commType.description, updatedAt: new Date() },
      create: {
        id: randomUUID(),
        typeName: commType.typeName,
        description: commType.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  console.log('✅ Communication types created successfully');

  // Create engagement types
  console.log('🤝 Creating engagement types...');
  const engagementTypes = [
    { typeName: 'Partnership Agreement', description: 'Formal partnership agreement' },
    { typeName: 'MoU', description: 'Memorandum of Understanding' },
    { typeName: 'Joint Project', description: 'Collaborative project engagement' },
    { typeName: 'Technical Assistance', description: 'Technical support and assistance' },
    { typeName: 'Capacity Building', description: 'Training and capacity development' },
    { typeName: 'Research Collaboration', description: 'Joint research initiative' },
  ];

  for (const engType of engagementTypes) {
    await prisma.engagementType.upsert({
      where: { typeName: engType.typeName },
      update: { description: engType.description, updatedAt: new Date() },
      create: {
        id: randomUUID(),
        typeName: engType.typeName,
        description: engType.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  console.log('✅ Engagement types created successfully');

  // Create opportunity categories
  console.log('📁 Creating opportunity categories...');
  const opportunityCategories = [
    { name: 'Technology', description: 'Technology-related partnership opportunities' },
    { name: 'Research & Development', description: 'R&D collaboration opportunities' },
    { name: 'Capacity Building', description: 'Training and skills development opportunities' },
    { name: 'Infrastructure', description: 'Infrastructure development opportunities' },
    { name: 'Funding & Grants', description: 'Funding and grant opportunities' },
  ];

  for (const category of opportunityCategories) {
    await prisma.opportunityCategory.upsert({
      where: { name: category.name },
      update: { description: category.description, updatedAt: new Date() },
      create: {
        id: randomUUID(),
        name: category.name,
        description: category.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  console.log('✅ Opportunity categories created successfully');

  // Create strategic importance levels
  console.log('⭐ Creating strategic importance levels...');
  const importanceLevels = [
    { levelName: 'Critical', description: 'High priority, strategic importance' },
    { levelName: 'High', description: 'Important for organizational goals' },
    { levelName: 'Medium', description: 'Moderate strategic value' },
    { levelName: 'Low', description: 'Low strategic priority' },
  ];

  for (const level of importanceLevels) {
    await prisma.strategicImportanceLevel.upsert({
      where: { levelName: level.levelName },
      update: { description: level.description, updatedAt: new Date() },
      create: {
        id: randomUUID(),
        levelName: level.levelName,
        description: level.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  console.log('✅ Strategic importance levels created successfully');

  // Create opportunity sources
  console.log('📡 Creating opportunity sources...');
  const opportunitySources = [
    { sourceName: 'Partner Proposal', description: 'Opportunity proposed by partner organization' },
    { sourceName: 'Internal Identification', description: 'Identified internally by team' },
    { sourceName: 'Government Initiative', description: 'From government programs or initiatives' },
    { sourceName: 'International Organization', description: 'From UN, AU, or other international bodies' },
    { sourceName: 'Donor Agency', description: 'From bilateral or multilateral donors' },
    { sourceName: 'Market Research', description: 'Identified through market research' },
  ];

  for (const source of opportunitySources) {
    await prisma.opportunitySource.upsert({
      where: { sourceName: source.sourceName },
      update: { description: source.description, updatedAt: new Date() },
      create: {
        id: randomUUID(),
        sourceName: source.sourceName,
        description: source.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  console.log('✅ Opportunity sources created successfully');

  // Create agreement types
  console.log('📜 Creating agreement types...');
  const agreementTypes = [
    { typeName: 'MoU', description: 'Memorandum of Understanding' },
    { typeName: 'MoA', description: 'Memorandum of Agreement' },
    { typeName: 'Contract', description: 'Formal contract agreement' },
    { typeName: 'Grant Agreement', description: 'Funding or grant agreement' },
    { typeName: 'Research Agreement', description: 'Collaborative research agreement' },
    { typeName: 'NDA', description: 'Non-Disclosure Agreement' },
    { typeName: 'Other', description: 'Other agreement types' },
  ];

  for (const type of agreementTypes) {
    await prisma.agreementType.upsert({
      where: { typeName: type.typeName },
      update: { description: type.description, updatedAt: new Date() },
      create: {
        id: randomUUID(),
        typeName: type.typeName,
        description: type.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  console.log('✅ Agreement types created successfully');

  // Create document types
  console.log('📂 Creating document types...');
  const documentTypes = [
    { name: 'Agenda', description: 'Meeting or event agenda' },
    { name: 'Attendance Sheet', description: 'Participant attendance record' },
    { name: 'Presentation', description: 'Slide deck or presentation materials' },
    { name: 'MoU Draft', description: 'Draft Memorandum of Understanding' },
    { name: 'Signed Agreement', description: 'Signed partnership agreement' },
    { name: 'Proposal', description: 'Project or partnership proposal' },
    { name: 'Report', description: 'Progress, final, or thematic report' },
    { name: 'Financial Document', description: 'Budgets, financial reports, or grants' },
    { name: 'Letter', description: 'Official incoming or outgoing correspondence' },
    { name: 'Other', description: 'Other document types' },
  ];

  for (const type of documentTypes) {
    await prisma.documentType.upsert({
      where: { name: type.name },
      update: { description: type.description, updatedAt: new Date() },
      create: {
        id: randomUUID(),
        name: type.name,
        description: type.description,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  console.log('✅ Document types created successfully');



  // Create admin user with explicit UUID
  console.log('👤 Creating admin user...');
  const adminUserId = randomUUID();
  const hashedPassword = await bcrypt.hash('Admin@123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {
      passwordHash: hashedPassword,
      fullName: 'System Administrator',
      status: 'ACTIVE',
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      updatedAt: new Date(),
      divisionId: defaultDivision.id,
    },
    create: {
      id: adminUserId,
      email: 'admin@example.com',
      passwordHash: hashedPassword,
      fullName: 'System Administrator',
      status: 'ACTIVE',
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      divisionId: defaultDivision.id,
      lastPasswordChangeAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      userRoles: {
        create: {
          id: randomUUID(),
          roleId: adminRole.id,
          createdAt: new Date(),
        },
      },
    },
  });

  console.log('✅ Admin user created successfully');

  // Create a manager user with explicit UUID
  console.log('👤 Creating manager user...');
  const managerUserId = randomUUID();
  const managerPassword = await bcrypt.hash('Manager@123', 10);

  const managerUser = await prisma.user.upsert({
    where: { email: 'manager@example.com' },
    update: {
      passwordHash: managerPassword,
      fullName: 'Department Manager',
      status: 'ACTIVE',
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      updatedAt: new Date(),
      divisionId: defaultDivision.id,
    },
    create: {
      id: managerUserId,
      email: 'manager@example.com',
      passwordHash: managerPassword,
      fullName: 'Department Manager',
      status: 'ACTIVE',
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      divisionId: defaultDivision.id,
      position: 'Department Manager',
      lastPasswordChangeAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      userRoles: {
        create: {
          id: randomUUID(),
          roleId: managerRole.id,
          createdAt: new Date(),
        },
      },
    },
  });

  console.log('✅ Manager user created successfully');

  // Create a regular user with explicit UUID
  console.log('👤 Creating regular user...');
  const regularUserId = randomUUID();
  const userPassword = await bcrypt.hash('User@123', 10);

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {
      passwordHash: userPassword,
      fullName: 'Regular User',
      status: 'ACTIVE',
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      updatedAt: new Date(),
      divisionId: itDivision.id,
    },
    create: {
      id: regularUserId,
      email: 'user@example.com',
      passwordHash: userPassword,
      fullName: 'Regular User',
      status: 'ACTIVE',
      isEmailVerified: true,
      emailVerifiedAt: new Date(),
      divisionId: itDivision.id,
      position: 'Software Developer',
      lastPasswordChangeAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      userRoles: {
        create: {
          id: randomUUID(),
          roleId: userRole.id,
          createdAt: new Date(),
        },
      },
    },
  });

  console.log('✅ Regular user created successfully');

  // Create an inactive user with explicit UUID
  console.log('👤 Creating inactive user...');
  const inactiveUserId = randomUUID();
  const inactivePassword = await bcrypt.hash('Inactive@123', 10);

  const inactiveUser = await prisma.user.upsert({
    where: { email: 'inactive@example.com' },
    update: {
      passwordHash: inactivePassword,
      fullName: 'Inactive User',
      status: 'INACTIVE',
      updatedAt: new Date(),
      divisionId: hrDivision.id,
    },
    create: {
      id: inactiveUserId,
      email: 'inactive@example.com',
      passwordHash: inactivePassword,
      fullName: 'Inactive User',
      status: 'INACTIVE',
      isEmailVerified: false,
      divisionId: hrDivision.id,
      position: 'HR Assistant',
      lastPasswordChangeAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      userRoles: {
        create: {
          id: randomUUID(),
          roleId: userRole.id,
          createdAt: new Date(),
        },
      },
    },
  });

  console.log('✅ Inactive user created successfully');

  // Create an unverified user with explicit UUID
  console.log('👤 Creating unverified user...');
  const unverifiedUserId = randomUUID();
  const unverifiedPassword = await bcrypt.hash('Unverified@123', 10);

  const unverifiedUser = await prisma.user.upsert({
    where: { email: 'unverified@example.com' },
    update: {
      passwordHash: unverifiedPassword,
      fullName: 'Unverified User',
      status: 'ACTIVE',
      isEmailVerified: false,
      updatedAt: new Date(),
      divisionId: defaultDivision.id,
    },
    create: {
      id: unverifiedUserId,
      email: 'unverified@example.com',
      passwordHash: unverifiedPassword,
      fullName: 'Unverified User',
      status: 'ACTIVE',
      isEmailVerified: false,
      divisionId: defaultDivision.id,
      position: 'Intern',
      lastPasswordChangeAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
      userRoles: {
        create: {
          id: randomUUID(),
          roleId: userRole.id,
          createdAt: new Date(),
        },
      },
    },
  });

  console.log('✅ Unverified user created successfully');

  // Create some activity logs for testing
  console.log('📝 Creating activity logs...');

  await prisma.userActivityLog.createMany({
    data: [
      {
        id: randomUUID(),
        userId: adminUser.id,
        action: 'LOGIN',
        entityType: 'User',
        entityId: adminUser.id,
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 3600000), // 1 hour ago
      },
      {
        id: randomUUID(),
        userId: adminUser.id,
        action: 'CREATE',
        entityType: 'User',
        entityId: regularUser.id,
        newValues: { email: 'user@example.com', fullName: 'Regular User' },
        createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
      },
      {
        id: randomUUID(),
        userId: managerUser.id,
        action: 'UPDATE',
        entityType: 'Division',
        entityId: defaultDivision.id,
        oldValues: { name: 'Headquarters' },
        newValues: { name: 'HQ' },
        createdAt: new Date(Date.now() - 1200000), // 20 minutes ago
      },
      {
        id: randomUUID(),
        userId: adminUser.id,
        action: 'LOGIN',
        entityType: 'User',
        entityId: adminUser.id,
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 600000), // 10 minutes ago
      },
      {
        id: randomUUID(),
        userId: regularUser.id,
        action: 'LOGIN',
        entityType: 'User',
        entityId: regularUser.id,
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 300000), // 5 minutes ago
      },
    ],
  });

  console.log('✅ Activity logs created successfully');

  // Log seeding summary
  console.log('\n📊 Seeding Summary:');
  console.log('===================');
  console.log(`✅ ${allPermissions.length} permissions created`);
  console.log('✅ 3 roles created (admin, manager, user)');
  console.log(
    '✅ 3 divisions created (Headquarters, Information Technology, Human Resources)',
  );
  console.log('✅ 5 event types created (Conference, Workshop, Seminar, Training, Exhibition)');
  console.log('✅ 5 event categories created (Technology, Business, Education, Networking, Government)');
  console.log('✅ 3 event modes created (Physical, Virtual, Hybrid)');
  console.log('✅ 5 visit types created (Official Visit, Working Visit, Fact-Finding Visit, Monitoring Visit, Inspection Visit)');
  console.log('✅ 5 visit categories created (Domestic, International, Field, Office, Virtual)');
  console.log('✅ 5 communication types created (Email, Letter, Memo, Meeting Minutes, Phone Call)');
  console.log('✅ 6 engagement types created (Partnership Agreement, MoU, Joint Project, Technical Assistance, Capacity Building, Research Collaboration)');
  console.log('✅ 7 agreement types created (MoU, MoA, Contract, Grant Agreement, Research Agreement, NDA, Other)');
  console.log('✅ 10 document types created (Agenda, Attendance Sheet, Presentation, MoU Draft, Signed Agreement, etc.)');
  console.log('✅ 5 opportunity categories created (Technology, Research & Development, Capacity Building, Infrastructure, Funding & Grants)');
  console.log('✅ 4 strategic importance levels created (Critical, High, Medium, Low)');
  console.log('✅ 6 opportunity sources created (Partner Proposal, Internal Identification, Government Initiative, International Organization, Donor Agency, Market Research)');
  console.log('✅ 11 organization types created (Government, University, Research Institute, Private Company, Startup, NGO, etc.)');
  console.log('✅ 8 partner classifications created (Strategic Partner, Technical Partner, Academic Partner, etc.)');
  console.log('✅ 6 partner statuses created (Prospect, Under Discussion, Active, Dormant, Expired, Terminated)');
  console.log('✅ 5 users created:');
  console.log('   - admin@example.com / Admin@123 (Admin, Headquarters)');
  console.log('   - manager@example.com / Manager@123 (Manager, Headquarters)');
  console.log('   - user@example.com / User@123 (User, IT)');
  console.log('   - inactive@example.com / Inactive@123 (Inactive, HR)');
  console.log(
    '   - unverified@example.com / Unverified@123 (Unverified, Headquarters)',
  );
  console.log('✅ 5 activity logs created');
  console.log('\n🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
