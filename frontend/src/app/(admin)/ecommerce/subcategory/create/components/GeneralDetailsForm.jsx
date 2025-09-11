import { yupResolver } from "@hookform/resolvers/yup";
import { Col, Row } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import SelectFormInput from "@/components/form/SelectFormInput";
import TextFormInput from "@/components/form/TextFormInput";
import { getAllCategories, createSubCategory } from "@/http/SubCategory";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import toast from "react-hot-toast";

// ✅ Match backend: only title, parentId
const generalFormSchema = yup.object({
  title: yup.string().required("SubCategory title is required"),
  parentId: yup.number().required("Parent category is required"),
});

const GeneralDetailsForm = ({ onSuccess }) => {
  const [categoryOptions, setCategoryOptions] = useState([]);

  const {
    control,
    handleSubmit,
    reset,
  } = useForm({
    resolver: yupResolver(generalFormSchema),
    defaultValues: {
      title: "",
      parentId: "",
    },
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        console.log("Fetched categories:", data);
        if (!data) return;

        const options = data.map((cat) => ({
          value: cat.id,
          label: cat.title,
        }));
        setCategoryOptions(options);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, []);

  // ✅ Submit to backend
  const onSubmit = async (formData) => {
    try {
      const res = await createSubCategory(formData);
      toast.success("SubCategory created successfully!");
      reset();
      if (onSuccess) onSuccess(res.data); // move to Finish tab
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to create SubCategory");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Row>
        <Col lg={6}>
          <TextFormInput
            control={control}
            label="SubCategory Title"
            placeholder="Enter subcategory title"
            containerClassName="mb-3"
            id="subcategory-title"
            name="title"
          />
        </Col>
        <Col lg={6}>
          <SelectFormInput
            control={control}
            name="parentId"
            label="Parent Category"
            options={categoryOptions}
            containerClassName="mb-3"
          />
        </Col>
      </Row>

      {/* ✅ Submit button */}
      <div className="d-flex justify-content-end mt-3">
        <button type="submit" className="btn btn-success">
          Submit SubCategory
          <IconifyIcon icon="bxs:check-circle" className="ms-2" />
        </button>
      </div>
    </form>
  );
};

export default GeneralDetailsForm;
