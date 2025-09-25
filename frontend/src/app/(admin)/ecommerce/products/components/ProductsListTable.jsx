
// src/components/ProductsListTable.jsx
import { useEffect, useState } from "react"
import clsx from "clsx"
import { Link } from "react-router-dom"
import ReactTable from "@/components/Table"
import IconifyIcon from "@/components/wrappers/IconifyIcon"
import { currency } from "@/context/constants"
import { getProducts } from "@/http/Product"
import { getStockStatus } from "@/utils/other"

const ProductsListTable = () => {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts()
        setProducts(data)
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const columns = [
    {
      header: "Product Name",
      cell: ({
        row: {
          original: { id, title, shortDescp, mainImage },
        },
      }) => (
        <div className="d-flex align-items-center">
          <div className="flex-shrink-0 me-3">
            <Link to={`/ecommerce/products/${id}`}>
              <img
                src={`http://localhost:5000/uploads/products/${mainImage}`}
                alt={title}
                className="img-fluid avatar-sm"
              />
            </Link>
          </div>
          <div className="flex-grow-1">
            <h5 className="mt-0 mb-1">
              <Link to={`/ecommerce/products/${id}`} className="text-reset">
                {title}
              </Link>
            </h5>
            <span className="fs-13 text-muted">{shortDescp}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Category",
      cell: ({ row: { original } }) => original.category?.title || "-",
    },
    {
      header: "Price",
      cell: ({ row: { original } }) => currency + (original.price || "0.00"),
    },
    {
      header: "Inventory",
      cell: ({
        row: {
          original: { quantity },
        },
      }) => {
        const stockStatus = getStockStatus(quantity)
        return (
          <div className={"text-" + stockStatus.variant}>
            <IconifyIcon
              icon="bxs:circle"
              className={clsx("me-1", "text-" + stockStatus.variant)}
            />
            {stockStatus.text}
          </div>
        )
      },
    },
      {
    header: 'Action',
    cell: () => (
      <>
        <button type="button" className="btn btn-sm btn-soft-secondary me-1">
          <IconifyIcon icon="bx:edit" className="fs-18" />
        </button>
        <button type="button" className="btn btn-sm btn-soft-danger">
          <IconifyIcon icon="bx:trash" className="fs-18" />
        </button>
      </>
    ),
  },
  ]

  const pageSizeList = [5, 10, 20, 50]

  return (
    <ReactTable
      columns={columns}
      data={products}
      rowsPerPageList={pageSizeList}
      pageSize={10}
      tableClass="text-nowrap mb-0"
      theadClass="bg-light bg-opacity-50"
      showPagination
      loading={loading}
    />
  )
}

export default ProductsListTable
