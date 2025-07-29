"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ColorPicker } from "@/components/ui/color-picker"
import { ImageUpload } from "@/components/ui/image-upload"
import { TimePicker } from "@/components/ui/time-picker"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

const faqSchema = z.object({
  question: z.string().min(5, {
    message: "Question must be at least 5 characters.",
  }),
  answer: z.string().min(10, {
    message: "Answer must be at least 10 characters.",
  }),
})

const storeFormSchema = z.object({
  storeName: z.string().min(2, {
    message: "Store name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  logo: z.string().url({
    message: "Please upload a valid image URL.",
  }),
  banner: z.string().url({
    message: "Please upload a valid image URL.",
  }),
  categories: z.array(z.string()).min(1, {
    message: "Please select at least one category.",
  }),
  address: z.object({
    street: z.string().min(2),
    city: z.string().min(2),
    state: z.string().min(2),
    postalCode: z.string().min(2),
    country: z.string().min(2),
  }),
  contact: z.object({
    email: z.string().email(),
    phone: z.string().min(6),
  }),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
  }),
  openingHours: z.array(
    z.object({
      day: z.string(),
      open: z.boolean(),
      openingTime: z.string().optional(),
      closingTime: z.string().optional(),
    })
  ),
  socialMedia: z.object({
    maps: z.string().optional(),
    facebook: z.string().url().optional(),
    instagram: z.string().url().optional(),
    twitter: z.string().url().optional(),
  }),
  faqs: z.array(faqSchema).optional(),
})

