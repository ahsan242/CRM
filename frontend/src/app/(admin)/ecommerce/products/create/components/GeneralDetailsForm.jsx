// import React from 'react'
// import { yupResolver } from '@hookform/resolvers/yup'
// import { Col, Row, Button, Alert } from 'react-bootstrap'
// import { useEffect, useState } from 'react'
// import { useForm } from 'react-hook-form'
// import ReactQuill from 'react-quill'
// import * as yup from 'yup'
// import SelectFormInput from '@/components/form/SelectFormInput'
// import TextAreaFormInput from '@/components/form/TextAreaFormInput'
// import TextFormInput from '@/components/form/TextFormInput'
// // import { getAllProductCategories, createProduct } from '@/http/Product';
// import { getAllProductCategories } from '@/http/Product'
// import { createProduct } from '@/http/Product'
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
//   categoryId: yup.string().required('Category is required'),
//   subCategoryId: yup.string().required('Subategory is required'),
//   mainImage: yup.mixed().required('Main image is required'),
//   detailImages: yup.array().of(yup.mixed()).optional(),
// })

// const GeneralDetailsForm = ({ onNext, formData, setFormData, onProductCreated, isLastStep }) => {
//   const [productCategories, setProductCategories] = useState([])
//   const [mainImagePreview, setMainImagePreview] = useState(null)
//   const [detailImagesPreviews, setDetailImagesPreviews] = useState([])
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [error, setError] = useState('')

//   const {
//     control,
//     register,
//     watch,
//     setValue,
//     handleSubmit,
//     formState: { errors },
//   } = useForm({
//     resolver: yupResolver(generalFormSchema),
//     defaultValues: formData,
//   })
//   // const  handleCreateProduct  = async () => {
//   //   try {

//   //     console.log(formData);
//   //     const res = await createProduct(formData);
//   //     toast.success("createProduct created successfully!");
//   //     console.log("Created PrcreateProduct:", res.data);
//   //   } catch (err) {
//   //     console.error(err);
//   //     toast.error(err.response?.data?.error || "Failed to create product");
//   //   }
//   // };
//   const mainImage = watch('mainImage')
//   const detailImages = watch('detailImages')

//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         const response = await getAllProductCategories()
//         const data = response.data
//         if (data) {
//           const categoryOptions = data.map((category) => {
//             return renameKeys(category, {
//               id: 'value',
//               name: 'label',
//             })
//           })
//           setProductCategories(categoryOptions)
//         }
//       } catch (error) {
//         console.error('Error fetching categories:', error)
//       }
//     }
//     fetchCategories()
//   }, [])

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

//   useEffect(() => {
//     if (detailImages && detailImages.length > 0) {
//       const previews = []
//       const readers = []
//       let isCancelled = false

//       detailImages.forEach((file, index) => {
//         if (file instanceof File) {
//           const reader = new FileReader()
//           readers.push(reader)

//           reader.onload = () => {
//             if (!isCancelled) {
//               previews[index] = reader.result
//               if (previews.filter(Boolean).length === detailImages.length) {
//                 setDetailImagesPreviews([...previews])
//               }
//             }
//           }
//           reader.readAsDataURL(file)
//         }
//       })

//       return () => {
//         isCancelled = true
//         readers.forEach((reader) => {
//           if (reader.readyState === 1) {
//             reader.abort()
//           }
//         })
//       }
//     } else {
//       setDetailImagesPreviews([])
//     }
//   }, [detailImages])

//   const handleMainImageChange = (e) => {
//     const file = e.target.files[0]
//     if (file) {
//       setValue('mainImage', file)
//       setFormData({ ...formData, mainImage: file })
//     }
//   }

//   const handleDetailImagesChange = (e) => {
//     const files = Array.from(e.target.files)
//     setValue('detailImages', files)
//     setFormData({ ...formData, detailImages: files })
//   }

//   const removeDetailImage = (index) => {
//     const newDetailImages = detailImages.filter((_, i) => i !== index)
//     setValue('detailImages', newDetailImages)
//     setFormData({ ...formData, detailImages: newDetailImages })

//     const newPreviews = [...detailImagesPreviews]
//     newPreviews.splice(index, 1)
//     setDetailImagesPreviews(newPreviews)
//   }

//   const onSubmit = async (data) => {
//     console.log('Form Data to submit:', data)
//     setIsSubmitting(true)
//     setError('')
//     try {
//       const completeFormData = { ...formData, ...data }
//       setFormData(completeFormData)

//       // Always build FormData and submit here
//       const formDataToSend = new FormData()
//       Object.keys(completeFormData).forEach((key) => {
//         if (key === 'detailImages' && Array.isArray(completeFormData.detailImages)) {
//           completeFormData.detailImages.forEach((file) => {
//             formDataToSend.append('detailImages', file)
//           })
//         } else if (key === 'mainImage') {
//           formDataToSend.append('mainImage', completeFormData.mainImage)
//         } else if (completeFormData[key] !== undefined && completeFormData[key] !== null) {
//           formDataToSend.append(key, completeFormData[key])
//         }
//       })

//       const response = await createProduct(formDataToSend)
//       console.log('✅ Product created successfully:', response.data)

//       // callback if needed
//       if (onProductCreated) onProductCreated()
//     } catch (error) {
//       console.error('❌ Error creating product:', error)
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
//         <Col lg={6}>
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
//         </Col>
//         <Col lg={6}>
//           {productCategories.length > 0 && (
//             <div className="mb-3">
//               <label className="form-label">Subcategories *</label>
//               <SelectFormInput
//                 control={control}
//                 name="subCategoryId"
//                 options={productCategories.map((subcat) => ({
//                   value: cat.id,
//                   label: cat.title,
//                 }))}
//                 error={errors.subCategoryId}
//               />
//             </div>
//           )}
//         </Col>
//       </Row>

//       <div className="d-flex justify-content-end">
//         <Button onClick={handleSubmit(onSubmit)} type="button" className="btn-primary">
//           {isSubmitting ? 'Processing...' : 'Save & Continue'}
//         </Button>
//       </div>
//     </form>
//   )
// }

// export default GeneralDetailsForm
