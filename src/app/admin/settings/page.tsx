

'use client';
import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
    getProjectTypes, saveProjectTypes, 
    getNavigationSettings, saveNavigationSettings,
    getFooterSettings, saveFooterSettings,
    getThemeSettings, saveThemeSettings,
} from '@/lib/services/settings-service';
import { X, PlusCircle, Loader, AlertCircle, ArrowUp, ArrowDown, GripVertical, Settings, Palette, Link as LinkIcon, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import type { ProjectType, NavigationSettings, FooterSettings, ThemeSettings, NavItem, FooterColumn, FooterLink, SocialLink } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { defaultNavigation, defaultFooter, defaultTheme } from '@/lib/defaults';
import { produce } from 'immer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


const slugify = (text: string) => text.toString().toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/[^\w-]+/g, '')
  .replace(/--+/g, '-')
  .replace(/^-+/, '')
  .replace(/-+$/, '');

// ---- Project Categories Manager ---- //
function ProjectCategoriesManager() {
    const [types, setTypes] = React.useState<ProjectType[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [isDirty, setIsDirty] = React.useState(false);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [editingType, setEditingType] = React.useState<ProjectType | null>(null);
    const { toast } = useToast();

    React.useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const fetchedData = await getProjectTypes();
                setTypes(fetchedData);
            } catch (err: any) {
                setError('Failed to load categories. ' + err.message);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveProjectTypes(types);
            toast({ title: 'Success', description: 'Project categories have been saved.' });
            setIsDirty(false);
        } catch (err: any) {
             toast({ variant: 'destructive', title: 'Error', description: 'Could not save categories. ' + err.message });
        } finally {
            setSaving(false);
        }
    }
    
    const handleOpenDialog = (type: ProjectType | null = null) => {
        setEditingType(type);
        setIsDialogOpen(true);
    };

    const handleFormSave = (formData: Omit<ProjectType, 'id' | 'slug' | 'order'>) => {
        setIsDirty(true);
        if (editingType) {
            setTypes(types.map(t => t.id === editingType.id ? { ...editingType, ...formData, slug: slugify(formData.label_ro) } : t));
        } else {
            const newType: ProjectType = {
                id: `type-${Date.now()}`,
                ...formData,
                slug: slugify(formData.label_ro),
                order: types.length + 1,
            };
            setTypes([...types, newType]);
        }
        setIsDialogOpen(false);
    };
    
    const handleDelete = (id: string) => {
        setIsDirty(true);
        setTypes(types.filter(t => t.id !== id));
    };
    
    const moveItem = (index: number, direction: 'up' | 'down') => {
        const newTypes = [...types];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= newTypes.length) return;
        const [movedItem] = newTypes.splice(index, 1);
        newTypes.splice(newIndex, 0, movedItem);
        setTypes(newTypes.map((t, i) => ({ ...t, order: i })));
        setIsDirty(true);
    }

    if (loading) return <Card><CardHeader><CardTitle>Project Categories</CardTitle></CardHeader><CardContent><Skeleton className="h-20 w-full" /></CardContent></Card>
    if (error) return <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Project Categories</CardTitle>
                    <CardDescription>Manage the categories for portfolio filtering.</CardDescription>
                </div>
                 <Button onClick={handleSave} disabled={saving || !isDirty}>
                    {saving ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : 'Save Changes'}
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                 <Button variant="outline" onClick={() => handleOpenDialog()}><PlusCircle className="mr-2 h-4 w-4"/> Add Category</Button>
                <div className="space-y-2 rounded-md border">
                    {types.map((type, index) => (
                        <div key={type.id} className="flex items-center p-2 border-b last:border-b-0">
                            <GripVertical className="h-5 w-5 text-muted-foreground mr-2 cursor-grab"/>
                             <div className="flex flex-col gap-1 mr-2">
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveItem(index, 'up')} disabled={index === 0}><ArrowUp className="h-4 w-4"/></Button>
                                <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => moveItem(index, 'down')} disabled={index === types.length - 1}><ArrowDown className="h-4 w-4"/></Button>
                            </div>
                            <div className="flex-1">
                                <p className="font-medium">{type.label_ro} / {type.label_en}</p>
                                <p className="text-xs text-muted-foreground">Slug: {type.slug} | Order: {type.order}</p>
                            </div>
                            <Switch checked={type.active} onCheckedChange={checked => {
                                setIsDirty(true);
                                setTypes(types.map(t => t.id === type.id ? {...t, active: checked} : t));
                            }} />
                            <Button variant="ghost" size="sm" className="ml-2" onClick={() => handleOpenDialog(type)}>Edit</Button>
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleDelete(type.id)}><X className="h-4 w-4"/></Button>
                        </div>
                    ))}
                    {types.length === 0 && <p className="p-4 text-sm text-muted-foreground">No categories defined.</p>}
                </div>

                <TypeEditDialog 
                    isOpen={isDialogOpen}
                    onClose={() => setIsDialogOpen(false)}
                    onSave={handleFormSave}
                    type={editingType}
                />
            </CardContent>
        </Card>
    )
}

