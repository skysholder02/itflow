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

export interface ContactSalesEmailTemplateParams {
  fullName: string
  companyName: string
  businessEmail: string
  phoneNumber: string
  subject: string
  message: string
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

function buildContactSalesEmailTemplateParams(params: ContactSalesEmailParams): ContactSalesEmailTemplateParams {
  return {
    fullName: params.fromName,
    companyName: params.companyName,
    businessEmail: params.fromEmail,
    phoneNumber: params.phoneNumber,
    subject: params.subject,
    message: params.message,
  }
}

class EmailJSContactSalesEmailService implements ContactSalesEmailService {
  async sendEmail(params: ContactSalesEmailParams): Promise<void> {
    const { send } = await import('@emailjs/browser')
    const templateParams = { ...buildContactSalesEmailTemplateParams(params) }
    await send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
      },
    )
  }
}

export const contactSalesEmailService: ContactSalesEmailService = new EmailJSContactSalesEmailService()

export function buildContactSalesWhatsAppMessage(data: ContactSalesEmailData): string {
  return [
    'Hello ITFlow 👋',
    '',
    'I would like to request an IT consultation.',
    '',
    'Full Name:',
    `${data.fullName}`,
    '',
    'Company:',
    `${data.companyName}`,
    '',
    'Business Email:',
    `${data.businessEmail}`,
    '',
    'Phone Number:',
    `${data.phoneNumber || ''}`,
    '',
    'Subject:',
    `${data.subject}`,
    '',
    'Message:',
    `${data.message}`,
    '',
    'Sent from ITFlow Contact Form',
  ].join('\n')
}

export function openContactSalesWhatsApp(data: ContactSalesEmailData): void {
  const message = buildContactSalesWhatsAppMessage(data)
  const phoneNumber = import.meta.env.VITE_CONTACT_WHATSAPP
  window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
}
