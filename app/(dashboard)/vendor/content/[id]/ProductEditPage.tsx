"use client";
import { useState, useEffect, useRef } from 'react';
import { Upload, Plus, X, ChevronDown, Info, DollarSign, Trash2, Image as ImageIcon } from 'lucide-react';
import CreatableSelect from 'react-select/creatable';
import { ActionMeta, MultiValue } from 'react-select';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import Image from 'next/image';

type OptionType = {
  label: string;
  value: string;
};

const predefinedCategories: OptionType[] = [
  { value: 'fashion', label: 'Fashion & Apparel' },
  { value: 'beauty', label: 'Beauty & Skincare' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'home', label: 'Home & Living' },
  { value: 'health', label: 'Health & Wellness' },
  { value: 'jewelry', label: 'Jewelry & Accessories' },
  { value: 'food', label: 'Food & Beverage' },
];

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
  hasVariants: z.boolean(),
  tags: z.array(z.object({
    label: z.string(),
    value: z.string()
  })).optional(),
  category: z.object({
    label: z.string(),
    value: z.string()
  }).optional(),
});

type ProductAttribute = {
  id: string;
  name: string;
  values: OptionType[];
};

type VideoProductFormValues = z.infer<typeof videoProductSchema>;

interface VideoProduct extends VideoProductFormValues {
  id: string;
  file: File | null;
  videoPreview: string | null;
  videoUrl?: string;
  thumbnail: File | null;
  localVideoPreview: File | null;
  localImagePreview: File | null;
  thumbnailPreview: string | null;
  thumbnailUrl?: string;
  images: {
    file: File | null;
    preview: string;
    url?: string;
  }[];
  attributes: ProductAttribute[];
}

