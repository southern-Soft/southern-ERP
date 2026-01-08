"use client";

import * as React from "react";
import { useState, useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Edit, Trash2, Search, X, Eye, Upload, Check, ChevronsUpDown, FileText, Info, RefreshCw, Plus, CheckCircle2 } from "lucide-react";
import { samplesService, buyersService, api } from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SAMPLE_CATEGORIES = ["Proto", "Fit", "PP", "SMS", "TOP", "Salesman", "Photo Shoot", "Production"];

export default function SampleRequestPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<any[]>([]);
  const [buyers, setBuyers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewingItem, setViewingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: "", buyer: "", category: "" });
  const [buyerOpen, setBuyerOpen] = useState(false);
  const [buyerSearch, setBuyerSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    buyer_id: "",
    buyer_name: "",
    sample_name: "",
    gauge: "",
    ply: "",
    yarn_id: "",
    yarn_details: "",
    trims_ids: "",
    trims_details: "",
    decorative_part: "",
    decorative_details: "",
    yarn_handover_date: "",
    trims_handover_date: "",
    required_date: "",
    item: "",
    request_pcs: "",
    sample_category: "Proto",
    color_name: "",
    size_name: "",
    additional_instruction: [] as Array<{instruction: string, done: boolean}>,
    techpack_url: "",
    techpack_filename: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [requests, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reqData, buyerData] = await Promise.all([
        samplesService.requests.getAll(),
        buyersService.getAll(),
      ]);
      setRequests(Array.isArray(reqData) ? reqData : []);
      setBuyers(Array.isArray(buyerData) ? buyerData : []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...requests];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter((r) =>
        r.sample_id?.toLowerCase().includes(s) ||
        r.sample_name?.toLowerCase().includes(s) ||
        r.buyer_name?.toLowerCase().includes(s)
      );
    }
    if (filters.buyer && filters.buyer !== "all") {
      filtered = filtered.filter((r) => r.buyer_id?.toString() === filters.buyer);
    }
    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter((r) => r.sample_category === filters.category);
    }
    setFilteredRequests(filtered);
  };

  const filteredBuyers = useMemo(() => {
    if (!buyerSearch) return buyers;
    return buyers.filter((b) =>
      b.buyer_name?.toLowerCase().includes(buyerSearch.toLowerCase()) ||
      b.buyer_code?.toLowerCase().includes(buyerSearch.toLowerCase())
    );
  }, [buyers, buyerSearch]);

  const handleBuyerSelect = (buyerId: string) => {
    const buyer = buyers.find((b) => b.id.toString() === buyerId);
    setFormData({ ...formData, buyer_id: buyerId, buyer_name: buyer?.buyer_name || "" });
    setBuyerOpen(false);
  };

  // Handlers for multiple additional instructions
  const [newInstruction, setNewInstruction] = useState("");
  const addInstruction = () => {
    if (newInstruction.trim()) {
      setFormData({
        ...formData,
        additional_instruction: [...(Array.isArray(formData.additional_instruction) ? formData.additional_instruction : []), { instruction: newInstruction.trim(), done: false }],
      });
      setNewInstruction("");
    }
  };
  const removeInstruction = (index: number) => {
    if (Array.isArray(formData.additional_instruction)) {
      setFormData({
        ...formData,
        additional_instruction: formData.additional_instruction.filter((_, i) => i !== index),
      });
    }
  };
  const toggleInstructionDone = (index: number) => {
    if (Array.isArray(formData.additional_instruction)) {
      const updated = [...formData.additional_instruction];
      updated[index] = { ...updated[index], done: !updated[index].done };
      setFormData({ ...formData, additional_instruction: updated });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, store as base64 data URL (in production, upload to server/S3)
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({
          ...formData,
          techpack_url: reader.result as string,
          techpack_filename: file.name,
        });
        toast.success(`File "${file.name}" attached`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const requestData = {
        buyer_id: parseInt(formData.buyer_id),
        buyer_name: formData.buyer_name,
        sample_name: formData.sample_name,
        gauge: formData.gauge || null,
        ply: formData.ply ? parseInt(formData.ply) : null,
        item: formData.item || null,
        yarn_id: formData.yarn_id || null,
        yarn_details: formData.yarn_details || null,
        trims_ids: formData.trims_ids ? formData.trims_ids.split(",").map((s) => s.trim()).filter(Boolean) : null,
        trims_details: formData.trims_details || null,
        decorative_part: formData.decorative_part || null,
        decorative_details: formData.decorative_details || null,
        yarn_handover_date: formData.yarn_handover_date ? new Date(formData.yarn_handover_date).toISOString() : null,
        trims_handover_date: formData.trims_handover_date ? new Date(formData.trims_handover_date).toISOString() : null,
        required_date: formData.required_date ? new Date(formData.required_date).toISOString() : null,
        request_pcs: formData.request_pcs ? parseInt(formData.request_pcs) : null,
        sample_category: formData.sample_category,
        color_name: formData.color_name || null,
        size_name: formData.size_name || null,
        additional_instruction: (() => {
          // Convert array to newline-separated string for backend (samples DB expects string)
          if (!formData.additional_instruction) return null;
          if (typeof formData.additional_instruction === 'string') return formData.additional_instruction;
          if (Array.isArray(formData.additional_instruction)) {
            if (formData.additional_instruction.length === 0) return null;
            return formData.additional_instruction.map((inst: any) => {
              const done = inst.done ? "✓ " : "";
              return `${done}${typeof inst === 'string' ? inst : (inst.instruction || String(inst))}`;
            }).join("\n");
          }
          return String(formData.additional_instruction);
        })(),
        techpack_url: formData.techpack_url || null,
        techpack_filename: formData.techpack_filename || null,
      };

      if (!editingItem) {
        toast.error("Cannot create new requests. Sample requests must be created in the Merchandising module.");
        return;
      }

      await samplesService.requests.update(editingItem.id, requestData);
      toast.success("Sample request updated successfully");

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save sample request");
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setIsDialogOpen(true);
    setFormData({
      buyer_id: item.buyer_id?.toString() || "",
      buyer_name: item.buyer_name || "",
      sample_name: item.sample_name || "",
      gauge: item.gauge || "",
      ply: item.ply?.toString() || "",
      item: item.item || "",
      yarn_id: item.yarn_id || "",
      yarn_details: item.yarn_details || "",
      trims_ids: item.trims_ids?.join(", ") || "",
      trims_details: item.trims_details || "",
      decorative_part: item.decorative_part || "",
      decorative_details: item.decorative_details || "",
      yarn_handover_date: item.yarn_handover_date?.split("T")[0] || "",
      trims_handover_date: item.trims_handover_date?.split("T")[0] || "",
      required_date: item.required_date?.split("T")[0] || "",
      request_pcs: item.request_pcs?.toString() || "",
      sample_category: item.sample_category || "Proto",
      color_name: item.color_name || "",
      size_name: item.size_name || "",
      additional_instruction: (() => {
        // Parse additional_instruction from string or JSON
        if (!item.additional_instruction) return [];
        if (typeof item.additional_instruction === 'string') {
          // Parse from newline-separated string with optional ✓ markers
          const lines = item.additional_instruction.split('\n');
          return lines.map((line: string) => {
            const trimmed = line.trim();
            if (!trimmed) return null;
            const done = trimmed.startsWith('✓');
            const instruction = done ? trimmed.substring(1).trim() : trimmed;
            return { instruction, done };
          }).filter((item: any) => item && item.instruction) as Array<{instruction: string, done: boolean}>;
        }
        if (Array.isArray(item.additional_instruction)) {
          return item.additional_instruction;
        }
        return [];
      })(),
      techpack_url: item.techpack_url || "",
      techpack_filename: item.techpack_filename || "",
    });
    setIsDialogOpen(true);
  };

  const handleView = (item: any) => {
    setViewingItem(item);
    setIsViewDialogOpen(true);
  };

  const handleSyncSamples = async () => {
    try {
      setLoading(true);
      const result = await api.merchandiser.samplePrimary.syncToSamples();
      toast.success(result?.message || "Samples synced successfully");
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to sync samples");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this sample request?")) {
      try {
        await samplesService.requests.delete(id);
        toast.success("Sample request deleted successfully");
        loadData();
      } catch (error) {
        toast.error("Failed to delete sample request");
      }
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      buyer_id: "", buyer_name: "", sample_name: "", gauge: "", ply: "", item: "",
      yarn_id: "", yarn_details: "", trims_ids: "", trims_details: "",
      decorative_part: "", decorative_details: "",
      yarn_handover_date: "", trims_handover_date: "", required_date: "", request_pcs: "",
      sample_category: "Proto", color_name: "", size_name: "", additional_instruction: [],
      techpack_url: "", techpack_filename: "",
    });
    setBuyerSearch("");
  };

  const selectedBuyer = buyers.find((b) => b.id.toString() === formData.buyer_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sample Request</h1>
          <p className="text-muted-foreground">
            View and edit sample requests received from Merchandiser. New requests are created in the Merchandising module.
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <div className="p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Sample requests are created by the Merchandiser
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              New sample requests must be created in the <strong>Merchandising → Sample Development</strong> module. 
              This page is for viewing and editing existing requests only.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSyncSamples}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Sync from Merchandiser
          </Button>
        </div>
      </Card>

      {/* Edit Dialog - Only opens when editingItem is set */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => { 
        if (!open) {
          setIsDialogOpen(false);
          resetForm();
        } else if (editingItem) {
          setIsDialogOpen(true);
        }
      }}>
          <DialogContent 
            className="max-h-[90vh] overflow-y-auto !p-6" 
            style={{ 
              maxWidth: 'calc(100vw - 4rem)', 
              width: 'calc(100vw - 4rem)',
              minWidth: '1400px'
            }}
          >
            <DialogHeader>
              <DialogTitle>Edit Sample Request</DialogTitle>
              <DialogDescription>Update sample request information. Sample requests are created in the Merchandising module.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Row 1: Buyer, Sample Name, Item, Category, Gauge, PLY, Color, Size - All side by side */}
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(8, minmax(0, 1fr))' }}>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Buyer *</Label>
                  <Popover open={buyerOpen} onOpenChange={setBuyerOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={buyerOpen} className="w-full justify-between h-10 text-sm">
                        {selectedBuyer ? selectedBuyer.buyer_name : "Select..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[350px] p-0">
                      <Command>
                        <CommandInput placeholder="Search buyer..." value={buyerSearch} onValueChange={setBuyerSearch} />
                        <CommandList>
                          <CommandEmpty>No buyer found.</CommandEmpty>
                          <CommandGroup>
                            {filteredBuyers.map((b) => (
                              <CommandItem key={b.id} value={b.id.toString()} onSelect={() => handleBuyerSelect(b.id.toString())}>
                                <Check className={cn("mr-2 h-4 w-4", formData.buyer_id === b.id.toString() ? "opacity-100" : "opacity-0")} />
                                {b.buyer_name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Sample Name *</Label>
                  <Input className="h-10" value={formData.sample_name} onChange={(e) => setFormData({ ...formData, sample_name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Item</Label>
                  <Input className="h-10" value={formData.item} onChange={(e) => setFormData({ ...formData, item: e.target.value })} placeholder="Sweater" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Category *</Label>
                  <Select value={formData.sample_category} onValueChange={(v) => setFormData({ ...formData, sample_category: v })}>
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SAMPLE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Gauge</Label>
                  <Input className="h-10" value={formData.gauge} onChange={(e) => setFormData({ ...formData, gauge: e.target.value })} placeholder="12GG" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">PLY</Label>
                  <Input className="h-10" type="number" value={formData.ply} onChange={(e) => setFormData({ ...formData, ply: e.target.value })} placeholder="2" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Color Name</Label>
                  <Input className="h-10" value={formData.color_name} onChange={(e) => setFormData({ ...formData, color_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Size Name</Label>
                  <Input className="h-10" value={formData.size_name} onChange={(e) => setFormData({ ...formData, size_name: e.target.value })} />
                </div>
              </div>

              {/* Row 2: Request Pcs, Yarn ID, Trims ID, Decorative Part, Yarn Handover Date, Trims Handover Date, Required Date */}
              <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(7, minmax(0, 1fr))' }}>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Request Pcs</Label>
                  <Input className="h-10" type="number" value={formData.request_pcs} onChange={(e) => setFormData({ ...formData, request_pcs: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Yarn ID</Label>
                  <Input className="h-10" value={formData.yarn_id} onChange={(e) => setFormData({ ...formData, yarn_id: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Trims ID</Label>
                  <Input className="h-10" value={formData.trims_ids} onChange={(e) => setFormData({ ...formData, trims_ids: e.target.value })} placeholder="TRM-001, TRM-002" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Decorative Part</Label>
                  <Input className="h-10" value={formData.decorative_part} onChange={(e) => setFormData({ ...formData, decorative_part: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Yarn Handover Date</Label>
                  <Input className="h-10" type="date" value={formData.yarn_handover_date} onChange={(e) => setFormData({ ...formData, yarn_handover_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Trims Handover Date</Label>
                  <Input className="h-10" type="date" value={formData.trims_handover_date} onChange={(e) => setFormData({ ...formData, trims_handover_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Required Date</Label>
                  <Input className="h-10" type="date" value={formData.required_date} onChange={(e) => setFormData({ ...formData, required_date: e.target.value })} />
                </div>
              </div>

              {/* Row 3: Yarn Details, Trims Details, Decorative Details, Techpack - Side by side */}
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Yarn Details</Label>
                  <Input className="h-10" value={formData.yarn_details} onChange={(e) => setFormData({ ...formData, yarn_details: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Trims Details</Label>
                  <Input className="h-10" value={formData.trims_details} onChange={(e) => setFormData({ ...formData, trims_details: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Decorative Details</Label>
                  <Input className="h-10" value={formData.decorative_details} onChange={(e) => setFormData({ ...formData, decorative_details: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Attach Techpack</Label>
                  <div className="flex gap-2">
                    <Input
                      className="h-10 flex-1"
                      value={formData.techpack_filename}
                      placeholder="No file"
                      readOnly
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                      className="hidden"
                    />
                    <Button type="button" variant="outline" size="sm" className="h-10 px-3" onClick={() => fileInputRef.current?.click()}>
                      <Upload className="h-4 w-4" />
                    </Button>
                    {formData.techpack_url && (
                      <Button type="button" variant="ghost" size="sm" className="h-10 px-3" onClick={() => window.open(formData.techpack_url, '_blank')}>
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 4: Additional Instructions (full width with multiple entries and done status) */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Additional Instructions</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input 
                      className="h-10 flex-1" 
                      value={newInstruction || ""} 
                      onChange={(e) => setNewInstruction(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInstruction())}
                      placeholder="Enter instruction..." 
                    />
                    <Button type="button" onClick={addInstruction} size="sm" className="h-10">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {formData.additional_instruction && formData.additional_instruction.length > 0 && (
                    <div className="space-y-2 border rounded-lg p-3">
                      {formData.additional_instruction.map((inst: any, idx: number) => (
                        <div key={idx} className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={inst.done || false}
                            onChange={() => toggleInstructionDone(idx)}
                            className="mt-1"
                          />
                          <span className={cn("flex-1 text-sm", inst.done && "line-through text-muted-foreground")}>
                            {typeof inst === 'string' ? inst : inst.instruction}
                          </span>
                          {inst.done && <Badge variant="secondary" className="text-xs">Done</Badge>}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInstruction(idx)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Update</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by Sample ID, Name, Buyer..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="pl-9" />
          </div>
          <Select value={filters.buyer} onValueChange={(v) => setFilters({ ...filters, buyer: v })}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Buyer" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Buyers</SelectItem>
              {buyers.map((b) => <SelectItem key={b.id} value={b.id.toString()}>{b.buyer_name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filters.category} onValueChange={(v) => setFilters({ ...filters, category: v })}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {SAMPLE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={() => setFilters({ search: "", buyer: "", category: "" })}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Showing {filteredRequests.length} of {requests.length} requests
        </div>
      </Card>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sample ID</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Sample Name</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Gauge</TableHead>
              <TableHead>PLY</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Required Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground">
                  {loading ? "Loading..." : "No sample requests found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredRequests.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono font-medium">{item.sample_id}</TableCell>
                  <TableCell>{item.buyer_name}</TableCell>
                  <TableCell>{item.sample_name}</TableCell>
                  <TableCell>{item.item || "-"}</TableCell>
                  <TableCell>{item.gauge || "-"}</TableCell>
                  <TableCell>{item.ply || "-"}</TableCell>
                  <TableCell>{item.color_name || "-"}</TableCell>
                  <TableCell>{item.size_name || "-"}</TableCell>
                  <TableCell><Badge variant="outline">{item.sample_category}</Badge></TableCell>
                  <TableCell>{item.required_date?.split("T")[0] || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleView(item)} title="View Details">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Sample Request Details</DialogTitle>
          </DialogHeader>
          {viewingItem && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-4 gap-4">
                <div><span className="font-medium">Sample ID:</span> {viewingItem.sample_id}</div>
                <div><span className="font-medium">Buyer:</span> {viewingItem.buyer_name}</div>
                <div><span className="font-medium">Sample Name:</span> {viewingItem.sample_name}</div>
                <div><span className="font-medium">Category:</span> {viewingItem.sample_category}</div>
                <div><span className="font-medium">Item:</span> {viewingItem.item || "-"}</div>
                <div><span className="font-medium">Gauge:</span> {viewingItem.gauge || "-"}</div>
                <div><span className="font-medium">PLY:</span> {viewingItem.ply || "-"}</div>
                <div><span className="font-medium">Request Pcs:</span> {viewingItem.request_pcs || "-"}</div>
                <div><span className="font-medium">Color:</span> {viewingItem.color_name || "-"}</div>
                <div><span className="font-medium">Size:</span> {viewingItem.size_name || "-"}</div>
                <div><span className="font-medium">Yarn ID:</span> {viewingItem.yarn_id || "-"}</div>
                <div><span className="font-medium">Trims IDs:</span> {viewingItem.trims_ids?.join(", ") || "-"}</div>
                <div><span className="font-medium">Decorative Part:</span> {viewingItem.decorative_part || "-"}</div>
                <div><span className="font-medium">Required Date:</span> {viewingItem.required_date?.split("T")[0] || "-"}</div>
                <div><span className="font-medium">Yarn Handover:</span> {viewingItem.yarn_handover_date?.split("T")[0] || "-"}</div>
                <div><span className="font-medium">Trims Handover:</span> {viewingItem.trims_handover_date?.split("T")[0] || "-"}</div>
              </div>
              {viewingItem.additional_instruction && (
                <div className="border-t pt-4">
                  <span className="font-medium">Additional Instructions:</span>
                  <p className="mt-1">{viewingItem.additional_instruction}</p>
                </div>
              )}
              {viewingItem.techpack_filename && (
                <div className="border-t pt-4 flex items-center gap-2">
                  <span className="font-medium">Techpack:</span>
                  <Button variant="link" onClick={() => window.open(viewingItem.techpack_url, '_blank')}>
                    <FileText className="mr-2 h-4 w-4" />
                    {viewingItem.techpack_filename}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
