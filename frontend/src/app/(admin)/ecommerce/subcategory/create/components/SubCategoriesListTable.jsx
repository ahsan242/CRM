

import { useState, useEffect } from "react";
import ReactTable from "@/components/Table";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { getSubCategories, deleteSubCategory } from "@/http/SubCategory";
import SubCategoryForm from "./SubCategoryForm";

const SubCategoriesListTable = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      const data = await getSubCategories();
      setSubcategories(data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch subcategories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubcategories();
  }, []);

  const handleEdit = (subcategory) => setEditingSubcategory(subcategory);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this subcategory?")) return;
    try {
      await deleteSubCategory(id);
      setSubcategories((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const columns = [
    { header: "ID", accessorKey: "id" },
    { header: "Subcategory Name", accessorKey: "title" },
    { header: "Parent ID", accessorKey: "parentId" },
    {
      header: "Action",
      cell: ({ row: { original } }) => (
        <>
          <button
            type="button"
            className="btn btn-sm btn-soft-secondary me-1"
            onClick={() => handleEdit(original)}
          >
            <IconifyIcon icon="bx:edit" className="fs-18" />
          </button>
          <button
            type="button"
            className="btn btn-sm btn-soft-danger"
            onClick={() => handleDelete(original.id)}
          >
            <IconifyIcon icon="bx:trash" className="fs-18" />
          </button>
        </>
      ),
    },
  ];

  if (loading) return <div className="text-center py-4">Loading subcategories...</div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;
  if (subcategories.length === 0) return <div className="alert alert-info">No SubCategories found.</div>;

  return (
    <>
      {editingSubcategory && (
        <div className="mb-4 p-3 border rounded bg-light">
          <h5>Edit SubCategory: {editingSubcategory.title}</h5>
          <SubCategoryForm
            subcategory={editingSubcategory}
            mode="edit"
            onSuccess={(updated) => {
              if (!updated || !updated.id) {
                console.error("Update response invalid:", updated);
                return;
              }
              setSubcategories((prev) =>
                prev.map((s) => (s.id === updated.id ? updated : s))
              );
              setEditingSubcategory(null);
            }}
          />
        </div>
      )}

      <ReactTable
        columns={columns}
        data={subcategories}
        rowsPerPageList={[2, 5, 10, 20, 50]}
        pageSize={10}
        tableClass="text-nowrap mb-0"
        theadClass="bg-light bg-opacity-50"
        showPagination
      />
    </>
  );
};

export default SubCategoriesListTable;