export default function ProductEditContent({ id }: { id: string }) {
  const [product, setProduct] = useState<VideoProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const { handleSubmit, formState: { errors }, trigger, setValue } = useForm<VideoProductFormValues>({
    resolver: zodResolver(videoProductSchema),
    mode: 'onBlur'
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!id) {
          throw new Error("No product ID provided");
        }

        const response = await fetch(`/api/content/upload/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        
        const data = await response.json();
        const productData = data.message;

        console.log(productData)

        const transformedProduct: VideoProduct = {
          id: productData.id,
          title: productData.title,
          description: productData.description,
          file: null,
          videoPreview: null,
          videoUrl: productData.video,
          thumbnail: null,
          thumbnailPreview: null,
          thumbnailUrl: productData.thumbnail,
          // images: productData.images,
          images: productData.images.map(img => ({
            file: null,
            preview: img,
            url: img
          })),
          basePrice: productData.basePrice,
          discountedPrice: productData.discountedPrice,
          showPrice: productData.showPrice,
          hasVariants: productData.hasVariants,
          sku: productData.sku,
          inventory: productData.inventory,
          tags: productData.tags,
          category: productData.category,
          attributes: productData.attributes || []
        };

        setProduct(transformedProduct);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const addNewAttribute = () => {
    if (!product) return;
    
    setProduct({ 
      ...product, 
      attributes: [
        ...product.attributes,
        { id: Date.now().toString(), name: "", values: [] }
      ]
    });
  };

  const removeAttribute = (attributeId: string) => {
    if (!product) return;
    
    setProduct({ 
      ...product, 
      attributes: product.attributes.filter(attr => attr.id !== attributeId)
    });
  };

  const updateAttributeName = (attributeId: string, newName: string) => {
    if (!product) return;
    
    setProduct({ 
      ...product, 
      attributes: product.attributes.map(attr => 
        attr.id === attributeId ? { ...attr, name: newName } : attr
      )
    });
  };

  const handleAttributeValuesChange = (
    attributeId: string,
    newValues: MultiValue<OptionType>
  ) => {
    if (!product) return;
    
    setProduct({ 
      ...product, 
      attributes: product.attributes.map(attr => 
        attr.id === attributeId ? { ...attr, values: [...newValues] } : attr
      )
    });
  };

  const handleFileChange = (type: 'file' | 'thumbnail', e: React.ChangeEvent<HTMLInputElement>) => {
    if (!product) return;
    
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'file') {
      const preview = URL.createObjectURL(file);
      setProduct({ 
        ...product, 
        file, 
        videoPreview: preview,
        videoUrl: undefined
      });
    } else {
      const preview = URL.createObjectURL(file);
      setProduct({ 
        ...product, 
        thumbnail: file, 
        thumbnailPreview: preview,
        thumbnailUrl: undefined
      });
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!product) return;
    
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages = Array.from(files).map(file => ({
      file,
      preview: URL.createObjectURL(file),
      url: undefined
    }));

    setProduct({ 
      ...product, 
      images: [...product.images, ...newImages]
    });

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const removeImage = (imageIndex: number) => {
    if (!product) return;
    
    const newImages = [...product.images];
    if (newImages[imageIndex].preview) {
      URL.revokeObjectURL(newImages[imageIndex].preview);
    }
    newImages.splice(imageIndex, 1);
    
    let newThumbnail = product.thumbnail;
    let newThumbnailPreview = product.thumbnailPreview;
    let newThumbnailUrl = product.thumbnailUrl;
    
    if (product.thumbnail === product.images[imageIndex].file || 
        product.thumbnailUrl === product.images[imageIndex].url) {
      newThumbnail = newImages.length > 0 ? newImages[0].file : null;
      newThumbnailPreview = newImages.length > 0 ? newImages[0].preview : null;
      newThumbnailUrl = newImages.length > 0 ? newImages[0].url : undefined;
    }
    
    setProduct({
      ...product,
      images: newImages,
      thumbnail: newThumbnail,
      thumbnailPreview: newThumbnailPreview,
      thumbnailUrl: newThumbnailUrl
    });
  };

  const setAsThumbnail = (imageIndex: number) => {
    if (!product || !product.images[imageIndex]) return;
    
    const selectedImage = product.images[imageIndex];

    console.log({ selectedImage })
    
    setProduct({ 
      ...product, 
      thumbnail: selectedImage.file || null,
      thumbnailPreview: selectedImage.preview || selectedImage.url || null,
      thumbnailUrl: selectedImage.url || undefined
    });
  };

  const triggerFileInput = (type: 'video' | 'images') => {
    if (type === 'video' && fileInputRef.current) {
      fileInputRef.current.click();
    } else if (type === 'images' && imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const handleInputChange = async (field: keyof VideoProduct, value: string | boolean) => {
    if (!product) return;
    
    const updatedProduct = { ...product, [field]: value };
    setProduct(updatedProduct);
    
    if (typeof value === 'string') {
      setValue(field as keyof VideoProductFormValues, value, {
        shouldValidate: true
      });
    }
  };

  const handleTagsChange = (
    newValue: MultiValue<OptionType>,
    // actionMeta: ActionMeta<OptionType>
  ) => {
    if (!product) return;
    
    setProduct({ ...product, tags: [...newValue] });
  };

  const calculateDiscountPercentage = (base: string, discounted: string) => {
    const baseNum = parseFloat(base);
    const discountedNum = parseFloat(discounted);
    if (isNaN(baseNum)) return 0;
    if (isNaN(discountedNum)) return 0;
    return Math.round(((baseNum - discountedNum) / baseNum) * 100);
  };

  const isThumbnail = (image: VideoProduct['images'][0]) => {
    if (!product) return false;
    return (
      product.thumbnail === image.file || 
      product.thumbnailUrl === image.url
    );
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product) return;

    setIsSubmitting(true);

    try {
      const formData = new FormData();

      // Append basic product fields
      formData.append('id', product.id);
      formData.append('title', product.title);
      formData.append('description', product.description);
      formData.append('basePrice', product.basePrice);
      formData.append('discountedPrice', product.discountedPrice);
      formData.append('showPrice', String(product.showPrice));
      formData.append('hasVariants', String(product.hasVariants));
      if (product.sku) formData.append('sku', product.sku);
      formData.append('inventory', product.inventory);

      // Append video and thumbnail if they exist
      if (product.file) formData.append('video', product.file);
      if (product.thumbnail) 
        formData.append('thumbnail', product.thumbnail);

      // Append tags
      product.tags?.forEach(tag => {
        formData.append('tags[]', tag.value);
      });

      // Append category
      if (product.category) {
        formData.append('category', product.category.value);
      }

      // Append all images (existing and new)
      product.images.forEach((image, index) => {
        if (image.file) {
          // New image: append the file
          formData.append(`images[${index}]`, image.file);
        }
        if (image.url) {
          // Existing image: append the URL
          formData.append(`existingImages[${index}]`, image.url);
        }
      });

      // Append attributes
      product.attributes.forEach((attr, index) => {
        formData.append(`attributes[${index}][name]`, attr.name);
        attr.values.forEach((value, valueIndex) => {
          formData.append(`attributes[${index}][values][${valueIndex}][value]`, value.value);
          formData.append(`attributes[${index}][values][${valueIndex}][label]`, value.label);
        });
      });

      const response = await fetch(`/api/content/upload/${product.id}`, {
        method: 'PUT',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      }

      alert("Product updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      alert(error instanceof Error ? error.message : "An error occurred while updating the product");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    return () => {
      if (product) {
        if (product.videoPreview) URL.revokeObjectURL(product.videoPreview);
        if (product.thumbnailPreview) URL.revokeObjectURL(product.thumbnailPreview);
        product.images.forEach(img => {
          if (img.preview) URL.revokeObjectURL(img.preview);
        });
      }
    };
  }, [product]);

  if (loading) {
    return <div className="p-4">Loading product data...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>;
  }

  if (!product) {
    return <div className="p-4">No product found</div>;
  }

  console.log({product})

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div>      
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            className={`px-4 py-2 font-medium text-sm flex items-center text-emerald-600 dark:text-emerald-400 border-b-2 border-emerald-600 dark:border-emerald-400`}
          >
            <Upload className="mr-2 h-4 w-4" /> Edit Content
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800 dark:text-white">
                Edit Product
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Product Title*
                </label>
                <input
                  type="text"
                  value={product.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
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
                  value={product.sku || ''}
                  onChange={(e) => handleInputChange('sku', e.target.value)}
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
                value={product.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
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
                <span className="text-x mr-2">₦</span> Pricing
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Base Price*
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 sm:text-sm">₦</span>
                    </div>
                    <input
                      type="text"
                      value={product.basePrice}
                      onChange={(e) => handleInputChange('basePrice', e.target.value)}
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
                      <span className="text-gray-500 dark:text-gray-400 sm:text-sm">₦</span>
                    </div>
                    <input
                      type="text"
                      value={product.discountedPrice}
                      onChange={(e) => handleInputChange('discountedPrice', e.target.value)}
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
                  {product.basePrice && product.discountedPrice && (
                    <div className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 px-3 py-2 rounded-md text-sm">
                      {calculateDiscountPercentage(product.basePrice, product.discountedPrice)}% OFF
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-3 flex items-center">
                <input
                  id="show-price"
                  type="checkbox"
                  checked={product.showPrice}
                  onChange={(e) => handleInputChange('showPrice', e.target.checked)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="show-price" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Show price in video
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Inventory
                </label>
                <input
                  type="number"
                  value={product.inventory}
                  onChange={(e) => handleInputChange('inventory', e.target.value)}
                  className={`w-full px-3 py-2 border ${
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <CreatableSelect
                  components={{
                    DropdownIndicator: () => <ChevronDown className="h-4 w-4 text-gray-400 mr-2" />,
                    ClearIndicator: () => <X className="dark:text-white h-4 w-4 text-gray-400 mr-1" />
                  }}
                  options={predefinedCategories}
                  value={product.category}
                  onChange={(newValue) => {
                    if (product) {
                      setProduct({ ...product, category: newValue as OptionType });
                    }
                  }}
                  className="react-select-container dark:text-white"
                  classNamePrefix="react-select"
                  placeholder="Select or create a category..."
                  formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
                  noOptionsMessage={() => "Type to create a category"}
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
                    singleValue: (base) => ({
                      ...base,
                      color: 'var(--text-color)'
                    }),
                    input: (base) => ({
                      ...base,
                      color: 'var(--text-color)'
                    })
                  }}
                />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center">
                <input
                  id="has-variants"
                  type="checkbox"
                  checked={product.hasVariants}
                  onChange={(e) => handleInputChange('hasVariants', e.target.checked)}
                  className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 dark:border-gray-600 rounded"
                />
                <label htmlFor="has-variants" className="ml-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  This product has variants (e.g., size, color)
                </label>
              </div>
            </div>

            {product.hasVariants && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Attributes (e.g., Size, Color)
                </label>
                
                {product.attributes?.map((attr) => (
                  <div key={attr.id} className="mb-4 p-3 border border-gray-200 dark:border-gray-700 rounded-md">
                    <div className="flex justify-between items-center mb-3">
                      <input
                        type="text"
                        value={attr.name}
                        onChange={(e) => updateAttributeName(attr.id, e.target.value)}
                        placeholder="Attribute name (e.g., Size)"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeAttribute(attr.id)}
                        className="ml-2 text-red-500 hover:text-red-700 dark:hover:text-red-400 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Values
                    </label>
                    <CreatableSelect
                      isMulti
                      components={{
                        DropdownIndicator: () => <ChevronDown className="h-4 w-4 text-gray-400 mr-2" />,
                        ClearIndicator: () => <X className="dark:text-white h-4 w-4 text-gray-400 mr-1" />
                      }}
                      value={attr.values}
                      onChange={(newValue) => handleAttributeValuesChange(attr.id, newValue)}
                      placeholder="Type and press enter to add values..."
                      noOptionsMessage={() => "Type to create values"}
                      formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                      className="react-select-container"
                      classNamePrefix="react-select"
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
                          backgroundColor: 'var(--emerald-100)'
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
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addNewAttribute}
                  className="mt-2 text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Attribute
                </button>
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Video File* {!product.file && !product.videoUrl && <span className="text-red-500">(Required)</span>}
              </label>
              <div className="mt-1 flex flex-col md:flex-row gap-4">
                {product.videoPreview || product.videoUrl ? (
                  <div className="w-full md:w-1/2">
                    <div className="relative aspect-video bg-black rounded-md overflow-hidden">
                      <video
                        src={product.videoPreview || product.videoUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={() => triggerFileInput('video')}
                        className="absolute top-2 right-2 bg-gray-800/80 text-white p-2 rounded-full hover:bg-gray-700/90 transition-colors"
                        title="Change video"
                      >
                        <Upload className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      <p className="truncate">{product.file?.name || "Current video"}</p>
                      <button
                        type="button"
                        onClick={() => {
                          if (product.videoPreview) URL.revokeObjectURL(product.videoPreview);
                          setProduct({ 
                            ...product, 
                            file: null, 
                            videoPreview: null,
                            videoUrl: undefined
                          });
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
                            ref={fileInputRef}
                            type="file" 
                            className="sr-only" 
                            accept="video/*"
                            onChange={(e) => handleFileChange('file', e)}
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
                    Product Images ({product.images.length} uploaded) {product.images.length === 0 && <span className="text-red-500">(At least one required)</span>}
                  </label>
                  <input 
                    ref={imageInputRef}
                    type="file" 
                    className="sr-only" 
                    accept="image/*"
                    onChange={handleImagesChange}
                    multiple
                  />
                  
                  {product.images.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                      {product.images.map((img, idx) => (
                        <div key={img.preview || img.url} className="relative group">
                          <Image
                            src={img.preview || img.url || ''}
                            width={400}
                            height={400}
                            alt={`Product image ${idx + 1}`}
                            className="aspect-square object-cover rounded-md border border-gray-200 dark:border-gray-700"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              target.src = '/image-placeholder.svg';
                            }}
                          />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                            <button
                              type="button"
                              onClick={() => setAsThumbnail(idx)}
                              className={`p-1 rounded-full mr-1 ${
                                (product.thumbnail === img.file || product.thumbnailUrl === img.url) 
                                  ? 'bg-emerald-500 text-white' 
                                  : 'bg-white text-gray-800'
                              }`}
                              title="Set as thumbnail"
                            >
                              <ImageIcon className="h-3 w-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => removeImage(idx)}
                              className="p-1 rounded-full bg-red-500 text-white"
                              title="Remove image"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                          {(product.thumbnail === img.file || product.thumbnailUrl === img.url) && (
                            <div className="absolute top-1 left-1 bg-emerald-500 text-white text-xs px-1 rounded">
                              Thumb
                            </div>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => triggerFileInput('images')}
                        className="aspect-square flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md hover:border-emerald-500 dark:hover:border-emerald-400 transition-colors"
                      >
                        <Plus className="h-5 w-5 text-gray-400" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      onClick={() => triggerFileInput('images')}
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
            
            {(product.thumbnailPreview || product.thumbnailUrl) && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Selected Thumbnail Preview
                </label>
                <div className="mt-1">
                  <Image
                    src={product.thumbnailPreview || product.thumbnailUrl || ''}
                    width={100}
                    height={100}
                    alt="Selected thumbnail"
                    className="max-h-60 rounded-md border border-gray-200 dark:border-gray-700"
                  />
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      Selected from: {
                        product.thumbnail?.name || 
                        product.images.find(img => 
                          img.file === product.thumbnail || 
                          img.url === product.thumbnailUrl
                        )?.file?.name || 
                        'product images'
                      }
                    </p>
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
                value={product.tags}
                onChange={handleTagsChange}
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
                  --text-color: #111827;
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
                  --text-color: #f3f4f6;
                }
              `}</style>
            </div>
          </div>
          
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full md:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 dark:focus:ring-offset-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}