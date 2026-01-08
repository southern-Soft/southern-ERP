"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowLeft, Edit, Trash2, Loader2, Search, Filter, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

// Unit conversion functions
const convertUnit = (value: number | null | undefined, fromUnit: string, toUnit: string): number | null => {
  if (value === null || value === undefined || isNaN(value)) return null;
  
  // Convert to inches first (base unit)
  let valueInInches = 0;
  switch (fromUnit) {
    case "inch":
      valueInInches = value;
      break;
    case "cm":
      valueInInches = value / 2.54;
      break;
    case "mm":
      valueInInches = value / 25.4;
      break;
    case "feet":
      valueInInches = value * 12;
      break;
    default:
      return value;
  }
  
  // Convert from inches to target unit
  switch (toUnit) {
    case "inch":
      return Number(valueInInches.toFixed(2));
    case "cm":
      return Number((valueInInches * 2.54).toFixed(2));
    case "mm":
      return Number((valueInInches * 25.4).toFixed(2));
    case "feet":
      return Number((valueInInches / 12).toFixed(2));
    default:
      return value;
  }
};

const formatUnit = (unit: string): string => {
  const unitMap: Record<string, string> = {
    inch: "in",
    cm: "cm",
    mm: "mm",
    feet: "ft",
  };
  return unitMap[unit] || unit;
};

