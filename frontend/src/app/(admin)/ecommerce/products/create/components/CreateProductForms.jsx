// import React, { useEffect, useState } from 'react'
// import { yupResolver } from '@hookform/resolvers/yup'
// import { Col, Row, Alert } from 'react-bootstrap'
// import { useForm } from 'react-hook-form'
// import * as yup from 'yup'
// import SelectFormInput from '@/components/form/SelectFormInput'
// import TextAreaFormInput from '@/components/form/TextAreaFormInput'
// import TextFormInput from '@/components/form/TextFormInput'
// import { getAllProductCategories, createProduct } from '@/http/Product'
// import { getSubCategories } from '@/http/SubCategory'
// import { getBrands } from '@/http/Brand'
// import { renameKeys } from '@/utils/rename-object-keys'
// import 'react-quill/dist/quill.snow.css'

// const generalFormSchema = yup.object({
//   sku: yup.string().required('SKU is required'),
//   mfr: yup.string().optional(),
//   techPartNo: yup.string().optional(),
//   shortDescp: yup.string().optional(),
//   longDescp: yup.string().optional(),
//   metaTitle: yup.string().optional(),
//   metaDescp: yup.string().optional(),
//   ucpCode: yup.string().optional(),
//   productSource: yup.string().optional(),
//   userId: yup.string().optional(),
//   title: yup.string().required('Title is required'),
//   brandId: yup.string().optional(),
//   // categoryId: yup.string().required('Category is required'),
//   subCategoryId: yup.string().optional('Subcategory is required'),
//   mainImage: yup.mixed().required('Main image is required'),
//   detailImages: yup.array().of(yup.mixed()).optional(),
// })

// const GeneralDetailsForm = ({ onProductCreated }) => {
//   // const [productCategories, setProductCategories] = useState([])
//   const [subCategories, setSubCategories] = useState([])
//   const [productBrand, setProductBrand] = useState([])
//   const [mainImagePreview, setMainImagePreview] = useState(null)
//   const [detailImagesPreviews, setDetailImagesPreviews] = useState([])
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [error, setError] = useState('')

//   const {
//     control,
//     watch,
//     setValue,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({
//     resolver: yupResolver(generalFormSchema),
//   })

//   const mainImage = watch('mainImage')
//   const detailImages = watch('detailImages')

//   // fetch subCategories
//   useEffect(() => {
//     const fetchsubCategories = async () => {
//       try {
//         // console.log('Fetching subcategories...')
//         const response = await getSubCategories()
//         // console.log('SubCategories response:', response)
//         const data = response
//         console.log('SubCategories fetched:', data)
//         if (data) {
//           setSubCategories(data)
//         }
//       } catch (error) {
//         console.error('Error fetching subCategories:', error)
//         console.error('Error details:', error.response)
//       }
//     }
//     fetchsubCategories()
//   }, [])

//   // fetch categories
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const response = await getAllProductCategories()
//         const data = response.data
//         console.log('Categories fetched:', data)
//         setProductCategories(data)
//       } catch (error) {
//         console.error('Error fetching categories:', error)
//       }
//     }
//     fetchCategories()
//   }, [])

//   // fetch brands
//   useEffect(() => {
//     const fetchBrands = async () => {
//       try {
//         const response = await getBrands()
//         const data = response.data
//         if (data) {
//           setProductBrand(data)
//         }
//       } catch (error) {
//         console.error('Error fetching brands:', error)
//       }
//     }
//     fetchBrands()
//   }, [])

//   // preview for main image
//   useEffect(() => {
//     if (mainImage && mainImage instanceof File) {
//       const reader = new FileReader()
//       reader.onload = () => {
//         setMainImagePreview(reader.result)
//       }
//       reader.readAsDataURL(mainImage)
//     } else {
//       setMainImagePreview(null)
//     }
//   }, [mainImage])