export default function CreateStore() {
  const form = useForm<z.infer<typeof storeFormSchema>>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      storeName: "",
      description: "",
      logo: "",
      banner: "",
      categories: [],
      address: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      },
      contact: {
        email: "",
        phone: "",
      },
      colors: {
        primary: "#3b82f6",
        secondary: "#10b981",
        accent: "#f59e0b",
      },
      openingHours: [
        { day: "Monday", open: true, openingTime: "09:00", closingTime: "17:00" },
        { day: "Tuesday", open: true, openingTime: "09:00", closingTime: "17:00" },
        { day: "Wednesday", open: true, openingTime: "09:00", closingTime: "17:00" },
        { day: "Thursday", open: true, openingTime: "09:00", closingTime: "17:00" },
        { day: "Friday", open: true, openingTime: "09:00", closingTime: "17:00" },
        { day: "Saturday", open: false },
        { day: "Sunday", open: false },
      ],
      socialMedia: {
        maps: "",
        facebook: "",
        instagram: "",
        twitter: "",
      },
      faqs: [],
    },
  })


  const [expandedFaqs, setExpandedFaqs] = useState<number[]>([])
  const [submiting, setSubmiting] = useState<boolean>(false);
  const { data: session, update } = useSession();

  const router = useRouter();

  const test = () => {
    console.log(session?.user.role);
  }
  const toggleFaq = (index: number) => {
    setExpandedFaqs(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  async function updateSession() {
    await update({
      user: {
        role: "seller",
      },
    })
  }

  const addNewFaq = () => {
    const currentFaqs = form.getValues("faqs") || []
    const newIndex = currentFaqs.length
    
    form.setValue("faqs", [...currentFaqs, { question: "", answer: "" }])
    
    if (currentFaqs.length === 0) {
      setExpandedFaqs([newIndex])
    } else {
      setExpandedFaqs([newIndex])
    }
  }

  const removeFaq = (index: number) => {
    const currentFaqs = form.getValues("faqs") || []
    form.setValue("faqs", currentFaqs.filter((_, i) => i !== index))
    setExpandedFaqs(prev => prev.filter(i => i !== index))
  }

  async function onSubmit(values: z.infer<typeof storeFormSchema>) {
    console.log(values)
    setSubmiting(true)
    try {
      const response = await fetch('/api/create-store', {
        method: 'POST',
        body: JSON.stringify(values),
        headers: {
            'Content-Type': 'request/json'
        }
      })

      if (!response.ok) {
          const errorRes = await response.json();
          console.log(errorRes)
          toast(errorRes.error)
          return
      }
    
      const data = await response.json()

      toast(data.message)
      updateSession();
      setTimeout(() => {
        router.push("/vendor")
      }, 2000)
    } catch (error) {
      console.log(error);
      toast("something went wrong")
    } finally {
      setSubmiting(false)
    }
  }

  return (
    <main className="container mx-auto py-8 px-4 h-screen overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create Your Store</h1>
        <p className="text-muted-foreground mb-8">
          Fill out the form below to set up your store. All fields are required unless marked optional.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="storeName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Store Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your store name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell customers about your store..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This will appear on your store's homepage.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="logo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Logo</FormLabel>
                        <FormControl>
                          <ImageUpload
                            value={field.value}
                            onChange={field.onChange}
                            maxFiles={1}
                            accept={{ "image/*": [] }}
                            placeholder="Upload your logo"
                          />
                        </FormControl>
                        <FormDescription>
                          Recommended size: 300x300 pixels
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="banner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Store Banner</FormLabel>
                        <FormControl>
                          <ImageUpload
                            value={field.value}
                            onChange={field.onChange}
                            maxFiles={1}
                            accept={{ "image/*": [] }}
                            placeholder="Upload your banner"
                          />
                        </FormControl>
                        <FormDescription>
                          Recommended size: 1200x400 pixels
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                        <FormField
                            control={form.control}
                            name="categories"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Store Categories</FormLabel>
                                <div className="flex gap-2">
                                <Select
                                    onValueChange={(value) => {
                                        if (!field.value.includes(value)) {
                                          field.onChange([...field.value, value])
                                        }
                                    }}
                                >
                                    <FormControl>
                                    <SelectTrigger className="min-w-[180px]">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                    <SelectItem value="fashion">Fashion</SelectItem>
                                    <SelectItem value="electronics">Electronics</SelectItem>
                                    <SelectItem value="home">Home & Garden</SelectItem>
                                    <SelectItem value="beauty">Beauty</SelectItem>
                                    <SelectItem value="sports">Sports</SelectItem>
                                    <SelectItem value="food">Food & Beverage</SelectItem>
                                    <SelectItem value="health">Health & Wellness</SelectItem>
                                    </SelectContent>
                                </Select>
                                
                                <Input
                                    type="text"
                                    placeholder="Custom category"
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') {
                                        e.preventDefault()
                                        const value = e.currentTarget.value.trim()
                                        if (value && !field.value.includes(value)) {
                                            field.onChange([...field.value, value])
                                            e.currentTarget.value = ''
                                        }
                                      }
                                    }}
                                    className="flex-1"
                                />
                                </div>
                                <FormDescription>
                                    select from the dropdown or type a custom category and press Enter
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        </div>
                    </div>

                    {form.watch("categories")?.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                        {form.watch("categories").map((category) => (
                            <div
                            key={category}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
                            >
                            {category}
                            <button
                                type="button"
                                onClick={() => {
                                form.setValue(
                                    "categories",
                                    form.watch("categories").filter((c) => c !== category)
                                )
                                }}
                                className="ml-2 rounded-full hover:bg-primary/20 p-1"
                            >
                                <span className="sr-only">Remove</span>
                                <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                >
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                            </div>
                        ))}
                        </div>
                    )}
                    </div>
                </CardContent>
             </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location & Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="New York" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State/Province</FormLabel>
                        <FormControl>
                          <Input placeholder="NY" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Postal Code</FormLabel>
                        <FormControl>
                          <Input placeholder="10001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="address.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="United States" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Separator className="my-4" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Email</FormLabel>
                        <FormControl>
                          <Input placeholder="contact@yourstore.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contact.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 (555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Brand Colors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="colors.primary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Color</FormLabel>
                        <FormControl>
                          <ColorPicker value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="colors.secondary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Color</FormLabel>
                        <FormControl>
                          <ColorPicker value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="colors.accent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Accent Color</FormLabel>
                        <FormControl>
                          <ColorPicker value={field.value} onChange={field.onChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Opening Hours</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                    {form.watch("openingHours").map((day, index) => (
                        <div key={day.day} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="w-full sm:w-24 font-medium">{day.day}</div>
                        
                        <div className="flex items-center gap-2 sm:gap-4">
                            <FormField
                            control={form.control}
                            name={`openingHours.${index}.open`}
                            render={({ field }) => (
                                <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                    <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <FormLabel className="!mt-0">
                                    {field.value ? "Open" : "Closed"}
                                </FormLabel>
                                </FormItem>
                            )}
                            />

                            {day.open && (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                <FormField
                                control={form.control}
                                name={`openingHours.${index}.openingTime`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormControl>
                                        <TimePicker value={field.value} onChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                                <span className="hidden sm:inline">to</span>
                                <span className="sm:hidden text-center w-full">-</span>
                                <FormField
                                control={form.control}
                                name={`openingHours.${index}.closingTime`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormControl>
                                        <TimePicker value={field.value} onChange={field.onChange} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </div>
                            )}
                        </div>
                        </div>
                    ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Media (Optional)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="socialMedia.maps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Google Maps</FormLabel>
                      <FormControl>
                        <Input placeholder='<iframe src="https://www.google.com/maps/embed?..."></iframe>' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="socialMedia.facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Facebook</FormLabel>
                      <FormControl>
                        <Input placeholder="https://facebook.com/yourstore" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialMedia.instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input placeholder="https://instagram.com/yourstore" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="socialMedia.twitter"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter/X</FormLabel>
                      <FormControl>
                        <Input placeholder="https://twitter.com/yourstore" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>FAQs (Optional)</CardTitle>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addNewFaq}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add FAQ
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {form.watch("faqs")?.length === 0 ? (
                  <div className="text-center text-muted-foreground py-4">
                    No FAQs added yet. Click "Add FAQ" to create one.
                  </div>
                ) : (
                  form.watch("faqs")?.map((faq, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                        <div className="w-full flex justify-between items-center p-4 hover:bg-muted/50 transition-colors">
                            <button
                                type="button"
                                className="flex-1 flex items-center space-x-3 text-left"
                                onClick={() => toggleFaq(index)}
                            >
                                <span className="font-medium">
                                    {faq.question || `FAQ ${index + 1}`}
                                </span>
                            </button>
                            
                            <div className="flex items-center space-x-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="text-muted-foreground hover:text-destructive"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        removeFaq(index)
                                    }}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <button
                                    type="button"
                                    className="p-1 text-muted-foreground hover:text-foreground"
                                    onClick={() => toggleFaq(index)}
                                >
                                    {expandedFaqs.includes(index) ? (
                                        <ChevronUp className="h-4 w-4" />
                                    ) : (
                                        <ChevronDown className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                        
                        <div className={cn(
                            "overflow-hidden transition-all duration-300",
                            expandedFaqs.includes(index) ? "max-h-96 p-4" : "max-h-0"
                        )}>
                            <FormField
                                control={form.control}
                                name={`faqs.${index}.question`}
                                render={({ field }) => (
                                    <FormItem className="mb-4">
                                        <FormLabel>Question</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter a frequently asked question"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            
                            <FormField
                                control={form.control}
                                name={`faqs.${index}.answer`}
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Answer</FormLabel>
                                    <FormControl>
                                        <Textarea
                                        placeholder="Provide the answer to this question"
                                        className="min-h-[100px]"
                                        {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" size="lg" disabled={submiting}>
                {submiting ? 'Creating...' : 'Create Store'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
      <Button onClick={test}>
        Test session
      </Button>
    </main>
  )
}