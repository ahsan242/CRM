
// import clsx from 'clsx';
// import { useState } from 'react';
// import { Tab, Tabs } from 'react-bootstrap';
// import IconifyIcon from '@/components/wrappers/IconifyIcon';
// import GeneralDetailsForm from './GeneralDetailsForm';
// import TechProductNameSubmittedForm from './TechProductSubmittedForm';

// const formSteps = [
//   {
//     index: 1,
//     name: 'General Detail',
//     icon: 'bxs:contact',
//     tab: (onSuccess) => <GeneralDetailsForm onSuccess={onSuccess} />
//   },
//   {
//     index: 2,
//     name: 'Finish',
//     icon: 'bxs:check-circle',
//     tab: <TechProductNameSubmittedForm />
//   }
// ];

// const CreateTechProductNameForms = () => {
//   const [activeStep, setActiveStep] = useState(1);

//   const handleSuccess = () => {
//     // ✅ When General Details form submits successfully, go to Finish step
//     setActiveStep(2);
//   };

//   return (
//     <>
//       <Tabs
//         variant="underline"
//         activeKey={activeStep}
//         className="nav nav-tabs card-tabs"
//         onSelect={(e) => setActiveStep(Number(e))}
//       >
//         {formSteps.map((step) => (
//           <Tab
//             key={step.index}
//             eventKey={step.index}
//             className="nav-item"
//             tabClassName="pb-3"
//             title={
//               <span className="fw-semibold">
//                 <IconifyIcon icon={step.icon} className="me-1" />
//                 <span className="d-none d-sm-inline">{step.name}</span>
//               </span>
//             }
//           >
//             {typeof step.tab === 'function'
//               ? step.tab(handleSuccess)
//               : step.tab}
//           </Tab>
//         ))}
//       </Tabs>

//     </>
//   );
// };

// export default CreateTechProductNameForms;

import { useState } from 'react';
import { Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import TextFormInput from '@/components/form/TextFormInput';
import toast from 'react-hot-toast';

// Validation schema
const techProductNameSchema = yup.object({
  title: yup.string().required('TechProductName title is required'),
});

const CreateTechProductNameForm = () => {
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(techProductNameSchema),
    defaultValues: {
      title: '',
    },
  });

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Make API call to create TechProductName
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/techProductNames`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create TechProductName');
      }

      const result = await response.json();
      
      // Show success message
      toast.success('TechProductName created successfully!');
      setShowSuccessAlert(true);
      
      // Reset form
      reset();
      
      // Hide alert after 5 seconds
      setTimeout(() => setShowSuccessAlert(false), 5000);
    } catch (err) {
      console.error('Error creating TechProductName:', err);
      setError(err.message);
      toast.error(err.message);
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
            <p className="mb-0">Your TechProductName has been successfully added!</p>
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
        <TextFormInput
          control={control}
          label="TechProductName Title"
          placeholder="Enter TechProductName title"
          containerClassName="mb-3"
          id="techproductname-title"
          name="title"
        />

        <div className="d-flex justify-content-end mt-3">
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
                Create TechProductName
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTechProductNameForm;