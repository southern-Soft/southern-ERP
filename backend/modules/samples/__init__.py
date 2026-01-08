"""Samples module - Samples, Styles, Style Variants, Operations management"""
from .routes.samples import router as samples_router
from .models.sample import (
    # Style models
    StyleSummary, StyleVariant, VariantColorPart,
    # Master data
    SampleMachine, ManufacturingOperation,
    GarmentColor, GarmentSize,
    # Sample core
    SampleRequest, SamplePlan, SampleRequiredMaterial,
    SampleOperation, SampleTNA, SampleStatus,
    # Style variant materials & SMV
    StyleVariantMaterial, SMVCalculation,
    # Legacy (deprecated)
    Sample, OperationType, RequiredMaterial
)

__all__ = [
    "samples_router",
    # Style models
    "StyleSummary", "StyleVariant", "VariantColorPart",
    # Master data
    "SampleMachine", "ManufacturingOperation",
    "GarmentColor", "GarmentSize",
    # Sample core
    "SampleRequest", "SamplePlan", "SampleRequiredMaterial",
    "SampleOperation", "SampleTNA", "SampleStatus",
    # Style variant materials & SMV
    "StyleVariantMaterial", "SMVCalculation",
    # Legacy (deprecated)
    "Sample", "OperationType", "RequiredMaterial"
]
