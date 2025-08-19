// NewCustomFirmwareForm.tsx - Example form component

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createCustomFirmware, generateSlug, validateCustomFirmwareInput, type CustomFirmwareInput } from './cfw-actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { X, Plus } from 'lucide-react'

export default function NewCustomFirmwareForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  // Form state
  const [formData, setFormData] = useState<CustomFirmwareInput>({
    name: '',
    slug: '',
    description: '',
    version: '',
    compatibility: [],
    features: [],
    supported_devices: [],
    installation_guide: '',
    download_url: '',
    official_website: '',
    is_active: true,
    release_date: '',
    changelog: '',
    requirements: [],
    tags: [],
    image_url: ''
  })

  // State for array inputs
  const [compatibilityInput, setCompatibilityInput] = useState('')
  const [featureInput, setFeatureInput] = useState('')
  const [deviceInput, setDeviceInput] = useState('')
  const [requirementInput, setRequirementInput] = useState('')
  const [tagInput, setTagInput] = useState('')

  // Handle basic input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Auto-generate slug from name
    if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }))
    }
  }

  // Handle switch change
  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      is_active: checked
    }))
  }

  // Add item to array field
  const addToArray = (field: keyof CustomFirmwareInput, value: string, setInput: (value: string) => void) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...(prev[field] as string[] || []), value.trim()]
      }))
      setInput('')
    }
  }

  // Remove item from array field
  const removeFromArray = (field: keyof CustomFirmwareInput, index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: (prev[field] as string[] || []).filter((_, i) => i !== index)
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validate input
    const validation = validateCustomFirmwareInput(formData)
    if (!validation.valid) {
      setError(validation.errors.join(', '))
      return
    }

    setLoading(true)

    try {
      const { data, error } = await createCustomFirmware(formData)
      
      if (error) {
        setError(error.message || 'Failed to create custom firmware')
      } else {
        setSuccess(true)
        // Redirect after a short delay
        setTimeout(() => {
          router.push('/admin/custom-firmware')
        }, 1500)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Form submission error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Custom Firmware</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g., ArkOS"
              />
            </div>
            
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                placeholder="e.g., arkos"
                pattern="[a-z0-9-]+"
              />
            </div>

            <div>
              <Label htmlFor="version">Version</Label>
              <Input
                id="version"
                name="version"
                value={formData.version}
                onChange={handleInputChange}
                placeholder="e.g., 2.0.1"
              />
            </div>

            <div>
              <Label htmlFor="release_date">Release Date</Label>
              <Input
                id="release_date"
                name="release_date"
                type="date"
                value={formData.release_date}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Brief description of the custom firmware"
            />
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="download_url">Download URL</Label>
              <Input
                id="download_url"
                name="download_url"
                type="url"
                value={formData.download_url}
                onChange={handleInputChange}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="official_website">Official Website</Label>
              <Input
                id="official_website"
                name="official_website"
                type="url"
                value={formData.official_website}
                onChange={handleInputChange}
                placeholder="https://..."
              />
            </div>

            <div>
              <Label htmlFor="image_url">Image URL</Label>
              <Input
                id="image_url"
                name="image_url"
                type="url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Compatibility (Array field) */}
          <div>
            <Label>Compatibility / Supported Devices</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={compatibilityInput}
                onChange={(e) => setCompatibilityInput(e.target.value)}
                placeholder="e.g., RG351P"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addToArray('compatibility', compatibilityInput, setCompatibilityInput)
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addToArray('compatibility', compatibilityInput, setCompatibilityInput)}
                size="sm"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.compatibility as string[])?.map((item, index) => (
                <Badge key={index} variant="secondary">
                  {item}
                  <button
                    type="button"
                    onClick={() => removeFromArray('compatibility', index)}
                    className="ml-2"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Features (Array field) */}
          <div>
            <Label>Features</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                placeholder="e.g., RetroArch Integration"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addToArray('features', featureInput, setFeatureInput)
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addToArray('features', featureInput, setFeatureInput)}
                size="sm"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.features as string[])?.map((item, index) => (
                <Badge key={index} variant="secondary">
                  {item}
                  <button
                    type="button"
                    onClick={() => removeFromArray('features', index)}
                    className="ml-2"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Tags (Array field) */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="e.g., linux, retro-gaming"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addToArray('tags', tagInput, setTagInput)
                  }
                }}
              />
              <Button
                type="button"
                onClick={() => addToArray('tags', tagInput, setTagInput)}
                size="sm"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {(formData.tags as string[])?.map((item, index) => (
                <Badge key={index} variant="outline">
                  {item}
                  <button
                    type="button"
                    onClick={() => removeFromArray('tags', index)}
                    className="ml-2"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Installation Guide */}
          <div>
            <Label htmlFor="installation_guide">Installation Guide</Label>
            <Textarea
              id="installation_guide"
              name="installation_guide"
              value={formData.installation_guide}
              onChange={handleInputChange}
              rows={4}
              placeholder="Step-by-step installation instructions..."
            />
          </div>

          {/* Changelog */}
          <div>
            <Label htmlFor="changelog">Changelog</Label>
            <Textarea
              id="changelog"
              name="changelog"
              value={formData.changelog}
              onChange={handleInputChange}
              rows={3}
              placeholder="Recent changes and updates..."
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert>
              <AlertDescription>Custom firmware created successfully! Redirecting...</AlertDescription>
            </Alert>
          )}

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Custom Firmware'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/custom-firmware')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
