import { PrismaClient, UserRole, CustomerStatus, CustomerSource, InteractionType, InteractionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Check if admin already exists to avoid duplicate seed
  const existing = await prisma.user.findUnique({ where: { email: 'admin@crmcare.local' } });
  if (existing) {
    console.log('✅ Database already seeded. Skipping.');
    return;
  }

  // ─── Users ───────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@CRM2024!', 12);
  const managerPassword = await bcrypt.hash('Manager@CRM2024!', 12);
  const staffPassword = await bcrypt.hash('Staff@CRM2024!', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'Quản Trị Viên',
      email: 'admin@crmcare.local',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Nguyễn Văn Quản Lý',
      email: 'manager@crmcare.local',
      passwordHash: managerPassword,
      role: UserRole.MANAGER,
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: 'Trần Thị Nhân Viên',
      email: 'staff@crmcare.local',
      passwordHash: staffPassword,
      role: UserRole.STAFF,
    },
  });

  console.log(`✅ Created ${3} users`);

  // ─── Customers ───────────────────────────────────────────────────────────────
  const customerData = [
    { code: 'CUS001', name: 'Công ty TNHH TechViet', email: 'contact@techviet.vn', phone: '024-3823-1000', company: 'TechViet', address: '12 Lý Thường Kiệt, Hoàn Kiếm, Hà Nội', status: CustomerStatus.ACTIVE, source: CustomerSource.REFERRAL },
    { code: 'CUS002', name: 'Tập đoàn FPT Software', email: 'biz@fpt.com.vn', phone: '024-7300-7300', company: 'FPT Software', address: 'Tòa nhà FPT, Cầu Giấy, Hà Nội', status: CustomerStatus.ACTIVE, source: CustomerSource.WEBSITE },
    { code: 'CUS003', name: 'Vinamilk Corporation', email: 'info@vinamilk.com.vn', phone: '028-3930-1828', company: 'Vinamilk', address: '10 Tân Trào, Tân Phú, TP.HCM', status: CustomerStatus.ACTIVE, source: CustomerSource.EVENT },
    { code: 'CUS004', name: 'VNG Corporation', email: 'contact@vng.com.vn', phone: '028-7302-3456', company: 'VNG', address: '182 Lê Đại Hành, Q11, TP.HCM', status: CustomerStatus.ACTIVE, source: CustomerSource.SOCIAL_MEDIA },
    { code: 'CUS005', name: 'Momo E-Wallet', email: 'partner@momo.vn', phone: '028-7308-7908', company: 'M_Service', address: '396A Hồng Bàng, Q11, TP.HCM', status: CustomerStatus.PROSPECT, source: CustomerSource.COLD_CALL },
    { code: 'CUS006', name: 'Tiki Corporation', email: 'b2b@tiki.vn', phone: '1800-6035', company: 'Tiki', address: '52 Út Tịch, Tân Bình, TP.HCM', status: CustomerStatus.ACTIVE, source: CustomerSource.REFERRAL },
    { code: 'CUS007', name: 'Shopee Vietnam', email: 'corporate@shopee.vn', phone: '1900-633-370', company: 'Sea Group', address: '14 Phan Đình Giót, Tân Bình, TP.HCM', status: CustomerStatus.ACTIVE, source: CustomerSource.WEBSITE },
    { code: 'CUS008', name: 'Viettel Telecom', email: 'kinhdoanh@viettel.com.vn', phone: '024-6268-3789', company: 'Viettel', address: '1 Giang Văn Minh, Ba Đình, Hà Nội', status: CustomerStatus.INACTIVE, source: CustomerSource.EMAIL_CAMPAIGN },
    { code: 'CUS009', name: 'VNPT Technology', email: 'info@vnpt-technology.vn', phone: '024-3775-8899', company: 'VNPT', address: '57 Huỳnh Thúc Kháng, Đống Đa, Hà Nội', status: CustomerStatus.PROSPECT, source: CustomerSource.EVENT },
    { code: 'CUS010', name: 'Grab Vietnam', email: 'partnervn@grab.com', phone: '1800-1005', company: 'Grab', address: '17 Nguyễn Đình Chiểu, Q1, TP.HCM', status: CustomerStatus.ACTIVE, source: CustomerSource.REFERRAL },
    { code: 'CUS011', name: 'Be Group JSC', email: 'business@be.com.vn', phone: '028-3620-6789', company: 'Be Group', address: '231 Đinh Tiên Hoàng, Bình Thạnh, TP.HCM', status: CustomerStatus.PROSPECT, source: CustomerSource.COLD_CALL },
    { code: 'CUS012', name: 'Saigon Co.op', email: 'info@co-opmart.com.vn', phone: '028-3930-5555', company: 'Saigon Co.op', address: '199-205 Nguyễn Thái Học, Q1, TP.HCM', status: CustomerStatus.ACTIVE, source: CustomerSource.WEBSITE },
    { code: 'CUS013', name: 'Hoa Phat Group', email: 'contact@hoaphat.com.vn', phone: '024-3974-2888', company: 'Hoa Phat', address: 'Tòa nhà Hoa Phát, Hoàng Đạo Thúy, Hà Nội', status: CustomerStatus.ACTIVE, source: CustomerSource.EVENT },
    { code: 'CUS014', name: 'Masan Consumer', email: 'investor@masanconsumer.com', phone: '028-3947-7788', company: 'Masan Group', address: 'Tầng 12, 289 Trần Hưng Đạo, Q5, TP.HCM', status: CustomerStatus.CHURNED, source: CustomerSource.REFERRAL },
    { code: 'CUS015', name: 'Techcombank', email: 'corporate@techcombank.com.vn', phone: '1800-588-822', company: 'Techcombank', address: '6 Quang Trung, Hoàn Kiếm, Hà Nội', status: CustomerStatus.ACTIVE, source: CustomerSource.SOCIAL_MEDIA },
    { code: 'CUS016', name: 'VPBank Digital', email: 'digital@vpbank.com.vn', phone: '1900-545-415', company: 'VPBank', address: '89 Láng Hạ, Đống Đa, Hà Nội', status: CustomerStatus.PROSPECT, source: CustomerSource.EMAIL_CAMPAIGN },
    { code: 'CUS017', name: 'Zalo Pay', email: 'merchant@zalopay.vn', phone: '028-7100-1688', company: 'Zalo Corp', address: '182 Lê Đại Hành, Q11, TP.HCM', status: CustomerStatus.ACTIVE, source: CustomerSource.SOCIAL_MEDIA },
    { code: 'CUS018', name: 'KMS Technology', email: 'contact@kms-technology.com', phone: '028-3515-0015', company: 'KMS Technology', address: 'Lầu 8, 391A Nam Kỳ Khởi Nghĩa, Q3, TP.HCM', status: CustomerStatus.ACTIVE, source: CustomerSource.REFERRAL },
    { code: 'CUS019', name: 'Fossil Vietnam', email: 'info@fossil.com.vn', phone: '028-3914-5678', company: 'Fossil Group', address: '72 Lê Thánh Tôn, Q1, TP.HCM', status: CustomerStatus.INACTIVE, source: CustomerSource.WEBSITE },
    { code: 'CUS020', name: 'LogiNext Vietnam', email: 'sales@loginextvn.com', phone: '028-6271-6388', company: 'LogiNext', address: 'Tòa nhà Viettel, Nguyễn Thị Minh Khai, Q3, TP.HCM', status: CustomerStatus.PROSPECT, source: CustomerSource.COLD_CALL },
  ];

  const customers = await Promise.all(
    customerData.map((c) =>
      prisma.customer.create({
        data: {
          customerCode: c.code,
          name: c.name,
          email: c.email,
          phone: c.phone,
          company: c.company,
          address: c.address,
          status: c.status,
          source: c.source,
          notes: `Ghi chú khách hàng ${c.name}. Được thêm vào hệ thống CRM Care.`,
        },
      })
    )
  );
  console.log(`✅ Created ${customers.length} customers`);

  // ─── Contacts ────────────────────────────────────────────────────────────────
  const contactData = [
    { ci: 0, name: 'Lê Văn An', email: 'le.van.an@techviet.vn', phone: '0912-345-001', position: 'CEO', department: 'Ban Giám đốc' },
    { ci: 0, name: 'Nguyễn Thị Bích', email: 'nguyen.thi.bich@techviet.vn', phone: '0912-345-002', position: 'CTO', department: 'Công nghệ' },
    { ci: 1, name: 'Trần Văn Cường', email: 'tran.van.cuong@fpt.com.vn', phone: '0912-346-001', position: 'Business Director', department: 'Kinh doanh' },
    { ci: 1, name: 'Phạm Thị Dung', email: 'pham.thi.dung@fpt.com.vn', phone: '0912-346-002', position: 'Account Manager', department: 'Kinh doanh' },
    { ci: 2, name: 'Hoàng Văn Đức', email: 'hoang.van.duc@vinamilk.com.vn', phone: '0912-347-001', position: 'Head of Procurement', department: 'Mua hàng' },
    { ci: 3, name: 'Nguyễn Văn Em', email: 'nguyen.van.em@vng.com.vn', phone: '0912-348-001', position: 'Partnership Manager', department: 'Đối tác' },
    { ci: 4, name: 'Lê Thị Fung', email: 'le.thi.fung@momo.vn', phone: '0912-349-001', position: 'Business Development', department: 'Phát triển kinh doanh' },
    { ci: 5, name: 'Võ Văn Giàu', email: 'vo.van.giau@tiki.vn', phone: '0912-350-001', position: 'Vendor Manager', department: 'Quản lý đối tác' },
    { ci: 6, name: 'Đặng Thị Hà', email: 'dang.thi.ha@shopee.vn', phone: '0912-351-001', position: 'Corporate Affairs', department: 'Quan hệ đối ngoại' },
    { ci: 7, name: 'Bùi Văn Inh', email: 'bui.van.inh@viettel.com.vn', phone: '0912-352-001', position: 'Key Account', department: 'Kinh doanh doanh nghiệp' },
    { ci: 8, name: 'Phan Thị Kim', email: 'phan.thi.kim@vnpt-tech.vn', phone: '0912-353-001', position: 'Sales Manager', department: 'Kinh doanh' },
    { ci: 9, name: 'Lý Văn Long', email: 'ly.van.long@grab.com', phone: '0912-354-001', position: 'Country Manager', department: 'Ban Giám đốc' },
    { ci: 9, name: 'Mai Thị Nga', email: 'mai.thi.nga@grab.com', phone: '0912-354-002', position: 'Operations Lead', department: 'Vận hành' },
    { ci: 10, name: 'Trương Văn Ổn', email: 'truong.van.on@be.com.vn', phone: '0912-355-001', position: 'Head of Sales', department: 'Kinh doanh' },
    { ci: 11, name: 'Đinh Thị Phúc', email: 'dinh.thi.phuc@coop.com.vn', phone: '0912-356-001', position: 'Procurement Director', department: 'Mua hàng' },
    { ci: 12, name: 'Hồ Văn Quang', email: 'ho.van.quang@hoaphat.com.vn', phone: '0912-357-001', position: 'IT Manager', department: 'CNTT' },
    { ci: 13, name: 'Vũ Thị Rạng', email: 'vu.thi.rang@masan.com', phone: '0912-358-001', position: 'Digital Director', department: 'Chuyển đổi số' },
    { ci: 14, name: 'Chu Văn Sơn', email: 'chu.van.son@techcombank.com.vn', phone: '0912-359-001', position: 'Enterprise Account', department: 'Khối doanh nghiệp' },
    { ci: 14, name: 'Ngô Thị Thúy', email: 'ngo.thi.thuy@techcombank.com.vn', phone: '0912-359-002', position: 'Relationship Manager', department: 'Khối doanh nghiệp' },
    { ci: 15, name: 'Đoàn Văn Uy', email: 'doan.van.uy@vpbank.com.vn', phone: '0912-360-001', position: 'Digital Innovation', department: 'Đổi mới sáng tạo' },
    { ci: 16, name: 'Lê Thị Vân', email: 'le.thi.van@zalopay.vn', phone: '0912-361-001', position: 'Partner Manager', department: 'Đối tác' },
    { ci: 17, name: 'Phạm Văn Xuân', email: 'pham.van.xuan@kms-tech.com', phone: '0912-362-001', position: 'Sales Director', department: 'Kinh doanh' },
    { ci: 17, name: 'Tạ Thị Ý', email: 'ta.thi.y@kms-tech.com', phone: '0912-362-002', position: 'Pre-sales Engineer', department: 'Kỹ thuật' },
    { ci: 18, name: 'Phùng Văn Zen', email: 'phung.van.zen@fossil.com.vn', phone: '0912-363-001', position: 'Country Director', department: 'Ban Giám đốc' },
    { ci: 19, name: 'Đỗ Thị Ái', email: 'do.thi.ai@loginext.vn', phone: '0912-364-001', position: 'Regional Sales', department: 'Kinh doanh khu vực' },
    { ci: 2, name: 'Kiều Văn Bình', email: 'kieu.van.binh@vinamilk.com.vn', phone: '0912-347-002', position: 'Supply Chain', department: 'Chuỗi cung ứng' },
    { ci: 5, name: 'Lưu Thị Châu', email: 'luu.thi.chau@tiki.vn', phone: '0912-350-002', position: 'Category Manager', department: 'Danh mục sản phẩm' },
    { ci: 3, name: 'Mã Văn Doanh', email: 'ma.van.doanh@vng.com.vn', phone: '0912-348-002', position: 'Tech Lead', department: 'Công nghệ' },
    { ci: 19, name: 'Nông Thị Ếch', email: 'nong.thi.ech@loginext.vn', phone: '0912-364-002', position: 'Implementation Manager', department: 'Triển khai' },
    { ci: 11, name: 'Ông Văn Phát', email: 'ong.van.phat@coop.com.vn', phone: '0912-356-002', position: 'IT Coordinator', department: 'CNTT' },
  ];

  const contacts = await Promise.all(
    contactData.map((c) =>
      prisma.contact.create({
        data: {
          customerId: customers[c.ci].id,
          name: c.name,
          email: c.email,
          phone: c.phone,
          position: c.position,
          department: c.department,
          notes: `Liên hệ chính của ${customers[c.ci].name}`,
        },
      })
    )
  );
  console.log(`✅ Created ${contacts.length} contacts`);

  // ─── Interactions ─────────────────────────────────────────────────────────────
  const users = [admin, manager, staff];
  const types: InteractionType[] = [InteractionType.CALL, InteractionType.EMAIL, InteractionType.MEETING, InteractionType.SUPPORT];
  const statuses: InteractionStatus[] = [InteractionStatus.COMPLETED, InteractionStatus.PLANNED, InteractionStatus.FOLLOW_UP, InteractionStatus.CANCELLED];

  const interactionTemplates = [
    { title: 'Cuộc gọi tư vấn sản phẩm', content: 'Đã tư vấn chi tiết về giải pháp CRM, khách hàng quan tâm đến module quản lý liên hệ. Cần gửi proposal tuần tới.', type: InteractionType.CALL },
    { title: 'Email giới thiệu dịch vụ', content: 'Gửi email giới thiệu gói dịch vụ Enterprise CRM kèm brochure và case study. Khách hàng phản hồi tích cực.', type: InteractionType.EMAIL },
    { title: 'Họp trực tiếp demo sản phẩm', content: 'Demo hệ thống CRM Care tại văn phòng khách hàng. Tham dự 5 người từ phía khách hàng. Kết quả tốt.', type: InteractionType.MEETING },
    { title: 'Hỗ trợ kỹ thuật cài đặt', content: 'Hỗ trợ khách hàng cài đặt và cấu hình ban đầu. Giải quyết vấn đề kết nối database. Hệ thống hoạt động ổn định.', type: InteractionType.SUPPORT },
    { title: 'Gọi điện theo dõi hài lòng', content: 'Gọi điện hỏi thăm mức độ hài lòng sau 1 tháng sử dụng. Khách hàng hài lòng 8/10, đề xuất thêm tính năng báo cáo.', type: InteractionType.CALL },
    { title: 'Email gửi báo giá', content: 'Gửi báo giá chi tiết cho gói Premium 12 tháng. Đang chờ phê duyệt từ ban giám đốc phía khách hàng.', type: InteractionType.EMAIL },
    { title: 'Cuộc họp thương lượng hợp đồng', content: 'Họp thương lượng các điều khoản hợp đồng. Đã thống nhất về giá và thời gian triển khai. Cần xem xét điều khoản bảo mật.', type: InteractionType.MEETING },
    { title: 'Hỗ trợ xuất báo cáo', content: 'Hỗ trợ khách hàng xuất báo cáo tháng. Hướng dẫn sử dụng tính năng lọc và export Excel.', type: InteractionType.SUPPORT },
    { title: 'Gọi điện nhắc gia hạn', content: 'Thông báo hợp đồng sắp hết hạn sau 30 ngày. Khách hàng đồng ý gia hạn thêm 1 năm với mức giá ưu đãi.', type: InteractionType.CALL },
    { title: 'Email gửi tài liệu hướng dẫn', content: 'Gửi bộ tài liệu hướng dẫn sử dụng đầy đủ cho team của khách hàng. Bao gồm video tutorial và FAQ.', type: InteractionType.EMAIL },
  ];

  const now = new Date();
  const interactionsToCreate = [];
  for (let i = 0; i < 50; i++) {
    const customer = customers[i % customers.length];
    const template = interactionTemplates[i % interactionTemplates.length];
    const user = users[i % users.length];
    // Pick a contact from the same customer if available
    const customerContacts = contacts.filter(c => c.customerId === customer.id);
    const contact = customerContacts.length > 0 ? customerContacts[0] : null;
    const daysAgo = Math.floor(Math.random() * 90);
    const interactionDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    interactionsToCreate.push({
      customerId: customer.id,
      contactId: contact?.id ?? null,
      userId: user.id,
      interactionType: template.type,
      title: template.title,
      content: template.content,
      interactionDate,
      status: statuses[i % statuses.length],
    });
  }

  await prisma.interaction.createMany({ data: interactionsToCreate });
  console.log(`✅ Created 50 interactions`);

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('Demo accounts:');
  console.log('  admin@crmcare.local    / Admin@CRM2024!');
  console.log('  manager@crmcare.local  / Manager@CRM2024!');
  console.log('  staff@crmcare.local    / Staff@CRM2024!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
