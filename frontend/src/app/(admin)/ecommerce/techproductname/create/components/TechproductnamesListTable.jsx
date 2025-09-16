// import { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import ReactTable from '@/components/Table';
// import IconifyIcon from '@/components/wrappers/IconifyIcon';
// import { getCategories } from '@/http/Category';
// import { getTechProductNames } from '@/http/TechProductName';


// const TechproductnamesListTable = () => {
//   const [categories, setCategories] = useState([]);

//   const [TechProductNames, setTechProductNames] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);


//   useEffect(() => {
//     const fetchTechProductNames = async () => {
//       try {
//         setLoading(true);
//         const response = await getTechProductNames();
//         console.log('Fetched TechProductNames:', response.data);
//         setTechProductNames(response.data);
//       } catch (err) {
//         setError(err.message || 'Failed to fetch TechProductNames');
//         console.error('Error fetching TechProductNames:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchTechProductNames();
//   }, []);


//   const columns = [
//     {
//       header: 'Category Name',
//       accessorKey: 'title',
//     },
//     {
//       header: 'Meta Title',
//       accessorKey: 'metaTitle',
//     },
//     {
//       header: 'Meta Description',
//       accessorKey: 'metaDescp',
//     },
//     {
//       header: 'Action',
//       cell: ({ row: { original } }) => (
//         <>
//           <button 
//             type="button" 
//             className="btn btn-sm btn-soft-secondary me-1"
//             onClick={() => handleEdit(original)}
//           >
//             <IconifyIcon icon="bx:edit" className="fs-18" />
//           </button>
//           <button 
//             type="button" 
//             className="btn btn-sm btn-soft-danger"
//             onClick={() => handleDelete(original.id)}
//           >
//             <IconifyIcon icon="bx:trash" className="fs-18" />
//           </button>
//         </>
//       ),
//     },
//   ];

//   const handleEdit = (TechProductName) => {
//     // Implement edit functionality
//     console.log('Edit category:', TechProductName);
//     // You might want to open a modal or navigate to an edit page
//   };

//   const handleDelete = (TechProductNameId) => {
//     // Implement delete functionality
//     console.log('Delete category:', TechProductNameId);
//     // You might want to show a confirmation dialog first
//   };

//   const pageSizeList = [2, 5, 10, 20, 50];

//   if (loading) {
//     return <div className="text-center py-4">Loading Tech Product ame...</div>;
//   }

//   if (error) {
//     return <div className="alert alert-danger">Error: {error}</div>;
//   }

//   if (TechProductNames.length === 0) {
//     return <div className="alert alert-info">No Tech Product Name  found.</div>;
//   }

//   return (
//     <ReactTable
//       columns={columns}
//       data={TechProductNames}
//       rowsPerPageList={pageSizeList}
//       pageSize={10}
//       tableClass="text-nowrap mb-0"
//       theadClass="bg-light bg-opacity-50"
//       showPagination
//     />
//   );
// };

// export default TechproductnamesListTable;

import { useState, useEffect } from "react";
import ReactTable from "@/components/Table";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { getTechProductNames, deleteTechProductName } from "@/http/TechProductName";
import EditTechProductNameForm from "./EditTechProductNameForm";

const TechproductnamesListTable = () => {
  const [techProductNames, setTechProductNames] = useState([]);
  const [editingTechProductName, setEditingTechProductName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTechProductNames = async () => {
    try {
      setLoading(true);
      const res = await getTechProductNames();
      setTechProductNames(res.data || res);
    } catch (err) {
      setError(err.message || "Failed to fetch TechProductNames");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechProductNames();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this TechProductName?")) return;
    try {
      await deleteTechProductName(id);
      setTechProductNames((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  const columns = [
    { header: "ID", accessorKey: "id" },
    { header: "Title", accessorKey: "title" },
    {
      header: "Action",
      cell: ({ row: { original } }) => (
        <>
          <button
            type="button"
            className="btn btn-sm btn-soft-secondary me-1"
            onClick={() => setEditingTechProductName(original)}
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

  if (loading) return <div className="text-center py-4">Loading TechProductNames...</div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;

  return (
    <>
      {editingTechProductName && (
        <div className="mb-4 p-3 border rounded bg-light">
          <h5>Edit TechProductName: {editingTechProductName.title}</h5>
          <EditTechProductNameForm
            techProductName={editingTechProductName}
            onSuccess={(updated) => {
              setTechProductNames((prev) =>
                prev.map((t) => (t.id === updated.id ? updated : t))
              );
              setEditingTechProductName(null);
            }}
            onCancel={() => setEditingTechProductName(null)}
          />
        </div>
      )}

      <ReactTable
        columns={columns}
        data={techProductNames}
        rowsPerPageList={[2, 5, 10, 20, 50]}
        pageSize={10}
        tableClass="text-nowrap mb-0"
        theadClass="bg-light bg-opacity-50"
        showPagination
      />
    </>
  );
};

export default TechproductnamesListTable;
