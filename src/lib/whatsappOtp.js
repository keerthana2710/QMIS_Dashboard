import axios from 'axios';

const WHATSAPP_API_URL = 'https://graph.facebook.com/v17.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// Generate 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send WhatsApp OTP using template
export const sendWhatsAppOTP = async (phoneNumber, otp) => {
  try {
    // Clean phone number
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
    const toNumber = formattedPhone.replace(/^0+/, '');

    console.log(`[WhatsApp] Sending OTP to: ${toNumber}, OTP: ${otp}`);

    // For development, simulate success
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] WhatsApp OTP would be sent to: ${toNumber}`);
      console.log(`[DEV] OTP Code: ${otp}`);

      return {
        success: true,
        messageId: `dev_${Date.now()}`,
        phoneNumber: toNumber,
        timestamp: new Date().toISOString()
      };
    }

    // Production: Send via WhatsApp Cloud API
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: toNumber,
        type: "template",
        template: {
          name: "otp_verification", // Create this template in WhatsApp Manager
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: otp },
                { type: "text", text: "10" }
              ]
            }
          ]
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      messageId: response.data.messages?.[0]?.id,
      phoneNumber: toNumber,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('WhatsApp API Error:', error.response?.data || error.message);

    let errorMessage = 'Failed to send WhatsApp OTP';
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error.message || errorMessage;
    }

    return {
      success: false,
      error: errorMessage,
      code: error.response?.data?.error?.code
    };
  }
};

// Send simple text message (fallback)
export const sendWhatsAppText = async (phoneNumber, message) => {
  try {
    const cleanPhone = phoneNumber.replace(/\D/g, '');
    const toNumber = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

    const response = await axios.post(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: toNumber,
        type: "text",
        text: { body: message }
      },
      {
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      success: true,
      messageId: response.data.messages?.[0]?.id
    };

  } catch (error) {
    console.error('WhatsApp Text Error:', error);
    return { success: false, error: 'Failed to send message' };
  }
};
