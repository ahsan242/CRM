import { Col, Row } from "react-bootstrap";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const GeneralDetailsForm = ({ formData, updateFormData }) => {
  return (
    <form>
      <Row>
        {/* Title */}
        <Col lg={6}>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Title"
              value={formData.title}
              onChange={(e) => updateFormData({ title: e.target.value })}
            />
          </div>
        </Col>

        {/* Meta Title */}
        <Col lg={6}>
          <div className="mb-3">
            <label className="form-label">Meta Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter Meta Title"
              value={formData.metaTitle}
              onChange={(e) => updateFormData({ metaTitle: e.target.value })}
            />
          </div>
        </Col>
      </Row>

      {/* Meta Description (Rich Text Editor) */}
      <Row>
        <Col lg={12}>
          <div className="mb-5">
            <label className="form-label">Meta Description</label>
            <ReactQuill
              theme="snow"
              style={{ height: 195 }}
              value={formData.metaDescp}
              onChange={(value) => updateFormData({ metaDescp: value })}
              modules={{
                toolbar: [
                  [{ font: [] }, { size: [] }],
                  ["bold", "italic", "underline", "strike"],
                  [{ color: [] }, { background: [] }],
                  [{ script: "super" }, { script: "sub" }],
                  [{ header: [false, 1, 2, 3, 4, 5, 6] }, "blockquote", "code-block"],
                  [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
                  ["direction", { align: [] }],
                  ["link", "image", "video"],
                  ["clean"],
                ],
              }}
            />
          </div>
        </Col>
      </Row>

      {/* Status */}
      <div className="mb-3">
        <label className="form-label">Status</label>
        <br />
        {["Online", "Offline", "Draft"].map((status) => (
          <div key={status} className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              id={`${status}Status`}
              checked={formData.status === status}
              onChange={() => updateFormData({ status })}
            />
            <label className="form-check-label" htmlFor={`${status}Status`}>
              {status}
            </label>
          </div>
        ))}
      </div>
    </form>
  );
};

export default GeneralDetailsForm;