//   // preview for detail images
//   useEffect(() => {
//     if (detailImages && detailImages.length > 0) {
//       const previews = []
//       detailImages.forEach((file, index) => {
//         if (file instanceof File) {
//           const reader = new FileReader()
//           reader.onload = () => {
//             previews[index] = reader.result
//             if (previews.filter(Boolean).length === detailImages.length) {
//               setDetailImagesPreviews([...previews])
//             }
//           }
//           reader.readAsDataURL(file)
//         }
//       })
//     } else {
//       setDetailImagesPreviews([])
//     }
//   }, [detailImages])

//   const handleMainImageChange = (e) => {
//     const file = e.target.files[0]
//     if (file) {
//       setValue('mainImage', file)
//     }
//   }

//   const handleDetailImagesChange = (e) => {
//     const files = Array.from(e.target.files)
//     setValue('detailImages', files)
//   }

//   const removeDetailImage = (index) => {
//     const newDetailImages = detailImages.filter((_, i) => i !== index)
//     setValue('detailImages', newDetailImages)

//     const newPreviews = [...detailImagesPreviews]
//     newPreviews.splice(index, 1)
//     setDetailImagesPreviews(newPreviews)
//   }

//   const onSubmit = async (data) => {
//     setIsSubmitting(true)
//     setError('')
//     console.log('Form Data:', data)

//     try {
//       const formDataToSend = new FormData()

//       const response = await createProduct(data)
//       console.log('Product created successfully:', response.data)
//       onProductCreated?.()
//     } catch (error) {
//       console.error('Error creating product:', error)
//       setError(error.response?.data?.error || 'Error creating product. Please try again.')
//     } finally {
//       setIsSubmitting(false)
//     }
//   }
//   return (
//     <form onSubmit={handleSubmit(onSubmit)}>
//       {error && <Alert variant="danger">{error}</Alert>}

//       <Row>
//         <Col lg={6}>
//           <TextFormInput control={control} label="SKU *" placeholder="Enter Sku" containerClassName="mb-3" name="sku" error={errors.sku} />
//         </Col>
//         <Col lg={6}>
//           <TextFormInput control={control} name="mfr" placeholder="Enter Mfr" label="Mfr" containerClassName="mb-3" />
//         </Col>
//         <Col lg={6}>
//           <TextFormInput control={control} name="techPartNo" placeholder="Enter techPartNo" label="Tech Part Number" containerClassName="mb-3" />
//         </Col>
//         <Col lg={6}>
//           <TextFormInput control={control} name="ucpCode" placeholder="Enter Ucp Code" label="Ucp Code" containerClassName="mb-3" />
//         </Col>
//         <Col lg={6}>
//           <TextFormInput control={control} name="userId" placeholder="Enter User ID" label="User ID" containerClassName="mb-3" />
//         </Col>
//         <Col lg={6}>
//           <TextFormInput control={control} name="title" placeholder="Enter title" label="Title *" containerClassName="mb-3" error={errors.title} />
//         </Col>
//         <Col lg={6}>
//           <TextFormInput control={control} name="metaTitle" placeholder="Enter meta title" label="Meta title" containerClassName="mb-3" />
//         </Col>
//       </Row>

//       {/* Image Upload Section */}
//       <Row className="mb-4">
//         <Col lg={6}>
//           <div className="mb-3">
//             <label className="form-label">Main Image *</label>
//             <input type="file" className="form-control" accept="image/*" onChange={handleMainImageChange} />
//             {errors.mainImage && <div className="text-danger">{errors.mainImage.message}</div>}
//             {mainImagePreview && (
//               <div className="mt-2">
//                 <img src={mainImagePreview} alt="Main preview" className="img-thumbnail" style={{ maxHeight: '200px' }} />
//               </div>
//             )}
//           </div>
//         </Col>
//         <Col lg={6}>
//           <div className="mb-3">
//             <label className="form-label">Detail Images</label>
//             <input type="file" className="form-control" accept="image/*" multiple onChange={handleDetailImagesChange} />
//             <div className="d-flex flex-wrap mt-2">
//               {detailImagesPreviews.map((preview, index) => (
//                 <div key={index} className="position-relative me-2 mb-2">
//                   <img
//                     src={preview}
//                     alt={`Detail preview ${index + 1}`}
//                     className="img-thumbnail"
//                     style={{ height: '100px', width: '100px', objectFit: 'cover' }}
//                   />
//                   <button
//                     type="button"
//                     className="btn-close position-absolute top-0 end-0 bg-white"
//                     style={{ transform: 'translate(50%, -50%)' }}
//                     onClick={() => removeDetailImage(index)}
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>
//         </Col>
//       </Row>

//       <Row>
//         <Col lg={12}>
//           <TextAreaFormInput control={control} name="shortDescp" label="Short Description" containerClassName="mb-3" rows={3} />
//         </Col>
//         <Col lg={12}>
//           <TextAreaFormInput control={control} name="longDescp" label="Long Description" containerClassName="mb-3" rows={5} />
//         </Col>
//         <Col lg={12}>
//           <TextAreaFormInput control={control} name="metaDescp" label="Meta Description" containerClassName="mb-3" rows={3} />
//         </Col>
//         <Col lg={6}>
//           <TextAreaFormInput control={control} name="productSource" label="Product Source" containerClassName="mb-3" rows={3} />
//         </Col>
//         <Col lg={3}>
//           {subCategories.length > 0 && (
//             <div className="mb-3">
//               <label className="form-label">subCategories *</label>
//               <SelectFormInput
//                 control={control}
//                 name="subCategoryId"
//                 options={subCategories.map((subcat) => ({
//                   value: subcat.id,
//                   label: subcat.title,
//                 }))}
//                 error={errors.subCategoryId}
//               />
//             </div>
//           )}
//         </Col>
//         {/* <Col lg={3}>
//           {productCategories.length > 0 && (
//             <div className="mb-3">
//               <label className="form-label">Categories *</label>
//               <SelectFormInput
//                 control={control}
//                 name="categoryId"
//                 options={productCategories.map((cat) => ({
//                   value: cat.id,
//                   label: cat.title,
//                 }))}
//                 error={errors.categoryId}
//               />
//             </div>
//           )}
//         </Col> */}
//         <Col lg={3}>
//           {productBrand.length > 0 && (
//             <div className="mb-3">
//               <label className="form-label">Brand</label>
//               <SelectFormInput
//                 control={control}
//                 name="brandId"
//                 options={productBrand.map((brand) => ({
//                   value: brand.id,
//                   label: brand.title,
//                 }))}
//                 error={errors.brandId}
//               />
//             </div>
//           )}
//         </Col>
//       </Row>

//       <div className="d-flex justify-content-end">
//         <button type="submit" className="btn btn-primary">
//           Save & Continue
//         </button>
//       </div>
//     </form>
//   )
// }

// export default GeneralDetailsForm


