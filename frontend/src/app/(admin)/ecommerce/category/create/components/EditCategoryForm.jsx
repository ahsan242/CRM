import { useState, useEffect } from 'react';
import { Col, Row, Alert } from 'react-bootstrap';
import ReactQuill from 'react-quill';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getCategory, updateCategory } from '@/http/Category';
import toast from 'react-hot-toast';

const EditCategoryForm = ({ categoryId, onSuccess }) => {
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Form data state
  const [formData, setFormData] = useState({
    title: "",
    metaTitle: "",
    metaDescp: "",
    status: "Online",
  });

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        const response = await getCategory(categoryId);
        const category = response.data;
        
        // Set form values
        setFormData({
          title: category.title || "",
          metaTitle: category.metaTitle || "",
          metaDescp: category.metaDescp || "",
          status: category.status || "Online",
        });
        
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch category details');
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  // Update form data
  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await updateCategory(categoryId, formData);
      
      // Show success alert
      setShowSuccessAlert(true);
      toast.success('Category updated successfully!');
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Hide alert after 5 seconds
      setTimeout(() => setShowSuccessAlert(false), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update category');
      toast.error(err.response?.data?.error || 'Failed to update category');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading category details...</div>;
  }

  return (
    <div className="p-4">
      {showSuccessAlert && (
        <Alert variant="success" className="d-flex align-items-center">
          <IconifyIcon icon="bx:check-circle" className="me-2" />
          Category updated successfully!
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger" className="d-flex align-items-center">
          <IconifyIcon icon="bx:error" className="me-2" />
          {error}
        </Alert>
      )}
      
      <form onSubmit={onSubmit}>
        <Row>
          {/* Title */}
          <Col lg={6}>
            <div className="mb-3">
              <label className="form-label">Title</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Title"
                value={formData.title}
                onChange={(e) => updateFormData({ title: e.target.value })}
                required
              />
            </div>
          </Col>

          {/* Meta Title */}
          <Col lg={6}>
            <div className="mb-3">
              <label className="form-label">Meta Title</label>
              <input
                type="text"
                className="form-control"
                placeholder="Enter Meta Title"
                value={formData.metaTitle}
                onChange={(e) => updateFormData({ metaTitle: e.target.value })}
              />
            </div>
          </Col>
        </Row>

        {/* Meta Description (Rich Text Editor) */}
        <Row>
          <Col lg={12}>
            <div className="mb-5">
              <label className="form-label">Meta Description</label>
              <ReactQuill
                theme="snow"
                style={{ height: 195 }}
                value={formData.metaDescp}
                onChange={(value) => updateFormData({ metaDescp: value })}
                modules={{
                  toolbar: [
                    [{ font: [] }, { size: [] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ color: [] }, { background: [] }],
                    [{ script: "super" }, { script: "sub" }],
                    [{ header: [false, 1, 2, 3, 4, 5, 6] }, "blockquote", "code-block"],
                    [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
                    ["direction", { align: [] }],
                    ["link", "image", "video"],
                    ["clean"],
                  ],
                }}
              />
            </div>
          </Col>
        </Row>

        {/* Status */}
        <div className="mb-3">
          <label className="form-label">Status</label>
          <br />
          {["Online", "Offline", "Draft"].map((status) => (
            <div key={status} className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                id={`${status}Status`}
                checked={formData.status === status}
                onChange={() => updateFormData({ status })}
              />
              <label className="form-check-label" htmlFor={`${status}Status`}>
                {status}
              </label>
            </div>
          ))}
        </div>
        
        <div className="d-flex justify-content-end mt-5">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Updating...
              </>
            ) : (
              <>
                <IconifyIcon icon="bx:save" className="me-2" />
                Update Category
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCategoryForm;