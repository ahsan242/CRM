// src/app/(admin)/ecommerce/products/create/components/ExcelImportForm.jsx
import React, { useState } from 'react';
import { Card, CardBody, Alert, Button, Spinner, Table } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as XLSX from 'xlsx';
import { importProductsFromExcel } from '@/http/Product';

const ExcelImportForm = ({ onProductsImported }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [excelData, setExcelData] = useState([]);
  const [fileName, setFileName] = useState('');

  const { handleSubmit } = useForm();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setError('');
    setSuccess('');
    setExcelData([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // Validate required columns
        if (jsonData.length > 0) {
          const firstRow = jsonData[0];
          if (!firstRow.hasOwnProperty('Product Code') || !firstRow.hasOwnProperty('Brand')) {
            setError('Excel file must contain "Product Code" and "Brand" columns');
            return;
          }
        }

        setExcelData(jsonData);
        setSuccess(`Successfully loaded ${jsonData.length} products from Excel`);
      } catch (err) {
        setError('Error reading Excel file: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (excelData.length === 0) {
      setError('Please upload an Excel file first');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await importProductsFromExcel({ products: excelData });
      
      if (response.success) {
        setSuccess(`Successfully scheduled ${excelData.length} products for import. Job ID: ${response.jobId}`);
        setExcelData([]);
        setFileName('');
        document.querySelector('input[type="file"]').value = '';
        
        if (onProductsImported) {
          onProductsImported(response.jobId);
        }
      } else {
        setError(response.error || 'Failed to schedule import');
      }
    } catch (err) {
      setError(err.message || 'Failed to import products');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'Product Code': 'E500-G.APSMB1',
        'Brand': 'LG',
        'Price': '299.99',
        'Quantity': '50'
      },
      {
        'Product Code': 'M378A1K43CB2-CTD',
        'Brand': 'Samsung',
        'Price': '89.99',
        'Quantity': '100'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products Template');
    XLSX.writeFile(wb, 'product_import_template.xlsx');
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Import Products from Excel</h5>
      </Card.Header>
      <Card.Body>
        <div className="mb-4">
          <Button variant="outline-primary" onClick={downloadTemplate}>
            Download Template
          </Button>
          <small className="text-muted ms-2">
            Download Excel template with required columns
          </small>
        </div>

        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <div className="mb-3">
          <label className="form-label">Upload Excel File *</label>
          <input 
            type="file" 
            className="form-control" 
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={loading}
          />
          <small className="text-muted">
            File should contain "Product Code" and "Brand" columns. Optional: "Price", "Quantity"
          </small>
        </div>

        {fileName && (
          <div className="mb-3">
            <strong>File:</strong> {fileName}
          </div>
        )}

        {excelData.length > 0 && (
          <div className="mb-4">
            <h6>Preview ({excelData.length} products)</h6>
            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
              <Table striped bordered size="sm">
                <thead>
                  <tr>
                    <th>Product Code</th>
                    <th>Brand</th>
                    <th>Price</th>
                    <th>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {excelData.slice(0, 10).map((row, index) => (
                    <tr key={index}>
                      <td>{row['Product Code']}</td>
                      <td>{row['Brand']}</td>
                      <td>{row['Price'] || 'N/A'}</td>
                      <td>{row['Quantity'] || 'N/A'}</td>
                    </tr>
                  ))}
                  {excelData.length > 10 && (
                    <tr>
                      <td colSpan="4" className="text-center">
                        ... and {excelData.length - 10} more products
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </div>
        )}

        <div className="d-flex gap-2">
          <Button 
            variant="primary" 
            onClick={handleImport}
            disabled={loading || excelData.length === 0}
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Scheduling Import...
              </>
            ) : (
              `Schedule Import (${excelData.length} products)`
            )}
          </Button>
        </div>

        <div className="mt-4 p-3 border rounded bg-light">
          <h6 className="text-muted">How it works:</h6>
          <ul className="small text-muted mb-0">
            <li>Upload Excel file with product codes and brands</li>
            <li>Products will be scheduled for background import</li>
            <li>Daily limit: 300 products per job</li>
            <li>Import progress can be monitored in Import History</li>
            <li>Failed imports will be retried automatically</li>
          </ul>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ExcelImportForm;