

import clsx from "clsx";
import { useState } from "react";
import { Tab, Tabs } from "react-bootstrap";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import GeneralDetailsForm from "./GeneralDetailsForm";
import SubcategoriesubmittedForm from "./SubCategorySubmittedForm";

// ✅ Only keep General Detail & Finish
const CreateSubCategoryForms = () => {
  const [activeStep, setActiveStep] = useState(1);

  return (
    <>
      <Tabs
        variant="underline"
        activeKey={activeStep}
        className="nav nav-tabs card-tabs"
        onSelect={(e) => setActiveStep(Number(e))}
      >
        <Tab
          eventKey={1}
          className="nav-item"
          tabClassName="pb-3"
          title={
            <span className="fw-semibold">
              <IconifyIcon icon="bxs:contact" className="me-1" />
              <span className="d-none d-sm-inline">General Detail</span>
            </span>
          }
        >
          {/* ✅ pass callback to move to step 2 */}
          <GeneralDetailsForm onSuccess={() => setActiveStep(2)} />
        </Tab>

        <Tab
          eventKey={2}
          className="nav-item"
          tabClassName="pb-3"
          title={
            <span className="fw-semibold">
              <IconifyIcon icon="bxs:check-circle" className="me-1" />
              <span className="d-none d-sm-inline">Finish</span>
            </span>
          }
        >
          <SubcategoriesubmittedForm />
        </Tab>
      </Tabs>
    </>
  );
};

export default CreateSubCategoryForms;
