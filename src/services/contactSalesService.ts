export interface ContactSalesEmailData {
  fullName: string
  companyName: string
  businessEmail: string
  phoneNumber?: string
  subject: string
  message: string
}

export interface ContactSalesEmailParams {
  toName: string
  fromName: string
  fromEmail: string
  companyName: string
  phoneNumber: string
  subject: string
  message: string
}

export interface ContactSalesEmailService {
  sendEmail(params: ContactSalesEmailParams): Promise<void>
}

export function buildContactSalesEmailParams(data: ContactSalesEmailData): ContactSalesEmailParams {
  return {
    toName: 'ITFlow Sales Team',
    fromName: data.fullName,
    fromEmail: data.businessEmail,
    companyName: data.companyName,
    phoneNumber: data.phoneNumber || '',
    subject: data.subject,
    message: data.message,
  }
}

class MockContactSalesEmailService implements ContactSalesEmailService {
  async sendEmail(_params: ContactSalesEmailParams): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 800))
  }
}

export const contactSalesEmailService: ContactSalesEmailService = new MockContactSalesEmailService()

export function buildContactSalesWhatsAppMessage(data: ContactSalesEmailData): string {
  return [
    'Hello,',
    '',
    'I would like to request an ITFlow demo.',
    '',
    `Name: ${data.fullName}`,
    `Company: ${data.companyName}`,
    `Business Email: ${data.businessEmail}`,
    `Phone: ${data.phoneNumber || '-'}`,
    `Subject: ${data.subject}`,
    `Message: ${data.message}`,
  ].join('\n')
}

export function openContactSalesWhatsApp(data: ContactSalesEmailData): void {
  const message = buildContactSalesWhatsAppMessage(data)
  window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
}
