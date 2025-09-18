

import { useState, useEffect } from 'react';
import { Col, Row, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import SelectFormInput from '@/components/form/SelectFormInput';
import TextFormInput from '@/components/form/TextFormInput';
import { getAllTechProductNames, createTechProduct } from '@/http/TechProduct';
import { renameKeys } from '@/utils/rename-object-keys';
import toast from 'react-hot-toast';

// Validation schema
const techProductSchema = yup.object({
  specId: yup.number().required('Specification is required'),
  value: yup.string().required('Value is required'),
});

const CreateTechProductForm = () => {
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [specOptions, setSpecOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(techProductSchema),
    defaultValues: {
      specId: '',
      value: '',
    },
  });

  // Fetch specifications on component mount
  useEffect(() => {
    const fetchSpecs = async () => {
      try {
        setIsLoading(true);
        const data = await getAllTechProductNames();
        console.log('API Response:', data); // Debug: Check what the API returns
        
        if (!data || !Array.isArray(data)) {
          console.error('Invalid data format received from API');
          setError('Invalid data received from server');
          return;
        }
        
        // Map the data to the format expected by SelectFormInput
        const mapped = data.map((spec) => ({
          value: spec.id,
          label: spec.title || spec.name || 'Unnamed'
        }));
        
        console.log('Mapped options:', mapped); // Debug: Check the mapped options
        setSpecOptions(mapped);
      } catch (err) {
        console.error('Failed to fetch specs:', err);
        setError('Failed to load specifications');
        toast.error('Failed to load specifications');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSpecs();
  }, []);

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      await createTechProduct(formData);
      
      // Show success message
      toast.success('TechProduct created successfully!');
      setShowSuccessAlert(true);
      
      // Reset form
      reset();
      
      // Hide alert after 5 seconds
      setTimeout(() => setShowSuccessAlert(false), 5000);
    } catch (err) {
      console.error('Error creating TechProduct:', err);
      const errorMsg = err.response?.data?.error || 'Failed to create TechProduct';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      {showSuccessAlert && (
        <Alert variant="success" className="d-flex align-items-center">
          <IconifyIcon icon="bx:check-double" className="me-2 text-success h4 mb-0" />
          <div>
            <h5 className="mt-0 mb-1">Congratulations!</h5>
            <p className="mb-0">Your TechProduct has been successfully added!</p>
          </div>
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
          <Col lg={6}>
            <div className="mb-3">
              <label className="form-label">TechProductNames *</label>
              {isLoading ? (
                <div className="form-control">
                  <span className="text-muted">Loading TechProductNames...</span>
                </div>
              ) : specOptions.length === 0 ? (
                <div className="form-control">
                  <span className="text-muted">No TechProductNames available</span>
                </div>
              ) : (
                <SelectFormInput
                  control={control}
                  name="specId"
                  options={specOptions}
                  placeholder="Select TechProductName"
                />
              )}
            </div>
          </Col>
          <Col lg={6}>
            <TextFormInput
              control={control}
              name="value"
              label="Value *"
              containerClassName="mb-3"
              placeholder="Enter Value"
            />
          </Col>
        </Row>

        <div className="d-flex justify-content-end mt-3">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={isSubmitting || isLoading || specOptions.length === 0}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Creating...
              </>
            ) : (
              <>
                <IconifyIcon icon="bx:plus" className="me-2" />
                Create TechProduct
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTechProductForm;