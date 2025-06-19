"use client";
import { useState, useRef, useEffect } from 'react';
import { Upload, Plus, X, ChevronDown, Info, DollarSign, Trash2 } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';
import { ActionMeta, MultiValue } from 'react-select';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import ImageIcon from './image-icon';

type OptionType = {
  label: string;
  value: string;
};

const videoProductSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  basePrice: z.string().min(1, "Base price is required")
    .refine(val => !isNaN(parseFloat(val)), "Base price must be a number"),
  discountedPrice: z.string()
    .refine(val => val === "" || !isNaN(parseFloat(val)), "Discounted price must be a number"),
  sku: z.string().optional(),
  inventory: z.string().refine(val => val === "" || !isNaN(parseInt(val)), "Inventory must be a number"),
  showPrice: z.boolean(),
  tags: z.array(z.object({
    label: z.string(),
    value: z.string()
  })).optional(),
});

type VideoProductFormValues = z.infer<typeof videoProductSchema>;

interface VideoProduct extends VideoProductFormValues {
  id: number;
  file: File | null;
  videoPreview: string | null;
  thumbnail: File | null;
  thumbnailPreview: string | null;
  images: {
    file: File;
    preview: string;
  }[];
}

const DashboardContentUpload = () => {
  const [videoProducts, setVideoProducts] = useState<VideoProduct[]>([
    {
      id: 1,
      title: '',
      description: '',
      file: null,
      videoPreview: null,
      thumbnail: null,
      thumbnailPreview: null,
      images: [],
      tags: [],
      basePrice: '',
      discountedPrice: '',
      showPrice: true,
      sku: '',
      inventory: ''
    }
  ]);
  const [activeTab, setActiveTab] = useState('upload');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const imageInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const { handleSubmit, formState: { errors }, trigger, setValue } = useForm<VideoProductFormValues>({
    resolver: zodResolver(videoProductSchema),
    mode: 'onBlur'
  });

  const handleFileChange = (id: number, type: 'file' | 'thumbnail', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'file') {
      const preview = URL.createObjectURL(file);
      setVideoProducts(videoProducts.map(vp => 
        vp.id === id ? { ...vp, file, videoPreview: preview } : vp
      ));
    } else {
      const preview = URL.createObjectURL(file);
      setVideoProducts(videoProducts.map(vp => 
        vp.id === id ? { ...vp, thumbnail: file, thumbnailPreview: preview } : vp
      ));
    }
  };

  const handleImagesChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setVideoProducts(videoProducts.map(vp => 
      vp.id === id ? { 
        ...vp, 
        images: [...vp.images, ...newImages],
        ...(!vp.thumbnail && newImages.length > 0 ? { 
          thumbnail: newImages[0].file,
          thumbnailPreview: newImages[0].preview
        } : {})
      } : vp
    ));
  };

  const addVideoProduct = () => {
    setVideoProducts([...videoProducts, {
      id: videoProducts.length + 1,
      title: '',
      description: '',
      file: null,
      videoPreview: null,
      thumbnail: null,
      thumbnailPreview: null,
      images: [],
      tags: [],
      basePrice: '',
      discountedPrice: '',
      showPrice: true,
      sku: '',
      inventory: ''
    }]);
  };

  const removeVideoProduct = (id: number) => {
    if (videoProducts.length <= 1) return;
    
    const productToRemove = videoProducts.find(vp => vp.id === id);
    if (productToRemove) {
      if (productToRemove.videoPreview) URL.revokeObjectURL(productToRemove.videoPreview);
      if (productToRemove.thumbnailPreview) URL.revokeObjectURL(productToRemove.thumbnailPreview);
      productToRemove.images.forEach(img => URL.revokeObjectURL(img.preview));
    }
    
    setVideoProducts(videoProducts.filter(vp => vp.id !== id));
  };

  const removeImage = (productId: number, imageIndex: number) => {
    setVideoProducts(videoProducts.map(vp => {
      if (vp.id !== productId) return vp;
      
      URL.revokeObjectURL(vp.images[imageIndex].preview);
      
      const newImages = [...vp.images];
      newImages.splice(imageIndex, 1);
      
      let newThumbnail = vp.thumbnail;
      let newThumbnailPreview = vp.thumbnailPreview;
      
      if (vp.thumbnail === vp.images[imageIndex].file) {
        newThumbnail = newImages.length > 0 ? newImages[0].file : null;
        newThumbnailPreview = newImages.length > 0 ? newImages[0].preview : null;
      }
      
      return {
        ...vp,
        images: newImages,
        thumbnail: newThumbnail,
        thumbnailPreview: newThumbnailPreview
      };
    }));
  };

  const setAsThumbnail = (productId: number, image: { file: File, preview: string }) => {
    setVideoProducts(videoProducts.map(vp => 
      vp.id === productId ? { 
        ...vp, 
        thumbnail: image.file,
        thumbnailPreview: image.preview
      } : vp
    ));
  };

  const triggerFileInput = (productId: number, type: 'video' | 'images') => {
    if (type === 'video' && fileInputRefs.current[`video-${productId}`]) {
      fileInputRefs.current[`video-${productId}`]?.click();
    } else if (type === 'images' && imageInputRefs.current[`images-${productId}`]) {
      imageInputRefs.current[`images-${productId}`]?.click();
    }
  };

  const handleInputChange = async (id: number, field: keyof VideoProduct, value: string | boolean) => {
    const updatedProducts = videoProducts.map(vp => 
      vp.id === id ? { ...vp, [field]: value } : vp
    );
    
    setVideoProducts(updatedProducts);
    
    // Update form value and trigger validation
    if (typeof value === 'string') {
      setValue(field as keyof VideoProductFormValues, value, {
        shouldValidate: true
      });
    }
  };

  const handleTagsChange = (
    id: number,
    newValue: MultiValue<OptionType>,
    actionMeta: ActionMeta<OptionType>
  ) => {
    setVideoProducts(videoProducts.map(vp => 
      vp.id === id ? { ...vp, tags: [...newValue] } : vp
    ));
  };

  const calculateDiscountPercentage = (base: string, discounted: string) => {
    const baseNum = parseFloat(base);
    const discountedNum = parseFloat(discounted);
    if (isNaN(baseNum)) return 0;
    if (isNaN(discountedNum)) return 0;
    return Math.round(((baseNum - discountedNum) / baseNum) * 100);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitting");
    setIsSubmitting(true);
    
    try {
      const missingFiles = videoProducts.some(vp => !vp.file || !vp.thumbnail || vp.images.length === 0);
      if (missingFiles) {
        alert("Please upload both video and thumbnail for all products, and at least one product image.");
        return;
      }
  
      for (const vp of videoProducts) {
        const result = await videoProductSchema.safeParseAsync(vp);
        if (!result.success) {
          console.error("Validation errors:", result.error);
          alert(`Please fix validation errors for product ${vp.id}`);
          return;
        }
      }
      
      const formDataArray = videoProducts.map(vp => {
        const formData = new FormData();
        
        formData.append('title', vp.title);
        formData.append('description', vp.description);
        formData.append('basePrice', vp.basePrice);
        formData.append('discountedPrice', vp.discountedPrice);
        formData.append('showPrice', String(vp.showPrice));
        if (vp.sku) {
          formData.append('sku', vp.sku);
        }
        formData.append('inventory', vp.inventory);
        
        if (vp.file) formData.append('video', vp.file);
        if (vp.thumbnail) formData.append('thumbnail', vp.thumbnail);
        
        vp.tags?.forEach(tag => {
          formData.append('tags[]', tag.value);
        });
        
        vp.images.forEach((image, index) => {
          formData.append(`images[${index}]`, image.file);
        });
        
        return formData;
      });
  
      const responses = await Promise.all(
        formDataArray.map(formData =>
          fetch('/api/content/upload', {
            method: 'POST',
            body: formData
          })
        ));
      
      const allSuccessful = responses.every(response => response.ok);
      
      if (allSuccessful) {
        setVideoProducts([{
          id: 1,
          title: '',
          description: '',
          file: null,
          videoPreview: null,
          thumbnail: null,
          thumbnailPreview: null,
          images: [],
          tags: [],
          basePrice: '',
          discountedPrice: '',
          showPrice: true,
          sku: '',
          inventory: ''
        }]);
        
        // reset();
        alert("Products uploaded successfully!");
      } else {
        // Handle errors if any request failed
        const errors = await Promise.all(
          responses.map(async r => {
            if (!r.ok) {
              return await r.json().catch(() => ({ error: 'Unknown error' }));
            }
            return null;
          })
        );
        
        console.error("Submission errors:", errors);
        alert("Some products failed to upload. Please try again.");
      }
    } catch (error) {
      console.error("Submission error:", error);
      alert("An error occurred while submitting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const currentProducts = videoProducts;
    return () => {
      currentProducts.forEach(vp => {
        if (vp.videoPreview) URL.revokeObjectURL(vp.videoPreview);
        if (vp.thumbnailPreview) URL.revokeObjectURL(vp.thumbnailPreview);
        vp.images.forEach(img => URL.revokeObjectURL(img.preview));
      });
    };
  }, [videoProducts]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div>      
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-4 py-2 font-medium text-sm flex items-center ${
              activeTab === 'upload' 
                ? 'text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400' 
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <Upload className="mr-2 h-4 w-4" /> Upload Content
          </button>
        </div>
        
        <form onSubmit={onSubmit} 
              className="space-y-6">
          {videoProducts.map((vp) => (
            <div 
              key={vp.id} 
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6 border border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                  Product Upload {vp.id}
                </h3>
                {videoProducts.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => removeVideoProduct(vp.id)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1 rounded-full hover:bg-red-50 dark:hover:bg-gray-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Product Title*
                  </label>
                  <input
                    type="text"
                    value={vp.title}
                    onChange={(e) => handleInputChange(vp.id, 'title', e.target.value)}
                    onBlur={() => trigger('title')}
                    className={`w-full px-3 py-2 border ${
                      errors.title 
                        ? 'border-red-500' 
                        : 'border-gray-300 dark:border-gray-600'
                    } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white`}
                    placeholder="Enter product title"
                    required
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.title.message}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={vp.sku}
                    onChange={(e) => handleInputChange(vp.id, 'sku', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Product SKU"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Description*
                </label>
                <textarea
                  value={vp.description}
                  onChange={(e) => handleInputChange(vp.id, 'description', e.target.value)}
                  onBlur={() => trigger('description')}
                  className={`w-full px-3 py-2 border ${
                    errors.description 
                      ? 'border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white`}
                  placeholder="Describe your product in detail..."
                  rows={4}
                  required
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.description.message}
                  </p>
                )}
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg mb-4">
                <h4 className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <DollarSign className="h-4 w-4 mr-2" /> Pricing
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Base Price*
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                      </div>
                      <input
                        type="text"
                        value={vp.basePrice}
                        onChange={(e) => handleInputChange(vp.id, 'basePrice', e.target.value)}
                        onBlur={() => trigger('basePrice')}
                        className={`block w-full pl-7 pr-12 py-2 ${
                          errors.basePrice 
                            ? 'border-red-500' 
                            : 'border-gray-300 dark:border-gray-600'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.basePrice && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.basePrice.message}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Discounted Price
                    </label>
                    <div className="relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
                      </div>
                      <input
                        type="text"
                        value={vp.discountedPrice}
                        onChange={(e) => handleInputChange(vp.id, 'discountedPrice', e.target.value)}
                        className={`block w-full pl-7 pr-12 py-2 ${
                          errors.discountedPrice 
                            ? 'border-red-500' 
                            : 'border-gray-300 dark:border-gray-600'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white`}
                        placeholder="0.00"
                      />
                    </div>
                    {errors.discountedPrice && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.discountedPrice.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-end">
                    {vp.basePrice && vp.discountedPrice && (
                      <div className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 px-3 py-2 rounded-md text-sm">
                        {calculateDiscountPercentage(vp.basePrice, vp.discountedPrice)}% OFF
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mt-3 flex items-center">
                  <input
                    id={`show-price-${vp.id}`}
                    type="checkbox"
                    checked={vp.showPrice}
                    onChange={(e) => handleInputChange(vp.id, 'showPrice', e.target.checked)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-600 rounded"
                  />
                  <label htmlFor={`show-price-${vp.id}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Show price in video
                  </label>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Inventory
                </label>
                <input
                  type="number"
                  value={vp.inventory}
                  onChange={(e) => handleInputChange(vp.id, 'inventory', e.target.value)}
                  className={`w-full md:w-1/3 px-3 py-2 border ${
                    errors.inventory 
                      ? 'border-red-500' 
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white`}
                  placeholder="Available quantity"
                  min="0"
                />
                {errors.inventory && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.inventory.message}
                  </p>
                )}
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Video File* {!vp.file && <span className="text-red-500">(Required)</span>}
                </label>
                <div className="mt-1 flex flex-col md:flex-row gap-4">
                  {vp.videoPreview ? (
                    <div className="w-full md:w-1/2">
                      <div className="relative aspect-video bg-black rounded-md overflow-hidden">
                        <video
                          src={vp.videoPreview}
                          controls
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => triggerFileInput(vp.id, 'video')}
                          className="absolute top-2 right-2 bg-gray-800/80 text-white p-2 rounded-full hover:bg-gray-700/90 transition-colors"
                          title="Change video"
                        >
                          <Upload className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        <p className="truncate">{vp.file?.name}</p>
                        <button
                          type="button"
                          onClick={() => {
                            setVideoProducts(videoProducts.map(p => 
                              p.id === vp.id ? { 
                                ...p, 
                                file: null, 
                                videoPreview: null 
                              } : p
                            ));
                          }}
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm flex items-center mt-1"
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Remove video
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full md:w-1/2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                          <label className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 focus-within:outline-none">
                            <span>Upload a file</span>
                            <input 
                              ref={el => { fileInputRefs.current[`video-${vp.id}`] = el; }}
                              type="file" 
                              className="sr-only" 
                              accept="video/*"
                              onChange={(e) => handleFileChange(vp.id, 'file', e)}
                              required
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          MP4, MOV up to 100MB
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="w-full md:w-1/2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Product Images ({vp.images.length} uploaded) {vp.images.length === 0 && <span className="text-red-500">(At least one required)</span>}
                    </label>
                    <input 
                      ref={el => { imageInputRefs.current[`images-${vp.id}`] = el; }}
                      type="file" 
                      className="sr-only" 
                      accept="image/*"
                      onChange={(e) => handleImagesChange(vp.id, e)}
                      multiple
                    />
                    
                    {vp.images.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2">
                        {vp.images.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <Image
                              src={img.preview}
                              width={400}
                              height={400}
                              alt={`Product image ${idx + 1}`}
                              className="aspect-square object-cover rounded-md border border-gray-200 dark:border-gray-700"
                            />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                              <button
                                type="button"
                                onClick={() => setAsThumbnail(vp.id, img)}
                                className={`p-1 rounded-full mr-1 ${vp.thumbnail === img.file ? 'bg-emerald-500 text-white' : 'bg-white text-gray-800'}`}
                                title="Set as thumbnail"
                              >
                                <ImageIcon />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeImage(vp.id, idx)}
                                className="p-1 rounded-full bg-red-500 text-white"
                                title="Remove image"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                            {vp.thumbnail === img.file && (
                              <div className="absolute top-1 left-1 bg-emerald-500 text-white text-xs px-1 rounded">
                                Thumb
                              </div>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => triggerFileInput(vp.id, 'images')}
                          className="aspect-square flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors"
                        >
                          <Plus className="h-5 w-5 text-gray-400" />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => triggerFileInput(vp.id, 'images')}
                        className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors"
                      >
                        <div className="space-y-1 text-center">
                          <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                            <span className="font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300">
                              Upload images
                            </span>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            JPG, PNG up to 5MB each
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {vp.thumbnailPreview && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Selected Thumbnail Preview
                  </label>
                  <div className="mt-1">
                    <Image
                      src={vp.thumbnailPreview}
                      width={100}
                      height={100}
                      alt="Selected thumbnail"
                      className="max-h-60 rounded-md border border-gray-200 dark:border-gray-700"
                    />
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <p>Selected from: {vp.thumbnail?.name || 'product images'}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags
                </label>
                <CreatableSelect
                  isMulti
                  components={{
                    DropdownIndicator: () => <ChevronDown className="h-4 w-4 text-gray-400 mr-2" />,
                    ClearIndicator: () => <X className="dark:text-white h-4 w-4 text-gray-400 mr-1" />
                  }}
                  options={[]}
                  value={vp.tags}
                  onChange={(newValue, actionMeta) => handleTagsChange(vp.id, newValue, actionMeta)}
                  className="react-select-container dark:text-white"
                  classNamePrefix="react-select"
                  placeholder="Type and press enter to add tags..."
                  noOptionsMessage={() => "Type to create tags"}
                  formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                  styles={{
                    control: (base) => ({
                      ...base,
                      backgroundColor: 'var(--bg-color)',
                      borderColor: 'var(--border-color)',
                      minHeight: '42px',
                      '&:hover': {
                        borderColor: 'var(--border-hover)'
                      }
                    }),
                    menu: (base) => ({
                      ...base,
                      backgroundColor: 'var(--bg-color)',
                      borderColor: 'var(--border-color)'
                    }),
                    multiValue: (base) => ({
                      ...base,
                      backgroundColor: 'var(--emerald-100)',
                      color: 'var(--emerald-800)'
                    }),
                    multiValueLabel: (base) => ({
                      ...base,
                      color: 'var(--emerald-800)'
                    }),
                    multiValueRemove: (base) => ({
                      ...base,
                      color: 'var(--emerald-600)',
                      ':hover': {
                        backgroundColor: 'var(--emerald-200)',
                        color: 'var(--emerald-700)'
                      }
                    })
                  }}
                />
                <style jsx global>{`
                  :root {
                    --bg-color: #fff;
                    --border-color: #d1d5db;
                    --border-hover: #9ca3af;
                    --emerald-100: #d1fae5;
                    --emerald-200: #a7f3d0;
                    --emerald-600: #059669;
                    --emerald-700: #047857;
                    --emerald-800: #065f46;
                  }
                  .dark {
                    --bg-color: #1f2937;
                    --border-color: #374151;
                    --border-hover: #4b5563;
                    --emerald-100: rgba(16, 185, 129, 0.1);
                    --emerald-200: rgba(16, 185, 129, 0.2);
                    --emerald-600: #10b981;
                    --emerald-700: #0d9488;
                    --emerald-800: #115e59;
                  }
                `}</style>
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addVideoProduct}
            className="w-full flex items-center justify-center px-4 py-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-md text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:border-emerald-400 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Another Product Video
          </button>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Uploading...' : 'Upload All Products'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DashboardContentUpload;