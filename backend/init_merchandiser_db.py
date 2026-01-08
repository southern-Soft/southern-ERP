"""
Initialize Merchandiser Database
Creates all tables in the merchandiser database
"""
from core.database import engines, DatabaseType, BaseMerchandiser
from modules.merchandiser.models import (
    YarnDetail,
    FabricDetail,
    TrimsDetail,
    AccessoriesDetail,
    FinishedGoodDetail,
    PackingGoodDetail,
    SizeChart,
    SamplePrimaryInfo,
    SampleTNAColorWise,
    SampleStatus,
    StyleCreation,
    StyleBasicInfo,
    StyleMaterialLink,
    StyleColor,
    StyleSize,
    StyleVariant,
    CMCalculation,
)

def init_merchandiser_tables():
    """Create all merchandiser tables"""
    print("Creating merchandiser database tables...")
    BaseMerchandiser.metadata.create_all(bind=engines[DatabaseType.MERCHANDISER])
    print("✅ Merchandiser database tables created successfully!")
    print("📊 Created tables:")
    print("   - yarn_details")
    print("   - fabric_details")
    print("   - trims_details")
    print("   - accessories_details")
    print("   - finished_good_details")
    print("   - packing_good_details")
    print("   - size_chart")
    print("   - sample_primary_info")
    print("   - sample_tna_color_wise")
    print("   - sample_status")
    print("   - style_creation")
    print("   - style_basic_info")
    print("   - style_material_link")
    print("   - style_color")
    print("   - style_size")
    print("   - style_variant")
    print("   - cm_calculation")

if __name__ == "__main__":
    init_merchandiser_tables()

