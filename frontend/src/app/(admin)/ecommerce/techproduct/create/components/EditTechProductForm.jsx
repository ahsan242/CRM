// import { useEffect } from "react";
// import { useForm } from "react-hook-form";
// import { yupResolver } from "@hookform/resolvers/yup";
// import * as yup from "yup";
// import { Row, Col } from "react-bootstrap";
// import toast from "react-hot-toast";
// import TextFormInput from "@/components/form/TextFormInput";
// import SelectFormInput from "@/components/form/SelectFormInput";
// import IconifyIcon from "@/components/wrappers/IconifyIcon";
// import { getAllSpecifications } from "@/http/Specification";
// import { updateTechProduct } from "@/http/TechProduct";

// const schema = yup.object({
//   specId: yup.number().required("Specification is required"),
//   value: yup.string().required("Value is required"),
// });

// const EditTechProductForm = ({ techProduct, onSuccess, onCancel }) => {
//   const {
//     control,
//     handleSubmit,
//     reset,
//     formState: { isSubmitting },
//   } = useForm({
//     resolver: yupResolver(schema),
//     defaultValues: {
//       specId: "",
//       value: "",
//     },
//   });

//   const [specOptions, setSpecOptions] = React.useState([]);

//   // Prefill form when editing
//   useEffect(() => {
//     if (techProduct) {
//       reset({
//         specId: techProduct.specId,
//         value: techProduct.value,
//       });
//     }
//   }, [techProduct, reset]);

//   // Fetch specifications for dropdown
//   useEffect(() => {
//     const fetchSpecs = async () => {
//       try {
//         const data = await getAllSpecifications();
//         const options = data.map((s) => ({
//           value: s.id,
//           label: s.title,
//         }));
//         setSpecOptions(options);
//       } catch (err) {
//         console.error("Failed to fetch specifications:", err);
//       }
//     };
//     fetchSpecs();
//   }, []);

//   const onSubmit = async (formData) => {
//     try {
//       const updated = await updateTechProduct(techProduct.id, formData);
//       toast.success("TechProduct updated!");
//       onSuccess?.(updated);
//     } catch (err) {
//       toast.error(err.response?.data?.error || "Update failed");
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit(onSubmit)}>
//       <Row>
//         <Col lg={6}>
//           <SelectFormInput
//             control={control}
//             name="specId"
//             label="Specification"
//             options={specOptions}
//             containerClassName="mb-3"
//           />
//         </Col>
//         <Col lg={6}>
//           <TextFormInput
//             control={control}
//             label="Value"
//             placeholder="Enter value"
//             containerClassName="mb-3"
//             name="value"
//           />
//         </Col>
//       </Row>

//       <div className="d-flex justify-content-end mt-3">
//         <button
//           type="button"
//           className="btn btn-secondary me-2"
//           onClick={onCancel}
//         >
//           Cancel
//         </button>
//         <button type="submit" className="btn btn-success" disabled={isSubmitting}>
//           Update TechProduct
//           <IconifyIcon icon="bxs:check-circle" className="ms-2" />
//         </button>
//       </div>
//     </form>
//   );
// };

// export default EditTechProductForm;


import { useState, useEffect } from 'react';
import { Col, Row, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import SelectFormInput from '@/components/form/SelectFormInput';
import TextFormInput from '@/components/form/TextFormInput';
import { getTechProductById, updateTechProduct, getAllTechProductNames } from '@/http/TechProduct';
import toast from 'react-hot-toast';

// Validation schema
const techProductSchema = yup.object({
  specId: yup.number().required('Specification is required'),
  value: yup.string().required('Value is required'),
  productId: yup.number().nullable().optional(),
});

const EditTechProductForm = ({ techProductId, onSuccess }) => {
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [specOptions, setSpecOptions] = useState([]);

  const { control, handleSubmit, reset, setValue } = useForm({
    resolver: yupResolver(techProductSchema),
    defaultValues: {
      specId: '',
      value: '',
      productId: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch specifications for dropdown
        const specsData = await getAllTechProductNames();
        const options = Array.isArray(specsData) 
          ? specsData.map((spec) => ({
              value: spec.id,
              label: spec.title || spec.name || 'Unnamed'
            }))
          : [];
        setSpecOptions(options);

        // Fetch tech product details
        if (techProductId) {
          const response = await getTechProductById(techProductId);
          const techProduct = response.data || response;
          
          // Set form values
          setValue('specId', techProduct.specId);
          setValue('value', techProduct.value);
          setValue('productId', techProduct.productId || '');
        }
        
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch data');
        toast.error(err.response?.data?.error || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [techProductId, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Convert empty productId to null
      const formData = {
        ...data,
        productId: data.productId || null
      };
      
      await updateTechProduct(techProductId, formData);
      
      // Show success alert
      setShowSuccessAlert(true);
      toast.success('TechProduct updated successfully!');
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      // Hide alert after 5 seconds
      setTimeout(() => setShowSuccessAlert(false), 5000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update tech product');
      toast.error(err.response?.data?.error || 'Failed to update tech product');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading tech product details...</div>;
  }

  return (
    <div className="p-4">
      {showSuccessAlert && (
        <Alert variant="success" className="d-flex align-items-center">
          <IconifyIcon icon="bx:check-circle" className="me-2" />
          TechProduct updated successfully!
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
              <label className="form-label">Specification *</label>
              {specOptions.length === 0 ? (
                <div className="form-control">
                  <span className="text-muted">No specifications available</span>
                </div>
              ) : (
                <SelectFormInput
                  control={control}
                  name="specId"
                  options={specOptions}
                  placeholder="Select Specification"
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

        <Row>
          <Col lg={6}>
            <TextFormInput
              control={control}
              name="productId"
              label="Product ID (Optional)"
              containerClassName="mb-3"
              placeholder="Enter Product ID"
              type="number"
            />
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
                Update TechProduct
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTechProductForm;