// import clsx from "clsx";
// import { useState } from "react";
// import { Tab, Tabs } from "react-bootstrap";
// import IconifyIcon from "@/components/wrappers/IconifyIcon";
// import GeneralDetailsForm from "./GeneralDetailsForm";
// import SubcategoriesubmittedForm from "./SubCategorySubmittedForm";

// // ✅ Only keep General Detail & Finish
// const formSteps = [
//   {
//     index: 1,
//     name: "General Detail",
//     icon: "bxs:contact",
//     tab: <GeneralDetailsForm />,
//   },
//   {
//     index: 2,
//     name: "Finish",
//     icon: "bxs:check-circle",
//     tab: <SubcategoriesubmittedForm />,
//   },
// ];

// const CreateSubCategoryForms = () => {
//   const [activeStep, setActiveStep] = useState(1);

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
//             {step.tab}
//           </Tab>
//         ))}
//       </Tabs>

//       <div className="d-flex flex-wrap gap-2 wizard justify-content-between mt-3">
//         <div className="previous me-2">
//           <button
//             onClick={() => setActiveStep(() => activeStep - 1)}
//             className={clsx("btn btn-primary", {
//               disabled: activeStep === 1,
//             })}
//           >
//             <IconifyIcon icon="bx:left-arrow-alt" className="me-2" />
//             Back To Previous
//           </button>
//         </div>
//         <div className="next">
//           <button
//             onClick={() => setActiveStep(() => activeStep + 1)}
//             className={clsx("btn btn-primary", {
//               disabled: formSteps.length === activeStep,
//             })}
//           >
//             Next Step
//             <IconifyIcon icon="bx:right-arrow-alt" className="ms-2" />
//           </button>
//         </div>
//       </div>
//     </>
//   );
// };

// export default CreateSubCategoryForms;


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
