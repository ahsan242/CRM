import { yupResolver } from '@hookform/resolvers/yup';
import { Col, Row } from 'react-bootstrap';
import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import ReactQuill from 'react-quill';
import * as yup from 'yup';
import axios from 'axios';
import toast from 'react-hot-toast';

import SelectFormInput from '@/components/form/SelectFormInput';
import TextAreaFormInput from '@/components/form/TextAreaFormInput';
import TextFormInput from '@/components/form/TextFormInput';
import { getAllTechProductNameCategories } from '@/helpers/data';
import { renameKeys } from '@/utils/rename-object-keys';
import 'react-quill/dist/quill.snow.css';

const generalFormSchema = yup.object({
  name: yup.string().required(),
  reference: yup.string().optional(),
  descQuill: yup.string().optional(),
  description: yup.string().required(),
  categories: yup.string().required(),
  price: yup.number().required(),
  comment: yup.string().optional()
});

const GeneralDetailsForm = ({ onSuccess }) => {
  const [techproductnameDescriptionContent, setTechProductNameDescriptionContent] = useState(
    `<h2>Describe Your TechProductName...</h2>`
  );
  const [techproductnameCategories, setTechProductNameCategories] = useState([]);

  const {
    control,
    handleSubmit,
    reset,
    setValue
  } = useForm({
    resolver: yupResolver(generalFormSchema)
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getAllTechProductNameCategories();
      if (!data) return null;
      const categoryOptions = data.map((category) =>
        renameKeys(category, {
          id: 'value',
          name: 'label'
        })
      );
      setTechProductNameCategories(categoryOptions);
    };
    fetchCategories();
  }, []);

  // ✅ Submit handler
  const onSubmit = async (formData) => {
    try {
      const payload = {
        title: formData.name, // backend expects "title"
        reference: formData.reference,
        description: formData.description,
        descQuill: techproductnameDescriptionContent,
        categories: formData.categories,
        price: formData.price,
        comment: formData.comment,
        status: formData.radio || 'Online'
      };

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/techProductNames`,
        payload
      );

      toast.success('TechProductName created successfully');
      reset();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      toast.error('Failed to create TechProductName');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Row>
        <Col lg={6}>
          <TextFormInput
            control={control}
            label="TechProductName Name"
            placeholder="Enter techproductname name"
            containerClassName="mb-3"
            id="techproductname-name"
            name="name"
          />
        </Col>
       
      </Row>



      <button type="submit" className="btn btn-success">
        Save & Continue
      </button>
    </form>
  );
};

export default GeneralDetailsForm;
