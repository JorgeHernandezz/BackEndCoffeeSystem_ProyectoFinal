import PDFDocument from 'pdfkit';
import fs from 'fs';
import Pedido from '../modelos/pedidos.js';

// Función para generar y descargar el PDF de pedidos
export const generarPDFPedidos = async (req, res) => {
    try {
        // Obtener los pedidos disponibles desde tu base de datos
        const pedidos = await Pedido.find({}); // Obtener todos los pedidos

        // Crear un nuevo documento PDF
        const doc = new PDFDocument();
        let fileName = 'Pedidos.pdf';
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        // Pipe el documento PDF directamente a la respuesta HTTP
        doc.pipe(res);

        // Agregar encabezado con fecha, hora y nombre de la compañía
        const fecha = new Date().toLocaleDateString();
        const hora = new Date().toLocaleTimeString();
        const nombreCompania = 'Coffee System';

        doc.fontSize(10)
           .text(`Fecha: ${fecha}`, { align: 'right' })
           .text(`Hora: ${hora}`, { align: 'right' })
           .text(`${nombreCompania}`, { align: 'right' })
           .moveDown();

       

        // Agregar título al documento
        doc.fontSize(24).text('Listado de Pedidos', { align: 'center' });

        // Agregar información de cada pedido
        pedidos.forEach((pedido, index) => {
            
            doc.fontSize(16).text(`Pedido ${index + 1}`, { underline: true }).moveDown();

            doc.fontSize(12)
               .text(`Nombre: ${pedido.nombrePedido}`)
               .text(`No. productos: ${pedido.totalArticulos}`)
               .text(`Precio unitario: $ ${pedido.costoArticulos}`)
               .text(`Costo Total: $ ${pedido.costoTotal}`)
               .text(`Método de pago: ${pedido.metodoPago}`)
               .text(`Producto: ${pedido.detallesPedido[0].producto_P}`)
               .moveDown();
        });

        // Finalizar el documento
        doc.end();
    } catch (error) {
        console.error('Error al generar PDF de pedidos:', error);
        res.status(500).json({ msg: 'Error al generar PDF de pedidos' });
    }
};
