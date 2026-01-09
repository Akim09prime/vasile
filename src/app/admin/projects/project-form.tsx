

"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
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
import type { Project, ProjectData, ProjectType, ImagePlaceholder } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState, useMemo } from "react"
import { getProjectTypes } from "@/lib/services/settings-service"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import { CheckCircle, Star, CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"


const imagePlaceholderSchema = z.object({
  id: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  imageHint: z.string(),
  rating: z.number().min(0).max(5).optional().default(0),
  isTop: z.boolean().optional().default(false),
});

const formSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
  category: z.string().min(1, "Category is required."),
  summary: z.string().optional(),
  content: z.string().optional(),
  location: z.string().optional(),
  completedAt: z.date().optional(),
  coverMediaId: z.string().optional(),
  media: z.array(imagePlaceholderSchema).optional().default([]),
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
      completedAt: project?.completedAt ? new Date(project.completedAt) : undefined,
      coverMediaId: project?.coverMediaId || "",
      media: project?.media || [],
      isPublished: project?.isPublished || false,
    },
  })
  
  const handleCategoryChange = (label: string) => {
    form.setValue("category", label);
  }

  function handleFormSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values)
  }
  
  const selectedMedia = form.watch("media") || [];
  const coverMediaId = form.watch("coverMediaId");

  const toggleMedia = (image: ImagePlaceholder) => {
    const currentMedia = form.getValues("media") || [];
    const isSelected = currentMedia.some(m => m.id === image.id);
    
    let updatedMedia;
    if (isSelected) {
      updatedMedia = currentMedia.filter(m => m.id !== image.id);
    } else {
      updatedMedia = [...currentMedia, { ...image, rating: 0, isTop: false }];
    }
    form.setValue("media", updatedMedia, { shouldDirty: true });
  }

 const updateMediaProperty = (imageId: string, property: 'rating' | 'isTop', value: any) => {
    const currentMedia = form.getValues("media") || [];
    const updatedMedia = currentMedia.map(item => {
        if (item.id === imageId) {
            const newItem = { ...item };
            if (property === 'rating') {
                const newRating = Number(value);
                newItem.rating = newRating;
                newItem.isTop = newRating === 5;
            } else if (property === 'isTop') {
                const newIsTop = Boolean(value);
                newItem.isTop = newIsTop;
                if (newIsTop) {
                    newItem.rating = 5;
                }
            }
            return newItem;
        }
        return item;
    });
    form.setValue("media", updatedMedia, { shouldDirty: true });
};
  
  const setCoverId = (id: string) => {
    form.setValue("coverMediaId", id, { shouldDirty: true });
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
                          name="completedAt"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Completion Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant={"outline"}
                                      className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? (
                                        format(field.value, "PPP")
                                      ) : (
                                        <span>Pick a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                      date > new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
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

                <div className="space-y-4 rounded-lg border p-4">
                    <FormLabel>Project Media Gallery</FormLabel>
                    <FormDescription>Select images to include, rate them, and mark top images for the public gallery.</FormDescription>
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {PlaceHolderImages.map(image => {
                            const selectedImage = selectedMedia.find(m => m.id === image.id);
                            const isSelected = !!selectedImage;
                            return (
                                <div key={image.id} className={cn("relative group border-2 rounded-lg overflow-hidden", isSelected ? "border-primary" : "border-transparent")}>
                                    <div className="relative cursor-pointer" onClick={() => toggleMedia(image)}>
                                        <Image 
                                            src={image.imageUrl} 
                                            alt={image.description} 
                                            width={150} 
                                            height={150} 
                                            className="object-cover w-full h-28"
                                        />
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-primary/70 flex items-center justify-center">
                                                <CheckCircle className="h-8 w-8 text-white" />
                                            </div>
                                        )}
                                        {selectedImage?.isTop && (
                                            <Badge variant="default" className="absolute top-1 right-1">TOP</Badge>
                                        )}
                                    </div>
                                    {isSelected && (
                                        <div className="p-2 bg-secondary/50 space-y-2">
                                            <div className="flex flex-col gap-1">
                                                <Label className="text-xs">Image Rating</Label>
                                                <Select onValueChange={(value) => updateMediaProperty(image.id, 'rating', parseInt(value))} defaultValue={String(selectedImage?.rating || 0)}>
                                                    <SelectTrigger className="h-8 text-xs">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {[0, 1, 2, 3, 4, 5].map(rate => (
                                                             <SelectItem key={rate} value={String(rate)}>
                                                                <span className="flex items-center gap-1">{rate} <Star className="h-3 w-3 text-yellow-400" fill="currentColor"/></span>
                                                             </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button size="sm" variant={selectedImage.isTop ? 'secondary' : 'outline'} className="w-full h-8 text-xs" onClick={() => updateMediaProperty(image.id, 'isTop', !selectedImage.isTop)}>
                                                <Star className="mr-1 h-3 w-3" /> {selectedImage.isTop ? 'Unmark Top' : 'Mark as Top'}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
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
