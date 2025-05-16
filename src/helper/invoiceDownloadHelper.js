const xl = require("excel4node");
const formatDate = require("../utils/formatDate");

const invoiceDownloadHelper = async ({ res, invoices }) => {
    try {
        var wb = new xl.Workbook();
        var ws = wb.addWorksheet("vouchers-list");

        const titleStyle = wb.createStyle({
            font: {
                bold: true,
                size: 10,
            },
        });

        let row = 1;
        ws.cell(row, 1).string("File Name").style(titleStyle);
        ws.cell(row, 2).string("File Size").style(titleStyle);
        ws.cell(row, 3).string("Invoice Number ").style(titleStyle);
        ws.cell(row, 4).string("Invoice Date ").style(titleStyle);
        ws.cell(row, 5).string("TNR Number ").style(titleStyle);
        ws.cell(row, 6).string("Company Name").style(titleStyle);
        ws.cell(row, 7).string("Gross Amount").style(titleStyle);
        ws.cell(row, 8).string("Vat").style(titleStyle);
        ws.cell(row, 9).string("Total Amount").style(titleStyle);

        for (let i = 0; i < invoices.length; i++) {
            const invoice = invoices[i];
            ws.cell(i + 2, 1).string(invoice?.fileName || "N/A");
            ws.cell(i + 2, 2).number(invoice?.imageSize || 0);
            ws.cell(i + 2, 3).string(invoice?.invoiceNumber || "N/A");
            ws.cell(i + 2, 4).string(formatDate(invoice?.invoiceDate) || "N/A");
            ws.cell(i + 2, 5).string(invoice?.tnrNumber || "N/A");
            ws.cell(i + 2, 6).string(invoice?.companyName || "N/A");
            ws.cell(i + 2, 7).string(invoice?.grossAmount || "N/A");
            ws.cell(i + 2, 8).string(invoice?.vatAmount || "N/A");
            ws.cell(i + 2, 9).string(invoice?.totalAmount || "N/A");
        }

        wb.write(`FileName.xlsx`, res);
    } catch (e) {
        console.log(e);
    }
};
module.exports = { invoiceDownloadHelper };
