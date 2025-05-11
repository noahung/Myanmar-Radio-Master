import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RadioStation } from "@/types";
import { Upload, X } from "lucide-react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

interface StationFormProps {
  station?: RadioStation;
  onSubmit: () => void;
  onCancel: () => void;
}

const StationForm: React.FC<StationFormProps> = ({ station, onSubmit, onCancel }) => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    name: '',
    streamUrl: '',
    description: '',
    category: [] as string[],
    isFeatured: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    if (station) {
      setForm({
        name: station.name,
        streamUrl: station.streamUrl,
        description: station.description || '',
        category: station.category || [],
        isFeatured: station.isFeatured || false,
      });
      setImagePreview(station.imageUrl || null);
    }
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [station]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('radio_stations')
      .select('category');
    if (!error && data) {
      // Flatten all category arrays and dedupe
      const allCats = data.flatMap((row: any) => Array.isArray(row.category) ? row.category : []).filter((cat: string) => !!cat && cat.trim() !== '');
      const unique = Array.from(new Set(allCats));
      setCategories(unique);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (cat: string) => {
    if (!form.category.includes(cat)) {
      setForm(prev => ({ ...prev, category: [...prev.category, cat] }));
    }
  };

  const handleCategoryRemove = (cat: string) => {
    setForm(prev => ({ ...prev, category: prev.category.filter(c => c !== cat) }));
  };

  const handleAddNewCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !form.category.includes(trimmed)) {
      setForm(prev => ({ ...prev, category: [...prev.category, trimmed] }));
      setNewCategory('');
      setIsAddingCategory(false);
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setForm(prev => ({ ...prev, isFeatured: checked }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(station?.imageUrl || null);
  };

  const uploadImage = async () => {
    if (!imageFile) return station?.imageUrl || null;
    setIsUploading(true);

    try {
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `${Date.now()}.${fileExt}`;

      // Upload the file to Supabase storage
      const { data, error } = await supabase.storage
        .from('station_images')
        .upload(filePath, imageFile);

      if (error) {
        throw error;
      }

      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('station_images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      });
      return station?.imageUrl || null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (!form.category.length) {
      toast({
        title: 'Category Required',
        description: 'Please select or enter at least one category.',
        variant: 'destructive',
      });
      setIsSaving(false);
      return;
    }

    try {
      let imageUrl = station?.imageUrl || null;
      if (imageFile) {
        imageUrl = await uploadImage();
      }
      if (station) {
        // Update existing station
        const { error } = await supabase
          .from('radio_stations')
          .update({
            name: form.name,
            stream_url: form.streamUrl,
            description: form.description,
            category: form.category,
            is_featured: form.isFeatured,
            image_url: imageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', station.id);
        if (error) throw error;
        toast({
          title: 'Station Updated',
          description: `${form.name} has been updated successfully.`,
        });
      } else {
        // Create new station
        const { error } = await supabase
          .from('radio_stations')
          .insert({
            name: form.name,
            stream_url: form.streamUrl,
            description: form.description,
            category: form.category,
            is_featured: form.isFeatured,
            image_url: imageUrl,
          });
        if (error) throw error;
        toast({
          title: 'Station Created',
          description: `${form.name} has been created successfully.`,
        });
      }
      await fetchCategories(); // Refetch categories after submit
      onSubmit();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save station',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold">
        {station ? 'Edit Radio Station' : 'Add New Radio Station'}
      </h2>
      
      <div className="space-y-2">
        <Label htmlFor="name">Station Name</Label>
        <Input 
          id="name" 
          name="name" 
          value={form.name} 
          onChange={handleChange} 
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="streamUrl">Stream URL</Label>
        <Input 
          id="streamUrl" 
          name="streamUrl" 
          value={form.streamUrl} 
          onChange={handleChange} 
          required
          placeholder="https://stream.example.com/station"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categories</Label>
        <div className="flex flex-wrap gap-2 mb-2">
          {form.category.map(cat => (
            <span key={cat} className="inline-flex items-center bg-secondary text-secondary-foreground rounded px-2 py-1 text-xs">
              {cat}
              <button type="button" className="ml-1 text-xs" onClick={() => handleCategoryRemove(cat)}>&times;</button>
            </span>
          ))}
        </div>
        <Select onValueChange={val => {
          if (val === "__add_new__") {
            setIsAddingCategory(true);
          } else {
            handleCategorySelect(val);
          }
        }}>
          <SelectTrigger id="category">
            <SelectValue placeholder="Add category..." />
          </SelectTrigger>
          <SelectContent>
            {categories.filter(cat => !form.category.includes(cat)).map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
            <SelectItem value="__add_new__">Add new category...</SelectItem>
          </SelectContent>
        </Select>
        {isAddingCategory && (
          <div className="flex gap-2 mt-2">
            <Input
              id="new-category"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              placeholder="Enter new category"
              className="flex-1"
            />
            <Button type="button" onClick={handleAddNewCategory} disabled={!newCategory.trim()}>
              Add
            </Button>
            <Button type="button" onClick={() => { setIsAddingCategory(false); setNewCategory(''); }}>
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          name="description" 
          value={form.description} 
          onChange={handleChange} 
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Station Image</Label>
        <div className="flex flex-col gap-2">
          {imagePreview && (
            <div className="relative w-40 h-40">
              <img 
                src={imagePreview} 
                alt="Station preview" 
                className="w-full h-full object-cover rounded-md"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1 text-white"
              >
                <X size={16} />
              </button>
            </div>
          )}
          
          <div>
            <Label 
              htmlFor="image-upload" 
              className="flex items-center gap-2 cursor-pointer bg-secondary hover:bg-secondary/80 text-secondary-foreground px-4 py-2 rounded-md max-w-fit"
            >
              <Upload size={16} />
              <span>Upload Image</span>
            </Label>
            <Input 
              id="image-upload" 
              type="file" 
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
          id="isFeatured"
          checked={form.isFeatured}
          onCheckedChange={handleSwitchChange}
        />
        <Label htmlFor="isFeatured">Feature this station</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button 
          type="submit" 
          disabled={isUploading || isSaving}
        >
          {isSaving ? 'Saving...' : station ? 'Update Station' : 'Add Station'}
        </Button>
        <Button 
          type="button" 
          onClick={onCancel}
          disabled={isUploading || isSaving}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default StationForm;
