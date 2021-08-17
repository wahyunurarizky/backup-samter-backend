const midtransClient = require('midtrans-client');
// Create Snap API instance
const snap = new midtransClient.Snap({
  // Set to true if you want Production Environment (accept real transaction).
  isProduction: false,
  serverKey: 'SB-Mid-server-kyQCjeU8EZJQYb_NDoLmt19q',
});

const parameter = {
  transaction_details: {
    order_id: Math.random() * 1000,
    gross_amount: 1000000,
  },
  customer_details: {
    first_name: 'Wahyu',
    last_name: 'Watson',
    email: 'test@example.com',
    phone: '+628123456',
    billing_address: {
      first_name: 'John',
      last_name: 'Watson',
      email: 'test@example.com',
      phone: '081 2233 44-55',
      address: 'Sudirman',
      city: 'Jakarta',
      postal_code: '12190',
      country_code: 'IDN',
    },
    shipping_address: {
      first_name: 'John',
      last_name: 'Watson',
      email: 'test@example.com',
      phone: '0 8128-75 7-9338',
      address: 'Sudirman',
      city: 'Jakarta',
      postal_code: '12190',
      country_code: 'IDN',
    },
  },
  enabled_payments: [
    'credit_card',
    'mandiri_clickpay',
    'cimb_clicks',
    'bca_klikbca',
    'bca_klikpay',
    'bri_epay',
    'echannel',
    'mandiri_ecash',
    'permata_va',
    'bca_va',
    'bni_va',
    'other_va',
    'gopay',
    'indomaret',
    'alfamart',
    'danamon_online',
    'akulaku',
  ],
  credit_card: {
    secure: true,
    bank: 'bca',
    installment: {
      required: false,
      terms: {
        bni: [3, 6, 12],
        mandiri: [3, 6, 12],
        cimb: [3],
        bca: [3, 6, 12],
        offline: [6, 12],
      },
    },
    whitelist_bins: ['48111111', '41111111'],
  },
  bca_va: {
    va_number: '12345678911',
    sub_company_code: '00000',
    free_text: {
      inquiry: [
        {
          en: 'text in English',
          id: 'text in Bahasa Indonesia',
        },
      ],
      payment: [
        {
          en: 'text in English',
          id: 'text in Bahasa Indonesia',
        },
      ],
    },
  },
  bni_va: {
    va_number: '12345678',
  },
  permata_va: {
    va_number: '1234567890',
    recipient_name: 'SUDARSONO',
  },
  expiry: {
    start_time: '2021-12-13 18:11:08 +0700',
    unit: 'minutes',
    duration: 1,
  },
  callbacks: {
    finish: 'https://demo.jancok.com',
  },
  custom_field1: 'custom field 1 content',
  custom_field2: 'custom field 2 content',
  custom_field3: 'custom field 3 content',
};

snap.createTransaction(parameter).then((transaction) => {
  // transaction token
  const transactionToken = transaction.token;
  console.log('transactionToken:', transactionToken);
});
