
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Row, Col } from "react-bootstrap";
import toast from "react-hot-toast";
import TextFormInput from "@/components/form/TextFormInput";
import SelectFormInput from "@/components/form/SelectFormInput";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { getAllCategories, createSubCategory, updateSubCategory } from "@/http/SubCategory";

const schema = yup.object({
  title: yup.string().required("SubCategory title is required"),
  parentId: yup.number().required("Parent category is required"),
});

const SubCategoryForm = ({ subcategory, mode = "create", onSuccess }) => {
  const [categoryOptions, setCategoryOptions] = useState([]);

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      parentId: "",
    },
  });

  // Prefill form when editing
  useEffect(() => {
    if (subcategory) {
      reset({
        title: subcategory.title,
        parentId: subcategory.parentId,
      });
    }
  }, [subcategory, reset]);

  // Fetch categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
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

  const onSubmit = async (formData) => {
    try {
      if (mode === "create") {
        const res = await createSubCategory(formData);
        const created = res.data || res; // normalize
        toast.success("SubCategory created!");
        reset();
        onSuccess?.(created);
      } else {
        const res = await updateSubCategory(subcategory.id, formData);
        const updated = res.data || res; // normalize
        toast.success("SubCategory updated!");
        onSuccess?.(updated);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Operation failed");
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

      <div className="d-flex justify-content-end mt-3">
        <button type="submit" className="btn btn-success">
          {mode === "create" ? "Create" : "Update"} SubCategory
          <IconifyIcon icon="bxs:check-circle" className="ms-2" />
        </button>
      </div>
    </form>
  );
};

export default SubCategoryForm;
