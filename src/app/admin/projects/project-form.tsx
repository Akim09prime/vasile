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
import { Switch } from "@/components/ui/switch"
import type { Project, ProjectData, ProjectType } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"
import { getProjectTypes } from "@/lib/services/settings-service"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import { X, CheckCircle, Star } from "lucide-react"

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  category: z.string().min(1, "Category is required."),
  summary: z.string().optional(),
  content: z.string().optional(),
  location: z.string().optional(),
  rating: z.coerce.number().min(0).max(5).default(0),
  coverMediaId: z.string().optional(),
  mediaIds: z.array(z.string()).optional(),
  isPublished: z.boolean().default(false),
})

type ProjectFormValues = z.infer<typeof formSchema>;

type ProjectFormProps = {
  onSubmit: (data: ProjectFormValues) => void;
  project?: Project | null;
  onClose: () => void;
}

export function ProjectForm({ onSubmit, project, onClose }: ProjectFormProps) {
  const [categories, setCategories] = useState<ProjectType[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      const fetchedCategories = await getProjectTypes();
      setCategories(fetchedCategories.filter(c => c.active));
    }
    fetchCategories();
  }, []);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name || "",
      category: project?.category || "",
      summary: project?.summary || "",
      content: project?.content || "",
      location: project?.location || "",
      rating: project?.rating || 0,
      coverMediaId: project?.coverMediaId || "",
      mediaIds: project?.mediaIds || [],
      isPublished: project?.isPublished || false,
    },
  })
  
  const handleCategoryChange = (label: string) => {
    form.setValue("category", label);
  }

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values)
  }

  const mediaIds = form.watch("mediaIds") || [];
  const coverMediaId = form.watch("coverMediaId");

  const toggleMediaId = (id: string) => {
    const currentIds = form.getValues("mediaIds") || [];
    if (currentIds.includes(id)) {
      form.setValue("mediaIds", currentIds.filter(mediaId => mediaId !== id));
    } else {
      form.setValue("mediaIds", [...currentIds, id]);
    }
  }

  const setCoverId = (id: string) => {
    form.setValue("coverMediaId", id);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <ScrollArea className="h-[70vh] p-4">
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                            <Input placeholder="Modern kitchen, oak" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Category</FormLabel>
                            <Select onValueChange={handleCategoryChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {categories.map(category => (
                                <SelectItem key={category.id} value={category.label_ro}>{category.label_ro}</SelectItem>
                                ))}
                            </SelectContent>
                            </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                                <Input placeholder="Bucharest" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                     <FormField
                        control={form.control}
                        name="rating"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Rating</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={String(field.value)}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a rating" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {[0, 1, 2, 3, 4, 5].map(rate => (
                                         <SelectItem key={rate} value={String(rate)}>
                                            <span className="flex items-center">{rate} <Star className="ml-1 h-4 w-4 text-yellow-400" fill="currentColor"/></span>
                                         </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>
                <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Summary</FormLabel>
                    <FormControl>
                        <Textarea placeholder="A short description of the project..." {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Detailed Content (HTML)</FormLabel>
                    <FormControl>
                        <Textarea placeholder="The full project description, technical details, etc." rows={8} {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
               
                {/* Cover Media Picker */}
                <div className="space-y-4 rounded-lg border p-4">
                    <FormLabel>Cover Image</FormLabel>
                    <FormDescription>Select the main image for the project.</FormDescription>
                     <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                        {PlaceHolderImages.map(image => (
                            <div key={image.id} className="relative group cursor-pointer" onClick={() => setCoverId(image.id)}>
                                <Image 
                                    src={image.imageUrl} 
                                    alt={image.description} 
                                    width={100} 
                                    height={100} 
                                    className="object-cover w-full h-24 rounded-md border-2 border-transparent group-hover:border-primary"
                                />
                                {coverMediaId === image.id && (
                                    <div className="absolute inset-0 bg-primary/70 flex items-center justify-center rounded-md">
                                        <CheckCircle className="h-8 w-8 text-white" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>


                {/* Media Gallery Picker */}
                <div className="space-y-4 rounded-lg border p-4">
                    <FormLabel>Project Media Gallery</FormLabel>
                    <FormDescription>Select images to include in the project gallery.</FormDescription>
                     <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                        {PlaceHolderImages.map(image => (
                            <div key={image.id} className="relative group cursor-pointer" onClick={() => toggleMediaId(image.id)}>
                                <Image 
                                    src={image.imageUrl} 
                                    alt={image.description} 
                                    width={100} 
                                    height={100} 
                                    className="object-cover w-full h-24 rounded-md border-2 border-transparent group-hover:border-primary"
                                />
                                {mediaIds.includes(image.id) && (
                                    <div className="absolute inset-0 bg-primary/70 flex items-center justify-center rounded-md">
                                        <CheckCircle className="h-8 w-8 text-white" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="isPublished"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <FormLabel>Published</FormLabel>
                            <FormDescription>
                            Make the project visible on the public site.
                            </FormDescription>
                        </div>
                        <FormControl>
                            <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        </FormItem>
                    )}
                />
            </div>
        </ScrollArea>

        <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">Save</Button>
        </div>
      </form>
    </Form>
  )
}