// src/app/(admin)/ecommerce/products/create/components/GeneralDetailsForm.jsx
import React, { useEffect, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { Col, Row, Alert } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import * as yup from 'yup'
import SelectFormInput from '@/components/form/SelectFormInput'
import TextAreaFormInput from '@/components/form/TextAreaFormInput'
import TextFormInput from '@/components/form/TextFormInput'
import { getAllProductCategories, createProduct } from '@/http/Product'
import { getSubCategories } from '@/http/SubCategory'
import { getBrands } from '@/http/Brand'
import { renameKeys } from '@/utils/rename-object-keys'
import 'react-quill/dist/quill.snow.css'

const generalFormSchema = yup.object({
  sku: yup.string().required('SKU is required'),
  mfr: yup.string().optional(),
  techPartNo: yup.string().optional(),
  shortDescp: yup.string().optional(),
  longDescp: yup.string().optional(),
  metaTitle: yup.string().optional(),
  metaDescp: yup.string().optional(),
  ucpCode: yup.string().optional(),
  productSource: yup.string().optional(),
  userId: yup.string().optional(),
  title: yup.string().required('Title is required'),
  price: yup.number().required('Price is required').positive('Price must be positive'),
  quantity: yup.number().required('Quantity is required').integer('Quantity must be a whole number').min(0, 'Quantity cannot be negative'),
  brandId: yup.string().optional(),
  subCategoryId: yup.string().optional('Subcategory is required'),
  mainImage: yup.mixed().required('Main image is required'),
  detailImages: yup.array().of(yup.mixed()).optional(),
})

const GeneralDetailsForm = ({ onProductCreated }) => {
  const [subCategories, setSubCategories] = useState([])
  const [productBrand, setProductBrand] = useState([])
  const [mainImagePreview, setMainImagePreview] = useState(null)
  const [detailImagesPreviews, setDetailImagesPreviews] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(generalFormSchema),
  })

  const mainImage = watch('mainImage')
  const detailImages = watch('detailImages')

  // fetch subCategories
  useEffect(() => {
    const fetchsubCategories = async () => {
      try {
        const response = await getSubCategories()
        const data = response
        console.log('SubCategories fetched:', data)
        if (data) {
          setSubCategories(data)
        }
      } catch (error) {
        console.error('Error fetching subCategories:', error)
        console.error('Error details:', error.response)
      }
    }
    fetchsubCategories()
  }, [])

  // fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await getBrands()
        const data = response.data
        if (data) {
          setProductBrand(data)
        }
      } catch (error) {
        console.error('Error fetching brands:', error)
      }
    }
    fetchBrands()
  }, [])

  // preview for main image
  useEffect(() => {
    if (mainImage && mainImage instanceof File) {
      const reader = new FileReader()
      reader.onload = () => {
        setMainImagePreview(reader.result)
      }
      reader.readAsDataURL(mainImage)
    } else {
      setMainImagePreview(null)
    }
  }, [mainImage])

  // preview for detail images
  useEffect(() => {
    if (detailImages && detailImages.length > 0) {
      const previews = []
      detailImages.forEach((file, index) => {
        if (file instanceof File) {
          const reader = new FileReader()
          reader.onload = () => {
            previews[index] = reader.result
            if (previews.filter(Boolean).length === detailImages.length) {
              setDetailImagesPreviews([...previews])
            }
          }
          reader.readAsDataURL(file)
        }
      })
    } else {
      setDetailImagesPreviews([])
    }
  }, [detailImages])

  const handleMainImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setValue('mainImage', file)
    }
  }

  const handleDetailImagesChange = (e) => {
    const files = Array.from(e.target.files)
    setValue('detailImages', files)
  }

  const removeDetailImage = (index) => {
    const newDetailImages = detailImages.filter((_, i) => i !== index)
    setValue('detailImages', newDetailImages)

    const newPreviews = [...detailImagesPreviews]
    newPreviews.splice(index, 1)
    setDetailImagesPreviews(newPreviews)
  }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    setError('')
    console.log('Form Data:', data)

    try {
      const formDataToSend = new FormData()

      // Append all fields including price and quantity
      Object.keys(data).forEach(key => {
        if (key !== 'mainImage' && key !== 'detailImages') {
          formDataToSend.append(key, data[key]);
        }
      });

      // Append main image
      if (data.mainImage && data.mainImage instanceof File) {
        formDataToSend.append('mainImage', data.mainImage);
      }

      // Append detail images
      if (data.detailImages && Array.isArray(data.detailImages)) {
        data.detailImages.forEach((image, index) => {
          if (image instanceof File) {
            formDataToSend.append('detailImages', image);
          }
        });
      }

      const response = await createProduct(formDataToSend)
      console.log('Product created successfully:', response.data)
      onProductCreated?.()
    } catch (error) {
      console.error('Error creating product:', error)
      setError(error.response?.data?.error || 'Error creating product. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col lg={6}>
          <TextFormInput control={control} label="SKU *" placeholder="Enter Sku" containerClassName="mb-3" name="sku" error={errors.sku} />
        </Col>
        <Col lg={6}>
          <TextFormInput control={control} name="mfr" placeholder="Enter Mfr" label="Mfr" containerClassName="mb-3" />
        </Col>
        <Col lg={6}>
          <TextFormInput control={control} name="techPartNo" placeholder="Enter techPartNo" label="Tech Part Number" containerClassName="mb-3" />
        </Col>
        <Col lg={6}>
          <TextFormInput control={control} name="ucpCode" placeholder="Enter Ucp Code" label="Ucp Code" containerClassName="mb-3" />
        </Col>
        <Col lg={6}>
          <TextFormInput control={control} name="userId" placeholder="Enter User ID" label="User ID" containerClassName="mb-3" />
        </Col>
        <Col lg={6}>
          <TextFormInput control={control} name="title" placeholder="Enter title" label="Title *" containerClassName="mb-3" error={errors.title} />
        </Col>
        <Col lg={6}>
          <TextFormInput control={control} name="metaTitle" placeholder="Enter meta title" label="Meta title" containerClassName="mb-3" />
        </Col>
        <Col lg={6}>
          <TextFormInput 
            control={control} 
            name="price" 
            placeholder="Enter price" 
            label="Price *" 
            containerClassName="mb-3" 
            type="number"
            step="0.01"
            error={errors.price}
          />
        </Col>
        <Col lg={6}>
          <TextFormInput 
            control={control} 
            name="quantity" 
            placeholder="Enter quantity" 
            label="Quantity *" 
            containerClassName="mb-3" 
            type="number"
            error={errors.quantity}
          />
        </Col>
      </Row>

      {/* Image Upload Section */}
      <Row className="mb-4">
        <Col lg={6}>
          <div className="mb-3">
            <label className="form-label">Main Image *</label>
            <input type="file" className="form-control" accept="image/*" onChange={handleMainImageChange} />
            {errors.mainImage && <div className="text-danger">{errors.mainImage.message}</div>}
            {mainImagePreview && (
              <div className="mt-2">
                <img src={mainImagePreview} alt="Main preview" className="img-thumbnail" style={{ maxHeight: '200px' }} />
              </div>
            )}
          </div>
        </Col>
        <Col lg={6}>
          <div className="mb-3">
            <label className="form-label">Detail Images</label>
            <input type="file" className="form-control" accept="image/*" multiple onChange={handleDetailImagesChange} />
            <div className="d-flex flex-wrap mt-2">
              {detailImagesPreviews.map((preview, index) => (
                <div key={index} className="position-relative me-2 mb-2">
                  <img
                    src={preview}
                    alt={`Detail preview ${index + 1}`}
                    className="img-thumbnail"
                    style={{ height: '100px', width: '100px', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    className="btn-close position-absolute top-0 end-0 bg-white"
                    style={{ transform: 'translate(50%, -50%)' }}
                    onClick={() => removeDetailImage(index)}
                  />
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col lg={12}>
          <TextAreaFormInput control={control} name="shortDescp" label="Short Description" containerClassName="mb-3" rows={3} />
        </Col>
        <Col lg={12}>
          <TextAreaFormInput control={control} name="longDescp" label="Long Description" containerClassName="mb-3" rows={5} />
        </Col>
        <Col lg={12}>
          <TextAreaFormInput control={control} name="metaDescp" label="Meta Description" containerClassName="mb-3" rows={3} />
        </Col>
        <Col lg={6}>
          <TextAreaFormInput control={control} name="productSource" label="Product Source" containerClassName="mb-3" rows={3} />
        </Col>
        <Col lg={3}>
          {subCategories.length > 0 && (
            <div className="mb-3">
              <label className="form-label">Subcategories</label>
              <SelectFormInput
                control={control}
                name="subCategoryId"
                options={subCategories.map((subcat) => ({
                  value: subcat.id,
                  label: subcat.title,
                }))}
                error={errors.subCategoryId}
              />
            </div>
          )}
        </Col>
        <Col lg={3}>
          {productBrand.length > 0 && (
            <div className="mb-3">
              <label className="form-label">Brand</label>
              <SelectFormInput
                control={control}
                name="brandId"
                options={productBrand.map((brand) => ({
                  value: brand.id,
                  label: brand.title,
                }))}
                error={errors.brandId}
              />
            </div>
          )}
        </Col>
      </Row>

      <div className="d-flex justify-content-end">
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Save & Continue'}
        </button>
      </div>
    </form>
  )
}

export default GeneralDetailsForm