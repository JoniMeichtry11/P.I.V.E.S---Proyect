require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MercadoPagoConfig, Preference } = require('mercadopago');

const app = express();
const port = process.env.PORT || 3000;

// Configuración de CORS para permitir peticiones desde tu app de Angular
app.use(cors());
app.use(express.json());

// Configuración de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN,
  options: { timeout: 5000 }
});

// Endpoint para crear una preferencia
app.post('/api/create-preference', async (req, res) => {
  try {
    const preference = new Preference(client);
    const body = {
      items: req.body.items,
      back_urls: req.body.back_urls,
      auto_return: req.body.auto_return,
      metadata: req.body.metadata,
      external_reference: req.body.external_reference,
    };

    const response = await preference.create({ body });
    
    res.json({
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point
    });
  } catch (error) {
    console.error('Error creando preferencia:', error);
    res.status(500).json({ error: 'Error al crear la preferencia de pago' });
  }
});

// Endpoint para verificar estado de un pago
app.get('/api/payment-status/:id', async (req, res) => {
  try {
    const paymentId = req.params.id;
    const axios = require('axios');
    const response = await axios.get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${process.env.MP_ACCESS_TOKEN}`
      }
    });

    res.json({
      status: response.data.status,
      status_detail: response.data.status_detail
    });
  } catch (error) {
    console.error('Error obteniendo estado del pago:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al obtener el estado del pago' });
  }
});

app.get('/health', (req, res) => {
  res.send('Server is running');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
