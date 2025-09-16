import { useState, useEffect } from 'react';
import { Col, Row, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ReactQuill from 'react-quill';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import TextFormInput from '@/components/form/TextFormInput';
import { getBrand, updateBrand } from '@/http/Brand';

// Form validation schema
const brandFormSchema = yup.object({
  title: yup.string().required('Brand title is required'),
  short_descp: yup.string().optional(),
  meta_descp: yup.string().optional(),
});

const EditBrandForm = ({ brandId, onSuccess }) => {
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [brandDescriptionContent, setBrandDescriptionContent] = useState('');
  const [brandMetaDescriptionContent, setBrandMetaDescriptionContent] = useState('');
  const [loading, setLoading] = useState(true);

  const { control, handleSubmit, reset, setValue } = useForm({
    resolver: yupResolver(brandFormSchema)
  });

  useEffect(() => {
    const fetchBrand = async () => {
      try {
        setLoading(true);
        const response = await getBrand(brandId);
        const brand = response.data;
        
        // Set form values
        setValue('title', brand.title);
        setBrandDescriptionContent(brand.short_descp || '');
        setBrandMetaDescriptionContent(brand.meta_descp || '');
        
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch brand details');
      } finally {
        setLoading(false);
      }
    };

    if (brandId) {
      fetchBrand();
    }
  }, [brandId, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Add the Quill content to the form data
      const formData = {
        ...data,
        short_descp: brandDescriptionContent,
        meta_descp: brandMetaDescriptionContent,
      };
      
      await updateBrand(brandId, formData);
      
      // Show success alert
      setShowSuccessAlert(true);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Hide alert after 5 seconds
      setTimeout(() => setShowSuccessAlert(false), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update brand');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading brand details...</div>;
  }

  return (
    <div className="p-4">
      {showSuccessAlert && (
        <Alert variant="success" className="d-flex align-items-center">
          <IconifyIcon icon="bx:check-circle" className="me-2" />
          Brand updated successfully!
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger" className="d-flex align-items-center">
          <IconifyIcon icon="bx:error" className="me-2" />
          {error}
        </Alert>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <Row>
          <Col lg={12}>
            <TextFormInput 
              control={control} 
              label="Brand Title" 
              placeholder="Enter brand title" 
              containerClassName="mb-3" 
              id="brand-title" 
              name="title" 
            />
          </Col>
        </Row>
        
        <Row>
          <Col lg={6}>
            <div className="mb-3">
              <label className="form-label">Brand Description</label>
              <ReactQuill 
                theme="snow" 
                style={{ height: 195 }}
                className="pb-sm-3 pb-5 pb-xl-0" 
                modules={{
                  toolbar: [[
                    { font: [] }, { size: [] }
                  ], ['bold', 'italic', 'underline', 'strike'], [
                    { color: [] }, { background: [] }
                  ], [
                    { script: 'super' }, { script: 'sub' }
                  ], [
                    { header: [false, 1, 2, 3, 4, 5, 6] }, 'blockquote', 'code-block'
                  ], [
                    { list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }
                  ], ['direction', { align: [] }], ['link', 'image', 'video'], ['clean']]
                }} 
                value={brandDescriptionContent} 
                onChange={setBrandDescriptionContent} 
              />
            </div>
          </Col>
          <Col lg={6}>
            <div className="mb-3">
              <label className="form-label">Meta Description</label>
              <ReactQuill 
                theme="snow" 
                style={{ height: 195 }}
                className="pb-sm-3 pb-5 pb-xl-0" 
                modules={{
                  toolbar: [[
                    { font: [] }, { size: [] }
                  ], ['bold', 'italic', 'underline', 'strike'], [
                    { color: [] }, { background: [] }
                  ], [
                    { script: 'super' }, { script: 'sub' }
                  ], [
                    { header: [false, 1, 2, 3, 4, 5, 6] }, 'blockquote', 'code-block'
                  ], [
                    { list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }
                  ], ['direction', { align: [] }], ['link', 'image', 'video'], ['clean']]
                }} 
                value={brandMetaDescriptionContent} 
                onChange={setBrandMetaDescriptionContent} 
              />
            </div>
          </Col>
        </Row>
        
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
                Update Brand
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBrandForm;