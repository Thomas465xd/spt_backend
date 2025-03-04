import resend from "../config/resend";

interface CartDetail {
    id: number;
    quantity: number;
    unitValue: number;
    netUnitValue: number;
    discount: number;
    itemName: string;
    total: number;
    image: string;
    idVarianteProducto: number;
    sku: string;
    link: string;
    notice: string;
    description: string;
    productWebId: number;
    cartId: number;
    taxList: number[];
    name: string;
    value: number;
    cd_q: number;
    cd_unit_value: number;
    cd_discount: number;
    cd_item_name: string;
    cd_sub_total: number;
    cd_id: number;
    cd_id_discount: number;
    cd_image: string;
    id_variante_producto: number;
    codigo_variante_producto: string;
    href: string;
}

interface OrderEmailInterface {
    token: string;
    clientName: string;
    clientEmail: string;
    clientPhone: string;
    clientCountry: string;
    clientState: string;
    clientCityZone: string;
    clientStreet: string;
    clientPostcode: string;
    clientBuildingNumber: string;
    shippingCost: number;
    total: number;
    cartDetails: CartDetail[];
}

export class OrderEmail {
    static sendOrderEmailToClient = async (order: OrderEmailInterface) => {
        const {
            token,
            clientName,
            clientEmail,
            clientPhone,
            clientCountry,
            clientState,
            clientCityZone,
            clientStreet,
            clientPostcode,
            clientBuildingNumber,
            shippingCost,
            total,
            cartDetails
        } = order;

        // Format currency
        const formatCurrency = (value: number) : string => {
            return `$ ${value.toLocaleString("es-CL")}`;
        }
        
        // Calculate subtotal (total before shipping)
        const subtotal = total - shippingCost;
        const iva = subtotal * 0.19;
        const totalWithTax = subtotal + iva;

        // Get date in Spanish format
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        const formattedDate = now.toLocaleDateString('es-CL', options);
        
        // Estimate delivery date (7 days from now)
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 7);
        /*
        const formattedDeliveryDate = deliveryDate.toLocaleDateString('es-CL', {
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        });
        */

        // Generate HTML for the email
        const emailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmación de tu Pedido</title>
            <style>
                body {
                    font-family: 'Segoe UI', Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 0;
                    background-color: #f7f7f7;
                    color: #333333;
                }
                .container {
                    max-width: 800px;
                    margin: 20px auto;
                    padding: 0;
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                    border-radius: 8px;
                    overflow: hidden;
                }
                .header {
                    background-color: #FF8C00;
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 28px;
                    letter-spacing: 0.5px;
                }
                .header-image {
                    margin-bottom: 20px;
                }
                .thank-you {
                    background-color: #333;
                    color: white;
                    text-align: center;
                    padding: 15px;
                    font-size: 18px;
                    font-weight: 500;
                }
                .content {
                    background-color: white;
                    padding: 30px;
                }
                .section-title {
                    color: #FF8C00;
                    border-bottom: 2px solid #FF8C00;
                    padding-bottom: 8px;
                    margin-top: 30px;
                    margin-bottom: 20px;
                    font-size: 20px;
                }
                .footer {
                    background-color: #FF8C00;
                    color: white;
                    text-align: center;
                    padding: 25px;
                    font-size: 14px;
                }
                .order-summary {
                    background-color: #fff8f0;
                    border-radius: 8px;
                    padding: 20px;
                    margin-bottom: 30px;
                    border-left: 4px solid #FF8C00;
                }
                .summary-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #eee;
                }
                .summary-row:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                    padding-bottom: 0;
                }
                .summary-label {
                    font-weight: 600;
                    color: #666;
                }
                .summary-value {
                    font-weight: 500;
                }
                .delivery-info {
                    background-color: #f9f9f9;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 20px 0;
                    border-left: 4px solid #333;
                }
                .status-tracker {
                    display: flex;
                    justify-content: space-between;
                    margin: 30px 0;
                    position: relative;
                }
                .status-tracker::before {
                    content: '';
                    position: absolute;
                    top: 15px;
                    left: 0;
                    right: 0;
                    height: 4px;
                    background-color: #ddd;
                    z-index: 1;
                }
                .status-step {
                    position: relative;
                    z-index: 2;
                    text-align: center;
                    width: 30px;
                    background-color: white;
                }
                .status-circle {
                    width: 30px;
                    height: 30px;
                    background-color: #FF8C00;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 10px;
                    color: white;
                    font-weight: bold;
                }
                .status-circle.inactive {
                    background-color: #ddd;
                }
                .status-label {
                    font-size: 12px;
                    color: #666;
                    margin-top: 5px;
                }
                .two-column {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .column {
                    flex: 1;
                    min-width: 300px;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                    border-radius: 8px;
                    overflow: hidden;
                }
                th {
                    background-color: #FF8C00;
                    color: white;
                    text-align: left;
                    padding: 12px 15px;
                    font-weight: 600;
                }
                td {
                    padding: 12px 15px;
                    border-bottom: 1px solid #eee;
                    vertical-align: middle;
                }
                tr:last-child td {
                    border-bottom: none;
                }
                tr:nth-child(even) {
                    background-color: #fff8f0;
                }
                .product-image {
                    width: 60px;
                    height: 60px;
                    object-fit: cover;
                    border-radius: 5px;
                    border: 1px solid #ddd;
                }
                .button {
                    display: inline-block;
                    background-color: #FF8C00;
                    color: white;
                    padding: 12px 25px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    transition: background-color 0.3s;
                }
                .button:hover {
                    background-color: #e67e00;
                }
                .button-secondary {
                    display: inline-block;
                    background-color: #333;
                    color: white;
                    padding: 12px 25px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    transition: background-color 0.3s;
                    margin-left: 10px;
                }
                .button-secondary:hover {
                    background-color: #555;
                }
                .totals-container {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 20px;
                }
                .totals-table {
                    width: 300px;
                    background-color: #f9f9f9;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                }
                .totals-table td {
                    padding: 10px 15px;
                }
                .totals-table tr:last-child {
                    background-color: #FF8C00;
                    color: white;
                    font-weight: bold;
                    font-size: 16px;
                }
                .notice {
                    background-color: #fffaf0;
                    border-left: 4px solid #ffa500;
                    padding: 10px;
                    margin: 5px 0;
                    font-style: italic;
                    border-radius: 0 5px 5px 0;
                }
                .product-details {
                    margin-top: 5px;
                    font-size: 13px;
                    color: #666;
                }
                .product-name {
                    font-weight: 600;
                    color: #333;
                }
                .info-label {
                    font-weight: 600;
                    color: #666;
                    display: inline-block;
                    width: 120px;
                }
                .section-icon {
                    display: inline-block;
                    margin-right: 8px;
                    font-size: 20px;
                }
                .action-container {
                    margin-top: 30px;
                    text-align: center;
                    padding: 20px;
                    background-color: #f9f9f9;
                    border-radius: 8px;
                }
                .help-box {
                    margin-top: 30px;
                    background-color: #f9f9f9;
                    border-radius: 8px;
                    padding: 20px;
                    text-align: center;
                }
                .help-box h3 {
                    color: #333;
                    margin-top: 0;
                }
                .social-links {
                    margin-top: 20px;
                }
                .social-link {
                    display: inline-block;
                    margin: 0 10px;
                    color: white;
                    text-decoration: none;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>¡Pedido Confirmado!</h1>
                    <p>Pedido #${token}</p>
                </div>
                
                <div class="thank-you">
                    ¡Gracias por tu compra, ${clientName.split(' ')[0]}!
                </div>
                
                <div class="content">
                    <p>Hemos recibido tu pedido y está siendo procesado. A continuación encontrarás los detalles de tu compra.</p>
                    
                    <div class="order-summary">
                        <h3>Resumen de tu Pedido</h3>
                        <div class="summary-row">
                            <span class="summary-label">Número de Pedido:</span>
                            <span class="summary-value">#${token}</span>
                        </div>
                        <div class="summary-row">
                            <span class="summary-label">Fecha de Pedido:</span>
                            <span class="summary-value">${formattedDate}</span>
                        </div>
                        <div class="summary-row">
                            <span class="summary-label">Estado del Pedido:</span>
                            <span class="summary-value" style="color: #FF8C00; font-weight: bold;">Solicitado</span>
                        </div>
                        <div class="summary-row">
                            <span class="summary-label">Total:</span>
                            <span class="summary-value" style="font-size: 18px; font-weight: bold;">${formatCurrency(totalWithTax)}</span>
                        </div>
                    </div>
                    
                    <div class="status-tracker">
                        <div class="status-step">
                            <div class="status-circle">✓</div>
                            <div class="status-label">Solicitado</div>
                        </div>
                        <div class="status-step">
                            <div class="status-circle inactive">2</div>
                            <div class="status-label">Procesando</div>
                        </div>
                        <div class="status-step">
                            <div class="status-circle inactive">3</div>
                            <div class="status-label">Enviado</div>
                        </div>
                        <div class="status-step">
                            <div class="status-circle inactive">4</div>
                            <div class="status-label">Entregado</div>
                        </div>
                    </div>
                    
                    <div class="delivery-info">
                        <h3>Información de Entrega</h3>
                        <p><strong>Dirección de entrega:</strong><br>
                        ${clientStreet} ${clientBuildingNumber}<br>
                        ${clientCityZone}, ${clientState}<br>
                        ${clientPostcode}, ${clientCountry}</p>
                    </div>
                    
                    <h2 class="section-title">
                        <span class="section-icon">📦</span>Productos Comprados
                    </h2>
                    
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 70px;">Imagen</th>
                                <th>Producto</th>
                                <th>Precio</th>
                                <th>Cantidad</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${cartDetails.map(item => `
                                <tr>
                                    <td><img src="${item.image}" alt="${item.itemName}" class="product-image"></td>
                                    <td>
                                        <div class="product-name">${item.itemName}</div>
                                        ${item.description ? `<div class="product-details">${item.description}</div>` : ''}
                                        ${item.notice ? `<div class="notice">${item.notice}</div>` : ''}
                                    </td>
                                    <td>${formatCurrency(item.unitValue)}</td>
                                    <td>${item.quantity}</td>
                                    <td>${formatCurrency(item.total)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="totals-container">
                        <table class="totals-table">
                            <tr>
                                <td>Subtotal:</td>
                                <td>${formatCurrency(subtotal)}</td>
                            </tr>
                            <tr>
                                <td>IVA:</td>
                                <td>${formatCurrency(iva)}</td>
                            </tr>
                            <tr>
                                <td>Envío:</td>
                                <td>${formatCurrency(shippingCost)}</td>
                            </tr>
                            <tr>
                                <td>Total:</td>
                                <td>${formatCurrency(totalWithTax)}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="action-container">
                        <h3>¿Quieres ver el estado de tu pedido?</h3>
                        <p>Puedes revisar los detalles completos de tu pedido aqui</p>
                        <a href=${`${process.env.FRONTEND_URL}/orders?page=1&searchOrder=${token}`} class="button-secondary">Mis Pedidos</a>
                    </div>
                    
                    <div class="help-box">
                        <h3>¿Necesitas ayuda con tu pedido?</h3>
                        <p>Nuestro equipo de atención al cliente está listo para ayudarte</p>
                        <p>Puedes contactarnos en <span style="color: #FF8C00; font-weight: bold;">${process.env.CONTACT_EMAIL}</span></p>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Gracias por confiar en nosotros</p>
                    <div class="social-links">
                        <a href="https://www.facebook.com/Spare.parts.trade/" class="social-link">Facebook</a>
                        <a href="https://www.instagram.com/spare.parts.trade/?hl=es-la" class="social-link">Instagram</a>
                    </div>
                    <p style="margin-top: 15px; font-size: 12px;">© ${new Date().getFullYear()} Portal SPT. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Send the email
        await resend.emails.send({
            from: `"Tu Empresa - Confirmación de Pedido" <${process.env.NOREPLY_EMAIL}>`,
            to: clientEmail,
            subject: `🎉 ¡Pedido #${token} Confirmado!`,
            html: emailHTML,
        });
    }

    static sendOrderEmailToAdmin = async (order: OrderEmailInterface) => {
        const {
            token,
            clientName,
            clientEmail,
            clientPhone,
            clientCountry,
            clientState,
            clientCityZone,
            clientStreet,
            clientPostcode,
            clientBuildingNumber,
            shippingCost,
            total,
            cartDetails
        } = order;

        // Format currency
        const formatCurrency = (value: number) : string => {
            return `$ ${value.toLocaleString("es-CL")}`;
        }
        
        // Calculate subtotal (total before shipping)
        const subtotal = total - shippingCost;
        const iva = subtotal * 0.19;
        const totalWithTax = subtotal + iva;

        // Get date in Spanish format
        const now = new Date();
        const options: Intl.DateTimeFormatOptions = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        const formattedDate = now.toLocaleDateString('es-CL', options);

        // Generate HTML for the email
        const emailHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Nueva Confirmación de Pedido</title>
            <style>
                body {
                    font-family: 'Segoe UI', Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 0;
                    background-color: #f7f7f7;
                    color: #333333;
                }
                .container {
                    max-width: 800px;
                    margin: 20px auto;
                    padding: 0;
                    box-shadow: 0 0 20px rgba(0,0,0,0.1);
                    border-radius: 8px;
                    overflow: hidden;
                }
                .header {
                    background-color: #FF8C00;
                    color: white;
                    padding: 30px;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 28px;
                    letter-spacing: 0.5px;
                }
                .header p {
                    margin: 10px 0 0;
                    font-size: 16px;
                    opacity: 0.9;
                }
                .date-bar {
                    background-color: #333;
                    color: white;
                    text-align: center;
                    padding: 10px;
                    font-size: 14px;
                }
                .content {
                    background-color: white;
                    padding: 30px;
                }
                .section-title {
                    color: #FF8C00;
                    border-bottom: 2px solid #FF8C00;
                    padding-bottom: 8px;
                    margin-top: 30px;
                    margin-bottom: 20px;
                    font-size: 20px;
                }
                .footer {
                    background-color: #FF8C00;
                    color: white;
                    text-align: center;
                    padding: 20px;
                    font-size: 14px;
                }
                .customer-info {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                    margin-bottom: 30px;
                }
                .customer-contact {
                    flex: 1;
                    min-width: 300px;
                    padding: 20px;
                    background-color: #fff8f0;
                    border-radius: 8px;
                    border-left: 4px solid #FF8C00;
                }
                .customer-location {
                    flex: 1;
                    min-width: 300px;
                    padding: 20px;
                    background-color: #fff8f0;
                    border-radius: 8px;
                    border-left: 4px solid #FF8C00;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                    border-radius: 8px;
                    overflow: hidden;
                }
                th {
                    background-color: #FF8C00;
                    color: white;
                    text-align: left;
                    padding: 12px 15px;
                    font-weight: 600;
                }
                td {
                    padding: 12px 15px;
                    border-bottom: 1px solid #eee;
                    vertical-align: middle;
                }
                tr:last-child td {
                    border-bottom: none;
                }
                tr:nth-child(even) {
                    background-color: #fff8f0;
                }
                tr:hover {
                    background-color: #fff0e0;
                }
                .product-image {
                    width: 60px;
                    height: 60px;
                    object-fit: cover;
                    border-radius: 5px;
                    border: 1px solid #ddd;
                }
                .button {
                    display: inline-block;
                    background-color: #FF8C00;
                    color: white;
                    padding: 12px 25px;
                    text-decoration: none;
                    border-radius: 5px;
                    font-weight: bold;
                    transition: background-color 0.3s;
                }
                .button:hover {
                    background-color: #e67e00;
                }
                .totals-container {
                    display: flex;
                    justify-content: flex-end;
                    margin-top: 20px;
                }
                .totals-table {
                    width: 300px;
                    background-color: #f9f9f9;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                }
                .totals-table td {
                    padding: 10px 15px;
                }
                .totals-table tr:last-child {
                    background-color: #FF8C00;
                    color: white;
                    font-weight: bold;
                    font-size: 16px;
                }
                .notice {
                    background-color: #fffaf0;
                    border-left: 4px solid #ffa500;
                    padding: 10px;
                    margin: 5px 0;
                    font-style: italic;
                    border-radius: 0 5px 5px 0;
                }
                .product-details {
                    margin-top: 5px;
                    font-size: 13px;
                    color: #666;
                }
                .product-name {
                    font-weight: 600;
                    color: #333;
                }
                .info-label {
                    font-weight: 600;
                    color: #666;
                    display: inline-block;
                    width: 100px;
                }
                .section-icon {
                    display: inline-block;
                    margin-right: 8px;
                    font-size: 20px;
                }
                .action-container {
                    margin-top: 30px;
                    text-align: center;
                    padding: 20px;
                    background-color: #f9f9f9;
                    border-radius: 8px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>¡Nuevo Pedido Recibido!</h1>
                    <p>Referencia del pedido: ${token}</p>
                </div>
                
                <div class="date-bar">
                    Pedido realizado el ${formattedDate}
                </div>
                
                <div class="content">
                    <h2 class="section-title">
                        <span class="section-icon">👤</span>Información del Cliente
                    </h2>
                    
                    <div class="customer-info">
                        <div class="customer-contact">
                            <h3>Datos de Contacto</h3>
                            <p><span class="info-label">Nombre:</span> ${clientName}</p>
                            <p><span class="info-label">Email:</span> ${clientEmail}</p>
                            <p><span class="info-label">Teléfono:</span> ${clientPhone}</p>
                        </div>
                        
                        <div class="customer-location">
                            <h3>Dirección de Entrega</h3>
                            <p><span class="info-label">País:</span> ${clientCountry}</p>
                            <p><span class="info-label">Región:</span> ${clientState}</p>
                            <p><span class="info-label">Ciudad:</span> ${clientCityZone}</p>
                            <p><span class="info-label">Calle:</span> ${clientStreet} ${clientBuildingNumber}</p>
                            <p><span class="info-label">Código Postal:</span> ${clientPostcode}</p>
                        </div>
                    </div>
                    
                    <h2 class="section-title">
                        <span class="section-icon">📦</span>Productos del Pedido
                    </h2>
                    
                    <table>
                        <thead>
                            <tr>
                                <th style="width: 70px;">Imagen</th>
                                <th>Producto</th>
                                <th>SKU</th>
                                <th>Precio</th>
                                <th>Cantidad</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${cartDetails.map(item => `
                                <tr>
                                    <td><img src="${item.image}" alt="${item.itemName}" class="product-image"></td>
                                    <td>
                                        <div class="product-name">${item.itemName}</div>
                                        ${item.description ? `<div class="product-details">${item.description}</div>` : ''}
                                        ${item.notice ? `<div class="notice">${item.notice}</div>` : ''}
                                    </td>
                                    <td>${item.sku}</td>
                                    <td>${formatCurrency(item.unitValue)}</td>
                                    <td>${item.quantity}</td>
                                    <td>${formatCurrency(item.total)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="totals-container">
                        <table class="totals-table">
                            <tr>
                                <td>Subtotal:</td>
                                <td>${formatCurrency(subtotal)}</td>
                            </tr>
                            <tr>
                                <td>IVA:</td>
                                <td>${formatCurrency(iva)}</td>
                            </tr>
                            <tr>
                                <td>Envío:</td>
                                <td>${formatCurrency(shippingCost)}</td>
                            </tr>
                            <tr>
                                <td>Total:</td>
                                <td>${formatCurrency(totalWithTax)}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div class="action-container">
                        <h3>Administrar este pedido</h3>
                        <a href="/admin/orders/${token}" class="button">Ver Detalles Completos</a>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Este es un correo automático. Por favor no responda directamente a este mensaje.</p>
                    <p>© 2025 Tu Empresa. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        // Send the email
        const adminEmail = process.env.ADMIN_EMAIL;

        await resend.emails.send({
            from: `"SPT - Nuevo Pedido" <noreply@spt.com>`,
            to: adminEmail,
            subject: "🔔 Nueva Orden Solicitada",
            html: emailHTML,
        });
    }
}