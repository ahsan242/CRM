// src/app/(admin)/ecommerce/products/create/components/ImportJobsTable.jsx
import { useState, useEffect } from 'react';
import { Table, Badge, Button, Spinner } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getImportJobs } from '@/http/Product';

const ImportJobsTable = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await getImportJobs();
      setJobs(response.data || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch import jobs');
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'processing': return 'primary';
      case 'failed': return 'danger';
      case 'scheduled': return 'warning';
      default: return 'secondary';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return <div className="text-center py-4"><Spinner animation="border" /> Loading import jobs...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Import Jobs</h5>
        <Button variant="outline-primary" size="sm" onClick={fetchJobs}>
          <IconifyIcon icon="bx:refresh" className="me-1" />
          Refresh
        </Button>
      </div>

      {jobs.length === 0 ? (
        <div className="alert alert-info">No import jobs found.</div>
      ) : (
        <Table striped bordered responsive>
          <thead>
            <tr>
              <th>Job ID</th>
              <th>Products</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Created</th>
              <th>Completed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>#{job.id}</td>
                <td>{job.totalProducts}</td>
                <td>
                  <Badge bg={getStatusVariant(job.status)}>
                    {job.status}
                  </Badge>
                </td>
                <td>
                  <div className="d-flex align-items-center">
                    <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                      <div 
                        className={`progress-bar bg-${getStatusVariant(job.status)}`}
                        style={{ width: `${job.progress}%` }}
                      ></div>
                    </div>
                    <small>{job.progress}%</small>
                  </div>
                </td>
                <td>{formatDate(job.createdAt)}</td>
                <td>{job.completedAt ? formatDate(job.completedAt) : '-'}</td>
                <td>
                  <Button variant="outline-secondary" size="sm">
                    Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default ImportJobsTable;