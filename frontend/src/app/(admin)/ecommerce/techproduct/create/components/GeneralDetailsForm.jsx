

import { yupResolver } from "@hookform/resolvers/yup";
import { Col, Row } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as yup from "yup";
import SelectFormInput from "@/components/form/SelectFormInput";
import TextFormInput from "@/components/form/TextFormInput";
import { getAllTechProductNames, createTechProduct } from "@/http/TechProduct";
import { renameKeys } from "@/utils/rename-object-keys";
import toast from "react-hot-toast";

// ✅ Match backend schema
const generalFormSchema = yup.object({
  specId: yup.number().required("Specification is required"),
  value: yup.string().required("Value is required"),
  productId: yup.number().optional(), // keep optional
});

const GeneralDetailsForm = ({ onSuccess }) => {
  const [specOptions, setSpecOptions] = useState([]);

  const { control, handleSubmit, reset } = useForm({
    resolver: yupResolver(generalFormSchema),
    defaultValues: {
      specId: "",
      value: "",
      productId: "",
    },
  });

  useEffect(() => {
    const fetchSpecs = async () => {
      try {
        const data = await getAllTechProductNames();
        if (!data) return;
        const mapped = data.map((spec) =>
          renameKeys(spec, { id: "value", name: "label" })
        );
        setSpecOptions(mapped);
      } catch (err) {
        console.error("Failed to fetch specs:", err);
      }
    };
    fetchSpecs();
  }, []);

  const onSubmit = async (formData) => {
    try {
      const res = await createTechProduct(formData);
      toast.success("TechProduct created successfully!");
      reset();
      if (onSuccess) onSuccess(res.data); // go to Finish tab
    } catch (err) {
      console.error("Error creating TechProduct:", err);
      toast.error(err.response?.data?.error || "Failed to create TechProduct");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Row>
        <Col lg={6}>
          <SelectFormInput
            control={control}
            name="specId"
            label="Specification"
            options={specOptions}
            containerClassName="mb-3"
          />
        </Col>
        <Col lg={6}>
          <TextFormInput
            control={control}
            name="value"
            label="Value"
            containerClassName="mb-3"
            placeholder="Enter Value"
          />
        </Col>
      </Row>

      {/* ✅ Optional product link later */}
      {/* <Row>
        <Col lg={6}>
          <SelectFormInput
            control={control}
            name="productId"
            label="Product"
            options={productOptions}
            containerClassName="mb-3"
          />
        </Col>
      </Row> */}

      <div className="d-flex justify-content-end mt-3">
        <button type="submit" className="btn btn-success">
          Save TechProduct
        </button>
      </div>
    </form>
  );
};

export default GeneralDetailsForm;
