import { useState } from "react";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import toast from "react-hot-toast";
import { createCategory } from "@/http/Category";

// Import only the GeneralDetailsForm
import GeneralDetailsForm from "./GeneralDetailsForm";

const CreateCategoryForms = () => {
  // ✅ Centralized form data
  const [formData, setFormData] = useState({
    title: "",
    metaTitle: "",
    metaDescp: "",
    status: "Online",
  });

  // ✅ Update state from children
  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  // ✅ Submit to backend
  const handleSubmit = async () => {
    try {
     
      console.log(createCategory);
      const res = await createCategory(formData);
      toast.success("Category created successfully!");
      console.log("Created category:", res.data);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to create category");
    }
  };

  return (
    <>
      {/* General Details Form */}
      <GeneralDetailsForm formData={formData} updateFormData={updateFormData} />

      {/* Submit button */}
      <div className="d-flex justify-content-end mt-3">
        <button onClick={handleSubmit} type="button" className="btn btn-success">
          Submit Category
          <IconifyIcon icon="bxs:check-circle" className="ms-2" />
        </button>
      </div>
    </>
  );
};

export default CreateCategoryForms;
