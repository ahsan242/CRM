import React, { useState, useRef } from 'react';
import { Card, CardBody, Alert, Button, Spinner, Table, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import * as XLSX from 'xlsx';
import { bulkImportPrices, testPriceAPI } from '@/http/Product';

const PriceImportForm = ({ onPricesImported }) => {
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [excelData, setExcelData] = useState([]);
  const [fileName, setFileName] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [detectedSeller, setDetectedSeller] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  const fileInputRef = useRef(null);
  const { handleSubmit } = useForm();

  // Test API connection
  const testAPIConnection = async () => {
    setTesting(true);
    setError('');
    setSuccess('');
    
    try {
      const result = await testPriceAPI();
      setSuccess(`✅ API Connection Successful: ${result.message}`);
    } catch (err) {
      setError(`❌ API Connection Failed: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFile(file);
    setFileName(file.name);
    setError('');
    setSuccess('');
    setExcelData([]);
    setDetectedSeller('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          setError('Excel file is empty');
          return;
        }

        // Check for seller column and detect seller name
        const firstRow = jsonData[0];
        let detectedSellerName = '';
        
        // Check multiple possible seller column names
        if (firstRow.seller) {
          detectedSellerName = firstRow.seller;
        } else if (firstRow.Seller) {
          detectedSellerName = firstRow.Seller;
        } else if (firstRow.vendor) {
          detectedSellerName = firstRow.vendor;
        } else if (firstRow['seller name']) {
          detectedSellerName = firstRow['seller name'];
        }

        if (detectedSellerName) {
          setDetectedSeller(detectedSellerName);
          setSellerName(detectedSellerName);
        }

        // Validate required columns - check multiple possible column names
        const hasSku = firstRow.sku || firstRow.SKU || firstRow.productcode || firstRow.ProductCode || firstRow['product code'];
        const hasPrice = firstRow.price || firstRow.Price || firstRow.cost || firstRow.Cost;
        
        if (!hasSku || !hasPrice) {
          setError('Excel file must contain "sku" and "price" columns (case insensitive)');
          return;
        }

        // Check for duplicate SKUs within the same file
        const skuCount = {};
        jsonData.forEach((row, index) => {
          const sku = row.sku || row.SKU || row.productcode || row.ProductCode || row['product code'];
          if (sku) {
            skuCount[sku] = (skuCount[sku] || 0) + 1;
          }
        });

        const duplicateSkus = Object.keys(skuCount).filter(sku => skuCount[sku] > 1);
        if (duplicateSkus.length > 0) {
          setError(`Duplicate SKUs found: ${duplicateSkus.join(', ')}. Please remove duplicates before importing.`);
          return;
        }

        setExcelData(jsonData);
        setSuccess(`✅ Successfully loaded ${jsonData.length} price records from Excel${detectedSellerName ? ` for seller: ${detectedSellerName}` : ''}`);

      } catch (err) {
        setError('❌ Error reading Excel file: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    if (!sellerName) {
      setError('Please enter seller name');
      return;
    }

    if (!selectedFile) {
      setError('Please upload an Excel file first');
      return;
    }

    if (excelData.length === 0) {
      setError('No valid data found in the uploaded file');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('📤 Preparing form data for import...');
      console.log('📁 File:', selectedFile.name);
      console.log('🏪 Seller:', sellerName);
      console.log('📊 Records:', excelData.length);

      const formData = new FormData();
      formData.append('priceFile', selectedFile);
      formData.append('sellerName', sellerName);
      formData.append('source', 'excel');

      // Debug: Check FormData contents
      console.log('📋 FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}:`, value);
      }

      const response = await bulkImportPrices(formData);
      
      if (response.success) {
        setSuccess(`✅ Successfully imported ${response.data.results.successful} price records. ${response.data.results.failed} failed.`);
        
        // Reset form
        setExcelData([]);
        setFileName('');
        setSellerName('');
        setDetectedSeller('');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        if (onPricesImported) {
          onPricesImported(response.data);
        }
      } else {
        setError(response.error || 'Failed to import prices');
      }
    } catch (err) {
      console.error('❌ Import error:', err);
      setError(err.message || 'Failed to import prices. Please check the console for details.');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const templateData = [
      {
        'seller': 's_Cloud',
        'sku': 'HL6B1E',
        'price': '10.00',
        'discount price': '8.00',
        'stock quantity': '100'
      },
      {
        'seller': 's_Cloud',
        'sku': 'H02C6PE',
        'price': '30.00',
        'discount price': '28.00',
        'stock quantity': '50'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Price Template');
    XLSX.writeFile(wb, 'price_import_template.xlsx');
  };

  const fixDuplicateSkus = () => {
    // Remove duplicate SKUs, keeping the first occurrence
    const uniqueData = [];
    const seenSkus = new Set();
    
    excelData.forEach(row => {
      const sku = row.sku || row.SKU || row.productcode || row.ProductCode || row['product code'];
      if (sku && !seenSkus.has(sku)) {
        seenSkus.add(sku);
        uniqueData.push(row);
      }
    });

    setExcelData(uniqueData);
    setSuccess(`✅ Removed duplicate SKUs. Now ${uniqueData.length} unique records.`);
  };

  const clearForm = () => {
    setExcelData([]);
    setFileName('');
    setSellerName('');
    setDetectedSeller('');
    setSelectedFile(null);
    setError('');
    setSuccess('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Badge component
  const Badge = ({ bg, children }) => (
    <span className={`badge bg-${bg} px-2 py-1`}>
      {children}
    </span>
  );

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5 className="mb-0">Import Product Prices from Excel</h5>
        <Button variant="outline-secondary" size="sm" onClick={clearForm}>
          Clear Form
        </Button>
      </Card.Header>
      <Card.Body>
        <div className="mb-4">
          <div className="d-flex gap-2 mb-2">
            <Button variant="outline-primary" onClick={downloadTemplate}>
              📥 Download Template
            </Button>
            <Button variant="outline-secondary" onClick={testAPIConnection} disabled={testing}>
              {testing ? <Spinner animation="border" size="sm" /> : '🔌 Test API Connection'}
            </Button>
          </div>
          <small className="text-muted">
            Download Excel template with the required columns: <strong>seller, sku, price</strong>
          </small>
        </div>

        {error && (
          <Alert variant="danger" className="d-flex align-items-center">
            <span className="me-2">❌</span>
            <span>{error}</span>
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="d-flex align-items-center">
            <span className="me-2">✅</span>
            <span>{success}</span>
          </Alert>
        )}

        <Form.Group className="mb-3">
          <Form.Label>
            <strong>Seller Name *</strong>
          </Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter seller name (e.g., s_Cloud, v_Cloud, Amazon, eBay)"
            value={sellerName}
            onChange={(e) => setSellerName(e.target.value)}
            disabled={loading}
            className={detectedSeller ? 'border-success' : ''}
          />
          <Form.Text className="text-muted">
            {detectedSeller ? (
              <span className="text-success">✅ Seller detected from file: {detectedSeller}</span>
            ) : (
              'Enter seller name or it will be detected from file automatically'
            )}
          </Form.Text>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>
            <strong>Upload Price Excel File *</strong>
          </Form.Label>
          <Form.Control 
            type="file" 
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            disabled={loading}
            ref={fileInputRef}
          />
          <Form.Text className="text-muted">
            Supported formats: Excel (.xlsx, .xls) or CSV (.csv). Required columns: <strong>seller, sku, price</strong>
          </Form.Text>
        </Form.Group>

        {fileName && (
          <Alert variant="info" className="py-2">
            <div className="d-flex justify-content-between align-items-center">
              <span>
                <strong>Selected File:</strong> {fileName}
                {detectedSeller && (
                  <span className="ms-2 text-success">
                    | <strong>Seller:</strong> {detectedSeller}
                  </span>
                )}
              </span>
              <Badge bg="primary">{excelData.length} records</Badge>
            </div>
          </Alert>
        )}

        {excelData.length > 0 && (
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0">
                📊 Price Preview <Badge bg="secondary">{excelData.length} records</Badge>
              </h6>
              <div className="d-flex gap-2">
                {excelData.length !== new Set(excelData.map(row => 
                  row.sku || row.SKU || row.productcode || row.ProductCode || row['product code']
                )).size && (
                  <Button variant="warning" size="sm" onClick={fixDuplicateSkus}>
                    🗑️ Remove Duplicate SKUs
                  </Button>
                )}
              </div>
            </div>
            <div style={{ maxHeight: '300px', overflow: 'auto' }}>
              <Table striped bordered hover size="sm">
                <thead className="table-dark">
                  <tr>
                    <th>Seller</th>
                    <th>SKU</th>
                    <th>Price</th>
                    <th>Discount Price</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {excelData.slice(0, 10).map((row, index) => (
                    <tr key={index}>
                      <td>{row.seller || row.Seller || row.vendor || 'N/A'}</td>
                      <td>
                        <code>{row.sku || row.SKU || row.productcode || row.ProductCode || row['product code']}</code>
                      </td>
                      <td className="text-success fw-bold">
                        ${parseFloat(row.price || row.Price || row.cost || row.Cost || 0).toFixed(2)}
                      </td>
                      <td className="text-warning">
                        {row['discount price'] || row['Discount Price'] || row.saleprice || row.salePrice ? 
                          `$${parseFloat(row['discount price'] || row['Discount Price'] || row.saleprice || row.salePrice).toFixed(2)}` : 
                          'N/A'
                        }
                      </td>
                      <td>
                        {row['stock quantity'] || row.quantity || row.stockQuantity || row.stock || '100'}
                      </td>
                    </tr>
                  ))}
                  {excelData.length > 10 && (
                    <tr>
                      <td colSpan="5" className="text-center text-muted fst-italic">
                        ... and {excelData.length - 10} more price records
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
            disabled={loading || !selectedFile || !sellerName || excelData.length === 0}
            className="flex-fill"
          >
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                📤 Importing Prices...
              </>
            ) : (
              `📤 Import ${excelData.length} Price Records`
            )}
          </Button>
        </div>

        <div className="mt-4 p-3 border rounded bg-light">
          <h6 className="text-muted mb-3">📝 Import Instructions</h6>
          <div className="row">
            <div className="col-md-6">
              <h6 className="text-primary">Required Columns:</h6>
              <ul className="small">
                <li><strong>seller</strong> - Seller name (e.g., s_Cloud, v_Cloud)</li>
                <li><strong>sku</strong> - Product SKU code</li>
                <li><strong>price</strong> - Current price in USD</li>
              </ul>
            </div>
            <div className="col-md-6">
              <h6 className="text-primary">Optional Columns:</h6>
              <ul className="small">
                <li><strong>discount price</strong> - Sale/discount price</li>
                <li><strong>stock quantity</strong> - Available stock (default: 100)</li>
              </ul>
            </div>
          </div>
          <div className="mt-2 p-2 bg-white rounded border">
            <h6 className="text-warning mb-2">⚠️ Important Notes:</h6>
            <ul className="small mb-0">
              <li>Seller name will be auto-detected from your Excel files</li>
              <li>Duplicate SKUs in the same file will cause import errors</li>
              <li>Files must contain valid SKUs that exist in your product database</li>
              <li>Default stock quantity is 100 if not specified</li>
            </ul>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PriceImportForm;