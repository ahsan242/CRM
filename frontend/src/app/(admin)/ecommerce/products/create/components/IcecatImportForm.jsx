
// src/app/(admin)/ecommerce/products/create/components/IcecatImportForm.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Row, Col, Alert, Button, Card, Spinner, Badge, Form, 
  ProgressBar, Modal, Tabs, Tab, Table 
} from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import TextFormInput from '@/components/form/TextFormInput';
import { 
  importProductFromIcecat, 
  getImportedProducts,
  importFromProductForImport,
  getImportJobStatus,
  bulkImportProducts
} from '@/http/Product';

const IcecatImportForm = ({ onProductImported }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [importedProduct, setImportedProduct] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [importedProductsList, setImportedProductsList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [statusFilter, setStatusFilter] = useState('inactive');
  const [searchTerm, setSearchTerm] = useState('');
  const [batchImportProgress, setBatchImportProgress] = useState(null);
  const [importHistory, setImportHistory] = useState([]);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalProducts, setTotalProducts] = useState(0);

  const [batchConfig, setBatchConfig] = useState({
    count: 10,
    status: 'inactive',
    brand: '',
    distributor: '',
    autoCleanup: true,
    delayBetweenRequests: 1000
  });

  const { control, handleSubmit, watch, setValue, reset } = useForm({
    defaultValues: {
      productCode: '',
      brand: ''
    }
  });

  const productCode = watch('productCode');
  const brand = watch('brand');

  // Update the status filter options to include 'pending'
  const statusFilterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active Only' },
    { value: 'inactive', label: 'Inactive Only' },
    { value: 'pending', label: 'Pending Only' } // NEW: Added pending filter
  ];

  // Fetch imported products with pagination
  const fetchImportedProducts = async (status = 'inactive', page = 1, limit = pageSize) => {
    setLoadingProducts(true);
    try {
      let url = `/api/productforimports?page=${page}&limit=${limit}`;
      if (status !== 'all') {
        url += `&status=${status}`;
      }
      
      const response = await getImportedProducts(url);
      if (response.success) {
        setImportedProductsList(response.data || []);
        setTotalProducts(response.pagination?.total || 0);
        setCurrentPage(response.pagination?.page || 1);
        setPageSize(response.pagination?.limit || limit);
      }
    } catch (err) {
      console.error('Error fetching imported products:', err);
      setError('Failed to load imported products list');
    } finally {
      setLoadingProducts(false);
    }
  };

  // Fetch import history
  const fetchImportHistory = async () => {
    try {
      const history = await getImportJobStatus('recent');
      setImportHistory(history.data || []);
    } catch (err) {
      console.error('Error fetching import history:', err);
    }
  };

  useEffect(() => {
    fetchImportedProducts(statusFilter, 1, pageSize);
    fetchImportHistory();
  }, [statusFilter, pageSize]);

  // Poll for batch import progress
  useEffect(() => {
    let interval;
    if (batchImportProgress && batchImportProgress.status === 'processing') {
      interval = setInterval(async () => {
        try {
          const jobStatus = await getImportJobStatus(batchImportProgress.jobId);
          setBatchImportProgress(jobStatus.data);
          
          if (jobStatus.data.status === 'completed' || jobStatus.data.status === 'failed') {
            clearInterval(interval);
            fetchImportedProducts(statusFilter, currentPage, pageSize);
            fetchImportHistory();
            setSelectedProducts([]);
          }
        } catch (err) {
          console.error('Error polling job status:', err);
        }
      }, 3000);
    }
    
    return () => clearInterval(interval);
  }, [batchImportProgress]);

  // Update the handleImport function to handle pending status
  const handleImport = async (data) => {
    setLoading(true);
    setError('');
    setSuccess('');
    setImportedProduct(null);
    setDebugInfo('');
    
    try {
      console.log('Sending import request:', data);
      const response = await importProductFromIcecat(data);
      console.log('Import response:', response);
      
      if (response.product) {
        setImportedProduct(response.product);
        setSuccess('Product imported successfully!');
        onProductImported?.(response.product);
        fetchImportedProducts(statusFilter, currentPage, pageSize);
        fetchImportHistory();
      } else if (response.status === 'pending') {
        // ✅ NEW: Handle pending status
        setSuccess('Product not found in Icecat database. Status set to PENDING for manual review.');
        fetchImportedProducts(statusFilter, currentPage, pageSize);
      } else if (response.message) {
        setSuccess(response.message);
      }
      
    } catch (err) {
      console.error('Import error:', err);
      const errorMessage = err.message || 'Failed to import product from Icecat';
      setError(errorMessage);
      
      // ✅ NEW: Check if it's a 404 error and handle pending status
      if (err.response?.status === 404) {
        setSuccess('Product not found in Icecat database. Status set to PENDING for manual review.');
        fetchImportedProducts(statusFilter, currentPage, pageSize);
      }
      
      setDebugInfo(`Error details: ${JSON.stringify(err.response?.data || {}, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk import of selected products
  const handleBulkImportSelected = async () => {
    if (selectedProducts.length === 0) {
      setError('Please select at least one product to import');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const productsToImport = importedProductsList
        .filter(product => selectedProducts.includes(product.id))
        .map(product => ({
          productCode: product.sku,
          brand: product.brand,
          price: 0.0,
          quantity: 0
        }));

      console.log('Bulk importing selected products:', productsToImport);

      const response = await bulkImportProducts({ products: productsToImport });
      
      if (response.success) {
        setSuccess(`Bulk import started for ${selectedProducts.length} products!`);
        setBatchImportProgress({
          jobId: response.jobId,
          status: 'processing',
          progress: 0,
          ...response.importJob
        });
        setBulkAction('');
      } else {
        setError(response.error || 'Failed to start bulk import');
      }
      
    } catch (err) {
      console.error('Bulk import error:', err);
      setError(err.message || 'Failed to start bulk import');
    } finally {
      setLoading(false);
    }
  };

  const handleBatchImport = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('Starting batch import with config:', batchConfig);
      
      const response = await importFromProductForImport(batchConfig);
      
      if (response.success) {
        setSuccess(`Batch import started! ${response.message}`);
        setBatchImportProgress({
          jobId: response.jobId,
          status: 'processing',
          progress: 0,
          ...response.importJob
        });
        setShowBatchModal(false);
      } else {
        setError(response.error || 'Failed to start batch import');
      }
      
    } catch (err) {
      console.error('Batch import error:', err);
      setError(err.message || 'Failed to start batch import');
    } finally {
      setLoading(false);
    }
  };

  const handleUseImportedProduct = () => {
    if (importedProduct) {
      onProductImported?.(importedProduct, true);
    }
  };

  // Selection handlers
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedProducts(importedProductsList.map(product => product.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (productId, checked) => {
    if (checked) {
      setSelectedProducts(prev => [...prev, productId]);
    } else {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    }
  };

  // Test with sample data
  const fillSampleData = () => {
    setValue('productCode', 'E500-G.APSMB1');
    setValue('brand', 'HP');
  };

  // Quick fill from imported products list
  const quickFillFromList = (product) => {
    setValue('productCode', product.sku);
    setValue('brand', product.brand);
    setSuccess(`Form filled with ${product.sku} - ${product.brand}`);
  };

  // Update the status badge to handle pending status
  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      inactive: 'secondary',
      pending: 'warning' // NEW: Added pending variant
    };
    
    return (
      <Badge bg={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  // Filter imported products based on search term and status
  const filteredImportedProducts = useMemo(() => {
    return importedProductsList.filter(product => {
      const matchesSearch = 
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.distributor?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || product.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [importedProductsList, searchTerm, statusFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(totalProducts / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalProducts);

  // Statistics with enhanced metrics - UPDATED to include pending count
  const stats = useMemo(() => {
    const total = totalProducts;
    const active = importedProductsList.filter(p => p.status === 'active').length;
    const inactive = importedProductsList.filter(p => p.status === 'inactive').length;
    const pending = importedProductsList.filter(p => p.status === 'pending').length; // NEW: Pending count
    const brands = [...new Set(importedProductsList.map(p => p.brand))].length;
    const distributors = [...new Set(importedProductsList.map(p => p.distributor))].length;
    
    return {
      total,
      active,
      inactive,
      pending, // NEW: Include pending in stats
      brands,
      distributors,
      successRate: total > 0 ? ((active / total) * 100).toFixed(1) : 0,
      selectedCount: selectedProducts.length,
      showing: importedProductsList.length
    };
  }, [importedProductsList, totalProducts, selectedProducts]);

  // Smart batch suggestions based on available products - UPDATED to include pending
  const batchSuggestions = useMemo(() => {
    const suggestions = [];
    const brands = [...new Set(importedProductsList.map(p => p.brand))];
    
    brands.forEach(brand => {
      // Include both inactive and pending products for suggestions
      const brandProducts = importedProductsList.filter(p => 
        p.brand === brand && (p.status === 'inactive' || p.status === 'pending')
      );
      if (brandProducts.length > 0) {
        const inactiveCount = brandProducts.filter(p => p.status === 'inactive').length;
        const pendingCount = brandProducts.filter(p => p.status === 'pending').length;
        
        suggestions.push({
          brand,
          count: brandProducts.length,
          inactiveCount,
          pendingCount,
          distributor: brandProducts[0].distributor,
          description: `${inactiveCount} inactive, ${pendingCount} pending products available`
        });
      }
    });
    
    return suggestions.sort((a, b) => b.count - a.count);
  }, [importedProductsList]);

  // Apply smart batch suggestion
  const applySuggestion = (suggestion) => {
    setBatchConfig(prev => ({
      ...prev,
      brand: suggestion.brand,
      distributor: suggestion.distributor,
      count: Math.min(suggestion.count, 50)
    }));
    setShowBatchModal(true);
  };

  // Calculate daily usage (mock - you'd implement based on your backend)
  const dailyUsage = {
    used: 45,
    limit: 199,
    remaining: 154
  };

  // Handle immediate activation
  const handleActivateImmediately = async (product) => {
    try {
      setLoading(true);
      const response = await fetch('/api/products/activate-immediately', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sku: product.sku,
          brand: product.brand,
          distributor: product.distributor
        })
      });
      const result = await response.json();
      if (result.success) {
        setSuccess(`Product ${product.sku} activated immediately!`);
        fetchImportedProducts(statusFilter, currentPage, pageSize);
      } else {
        setError(result.error || 'Failed to activate product');
      }
    } catch (err) {
      setError('Failed to activate product');
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchImportedProducts(statusFilter, newPage, pageSize);
  };

  // Handle page size change
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    fetchImportedProducts(statusFilter, 1, newSize);
  };

  return (
    <Card>
      <Card.Header>
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Advanced Icecat Import</h5>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={() => setShowBatchModal(true)}
            >
              <i className="bx bx-layer me-1"></i>
              Batch Import
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={() => {
                fetchImportedProducts(statusFilter, currentPage, pageSize);
                fetchImportHistory();
                setSelectedProducts([]);
              }}
            >
              <i className="bx bx-refresh me-1"></i>
              Refresh
            </Button>
          </div>
        </div>
      </Card.Header>
      
      <Card.Body>
        {/* Daily Usage Alert */}
        <Alert variant="info" className="d-flex align-items-center">
          <i className="bx bx-info-circle me-2 fs-18"></i>
          <div className="flex-grow-1">
            <strong>Daily Icecat API Usage:</strong> {dailyUsage.used}/{dailyUsage.limit} requests 
            ({dailyUsage.remaining} remaining)
          </div>
          <ProgressBar 
            now={(dailyUsage.used / dailyUsage.limit) * 100} 
            style={{ width: '200px' }}
            variant={dailyUsage.used > 150 ? 'warning' : dailyUsage.used > 180 ? 'danger' : 'success'}
          />
        </Alert>

        <Tabs defaultActiveKey="single" className="mb-4">
          {/* Single Import Tab */}
          <Tab eventKey="single" title="Single Import">
            <div className="mb-3">
              <Button variant="outline-secondary" size="sm" onClick={fillSampleData}>
                Fill Sample Data
              </Button>
              <small className="text-muted ms-2">(HP E500-G.APSMB1 for testing)</small>
            </div>

            <form onSubmit={handleSubmit(handleImport)}>
              {error && (
                <Alert variant="danger">
                  <strong>Error:</strong> {error}
                  {debugInfo && (
                    <details className="mt-2">
                      <summary>Debug Info</summary>
                      <pre className="mt-2 small">{debugInfo}</pre>
                    </details>
                  )}
                </Alert>
              )}
              {success && <Alert variant="success">{success}</Alert>}
              
              <Row>
                <Col lg={6}>
                  <TextFormInput
                    control={control}
                    name="productCode"
                    label="Product Code *"
                    placeholder="e.g., E500-G.APSMB1"
                    containerClassName="mb-3"
                  />
                </Col>
                <Col lg={6}>
                  <TextFormInput
                    control={control}
                    name="brand"
                    label="Brand *"
                    placeholder="e.g., HP, LG, DELL"
                    containerClassName="mb-3"
                  />
                </Col>
              </Row>

              <div className="d-flex gap-2">
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={loading || !productCode || !brand}
                >
                  {loading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <i className="bx bx-download me-1"></i>
                      Import Product
                    </>
                  )}
                </Button>
                
                {importedProduct && (
                  <Button 
                    variant="success" 
                    onClick={handleUseImportedProduct}
                  >
                    <i className="bx bx-check me-1"></i>
                    Use Imported Product
                  </Button>
                )}
              </div>
            </form>

            {importedProduct && (
              <div className="mt-4 p-3 border rounded">
                <h6>Imported Product Details:</h6>
                <p><strong>Title:</strong> {importedProduct.title}</p>
                <p><strong>Brand:</strong> {importedProduct.brand?.title || importedProduct.brandId}</p>
                <p><strong>SKU:</strong> {importedProduct.sku}</p>
                <p><strong>Category:</strong> {importedProduct.category?.title || importedProduct.categoryId}</p>
                <p><strong>Description:</strong> {importedProduct.shortDescp?.substring(0, 100)}...</p>
                
                {importedProduct.mainImage && (
                  <div className="mt-2">
                    <img 
                      src={`/uploads/${importedProduct.mainImage}`} 
                      alt="Product preview" 
                      style={{ maxHeight: '150px', maxWidth: '100%' }}
                      className="img-thumbnail"
                    />
                  </div>
                )}
              </div>
            )}
          </Tab>

          {/* Batch Import Tab */}
          <Tab eventKey="batch" title="Batch Management">
            <div className="row">
              <div className="col-md-8">
                <h6>Smart Batch Suggestions</h6>
                <div className="row g-2 mb-4">
                  {batchSuggestions.slice(0, 6).map((suggestion, index) => (
                    <div key={index} className="col-md-6 col-lg-4">
                      <Card className="h-100">
                        <Card.Body className="p-3">
                          <h6 className="card-title">{suggestion.brand}</h6>
                          <p className="card-text small text-muted mb-2">
                            {suggestion.description}
                          </p>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <Badge bg="primary" className="me-1">{suggestion.count} total</Badge>
                              <Badge bg="warning" className="me-1">{suggestion.pendingCount} pending</Badge>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline-primary"
                              onClick={() => applySuggestion(suggestion)}
                            >
                              Import
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </div>
                  ))}
                  {batchSuggestions.length === 0 && (
                    <div className="col-12">
                      <Alert variant="info">
                        No batch suggestions available. Load some products first.
                      </Alert>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="col-md-4">
                <Card>
                  <Card.Header>
                    <h6 className="mb-0">Quick Stats</h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-flex flex-column gap-2">
                      <div className="d-flex justify-content-between">
                        <span>Total Products:</span>
                        <Badge bg="secondary">{stats.total}</Badge>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Active:</span>
                        <Badge bg="success">{stats.active}</Badge>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Inactive:</span>
                        <Badge bg="warning">{stats.inactive}</Badge>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Pending:</span>
                        <Badge bg="warning">{stats.pending}</Badge>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Showing:</span>
                        <Badge bg="info">{stats.showing}</Badge>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Selected:</span>
                        <Badge bg="primary">{stats.selectedCount}</Badge>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span>Success Rate:</span>
                        <Badge bg={stats.successRate > 80 ? 'success' : 'warning'}>
                          {stats.successRate}%
                        </Badge>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>

            {/* Batch Import Progress */}
            {batchImportProgress && (
              <Card className="mt-4 border-primary">
                <Card.Header>
                  <h6 className="mb-0">Batch Import Progress</h6>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Progress: {batchImportProgress.progress}%</span>
                      <span>
                        {batchImportProgress.processedProducts || 0} / {batchImportProgress.totalProducts || 0}
                      </span>
                    </div>
                    <ProgressBar 
                      now={batchImportProgress.progress} 
                      variant={
                        batchImportProgress.status === 'completed' ? 'success' :
                        batchImportProgress.status === 'failed' ? 'danger' : 'primary'
                      }
                    />
                  </div>
                  <div className="row text-center">
                    <div className="col-3">
                      <strong className="text-success">{batchImportProgress.successfulImports || 0}</strong>
                      <div className="small text-muted">Successful</div>
                    </div>
                    <div className="col-3">
                      <strong className="text-warning">{batchImportProgress.skippedImports || 0}</strong>
                      <div className="small text-muted">Skipped</div>
                    </div>
                    <div className="col-3">
                      <strong className="text-warning">{batchImportProgress.pendingImports || 0}</strong>
                      <div className="small text-muted">Pending</div>
                    </div>
                    <div className="col-3">
                      <strong className="text-danger">{batchImportProgress.failedImports || 0}</strong>
                      <div className="small text-muted">Failed</div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}
          </Tab>
        </Tabs>

        {/* Imported Products List with Selection */}
        <Card className="mt-4">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                Available Products for Import 
                <Badge bg="primary" className="ms-2">{stats.selectedCount} selected</Badge>
              </h6>
              <div className="d-flex gap-2 align-items-center">
                <Form.Control
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="sm"
                  style={{ width: '200px' }}
                />
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  size="sm"
                  style={{ width: '150px' }}
                >
                  {statusFilterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </div>
            </div>
          </Card.Header>
          
          {/* Bulk Actions */}
          {selectedProducts.length > 0 && (
            <div className="card-body border-bottom bg-light">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <span className="text-primary fw-semibold">
                    <i className="bx bx-check-double me-2"></i>
                    {selectedProducts.length} product(s) selected
                  </span>
                </div>
                <div className="col-md-6">
                  <div className="d-flex gap-2 justify-content-md-end">
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={handleBulkImportSelected}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <i className="bx bx-download me-1"></i>
                          Import Selected ({selectedProducts.length})
                        </>
                      )}
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => setSelectedProducts([])}
                    >
                      Clear Selection
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Card.Body>
            {loadingProducts ? (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" className="me-2" />
                Loading imported products...
              </div>
            ) : importedProductsList.length === 0 ? (
              <div className="text-center py-3 text-muted">
                No imported products found
              </div>
            ) : (
              <>
                <div className="table-responsive">
                  <table className="table table-sm table-hover">
                    <thead>
                      <tr>
                        <th width="50">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={selectedProducts.length === importedProductsList.length && importedProductsList.length > 0}
                              onChange={handleSelectAll}
                            />
                          </div>
                        </th>
                        <th>SKU</th>
                        <th>Brand</th>
                        <th>Distributor</th>
                        <th>Status</th>
                        <th>Last Updated</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importedProductsList.map((product) => (
                        <tr key={product.id} className={selectedProducts.includes(product.id) ? 'table-active' : ''}>
                          <td>
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={selectedProducts.includes(product.id)}
                                onChange={(e) => handleSelectProduct(product.id, e.target.checked)}
                                disabled={product.status === 'active' || product.status === 'pending'}
                              />
                            </div>
                          </td>
                          <td>
                            <code>{product.sku}</code>
                            {product.upcCode && (
                              <div>
                                <small className="text-muted">UPC: {product.upcCode}</small>
                              </div>
                            )}
                            {product.errorMessage && (
                              <div>
                                <small className="text-danger" title={product.errorMessage}>
                                  Error: {product.errorMessage.substring(0, 50)}...
                                </small>
                              </div>
                            )}
                          </td>
                          <td>
                            <Badge bg="outline-primary">{product.brand}</Badge>
                          </td>
                          <td>
                            <Badge bg="outline-secondary">{product.distributor}</Badge>
                          </td>
                          <td>
                            {getStatusBadge(product.status)}
                          </td>
                          <td>
                            <small className="text-muted">
                              {new Date(product.lastUpdated).toLocaleDateString()}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => quickFillFromList(product)}
                                title="Use this product for import"
                                disabled={product.status === 'active'}
                              >
                                Use
                              </Button>
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => {
                                  setValue('productCode', product.sku);
                                  setValue('brand', product.brand);
                                  handleSubmit(handleImport)();
                                }}
                                title="Import this product now"
                                disabled={product.status === 'active' || loading}
                              >
                                {loading ? (
                                  <Spinner animation="border" size="sm" />
                                ) : (
                                  <i className="bx bx-download">Import Product</i>
                                )}
                              </Button>
                              {/* ACTIVATE IMMEDIATELY BUTTON */}
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => handleActivateImmediately(product)}
                                title="Activate Immediately"
                                disabled={product.status === 'active' || loading}
                              >
                                <i className="bx bx-check-circle"></i> Activate
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="d-flex justify-content-between align-items-center mt-3">
                  <div>
                    <small className="text-muted">
                      Showing {startIndex + 1}-{endIndex} of {totalProducts} products • 
                      Page {currentPage} of {totalPages}
                    </small>
                  </div>
                  <div className="d-flex gap-2 align-items-center">
                    <Form.Select
                      value={pageSize}
                      onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                      size="sm"
                      style={{ width: '120px' }}
                    >
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                      <option value={100}>100 per page</option>
                    </Form.Select>
                    
                    <div className="btn-group">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </Card.Body>
        </Card>

        {/* Batch Import Modal */}
        <Modal show={showBatchModal} onHide={() => setShowBatchModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Configure Batch Import</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Number of Products</Form.Label>
                  <Form.Control
                    type="number"
                    value={batchConfig.count}
                    onChange={(e) => setBatchConfig(prev => ({ 
                      ...prev, 
                      count: parseInt(e.target.value) 
                    }))}
                    min="1"
                    max="199"
                  />
                  <Form.Text className="text-muted">
                    Max: 199 (Icecat daily limit: {dailyUsage.remaining} remaining)
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status Filter</Form.Label>
                  <Form.Select
                    value={batchConfig.status}
                    onChange={(e) => setBatchConfig(prev => ({ 
                      ...prev, 
                      status: e.target.value 
                    }))}
                  >
                    <option value="inactive">Inactive Only</option>
                    <option value="pending">Pending Only</option>
                    <option value="all">All Status</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Brand Filter</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., HP, Dell"
                    value={batchConfig.brand}
                    onChange={(e) => setBatchConfig(prev => ({ 
                      ...prev, 
                      brand: e.target.value 
                    }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Distributor Filter</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., ingram"
                    value={batchConfig.distributor}
                    onChange={(e) => setBatchConfig(prev => ({ 
                      ...prev, 
                      distributor: e.target.value 
                    }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Check
              type="checkbox"
              label="Auto-cleanup failed products"
              checked={batchConfig.autoCleanup}
              onChange={(e) => setBatchConfig(prev => ({ 
                ...prev, 
                autoCleanup: e.target.checked 
              }))}
              className="mb-3"
            />
            
            <Form.Group className="mb-3">
              <Form.Label>Delay Between Requests (ms)</Form.Label>
              <Form.Control
                type="number"
                value={batchConfig.delayBetweenRequests}
                onChange={(e) => setBatchConfig(prev => ({ 
                  ...prev, 
                  delayBetweenRequests: parseInt(e.target.value) 
                }))}
                min="500"
                max="5000"
                step="500"
              />
              <Form.Text className="text-muted">
                Higher delays reduce API rate limiting issues
              </Form.Text>
            </Form.Group>
            
            <Alert variant="warning">
              <strong>Note:</strong> This will use {batchConfig.count} of your daily Icecat API calls. 
              Remaining today: {dailyUsage.remaining}
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowBatchModal(false)}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleBatchImport}
              disabled={loading || batchConfig.count > dailyUsage.remaining}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Starting...
                </>
              ) : (
                `Start Batch Import (${batchConfig.count} products)`
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </Card.Body>
    </Card>
  );
};

export default IcecatImportForm;