function TypeEditDialog({isOpen, onClose, onSave, type}: {isOpen: boolean, onClose: () => void, onSave: (data: any) => void, type: ProjectType | null}) {
    const [label_ro, setLabelRo] = React.useState('');
    const [label_en, setLabelEn] = React.useState('');
    const [active, setActive] = React.useState(true);

    React.useEffect(() => {
        if(type) {
            setLabelRo(type.label_ro);
            setLabelEn(type.label_en);
            setActive(type.active);
        } else {
            setLabelRo('');
            setLabelEn('');
            setActive(true);
        }
    }, [type, isOpen]);
    
    const handleSubmit = () => {
        onSave({ label_ro, label_en, active });
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{type ? 'Edit Category' : 'Add New Category'}</DialogTitle>
                     <DialogDescription>
                        Enter the details for the project category. The slug will be auto-generated.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="label_ro">Label (RO)</Label>
                        <Input id="label_ro" value={label_ro} onChange={(e) => setLabelRo(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="label_en">Label (EN)</Label>
                        <Input id="label_en" value={label_en} onChange={(e) => setLabelEn(e.target.value)} />
                    </div>
                     <div className="flex items-center space-x-2">
                        <Switch id="active-mode" checked={active} onCheckedChange={setActive} />
                        <Label htmlFor="active-mode">Active</Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSubmit}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


function NavigationManager() {
    const [navSettings, setNavSettings] = React.useState<NavigationSettings>(defaultNavigation);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const { toast } = useToast();
     const [isDirty, setIsDirty] = React.useState(false);

    React.useEffect(() => {
        getNavigationSettings().then(settings => {
            setNavSettings(settings);
            setLoading(false);
        });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveNavigationSettings(navSettings);
            toast({ title: 'Success', description: 'Navigation links saved.' });
            setIsDirty(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save navigation. ' + error.message });
        } finally {
            setSaving(false);
        }
    };
    
    const handleReset = async () => {
        setNavSettings(defaultNavigation);
        setIsDirty(true);
        toast({ title: 'Defaults Loaded', description: 'Navigation has been reset to defaults. Click "Save Changes" to apply.' });
    };

    const handleItemChange = (id: string, field: keyof NavItem, value: any) => {
        setNavSettings(produce(draft => {
            const item = draft.items.find(i => i.id === id);
            if (item) {
                (item as any)[field] = value;
            }
        }));
        setIsDirty(true);
    }
    
    const handleAddNewItem = () => {
         setNavSettings(produce(draft => {
            draft.items.push({
                id: `nav-${Date.now()}`,
                label_ro: "Link Nou",
                label_en: "New Link",
                href: "/",
                order: draft.items.length,
                enabled: true,
                type: 'internal',
                target: '_self',
                isCta: false,
            });
        }));
        setIsDirty(true);
    }

    const handleDeleteItem = (id: string) => {
        setNavSettings(produce(draft => {
            draft.items = draft.items.filter(i => i.id !== id);
        }));
        setIsDirty(true);
    }

    if (loading) return <Card><CardHeader><CardTitle>Navigation (Header)</CardTitle></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>;

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Navigation (Header)</CardTitle>
                    <CardDescription>Manage main site navigation links and CTA button.</CardDescription>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleReset}>Reset to Defaults</Button>
                    <Button onClick={handleSave} disabled={saving || !isDirty}>
                        {saving ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : 'Save Changes'}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                     {navSettings.items.sort((a,b) => a.order - b.order).map(item => (
                        <Card key={item.id} className="p-4 space-y-4">
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <Label>Label (RO)</Label>
                                    <Input value={item.label_ro} onChange={(e) => handleItemChange(item.id, 'label_ro', e.target.value)} />
                                </div>
                                <div>
                                    <Label>Label (EN)</Label>
                                    <Input value={item.label_en} onChange={(e) => handleItemChange(item.id, 'label_en', e.target.value)} />
                                </div>
                                <div className="col-span-2">
                                    <Label>Link (href)</Label>
                                    <Input value={item.href} onChange={(e) => handleItemChange(item.id, 'href', e.target.value)} />
                                </div>
                             </div>
                              <div className="flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center space-x-2">
                                        <Switch id={`enabled-${item.id}`} checked={item.enabled} onCheckedChange={(c) => handleItemChange(item.id, 'enabled', c)} />
                                        <Label htmlFor={`enabled-${item.id}`}>Enabled</Label>
                                    </div>
                                     <div className="flex items-center space-x-2">
                                        <Switch id={`isCta-${item.id}`} checked={!!item.isCta} onCheckedChange={(c) => handleItemChange(item.id, 'isCta', c)} />
                                        <Label htmlFor={`isCta-${item.id}`}>Is CTA</Label>
                                    </div>
                                    <div className="w-32">
                                        <Select value={item.type} onValueChange={(v) => handleItemChange(item.id, 'type', v)}>
                                            <SelectTrigger><SelectValue/></SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="internal">Internal</SelectItem>
                                                <SelectItem value="external">External</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDeleteItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </Card>
                     ))}
                </div>
                 <Button variant="outline" onClick={handleAddNewItem}><PlusCircle className="mr-2 h-4 w-4"/> Add Nav Item</Button>
            </CardContent>
        </Card>
    );
}

function FooterManager() {
    const [footerSettings, setFooterSettings] = React.useState<FooterSettings>(defaultFooter);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const { toast } = useToast();
    const [isDirty, setIsDirty] = React.useState(false);
    
    React.useEffect(() => {
        getFooterSettings().then(settings => {
            setFooterSettings(settings);
            setLoading(false);
        });
    }, []);

    const handleSave = async () => {
        if (!footerSettings) return;
        setSaving(true);
        try {
            await saveFooterSettings(footerSettings);
            toast({ title: 'Success', description: 'Footer settings saved.' });
            setIsDirty(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save footer. ' + error.message });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Card><CardHeader><CardTitle>Footer</CardTitle></CardHeader><CardContent><Skeleton className="h-60 w-full" /></CardContent></Card>;

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Footer</CardTitle>
                    <CardDescription>Manage footer content, columns, and links.</CardDescription>
                </div>
                 <Button onClick={handleSave} disabled={saving || !isDirty}>
                    {saving ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : 'Save Changes'}
                </Button>
            </CardHeader>
            <CardContent>
                 <p className="text-sm text-muted-foreground">Feature coming soon.</p>
            </CardContent>
        </Card>
    );
}

function ThemeManager() {
    const [themeSettings, setThemeSettings] = React.useState<ThemeSettings>(defaultTheme);
    const [loading, setLoading] = React.useState(true);
    const [saving, setSaving] = React.useState(false);
    const { toast } = useToast();
    const [isDirty, setIsDirty] = React.useState(false);

    React.useEffect(() => {
        getThemeSettings().then(settings => {
            setThemeSettings(settings);
            setLoading(false);
        });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await saveThemeSettings(themeSettings);
            toast({ title: 'Success', description: 'Theme settings saved.' });
            setIsDirty(false);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save theme. ' + error.message });
        } finally {
            setSaving(false);
        }
    };

    const handleColorChange = (mode: 'light' | 'dark', colorName: keyof ThemeSettings['colors']['light'], value: string) => {
        setThemeSettings(produce(draft => {
            draft.colors[mode][colorName] = value;
        }));
        setIsDirty(true);
    };

    if (loading) return <Card><CardHeader><CardTitle>Theme</CardTitle></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>;

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between">
                <div>
                    <CardTitle>Theme & Branding</CardTitle>
                    <CardDescription>Manage site colors and branding assets.</CardDescription>
                </div>
                <Button onClick={handleSave} disabled={saving || !isDirty}>
                    {saving ? <><Loader className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : 'Save Changes'}
                </Button>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Light Theme</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-6">
                            {(Object.keys(themeSettings.colors.light) as Array<keyof typeof themeSettings.colors.light>).map(colorName => (
                                <div className="grid gap-2" key={`light-${colorName}`}>
                                    <Label className="capitalize">{colorName}</Label>
                                    <div className="flex items-center gap-2">
                                        <Input 
                                            value={themeSettings.colors.light[colorName]} 
                                            onChange={(e) => handleColorChange('light', colorName, e.target.value)} 
                                        />
                                        <div className="h-8 w-8 rounded border" style={{ backgroundColor: themeSettings.colors.light[colorName] }} />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Dark Theme</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-6">
                            {(Object.keys(themeSettings.colors.dark) as Array<keyof typeof themeSettings.colors.dark>).map(colorName => (
                                <div className="grid gap-2" key={`dark-${colorName}`}>
                                    <Label className="capitalize">{colorName}</Label>
                                    <div className="flex items-center gap-2">
                                        <Input 
                                            value={themeSettings.colors.dark[colorName]} 
                                            onChange={(e) => handleColorChange('dark', colorName, e.target.value)} 
                                        />
                                        <div className="h-8 w-8 rounded border" style={{ backgroundColor: themeSettings.colors.dark[colorName] }} />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Brand Assets</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Feature coming soon.</p>
                    </CardContent>
                </Card>
            </CardContent>
        </Card>
    );
}

export default function AdminSettingsPage() {
    return (
        <div className="p-4 md:p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage site-wide settings and content.</p>
            </div>

            <Tabs defaultValue="categories">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="categories"><Settings className="mr-2 h-4 w-4" />Categories</TabsTrigger>
                    <TabsTrigger value="navigation"><LinkIcon className="mr-2 h-4 w-4" />Navigation</TabsTrigger>
                    <TabsTrigger value="footer"><LinkIcon className="mr-2 h-4 w-4" />Footer</TabsTrigger>
                    <TabsTrigger value="theme"><Palette className="mr-2 h-4 w-4" />Theme</TabsTrigger>
                </TabsList>
                <TabsContent value="categories" className="mt-6">
                    <ProjectCategoriesManager />
                </TabsContent>
                <TabsContent value="navigation" className="mt-6">
                    <NavigationManager />
                </TabsContent>
                <TabsContent value="footer" className="mt-6">
                    <FooterManager />
                </TabsContent>
                 <TabsContent value="theme" className="mt-6">
                    <ThemeManager />
                </TabsContent>
            </Tabs>
        </div>
    );
}


    
