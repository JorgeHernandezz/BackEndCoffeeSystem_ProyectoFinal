import PDFDocument from 'pdfkit';
import fs from 'fs';
import Producto from '../modelos/productos.js';

// Función para generar y descargar el PDF de productos
export const generarPDFProductos = async (req, res) => {
    try {
        // Obtener los productos disponibles desde tu base de datos
        const productos = await Producto.find({}); // Obtener todos los productos

        // Crear un nuevo documento PDF
        const doc = new PDFDocument();
        let fileName = 'productos.pdf';
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
        doc.fontSize(24).text('Listado de Productos', { align: 'center' });

        // Agregar información de cada producto
        productos.forEach((producto, index) => {
            
            doc.fontSize(16).text(`Producto ${index + 1}`, { underline: true }).moveDown();

            doc.fontSize(12)
               .text(`Nombre: ${producto.nombreProducto}`)
               .text(`Descripción: ${producto.descrProducto}`)
               .text(`Precio $: ${producto.precioProducto}`)
               .text(`Cantidad en inventario: ${producto.cantidadInv}`)
               .text(`Descuento (%): ${producto.descuentoProducto}`)
               .text(`Categoría a la que pertenece: ${producto.categoriaProducto}`)
               .moveDown();
        });

        // Finalizar el documento
        doc.end();
    } catch (error) {
        console.error('Error al generar PDF de productos:', error);
        res.status(500).json({ msg: 'Error al generar PDF de productos' });
    }
};