export default function SizeDetailsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGarmentType, setFilterGarmentType] = useState<string>("all");
  const [filterGender, setFilterGender] = useState<string>("all");
  const [filterAgeGroup, setFilterAgeGroup] = useState<string>("all");

  const { data: sizesData, isLoading } = useQuery({
    queryKey: ["sizeChart"],
    queryFn: () => api.merchandiser.sizeChart.getAll(1000),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.merchandiser.sizeChart.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sizeChart"] });
      toast.success("Size chart created successfully");
      setDialogOpen(false);
      resetForm();
    },
    onError: () => toast.error("Failed to create size chart"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      api.merchandiser.sizeChart.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sizeChart"] });
      toast.success("Size chart updated successfully");
      setDialogOpen(false);
      setEditingSize(null);
      resetForm();
    },
    onError: () => toast.error("Failed to update size chart"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.merchandiser.sizeChart.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sizeChart"] });
      toast.success("Size chart deleted successfully");
    },
    onError: () => toast.error("Failed to delete size chart"),
  });

  const [formData, setFormData] = useState({
    size_id: "",
    size_name: "",
    garment_type: "",
    gender: "",
    age_group: "",
    chest: "",
    waist: "",
    hip: "",
    sleeve_length: "",
    body_length: "",
    shoulder_width: "",
    inseam: "",
    uom: "inch",
    remarks: "",
  });

  const resetForm = () => {
    setFormData({
      size_id: "",
      size_name: "",
      garment_type: "",
      gender: "",
      age_group: "",
      chest: "",
      waist: "",
      hip: "",
      sleeve_length: "",
      body_length: "",
      shoulder_width: "",
      inseam: "",
      uom: "inch",
      remarks: "",
    });
    setEditingSize(null);
  };

  const handleEdit = (size: any) => {
    setEditingSize(size);
    setFormData({
      size_id: size.size_id || "",
      size_name: size.size_name || "",
      garment_type: size.garment_type || "",
      gender: size.gender || "",
      age_group: size.age_group || "",
      chest: size.chest?.toString() || "",
      waist: size.waist?.toString() || "",
      hip: size.hip?.toString() || "",
      sleeve_length: size.sleeve_length?.toString() || "",
      body_length: size.body_length?.toString() || "",
      shoulder_width: size.shoulder_width?.toString() || "",
      inseam: size.inseam?.toString() || "",
      uom: size.uom || "inch",
      remarks: size.remarks || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = (sizeId: string) => {
    if (confirm("Are you sure you want to delete this size chart?")) {
      deleteMutation.mutate(sizeId);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      chest: formData.chest ? parseFloat(formData.chest) : null,
      waist: formData.waist ? parseFloat(formData.waist) : null,
      hip: formData.hip ? parseFloat(formData.hip) : null,
      sleeve_length: formData.sleeve_length ? parseFloat(formData.sleeve_length) : null,
      body_length: formData.body_length ? parseFloat(formData.body_length) : null,
      shoulder_width: formData.shoulder_width ? parseFloat(formData.shoulder_width) : null,
      inseam: formData.inseam ? parseFloat(formData.inseam) : null,
    };

    if (editingSize) {
      updateMutation.mutate({ id: editingSize.size_id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  // Filter and search logic
  const filteredSizes = sizesData?.filter((size: any) => {
    const matchesSearch =
      !searchTerm ||
      size.size_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      size.size_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      size.garment_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGarmentType = filterGarmentType === "all" || size.garment_type === filterGarmentType;
    const matchesGender = filterGender === "all" || size.gender === filterGender;
    const matchesAgeGroup = filterAgeGroup === "all" || size.age_group === filterAgeGroup;

    return matchesSearch && matchesGarmentType && matchesGender && matchesAgeGroup;
  }) || [];

  // Get unique values for filters
  const garmentTypes = [...new Set(sizesData?.map((s: any) => s.garment_type).filter(Boolean))] as string[];
  const genders = [...new Set(sizesData?.map((s: any) => s.gender).filter(Boolean))] as string[];
  const ageGroups = [...new Set(sizesData?.map((s: any) => s.age_group).filter(Boolean))] as string[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push("/dashboard/erp/merchandising")}
            className="mb-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Merchandising
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Size Details & Chart</h1>
          <p className="text-muted-foreground mt-2">
            Manage size specifications and measurement charts for all garment types
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Size
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSize ? "Edit" : "Add"} Size Chart</DialogTitle>
              <DialogDescription>
                Define all measurements for a specific size, garment type, gender, and age group
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="size_id">Size ID *</Label>
                  <Input
                    id="size_id"
                    value={formData.size_id}
                    onChange={(e) => setFormData({ ...formData, size_id: e.target.value })}
                    placeholder="e.g., S001"
                    required
                    disabled={!!editingSize}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="size_name">Size Name *</Label>
                  <Input
                    id="size_name"
                    value={formData.size_name}
                    onChange={(e) => setFormData({ ...formData, size_name: e.target.value })}
                    placeholder="e.g., XS, S, M, L"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="garment_type">Garment Type</Label>
                  <Input
                    id="garment_type"
                    value={formData.garment_type}
                    onChange={(e) => setFormData({ ...formData, garment_type: e.target.value })}
                    placeholder="e.g., Sweater, T-Shirt, Pants"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Unisex">Unisex</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age_group">Age Group</Label>
                  <Select value={formData.age_group} onValueChange={(v) => setFormData({ ...formData, age_group: v })}>
                    <SelectTrigger><SelectValue placeholder="Select age group" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Adult">Adult</SelectItem>
                      <SelectItem value="Kids">Kids</SelectItem>
                      <SelectItem value="Infant">Infant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uom">Unit of Measure</Label>
                  <Select value={formData.uom} onValueChange={(v) => setFormData({ ...formData, uom: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inch">Inch</SelectItem>
                      <SelectItem value="cm">Centimeter (cm)</SelectItem>
                      <SelectItem value="mm">Millimeter (mm)</SelectItem>
                      <SelectItem value="feet">Feet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">Measurements ({formData.uom})</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="chest">Chest / Bust</Label>
                    <Input
                      id="chest"
                      type="number"
                      step="0.1"
                      value={formData.chest}
                      onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waist">Waist</Label>
                    <Input
                      id="waist"
                      type="number"
                      step="0.1"
                      value={formData.waist}
                      onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hip">Hip</Label>
                    <Input
                      id="hip"
                      type="number"
                      step="0.1"
                      value={formData.hip}
                      onChange={(e) => setFormData({ ...formData, hip: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shoulder_width">Shoulder Width</Label>
                    <Input
                      id="shoulder_width"
                      type="number"
                      step="0.1"
                      value={formData.shoulder_width}
                      onChange={(e) => setFormData({ ...formData, shoulder_width: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sleeve_length">Sleeve Length</Label>
                    <Input
                      id="sleeve_length"
                      type="number"
                      step="0.1"
                      value={formData.sleeve_length}
                      onChange={(e) => setFormData({ ...formData, sleeve_length: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="body_length">Body Length</Label>
                    <Input
                      id="body_length"
                      type="number"
                      step="0.1"
                      value={formData.body_length}
                      onChange={(e) => setFormData({ ...formData, body_length: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inseam">Inseam</Label>
                    <Input
                      id="inseam"
                      type="number"
                      step="0.1"
                      value={formData.inseam}
                      onChange={(e) => setFormData({ ...formData, inseam: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              {/* Unit Comparison Section */}
              {(formData.chest || formData.waist || formData.hip || formData.sleeve_length || formData.body_length || formData.shoulder_width || formData.inseam) && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-4">Unit Comparison</h4>
                  <div className="rounded-lg border p-4 bg-muted/50">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Measurement</TableHead>
                            <TableHead>Inch</TableHead>
                            <TableHead>cm</TableHead>
                            <TableHead>mm</TableHead>
                            <TableHead>Feet</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[
                            { label: "Chest / Bust", value: formData.chest },
                            { label: "Waist", value: formData.waist },
                            { label: "Hip", value: formData.hip },
                            { label: "Sleeve Length", value: formData.sleeve_length },
                            { label: "Body Length", value: formData.body_length },
                            { label: "Shoulder Width", value: formData.shoulder_width },
                            { label: "Inseam", value: formData.inseam },
                          ]
                            .filter((item) => item.value)
                            .map((item) => {
                              const numValue = parseFloat(item.value);
                              return (
                                <TableRow key={item.label}>
                                  <TableCell className="font-medium">{item.label}</TableCell>
                                  <TableCell>
                                    {numValue
                                      ? convertUnit(numValue, formData.uom, "inch")?.toFixed(2) || "-"
                                      : "-"}{" "}
                                    in
                                  </TableCell>
                                  <TableCell>
                                    {numValue
                                      ? convertUnit(numValue, formData.uom, "cm")?.toFixed(2) || "-"
                                      : "-"}{" "}
                                    cm
                                  </TableCell>
                                  <TableCell>
                                    {numValue
                                      ? convertUnit(numValue, formData.uom, "mm")?.toFixed(2) || "-"
                                      : "-"}{" "}
                                    mm
                                  </TableCell>
                                  <TableCell>
                                    {numValue
                                      ? convertUnit(numValue, formData.uom, "feet")?.toFixed(2) || "-"
                                      : "-"}{" "}
                                    ft
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    </div>
                    {![
                      { label: "Chest / Bust", value: formData.chest },
                      { label: "Waist", value: formData.waist },
                      { label: "Hip", value: formData.hip },
                      { label: "Sleeve Length", value: formData.sleeve_length },
                      { label: "Body Length", value: formData.body_length },
                      { label: "Shoulder Width", value: formData.shoulder_width },
                      { label: "Inseam", value: formData.inseam },
                    ].some((item) => item.value) && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        Enter measurements above to see unit conversions
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Additional notes or remarks"
                  rows={2}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {editingSize ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    editingSize ? "Update" : "Create"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Size Chart Data</CardTitle>
          <CardDescription>View and manage all size specifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Size ID, Name, or Garment Type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterGarmentType} onValueChange={setFilterGarmentType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Garment Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Garment Types</SelectItem>
                {garmentTypes.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterGender} onValueChange={setFilterGender}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Genders</SelectItem>
                {genders.map((g) => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterAgeGroup} onValueChange={setFilterAgeGroup}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Age Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Age Groups</SelectItem>
                {ageGroups.map((ag) => (
                  <SelectItem key={ag} value={ag}>{ag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredSizes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {sizesData?.length === 0
                ? "No size charts found. Click 'Add Size' to create one."
                : "No sizes match your filters."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Size ID</TableHead>
                    <TableHead>Size Name</TableHead>
                    <TableHead>Garment Type</TableHead>
                    <TableHead>Gender</TableHead>
                    <TableHead>Age Group</TableHead>
                    <TableHead>Chest</TableHead>
                    <TableHead>Waist</TableHead>
                    <TableHead>Hip</TableHead>
                    <TableHead>Sleeve</TableHead>
                    <TableHead>Body Length</TableHead>
                    <TableHead>Shoulder</TableHead>
                    <TableHead>Inseam</TableHead>
                    <TableHead>UoM</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSizes.map((size: any) => (
                    <TableRow key={size.id}>
                      <TableCell className="font-medium">{size.size_id}</TableCell>
                      <TableCell><Badge variant="outline">{size.size_name}</Badge></TableCell>
                      <TableCell>{size.garment_type || "-"}</TableCell>
                      <TableCell>{size.gender || "-"}</TableCell>
                      <TableCell>{size.age_group || "-"}</TableCell>
                      <TableCell>{size.chest || "-"}</TableCell>
                      <TableCell>{size.waist || "-"}</TableCell>
                      <TableCell>{size.hip || "-"}</TableCell>
                      <TableCell>{size.sleeve_length || "-"}</TableCell>
                      <TableCell>{size.body_length || "-"}</TableCell>
                      <TableCell>{size.shoulder_width || "-"}</TableCell>
                      <TableCell>{size.inseam || "-"}</TableCell>
                      <TableCell><Badge variant="secondary">{size.uom}</Badge></TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(size)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(size.size_id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
