"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { PlusCircle, Edit, Trash2, Search, X, Check, ChevronsUpDown } from "lucide-react";
import { samplesService } from "@/services/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function AddOperationsForSamplePage() {
  const [sampleOperations, setSampleOperations] = useState<any[]>([]);
  const [filteredOperations, setFilteredOperations] = useState<any[]>([]);
  const [sampleRequests, setSampleRequests] = useState<any[]>([]);
  const [manufacturingOps, setManufacturingOps] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: "" });

  const [sampleOpen, setSampleOpen] = useState(false);
  const [sampleSearch, setSampleSearch] = useState("");
  const [operationOpen, setOperationOpen] = useState(false);
  const [operationSearch, setOperationSearch] = useState("");

  const [formData, setFormData] = useState({
    sample_request_id: "",
    operation_master_id: "",
    operation_type: "",
    operation_name: "",
    sequence_order: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sampleOperations, filters, sampleRequests]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [opsData, requestsData, mfgOpsData] = await Promise.all([
        samplesService.sampleOperations.getAll(),
        samplesService.requests.getAll(),
        samplesService.manufacturingOperations.getAll(undefined, true),
      ]);
      setSampleOperations(Array.isArray(opsData) ? opsData : []);
      setSampleRequests(Array.isArray(requestsData) ? requestsData : []);
      setManufacturingOps(Array.isArray(mfgOpsData) ? mfgOpsData : []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...sampleOperations];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter((op) => {
        const request = sampleRequests.find((r) => r.id === op.sample_request_id);
        return request?.sample_id?.toLowerCase().includes(s) ||
          request?.sample_name?.toLowerCase().includes(s) ||
          op.operation_name?.toLowerCase().includes(s) ||
          op.operation_type?.toLowerCase().includes(s);
      });
    }
    setFilteredOperations(filtered);
  };

  const filteredSamples = useMemo(() => {
    if (!sampleSearch) return sampleRequests;
    return sampleRequests.filter((r) =>
      r.sample_id?.toLowerCase().includes(sampleSearch.toLowerCase()) ||
      r.sample_name?.toLowerCase().includes(sampleSearch.toLowerCase()) ||
      r.buyer_name?.toLowerCase().includes(sampleSearch.toLowerCase())
    );
  }, [sampleRequests, sampleSearch]);

  const filteredMfgOps = useMemo(() => {
    if (!operationSearch) return manufacturingOps;
    return manufacturingOps.filter((op) =>
      op.operation_id?.toLowerCase().includes(operationSearch.toLowerCase()) ||
      op.operation_name?.toLowerCase().includes(operationSearch.toLowerCase()) ||
      op.operation_type?.toLowerCase().includes(operationSearch.toLowerCase())
    );
  }, [manufacturingOps, operationSearch]);

  const handleSampleSelect = (requestId: string) => {
    setFormData({ ...formData, sample_request_id: requestId });
    setSampleOpen(false);
  };

  const handleOperationSelect = (opId: string) => {
    const op = manufacturingOps.find((o) => o.id.toString() === opId);
    if (op) {
      setFormData({
        ...formData,
        operation_master_id: opId,
        operation_type: op.operation_type || "",
        operation_name: op.operation_name || "",
      });
    }
    setOperationOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        sample_request_id: parseInt(formData.sample_request_id),
        operation_master_id: formData.operation_master_id ? parseInt(formData.operation_master_id) : null,
        operation_type: formData.operation_type || null,
        operation_name: formData.operation_name || null,
        sequence_order: formData.sequence_order ? parseInt(formData.sequence_order) : null,
      };

      if (editingItem) {
        await samplesService.sampleOperations.update(editingItem.id, data);
        toast.success("Operation updated successfully");
      } else {
        await samplesService.sampleOperations.create(data);
        toast.success("Operation added to sample successfully");
      }

      setIsDialogOpen(false);
      resetForm();
      loadData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to save operation");
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({
      sample_request_id: item.sample_request_id?.toString() || "",
      operation_master_id: item.operation_master_id?.toString() || "",
      operation_type: item.operation_type || "",
      operation_name: item.operation_name || "",
      sequence_order: item.sequence_order?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to remove this operation from the sample?")) {
      try {
        await samplesService.sampleOperations.delete(id);
        toast.success("Operation removed successfully");
        loadData();
      } catch (error) {
        toast.error("Failed to remove operation");
      }
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      sample_request_id: "", operation_master_id: "", operation_type: "",
      operation_name: "", sequence_order: "",
    });
    setSampleSearch("");
    setOperationSearch("");
  };

  const getRequestInfo = (requestId: number) => sampleRequests.find((r) => r.id === requestId);
  const selectedRequest = sampleRequests.find((r) => r.id.toString() === formData.sample_request_id);
  const selectedOperation = manufacturingOps.find((o) => o.id.toString() === formData.operation_master_id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Add Operations For Sample</h1>
          <p className="text-muted-foreground">Link manufacturing operations to specific samples</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" />Add Operation to Sample</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit" : "Add"} Operation for Sample</DialogTitle>
              <DialogDescription>Link an operation from Manufacturing Operations master to a sample</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Sample Selection */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Sample ID (Search & Select) *</Label>
                  <Popover open={sampleOpen} onOpenChange={setSampleOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between">
                        {selectedRequest ? `${selectedRequest.sample_id} - ${selectedRequest.sample_name}` : "Search & select sample..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[450px] p-0">
                      <Command>
                        <CommandInput placeholder="Search sample ID, name, buyer..." value={sampleSearch} onValueChange={setSampleSearch} />
                        <CommandList>
                          <CommandEmpty>No sample found.</CommandEmpty>
                          <CommandGroup>
                            {filteredSamples.map((r) => (
                              <CommandItem key={r.id} value={r.id.toString()} onSelect={() => handleSampleSelect(r.id.toString())}>
                                <Check className={cn("mr-2 h-4 w-4", formData.sample_request_id === r.id.toString() ? "opacity-100" : "opacity-0")} />
                                <span className="font-mono">{r.sample_id}</span>
                                <span className="mx-2">-</span>
                                <span>{r.sample_name}</span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="space-y-2">
                  <Label>Buyer Name</Label>
                  <Input value={selectedRequest?.buyer_name || ""} disabled className="bg-muted" />
                </div>
              </div>

              {/* Operation Selection */}
              <div className="space-y-2">
                <Label>Operation ID (Search & Select) *</Label>
                <Popover open={operationOpen} onOpenChange={setOperationOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                      {selectedOperation ? `${selectedOperation.operation_id} - ${selectedOperation.operation_name}` : "Search & select operation..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[500px] p-0">
                    <Command>
                      <CommandInput placeholder="Search operation ID, name, type..." value={operationSearch} onValueChange={setOperationSearch} />
                      <CommandList>
                        <CommandEmpty>No operation found.</CommandEmpty>
                        <CommandGroup>
                          {filteredMfgOps.map((op) => (
                            <CommandItem key={op.id} value={op.id.toString()} onSelect={() => handleOperationSelect(op.id.toString())}>
                              <Check className={cn("mr-2 h-4 w-4", formData.operation_master_id === op.id.toString() ? "opacity-100" : "opacity-0")} />
                              <span className="font-mono">{op.operation_id}</span>
                              <span className="mx-2">-</span>
                              <span>{op.operation_name}</span>
                              <Badge variant="outline" className="ml-2">{op.operation_type}</Badge>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Auto-filled fields */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Operation Type</Label>
                  <Input value={formData.operation_type} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Operation Name</Label>
                  <Input value={formData.operation_name} disabled className="bg-muted" />
                </div>
                <div className="space-y-2">
                  <Label>Sequence Order</Label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.sequence_order}
                    onChange={(e) => setFormData({ ...formData, sequence_order: e.target.value })}
                    placeholder="e.g., 1, 2, 3..."
                  />
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">{editingItem ? "Update" : "Add"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by Sample ID, Operation..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} className="pl-9" />
          </div>
          <Button variant="outline" size="icon" onClick={() => setFilters({ search: "" })}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 text-sm text-muted-foreground">
          Showing {filteredOperations.length} of {sampleOperations.length} operations
        </div>
      </Card>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sample ID</TableHead>
              <TableHead>Sample Name</TableHead>
              <TableHead>Buyer</TableHead>
              <TableHead>Operation ID</TableHead>
              <TableHead>Operation Type</TableHead>
              <TableHead>Operation Name</TableHead>
              <TableHead>Seq</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOperations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  {loading ? "Loading..." : "No operations linked to samples"}
                </TableCell>
              </TableRow>
            ) : (
              filteredOperations.map((item) => {
                const request = getRequestInfo(item.sample_request_id);
                const mfgOp = manufacturingOps.find((o) => o.id === item.operation_master_id);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono">{request?.sample_id || "-"}</TableCell>
                    <TableCell>{request?.sample_name || "-"}</TableCell>
                    <TableCell>{request?.buyer_name || "-"}</TableCell>
                    <TableCell className="font-mono">{mfgOp?.operation_id || "-"}</TableCell>
                    <TableCell><Badge variant="outline">{item.operation_type || "-"}</Badge></TableCell>
                    <TableCell>{item.operation_name || "-"}</TableCell>
                    <TableCell>{item.sequence_order || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
