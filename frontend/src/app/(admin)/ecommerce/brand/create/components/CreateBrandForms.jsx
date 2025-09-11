import { useState } from 'react';
import { Col, Row, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import ReactQuill from 'react-quill';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import TextFormInput from '@/components/form/TextFormInput';
import { createBrand } from '@/http/Brand'; // Adjust import path as needed

// Form validation schema
const brandFormSchema = yup.object({
  title: yup.string().required('Brand title is required'),
  short_descp: yup.string().optional(),
  meta_descp: yup.string().optional(),
});

const CreateBrandForm = () => {
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [brandDescriptionContent, setBrandDescriptionContent] = useState('<h2>Describe Your Brand...</h2>');
  const [brandMetaDescriptionContent, setBrandMetaDescriptionContent] = useState('');

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(brandFormSchema)
  });

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
      
      await createBrand(formData);
      
      // Show success alert
      setShowSuccessAlert(true);
      
      // Reset form
      reset();
      setBrandDescriptionContent('<h2>Describe Your Brand...</h2>');
      setBrandMetaDescriptionContent('');
      
      // Hide alert after 5 seconds
      setTimeout(() => setShowSuccessAlert(false), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create brand');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      {showSuccessAlert && (
        <Alert variant="success" className="d-flex align-items-center">
          <IconifyIcon icon="bx:check-circle" className="me-2" />
          Brand created successfully!
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
        
        <Row>
          
        </Row>
        
        {/* <div className="mb-3 mt-4">
          <label className="form-label">Status</label>
          <br />
          <div className="form-check form-check-inline">
            <input className="form-check-input" name="status" type="radio" id="onlineStatus" value="online" defaultChecked />
            <label className="form-check-label" htmlFor="onlineStatus">
              Online
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input className="form-check-input" name="status" type="radio" id="offlineStatus" value="offline" />
            <label className="form-check-label" htmlFor="offlineStatus">
              Offline
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input className="form-check-input" name="status" type="radio" id="draftStatus" value="draft" />
            <label className="form-check-label" htmlFor="draftStatus">
              Draft
            </label>
          </div>
        </div> */}
        
        <div className="d-flex justify-content-end mt-5">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating...
              </>
            ) : (
              <>
                <IconifyIcon icon="bx:plus" className="me-2" />
                Create Brand
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBrandForm;