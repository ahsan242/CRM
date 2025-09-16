import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import TextFormInput from "@/components/form/TextFormInput";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import axios from "axios";

const schema = yup.object({
  title: yup.string().required("TechProductName title is required"),
});

const EditTechProductNameForm = ({ techProductName, onSuccess, onCancel }) => {
  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { title: "" },
  });

  useEffect(() => {
    if (techProductName) {
      reset({ title: techProductName.title });
    }
  }, [techProductName, reset]);

  const onSubmit = async (formData) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/techProductNames/${techProductName.id}`,
        formData
      );

      const updated = res.data || res;
      toast.success("TechProductName updated successfully!");
      onSuccess?.(updated);
    } catch (err) {
      console.error("Update failed:", err);
      toast.error(err.response?.data?.error || "Failed to update TechProductName");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextFormInput
        control={control}
        label="TechProductName Title"
        placeholder="Enter TechProductName title"
        containerClassName="mb-3"
        name="title"
      />

      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="btn btn-light" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-success">
          <IconifyIcon icon="bxs:check-circle" className="me-2" />
          Update
        </button>
      </div>
    </form>
  );
};

export default EditTechProductNameForm;
