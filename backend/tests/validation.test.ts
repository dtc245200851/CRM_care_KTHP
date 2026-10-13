import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Zod schemas corresponding to CRM entities
const customerSchema = z.object({
  name: z.string().min(2, 'Tên khách hàng phải có ít nhất 2 ký tự').max(200),
  email: z.string().email('Email không hợp lệ').optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  company: z.string().max(200).optional().nullable(),
});

const contactSchema = z.object({
  customerId: z.string().min(1, 'CustomerId là bắt buộc'),
  name: z.string().min(2, 'Tên liên hệ phải có ít nhất 2 ký tự').max(100),
  email: z.string().email('Email không hợp lệ').optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
});

const interactionSchema = z.object({
  customerId: z.string().min(1, 'CustomerId là bắt buộc'),
  title: z.string().min(2, 'Tiêu đề phải có ít nhất 2 ký tự').max(200),
  interactionType: z.enum(['CALL', 'EMAIL', 'MEETING', 'SUPPORT', 'OTHER']),
});

describe('CRM Validation Tests', () => {
  it('should validate a valid customer object', () => {
    const validCustomer = {
      name: 'Công ty TNHH Phần Mềm Á Châu',
      email: 'contact@achau.vn',
      phone: '0912345678',
      company: 'Á Châu Software',
    };
    const result = customerSchema.safeParse(validCustomer);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email for customer', () => {
    const invalidCustomer = {
      name: 'Công ty A',
      email: 'not-an-email',
    };
    const result = customerSchema.safeParse(invalidCustomer);
    expect(result.success).toBe(false);
  });

  it('should validate contact schema', () => {
    const validContact = {
      customerId: 'cus_12345',
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@gmail.com',
      phone: '0909123456',
    };
    const result = contactSchema.safeParse(validContact);
    expect(result.success).toBe(true);
  });

  it('should validate interaction schema', () => {
    const validInteraction = {
      customerId: 'cus_12345',
      title: 'Tư vấn giải pháp chuyển đổi số',
      interactionType: 'CALL',
    };
    const result = interactionSchema.safeParse(validInteraction);
    expect(result.success).toBe(true);
  });

  it('should reject invalid interaction type', () => {
    const invalidInteraction = {
      customerId: 'cus_12345',
      title: 'Họp khẩn',
      interactionType: 'INVALID_TYPE',
    };
    const result = interactionSchema.safeParse(invalidInteraction);
    expect(result.success).toBe(false);
  });
});

describe('Security & Auth Tests', () => {
  it('should hash password and verify successfully with bcrypt', async () => {
    const password = 'Admin@CRM2024!';
    const hash = await bcrypt.hash(password, 10);
    expect(hash).not.toBe(password);

    const match = await bcrypt.compare(password, hash);
    expect(match).toBe(true);

    const wrongMatch = await bcrypt.compare('WrongPassword', hash);
    expect(wrongMatch).toBe(false);
  });

  it('should sign and verify JWT tokens correctly', () => {
    const secret = 'super-secure-secret-key-for-testing-only-12345';
    const payload = { userId: 'usr_001', role: 'ADMIN', email: 'admin@crmcare.local' };
    
    const token = jwt.sign(payload, secret, { expiresIn: '1h' });
    expect(typeof token).toBe('string');

    const decoded = jwt.verify(token, secret) as typeof payload;
    expect(decoded.userId).toBe('usr_001');
    expect(decoded.role).toBe('ADMIN');
    expect(decoded.email).toBe('admin@crmcare.local');
  });
});
