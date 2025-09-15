"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Building2, Users, Bed } from "lucide-react";
import { getById$, create$, update$ } from "@/lib/api/admin/wards/_request";
import {
  WardFormData,
  WARD_TYPES,
  DEPARTMENTS,
  SPECIALIZATIONS,
  EQUIPMENT,
  getOccupancyVariant,
} from "@/lib/api/admin/wards/_model";

interface WardFormContentProps {
  wardId: string;
}

export default function WardFormContent({ wardId }: WardFormContentProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<WardFormData>({
    id: wardId === "0" ? null : wardId,
    name: "",
    description: "",
    capacity: 0,
    currentOccupancy: 0,
    wardType: "General Medical",
    department: "",
    location: "",
    contactNumber: "",
    wardManager: "",
    status: "A",
    specializations: [],
    equipment: [],
    notes: "",
  });

  const isNewWard = wardId === "0";

  // Load ward data if editing
  useEffect(() => {
    if (!isNewWard) {
      const fetchWard = async () => {
        try {
          setLoading(true);
          setError(null);
          const response = await getById$(wardId);
          const ward = response.data;

          setFormData({
            id: ward.id,
            name: ward.name,
            description: ward.description,
            capacity: ward.capacity,
            currentOccupancy: ward.currentOccupancy,
            wardType: ward.wardType,
            department: ward.department,
            location: ward.location,
            contactNumber: ward.contactNumber,
            wardManager: ward.wardManager,
            status: ward.status,
            specializations: ward.specializations,
            equipment: ward.equipment,
            notes: ward.notes || "",
          });
        } catch (err) {
          setError("Failed to load ward data. Please try again.");
          console.error("Error fetching ward:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchWard();
    }
  }, [wardId, isNewWard]);

  const handleInputChange = (field: keyof WardFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSpecializationToggle = (specialization: string) => {
    setFormData((prev) => ({
      ...prev,
      specializations: prev.specializations.includes(specialization)
        ? prev.specializations.filter((s) => s !== specialization)
        : [...prev.specializations, specialization],
    }));
  };

  const handleEquipmentToggle = (equipment: string) => {
    setFormData((prev) => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter((e) => e !== equipment)
        : [...prev.equipment, equipment],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.department ||
      !formData.location ||
      !formData.wardManager
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.capacity <= 0) {
      setError("Ward capacity must be greater than 0.");
      return;
    }

    if (
      formData.currentOccupancy < 0 ||
      formData.currentOccupancy > formData.capacity
    ) {
      setError(`Current occupancy must be between 0 and ${formData.capacity}.`);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      if (isNewWard) {
        await create$(formData);
      } else {
        await update$(wardId, formData);
      }

      router.push("/admin/wards");
    } catch (err) {
      setError("Failed to save ward. Please try again.");
      console.error("Error saving ward:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Loading Ward...</h1>
          </div>
        </div>
        <div className="flex items-center justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  const occupancyRate =
    formData.capacity > 0
      ? Math.round((formData.currentOccupancy / formData.capacity) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {isNewWard ? "Add New Ward" : `Edit Ward: ${formData.name}`}
          </h1>
          <p className="text-muted-foreground">
            {isNewWard
              ? "Create a new hospital ward"
              : "Update ward information and settings"}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ward Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Geriatrics Ward A"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    handleInputChange("department", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wardType">Ward Type</Label>
                <Select
                  value={formData.wardType}
                  onValueChange={(value) =>
                    handleInputChange("wardType", value as any)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WARD_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  placeholder="e.g., Building A, Floor 3"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Brief description of the ward"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Capacity & Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bed className="h-5 w-5" />
              Capacity & Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Bed Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) =>
                    handleInputChange("capacity", parseInt(e.target.value) || 0)
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentOccupancy">Current Occupancy</Label>
                <Input
                  id="currentOccupancy"
                  type="number"
                  min="0"
                  max={formData.capacity}
                  value={formData.currentOccupancy}
                  onChange={(e) =>
                    handleInputChange(
                      "currentOccupancy",
                      parseInt(e.target.value) || 0
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Occupancy Rate</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Badge variant={getOccupancyVariant(occupancyRate)}>
                    {occupancyRate}%
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formData.currentOccupancy} of {formData.capacity} beds
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="wardManager">Ward Manager *</Label>
                <Input
                  id="wardManager"
                  value={formData.wardManager}
                  onChange={(e) =>
                    handleInputChange("wardManager", e.target.value)
                  }
                  placeholder="Name of ward manager"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) =>
                    handleInputChange("contactNumber", e.target.value)
                  }
                  placeholder="Ward contact number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  handleInputChange("status", value as any)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">Active</SelectItem>
                  <SelectItem value="M">Maintenance</SelectItem>
                  <SelectItem value="C">Closed</SelectItem>
                  <SelectItem value="X">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Specializations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Specializations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {SPECIALIZATIONS.map((specialization) => (
                <div
                  key={specialization}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`spec-${specialization}`}
                    checked={formData.specializations.includes(specialization)}
                    onCheckedChange={() =>
                      handleSpecializationToggle(specialization)
                    }
                  />
                  <Label
                    htmlFor={`spec-${specialization}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {specialization}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Equipment */}
        <Card>
          <CardHeader>
            <CardTitle>Available Equipment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {EQUIPMENT.map((equipment) => (
                <div key={equipment} className="flex items-center space-x-2">
                  <Checkbox
                    id={`equip-${equipment}`}
                    checked={formData.equipment.includes(equipment)}
                    onCheckedChange={() => handleEquipmentToggle(equipment)}
                  />
                  <Label
                    htmlFor={`equip-${equipment}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {equipment}
                  </Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              placeholder="Any additional notes about the ward..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isNewWard ? "Create Ward" : "Update Ward"}
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

