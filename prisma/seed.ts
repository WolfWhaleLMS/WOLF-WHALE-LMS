import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.notification.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.permissionSlip.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.message.deleteMany();
  await prisma.discussionPost.deleteMany();
  await prisma.discussion.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.grade.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.rubricRating.deleteMany();
  await prisma.rubricCriterion.deleteMany();
  await prisma.rubric.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.moduleItem.deleteMany();
  await prisma.module.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.parentChild.deleteMany();
  await prisma.user.deleteMany();

  // MASTER ACCOUNT CREDENTIALS
  // ⚠️ CHANGE THESE IN PRODUCTION!
  const MASTER_EMAIL = 'master@learnquest.local';
  const MASTER_PASSWORD = 'MasterAdmin2024!';

  // Hash passwords
  const masterPasswordHash = await bcrypt.hash(MASTER_PASSWORD, 12);
  const demoPasswordHash = await bcrypt.hash('demo123', 12);

  // Create Master Account
  console.log('👑 Creating MASTER account...');
  const master = await prisma.user.create({
    data: {
      email: MASTER_EMAIL,
      password: masterPasswordHash,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'MASTER',
    },
  });

  // Create a sample Admin (created by Master)
  console.log('👤 Creating sample admin...');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@school.local',
      password: demoPasswordHash,
      firstName: 'School',
      lastName: 'Admin',
      role: 'ADMIN',
      createdById: master.id,
    },
  });

  // Create Teachers
  console.log('👨‍🏫 Creating teacher users...');
  const teacher1 = await prisma.user.create({
    data: {
      email: 'mwilson@school.local',
      password: demoPasswordHash,
      firstName: 'Margaret',
      lastName: 'Wilson',
      role: 'TEACHER',
      createdById: admin.id,
    },
  });

  const teacher2 = await prisma.user.create({
    data: {
      email: 'jthunder@school.local',
      password: demoPasswordHash,
      firstName: 'James',
      lastName: 'Thunder',
      role: 'TEACHER',
      createdById: admin.id,
    },
  });

  const teacher3 = await prisma.user.create({
    data: {
      email: 'speters@school.local',
      password: demoPasswordHash,
      firstName: 'Susan',
      lastName: 'Peters',
      role: 'TEACHER',
      createdById: admin.id,
    },
  });

  // Create Students
  console.log('👨‍🎓 Creating student users...');
  const student1 = await prisma.user.create({
    data: {
      email: 'emma.j@school.local',
      password: demoPasswordHash,
      firstName: 'Emma',
      lastName: 'Johnson',
      role: 'STUDENT',
      xp: 2450,
      level: 3,
      streak: 7,
      createdById: admin.id,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'kyle.b@school.local',
      password: demoPasswordHash,
      firstName: 'Kyle',
      lastName: 'Blackwood',
      role: 'STUDENT',
      xp: 1800,
      level: 2,
      streak: 5,
      createdById: admin.id,
    },
  });

  const student3 = await prisma.user.create({
    data: {
      email: 'sarah.m@school.local',
      password: demoPasswordHash,
      firstName: 'Sarah',
      lastName: 'Morrison',
      role: 'STUDENT',
      xp: 3200,
      level: 4,
      streak: 12,
      createdById: admin.id,
    },
  });

  // Create Parent
  console.log('👨‍👩‍👧 Creating parent user...');
  const parent = await prisma.user.create({
    data: {
      email: 'robert.j@parent.local',
      password: demoPasswordHash,
      firstName: 'Robert',
      lastName: 'Johnson',
      role: 'PARENT',
      createdById: admin.id,
    },
  });

  // Link parent to student
  await prisma.parentChild.create({
    data: {
      parentId: parent.id,
      childId: student1.id,
    },
  });

  // ============================================
  // SASKATCHEWAN GRADE 10 CURRICULUM COURSES
  // ============================================
  console.log('📚 Creating Saskatchewan Grade 10 courses...');

  // Foundations of Math 10
  const mathFoundations = await prisma.course.create({
    data: {
      name: 'Foundations of Mathematics 10',
      code: 'FOM10',
      description: 'Saskatchewan curriculum focusing on measurement, surface area, volume, trigonometry, factors, products, and relations/functions.',
      color: '#3b82f6',
      isPublished: true,
      teacherId: teacher1.id,
    },
  });

  // Workplace & Apprenticeship Math 10
  const mathWorkplace = await prisma.course.create({
    data: {
      name: 'Workplace & Apprenticeship Mathematics 10',
      code: 'WAM10',
      description: 'Practical mathematics for workplace applications including unit pricing, currency exchange, income, measurement, and geometry.',
      color: '#f59e0b',
      isPublished: true,
      teacherId: teacher1.id,
    },
  });

  // English Language Arts A10
  const englishA10 = await prisma.course.create({
    data: {
      name: 'English Language Arts A10',
      code: 'ELA-A10',
      description: 'Developing comprehension, composition, and critical thinking through various texts including Indigenous perspectives.',
      color: '#8b5cf6',
      isPublished: true,
      teacherId: teacher3.id,
    },
  });

  // English Language Arts B10
  const englishB10 = await prisma.course.create({
    data: {
      name: 'English Language Arts B10',
      code: 'ELA-B10',
      description: 'Continuation of ELA focusing on analyzing media, creative writing, and oral communication skills.',
      color: '#a855f7',
      isPublished: true,
      teacherId: teacher3.id,
    },
  });

  // Native Studies 10
  const nativeStudies = await prisma.course.create({
    data: {
      name: 'Native Studies 10',
      code: 'NAT10',
      description: 'Exploration of Indigenous peoples in Canada: history, culture, treaties, residential schools, and contemporary issues.',
      color: '#dc2626',
      isPublished: true,
      teacherId: teacher2.id,
    },
  });

  // Science 10
  const science10 = await prisma.course.create({
    data: {
      name: 'Science 10',
      code: 'SCI10',
      description: 'Introduction to climate, ecosystems, chemical reactions, and motion. Includes Indigenous knowledge connections.',
      color: '#22c55e',
      isPublished: true,
      teacherId: teacher3.id,
    },
  });

  // Social Studies 10
  const socialStudies = await prisma.course.create({
    data: {
      name: 'Social Studies 10',
      code: 'SOC10',
      description: 'Canadian history, governance, identity, and citizenship with focus on Saskatchewan and Indigenous perspectives.',
      color: '#0891b2',
      isPublished: true,
      teacherId: teacher2.id,
    },
  });

  // Physical Education 10
  const physEd = await prisma.course.create({
    data: {
      name: 'Physical Education 10',
      code: 'PE10',
      description: 'Developing physical literacy, wellness habits, and active living through various sports and activities.',
      color: '#f97316',
      isPublished: true,
      teacherId: teacher1.id,
    },
  });

  // Arts Education 10
  const artsEd = await prisma.course.create({
    data: {
      name: 'Arts Education 10',
      code: 'ART10',
      description: 'Visual arts, drama, music, and dance exploring creative expression and cultural arts including Indigenous art forms.',
      color: '#ec4899',
      isPublished: true,
      teacherId: teacher3.id,
    },
  });

  // Health Education 10
  const healthEd = await prisma.course.create({
    data: {
      name: 'Health Education 10',
      code: 'HE10',
      description: 'Understanding wellness, mental health, relationships, substance use, and decision-making for healthy lifestyles.',
      color: '#14b8a6',
      isPublished: true,
      teacherId: teacher1.id,
    },
  });

  // Create Enrollments
  console.log('📝 Creating enrollments...');
  await prisma.enrollment.createMany({
    data: [
      // Emma - full course load
      { studentId: student1.id, courseId: mathFoundations.id, currentGrade: 84 },
      { studentId: student1.id, courseId: englishA10.id, currentGrade: 88 },
      { studentId: student1.id, courseId: nativeStudies.id, currentGrade: 91 },
      { studentId: student1.id, courseId: science10.id, currentGrade: 79 },
      { studentId: student1.id, courseId: socialStudies.id, currentGrade: 85 },
      { studentId: student1.id, courseId: physEd.id, currentGrade: 92 },
      // Kyle - mixed courses
      { studentId: student2.id, courseId: mathWorkplace.id, currentGrade: 78 },
      { studentId: student2.id, courseId: englishB10.id, currentGrade: 72 },
      { studentId: student2.id, courseId: nativeStudies.id, currentGrade: 86 },
      { studentId: student2.id, courseId: physEd.id, currentGrade: 95 },
      { studentId: student2.id, courseId: artsEd.id, currentGrade: 88 },
      // Sarah - academic focus
      { studentId: student3.id, courseId: mathFoundations.id, currentGrade: 96 },
      { studentId: student3.id, courseId: englishA10.id, currentGrade: 94 },
      { studentId: student3.id, courseId: science10.id, currentGrade: 92 },
      { studentId: student3.id, courseId: socialStudies.id, currentGrade: 90 },
      { studentId: student3.id, courseId: healthEd.id, currentGrade: 89 },
    ],
  });

  // Create Modules for Foundations of Math 10
  console.log('📦 Creating modules...');
  const mathModule1 = await prisma.module.create({
    data: {
      courseId: mathFoundations.id,
      name: 'Measurement and Unit Conversions',
      description: 'SI and Imperial units, conversions, and applications',
      position: 1,
      isPublished: true,
    },
  });

  const mathModule2 = await prisma.module.create({
    data: {
      courseId: mathFoundations.id,
      name: 'Surface Area and Volume',
      description: '3D objects including prisms, cylinders, pyramids, cones, and spheres',
      position: 2,
      isPublished: true,
    },
  });

  const mathModule3 = await prisma.module.create({
    data: {
      courseId: mathFoundations.id,
      name: 'Right Triangle Trigonometry',
      description: 'Sine, cosine, tangent ratios and solving triangles',
      position: 3,
      isPublished: true,
    },
  });

  // Create Modules for Native Studies 10
  const natModule1 = await prisma.module.create({
    data: {
      courseId: nativeStudies.id,
      name: 'Indigenous Peoples and Worldviews',
      description: 'Understanding diverse Indigenous cultures, languages, and perspectives in Saskatchewan',
      position: 1,
      isPublished: true,
    },
  });

  const natModule2 = await prisma.module.create({
    data: {
      courseId: nativeStudies.id,
      name: 'Treaties and Treaty Relationships',
      description: 'History and significance of Treaties in Saskatchewan, Treaty rights and responsibilities',
      position: 2,
      isPublished: true,
    },
  });

  const natModule3 = await prisma.module.create({
    data: {
      courseId: nativeStudies.id,
      name: 'Residential Schools and Reconciliation',
      description: 'Truth and Reconciliation, impacts on families and communities, paths forward',
      position: 3,
      isPublished: true,
    },
  });

  // Create Module Items and Assignments
  console.log('📋 Creating assignments...');

  // Math Assignments
  const mathItem1 = await prisma.moduleItem.create({
    data: {
      moduleId: mathModule1.id,
      title: 'Unit Conversion Practice',
      type: 'ASSIGNMENT',
      content: 'Practice converting between SI and Imperial units.',
      position: 1,
      isPublished: true,
    },
  });

  await prisma.assignment.create({
    data: {
      moduleItemId: mathItem1.id,
      pointsPossible: 50,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      submissionTypes: 'FILE',
      instructions: 'Complete the unit conversion worksheet. Show all your work.',
    },
  });

  const mathItem2 = await prisma.moduleItem.create({
    data: {
      moduleId: mathModule2.id,
      title: 'Surface Area of 3D Shapes',
      type: 'ASSIGNMENT',
      content: 'Calculate surface area of various 3D objects.',
      position: 1,
      isPublished: true,
    },
  });

  await prisma.assignment.create({
    data: {
      moduleItemId: mathItem2.id,
      pointsPossible: 100,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      submissionTypes: 'FILE,TEXT',
      instructions: 'Calculate the surface area of the given prisms, cylinders, and composite shapes.',
    },
  });

  // Native Studies Assignments
  const natItem1 = await prisma.moduleItem.create({
    data: {
      moduleId: natModule1.id,
      title: 'Indigenous Community Research',
      type: 'ASSIGNMENT',
      content: 'Research and present on an Indigenous community in Saskatchewan.',
      position: 1,
      isPublished: true,
    },
  });

  await prisma.assignment.create({
    data: {
      moduleItemId: natItem1.id,
      pointsPossible: 100,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      submissionTypes: 'FILE,TEXT',
      instructions: 'Research a First Nation or Metis community in Saskatchewan. Include history, culture, and contemporary life.',
    },
  });

  const natItem2 = await prisma.moduleItem.create({
    data: {
      moduleId: natModule2.id,
      title: 'Treaty Analysis Essay',
      type: 'ASSIGNMENT',
      content: 'Analyze the significance of a numbered treaty.',
      position: 1,
      isPublished: true,
    },
  });

  await prisma.assignment.create({
    data: {
      moduleItemId: natItem2.id,
      pointsPossible: 100,
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      submissionTypes: 'FILE',
      instructions: 'Write a 500-word essay analyzing the promises, spirit, and current relevance of a numbered treaty in Saskatchewan.',
    },
  });

  // Create Achievements
  console.log('🏆 Creating achievements...');
  await prisma.achievement.createMany({
    data: [
      {
        name: 'First Steps',
        description: 'Complete your first assignment',
        icon: '🎯',
        xpReward: 50,
        criteria: JSON.stringify({ type: 'submissions', count: 1 }),
      },
      {
        name: 'Perfect Score',
        description: 'Get 100% on an assignment',
        icon: '⭐',
        xpReward: 100,
        criteria: JSON.stringify({ type: 'grade', value: 100 }),
      },
      {
        name: 'Week Warrior',
        description: 'Maintain a 7-day learning streak',
        icon: '🔥',
        xpReward: 150,
        criteria: JSON.stringify({ type: 'streak', count: 7 }),
      },
      {
        name: 'Treaty Scholar',
        description: 'Complete the Treaties module with 90%+',
        icon: '📜',
        xpReward: 200,
        criteria: JSON.stringify({ type: 'module_grade', module: 'treaties', grade: 90 }),
      },
      {
        name: 'Math Master',
        description: 'Score 95%+ on a math assignment',
        icon: '🧮',
        xpReward: 100,
        criteria: JSON.stringify({ type: 'subject_grade', subject: 'math', grade: 95 }),
      },
      {
        name: 'Active Learner',
        description: 'Log in for 30 days total',
        icon: '📚',
        xpReward: 250,
        criteria: JSON.stringify({ type: 'logins', count: 30 }),
      },
    ],
  });

  // Create Announcements
  console.log('📢 Creating announcements...');
  await prisma.announcement.createMany({
    data: [
      {
        courseId: mathFoundations.id,
        authorId: teacher1.id,
        title: 'Welcome to Foundations of Math 10!',
        content: 'Welcome students! This semester we will explore measurement, geometry, trigonometry, and more. Please review the course outline and come prepared with your calculators.',
        isPinned: true,
      },
      {
        courseId: nativeStudies.id,
        authorId: teacher2.id,
        title: 'Orange Shirt Day - September 30',
        content: 'We will be observing Orange Shirt Day on September 30th to honor residential school survivors. Please wear an orange shirt and be prepared for a meaningful class discussion.',
        isPinned: true,
      },
      {
        courseId: englishA10.id,
        authorId: teacher3.id,
        title: 'Novel Study Beginning',
        content: 'We will begin our first novel study next week. Please ensure you have a copy of the assigned reading.',
        isPinned: false,
      },
    ],
  });

  // Create Messages
  console.log('💬 Creating messages...');
  await prisma.message.createMany({
    data: [
      {
        senderId: teacher1.id,
        receiverId: student1.id,
        subject: 'Great work on your trigonometry quiz!',
        content: 'Hi Emma, I wanted to let you know that your trigonometry quiz was excellent. Keep up the great work!',
        isRead: false,
      },
      {
        senderId: teacher2.id,
        receiverId: student1.id,
        subject: 'Treaty research paper feedback',
        content: 'Emma, your research paper showed excellent understanding of Treaty relationships. I particularly appreciated your inclusion of Elder perspectives.',
        isRead: true,
      },
    ],
  });

  // Create Calendar Events
  console.log('📅 Creating calendar events...');
  await prisma.calendarEvent.createMany({
    data: [
      {
        userId: student1.id,
        courseId: mathFoundations.id,
        title: 'Surface Area Test',
        description: 'Unit test covering surface area of 3D shapes',
        startTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        type: 'EXAM',
      },
      {
        userId: student1.id,
        courseId: nativeStudies.id,
        title: 'Treaty Essay Due',
        description: 'Submit treaty analysis essay',
        startTime: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        type: 'ASSIGNMENT',
      },
      {
        userId: student1.id,
        title: 'Parent-Teacher Conferences',
        description: 'Evening conferences 4-8 PM',
        startTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        type: 'PERSONAL',
        allDay: true,
      },
    ],
  });

  // Create Notifications
  console.log('🔔 Creating notifications...');
  await prisma.notification.createMany({
    data: [
      {
        userId: student1.id,
        type: 'ACHIEVEMENT',
        title: 'Achievement Unlocked!',
        message: 'You earned "Week Warrior" for your 7-day streak!',
        link: '/dashboard',
      },
      {
        userId: student1.id,
        type: 'ASSIGNMENT',
        title: 'Assignment Due Soon',
        message: 'Treaty Analysis Essay is due in 3 weeks',
        link: '/courses',
      },
    ],
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n' + '='.repeat(50));
  console.log('📋 ACCOUNT CREDENTIALS');
  console.log('='.repeat(50));
  console.log('\n👑 MASTER ACCOUNT (Change in production!):');
  console.log(`   Email:    ${MASTER_EMAIL}`);
  console.log(`   Password: ${MASTER_PASSWORD}`);
  console.log('\n👤 Sample Admin (password: demo123):');
  console.log('   Email:    admin@school.local');
  console.log('\n👨‍🏫 Sample Teachers (password: demo123):');
  console.log('   Email:    mwilson@school.local');
  console.log('   Email:    jthunder@school.local');
  console.log('   Email:    speters@school.local');
  console.log('\n👨‍🎓 Sample Students (password: demo123):');
  console.log('   Email:    emma.j@school.local');
  console.log('   Email:    kyle.b@school.local');
  console.log('   Email:    sarah.m@school.local');
  console.log('\n👨‍👩‍👧 Sample Parent (password: demo123):');
  console.log('   Email:    robert.j@parent.local');
  console.log('='.repeat(50));
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
