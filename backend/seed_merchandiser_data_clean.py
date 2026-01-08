"""
Seed Merchandiser Database with Sample Data
Adds 1-2 sample records to each table for testing
"""
from core.database import SessionLocalMerchandiser
from modules.merchandiser.models import (
    YarnDetail, FabricDetail, TrimsDetail, AccessoriesDetail,
    FinishedGoodDetail, PackingGoodDetail, SizeChart,
    SamplePrimaryInfo, SampleTNAColorWise, SampleStatus,
    StyleCreation, StyleBasicInfo, StyleMaterialLink,
    StyleColor, StyleSize, StyleVariant, CMCalculation
)
from datetime import datetime, timedelta

def seed_data():
    """Seed all merchandiser tables with sample data"""
    db = SessionLocalMerchandiser()
    
    try:
        print("Seeding Merchandiser Database...")
        
        # ============================================================================
        # 1. YARN DETAILS
        # ============================================================================
        print("Adding Yarn Details...")
        if db.query(YarnDetail).count() == 0:
            yarns = [
                YarnDetail(
                    yarn_id="YRN-001",
                    yarn_name="Cotton Combed 30s",
                    yarn_composition="100% Cotton",
                    blend_ratio="100/0",
                    yarn_count="30",
                    count_system="Ne",
                    yarn_type="Ring Spun",
                    yarn_form="Cone",
                    tpi="18.5",
                    yarn_finish="Combed",
                    color="Raw White",
                    dye_type="Reactive",
                    uom="kg",
                    remarks="Premium quality combed cotton"
                ),
                YarnDetail(
                    yarn_id="YRN-002",
                    yarn_name="Polyester 40s",
                    yarn_composition="100% Polyester",
                    blend_ratio="100/0",
                    yarn_count="40",
                    count_system="Ne",
                    yarn_type="Open End",
                    yarn_form="Cone",
                    tpi="20.0",
                    yarn_finish="Standard",
                    color="Optical White",
                    dye_type="Disperse",
                    uom="kg",
                    remarks="Standard polyester yarn"
                ),
            ]
            db.add_all(yarns)
            print(f"    Added {len(yarns)} yarn records")
        else:
            print("     Yarn data already exists")

        # ============================================================================
        # 2. FABRIC DETAILS
        # ============================================================================
        print("Adding Fabric Details...")
        if db.query(FabricDetail).count() == 0:
            fabrics = [
                FabricDetail(
                    fabric_id="FAB-001",
                    fabric_name="Single Jersey 180 GSM",
                    category="Knit",
                    type="Single Jersey",
                    construction="1x1",
                    weave_knit="Plain Knit",
                    gsm=180,
                    gauge_epi="24",
                    width="72 inches",
                    stretch="20% horizontal",
                    shrink="3-5%",
                    finish="Enzyme Wash",
                    composition="100% Cotton",
                    handfeel="Soft and Smooth",
                    uom="meter",
                    remarks="Standard t-shirt fabric"
                ),
                FabricDetail(
                    fabric_id="FAB-002",
                    fabric_name="French Terry 280 GSM",
                    category="Knit",
                    type="French Terry",
                    construction="3 Thread",
                    weave_knit="Terry Loop",
                    gsm=280,
                    gauge_epi="20",
                    width="70 inches",
                    stretch="15% horizontal",
                    shrink="4-6%",
                    finish="Brushed Inside",
                    composition="80% Cotton 20% Polyester",
                    handfeel="Soft with Loop",
                    uom="meter",
                    remarks="Ideal for hoodies and sweatshirts"
                ),
            ]
            db.add_all(fabrics)
            print(f"    Added {len(fabrics)} fabric records")
        else:
            print("     Fabric data already exists")

        # ============================================================================
        # 3. TRIMS DETAILS
        # ============================================================================
        print(" Adding Trims Details...")
        if db.query(TrimsDetail).count() == 0:
            trims = [
                TrimsDetail(
                    product_id="TRIM-001",
                    product_name="Polyester Sewing Thread 40/2",
                    category="Thread",
                    sub_category="Sewing Thread",
                    uom="cone",
                    consumable_flag=True,
                    remarks="Standard sewing thread"
                ),
                TrimsDetail(
                    product_id="TRIM-002",
                    product_name="4-Hole Plastic Button 14mm",
                    category="Button",
                    sub_category="Plastic Button",
                    uom="piece",
                    consumable_flag=False,
                    remarks="White color button"
                ),
            ]
            db.add_all(trims)
            print(f"    Added {len(trims)} trims records")
        else:
            print("     Trims data already exists")

        # ============================================================================
        # 4. ACCESSORIES DETAILS
        # ============================================================================
        print(" Adding Accessories Details...")
        if db.query(AccessoriesDetail).count() == 0:
            accessories = [
                AccessoriesDetail(
                    product_id="ACC-001",
                    product_name="Woven Main Label",
                    category="Label",
                    sub_category="Woven Label",
                    uom="piece",
                    consumable_flag=False,
                    remarks="Brand main label"
                ),
                AccessoriesDetail(
                    product_id="ACC-002",
                    product_name="Printed Care Label",
                    category="Label",
                    sub_category="Care Label",
                    uom="piece",
                    consumable_flag=False,
                    remarks="Washing instruction label"
                ),
            ]
            db.add_all(accessories)
            print(f"    Added {len(accessories)} accessories records")
        else:
            print("     Accessories data already exists")

        # ============================================================================
        # 5. FINISHED GOOD DETAILS
        # ============================================================================
        print(" Adding Finished Good Details...")
        if db.query(FinishedGoodDetail).count() == 0:
            finished_goods = [
                FinishedGoodDetail(
                    product_id="FG-001",
                    product_name="Men's T-Shirt",
                    category="Apparel",
                    sub_category="T-Shirt",
                    uom="piece",
                    consumable_flag=False,
                    remarks="Finished garment"
                ),
            ]
            db.add_all(finished_goods)
            print(f"    Added {len(finished_goods)} finished good records")
        else:
            print("     Finished good data already exists")

        # ============================================================================
        # 6. PACKING GOOD DETAILS
        # ============================================================================
        print(" Adding Packing Good Details...")
        if db.query(PackingGoodDetail).count() == 0:
            packing_goods = [
                PackingGoodDetail(
                    product_id="PKG-001",
                    product_name="Poly Bag 12x16 inch",
                    category="Poly Bag",
                    sub_category="Standard",
                    uom="piece",
                    consumable_flag=True,
                    remarks="Individual garment packing"
                ),
                PackingGoodDetail(
                    product_id="PKG-002",
                    product_name="Export Carton 60x40x40 cm",
                    category="Carton",
                    sub_category="Export Carton",
                    uom="piece",
                    consumable_flag=True,
                    remarks="Master carton for export"
                ),
            ]
            db.add_all(packing_goods)
            print(f"    Added {len(packing_goods)} packing good records")
        else:
            print("     Packing good data already exists")

        # ============================================================================
        # 7. SIZE CHART
        # ============================================================================
        print(" Adding Size Chart...")
        if db.query(SizeChart).count() == 0:
            sizes = [
                SizeChart(
                    size_id="SIZE-001",
                    size_name="M",
                    garment_type="T-Shirt",
                    gender="Male",
                    age_group="Adult",
                    chest=38.0,
                    waist=32.0,
                    hip=38.0,
                    sleeve_length=8.5,
                    body_length=28.0,
                    shoulder_width=17.0,
                    inseam=None,
                    uom="inch",
                    remarks="Medium size for men's t-shirt"
                ),
                SizeChart(
                    size_id="SIZE-002",
                    size_name="L",
                    garment_type="T-Shirt",
                    gender="Male",
                    age_group="Adult",
                    chest=40.0,
                    waist=34.0,
                    hip=40.0,
                    sleeve_length=9.0,
                    body_length=29.0,
                    shoulder_width=18.0,
                    inseam=None,
                    uom="inch",
                    remarks="Large size for men's t-shirt"
                ),
            ]
            db.add_all(sizes)
            print(f"    Added {len(sizes)} size records")
        else:
            print("     Size chart data already exists")

        # ============================================================================
        # 8. SAMPLE PRIMARY INFO
        # ============================================================================
        print(" Adding Sample Primary Info...")
        if db.query(SamplePrimaryInfo).count() == 0:
            samples = [
                SamplePrimaryInfo(
                    sample_id="SAMPLE-001",
                    sample_name="Basic T-Shirt Proto Sample",
                    buyer_id=1,  # Assuming buyer with ID 1 exists
                    yarn_ids=["YRN-001"],
                    component_yarn="Body: Cotton 30s",
                    count="30",
                    trims_ids=["TRIM-001", "TRIM-002"],
                    decorative_part="Screen Print",
                    gauge="24",
                    ply="1",
                    color_id="COL-001",
                    color_name="White",
                    size_id="SIZE-001",
                    size_name="M"
                ),
            ]
            db.add_all(samples)
            print(f"    Added {len(samples)} sample records")
        else:
            print("     Sample primary info data already exists")

        # ============================================================================
        # 9. SAMPLE TNA
        # ============================================================================
        print(" Adding Sample TNA...")
        if db.query(SampleTNAColorWise).count() == 0:
            today = datetime.now()
            tnas = [
                SampleTNAColorWise(
                    sample_id="SAMPLE-001",
                    sample_name="Basic T-Shirt Proto Sample",
                    worksheet_received_date=today - timedelta(days=10),
                    worksheet_handover_date=today - timedelta(days=9),
                    yarn_handover_date=today - timedelta(days=7),
                    trims_handover_date=today - timedelta(days=6),
                    required_date=today + timedelta(days=5),
                    item="T-Shirt",
                    request_pcs=2,
                    sample_category="Proto Sample",
                    size="M",
                    additional_instruction="Use premium fabric",
                    techpack_attachment=None
                ),
            ]
            db.add_all(tnas)
            print(f"    Added {len(tnas)} TNA records")
        else:
            print("     Sample TNA data already exists")

        # ============================================================================
        # 10. SAMPLE STATUS
        # ============================================================================
        print(" Adding Sample Status...")
        if db.query(SampleStatus).count() == 0:
            statuses = [
                SampleStatus(
                    sample_id="SAMPLE-001",
                    status_from_sample="Completed",
                    status_from_buyer="Approved",
                    status_by_merchandiser="Ready for Bulk",
                    note="Sample approved with minor color adjustment"
                ),
            ]
            db.add_all(statuses)
            print(f"    Added {len(statuses)} status records")
        else:
            print("     Sample status data already exists")

        # ============================================================================
        # 11. STYLE CREATION
        # ============================================================================
        print(" Adding Style Creation...")
        if db.query(StyleCreation).count() == 0:
            styles = [
                StyleCreation(
                    style_id="STYLE-001",
                    style_name="Basic Round Neck T-Shirt",
                    sample_id="SAMPLE-001",
                    buyer_id=1
                ),
            ]
            db.add_all(styles)
            print(f"    Added {len(styles)} style records")
        else:
            print("     Style creation data already exists")

        # ============================================================================
        # 12. STYLE BASIC INFO
        # ============================================================================
        print(" Adding Style Basic Info...")
        if db.query(StyleBasicInfo).count() == 0:
            style_infos = [
                StyleBasicInfo(
                    style_id="STYLE-001",
                    gauge="24",
                    gender="Male",
                    age_group="Adult",
                    product_type="T-Shirt",
                    product_category="Casual Wear",
                    specific_name="Round Neck Tee"
                ),
            ]
            db.add_all(style_infos)
            print(f"    Added {len(style_infos)} style info records")
        else:
            print("     Style basic info data already exists")

        # ============================================================================
        # 13. STYLE MATERIAL LINK
        # ============================================================================
        print(" Adding Style Material Links...")
        if db.query(StyleMaterialLink).count() == 0:
            material_links = [
                StyleMaterialLink(
                    style_material_id="SM-001",
                    style_id="STYLE-001",
                    material_type="YARN",
                    material_id="YRN-001",
                    required_quantity=0.25,
                    uom="kg",
                    price_per_unit=8.50,
                    amount=2.125,
                    amendment_no="001"
                ),
                StyleMaterialLink(
                    style_material_id="SM-002",
                    style_id="STYLE-001",
                    material_type="TRIMS",
                    material_id="TRIM-001",
                    required_quantity=0.01,
                    uom="cone",
                    price_per_unit=2.50,
                    amount=0.025,
                    amendment_no="001"
                ),
            ]
            db.add_all(material_links)
            print(f"    Added {len(material_links)} material link records")
        else:
            print("     Style material link data already exists")

        # ============================================================================
        # 14. STYLE COLORS
        # ============================================================================
        print(" Adding Style Colors...")
        if db.query(StyleColor).count() == 0:
            colors = [
                StyleColor(
                    style_id="STYLE-001",
                    color_id="COL-001",
                    color_code_type="Pantone",
                    color_code="11-0601 TPX",
                    color_name="White"
                ),
                StyleColor(
                    style_id="STYLE-001",
                    color_id="COL-002",
                    color_code_type="Pantone",
                    color_code="19-4052 TPX",
                    color_name="Navy Blue"
                ),
            ]
            db.add_all(colors)
            print(f"    Added {len(colors)} color records")
        else:
            print("     Style color data already exists")

        # ============================================================================
        # 15. STYLE SIZES
        # ============================================================================
        print(" Adding Style Sizes...")
        if db.query(StyleSize).count() == 0:
            style_sizes = [
                StyleSize(
                    style_id="STYLE-001",
                    size_id="SIZE-001",
                    size_name="M"
                ),
                StyleSize(
                    style_id="STYLE-001",
                    size_id="SIZE-002",
                    size_name="L"
                ),
            ]
            db.add_all(style_sizes)
            print(f"    Added {len(style_sizes)} style size records")
        else:
            print("     Style size data already exists")

        # ============================================================================
        # 16. STYLE VARIANTS (Auto-generated: 2 colors  2 sizes = 4 variants)
        # ============================================================================
        print(" Adding Style Variants...")
        if db.query(StyleVariant).count() == 0:
            variants = [
                StyleVariant(
                    style_variant_id="STYLE-001-COL-001-SIZE-001",
                    style_id="STYLE-001",
                    color_id="COL-001",
                    size_id="SIZE-001",
                    color_name="White",
                    size_name="M",
                    variant_name="White / M",
                    is_active=True
                ),
                StyleVariant(
                    style_variant_id="STYLE-001-COL-001-SIZE-002",
                    style_id="STYLE-001",
                    color_id="COL-001",
                    size_id="SIZE-002",
                    color_name="White",
                    size_name="L",
                    variant_name="White / L",
                    is_active=True
                ),
                StyleVariant(
                    style_variant_id="STYLE-001-COL-002-SIZE-001",
                    style_id="STYLE-001",
                    color_id="COL-002",
                    size_id="SIZE-001",
                    color_name="Navy Blue",
                    size_name="M",
                    variant_name="Navy Blue / M",
                    is_active=True
                ),
                StyleVariant(
                    style_variant_id="STYLE-001-COL-002-SIZE-002",
                    style_id="STYLE-001",
                    color_id="COL-002",
                    size_id="SIZE-002",
                    color_name="Navy Blue",
                    size_name="L",
                    variant_name="Navy Blue / L",
                    is_active=True
                ),
            ]
            db.add_all(variants)
            print(f"    Added {len(variants)} variant records (auto-generated)")
        else:
            print("     Style variant data already exists")

        # ============================================================================
        # 17. CM CALCULATION
        # ============================================================================
        print(" Adding CM Calculation...")
        if db.query(CMCalculation).count() == 0:
            cm_calcs = [
                CMCalculation(
                    cm_id="CM-001",
                    style_id="STYLE-001",
                    style_material_id="SM-001",
                    total_material_cost=2.15,  # Sum of materials
                    average_knitting_minute=12.5,  # SMV
                    per_minute_value=0.15,  # Labor rate per minute
                    production_cost=1.875,  # 12.5 * 0.15
                    overhead_cost=0.50,
                    testing_cost=0.10,
                    commercial_cost=0.25,
                    total_cm=4.875,  # Sum of all costs
                    amendment_no="001"
                ),
            ]
            db.add_all(cm_calcs)
            print(f"    Added {len(cm_calcs)} CM calculation records")
        else:
            print("     CM calculation data already exists")

        # Commit all changes
        db.commit()
        
        print("\n" + "="*70)
        print(" MERCHANDISER DATABASE SEEDED SUCCESSFULLY!")
        print("="*70)
        print("\n Summary:")
        print(f"    Yarns: {db.query(YarnDetail).count()}")
        print(f"    Fabrics: {db.query(FabricDetail).count()}")
        print(f"    Trims: {db.query(TrimsDetail).count()}")
        print(f"    Accessories: {db.query(AccessoriesDetail).count()}")
        print(f"    Finished Goods: {db.query(FinishedGoodDetail).count()}")
        print(f"    Packing Goods: {db.query(PackingGoodDetail).count()}")
        print(f"    Size Charts: {db.query(SizeChart).count()}")
        print(f"    Samples: {db.query(SamplePrimaryInfo).count()}")
        print(f"    Sample TNAs: {db.query(SampleTNAColorWise).count()}")
        print(f"    Sample Status: {db.query(SampleStatus).count()}")
        print(f"    Styles: {db.query(StyleCreation).count()}")
        print(f"    Style Infos: {db.query(StyleBasicInfo).count()}")
        print(f"    Material Links: {db.query(StyleMaterialLink).count()}")
        print(f"    Style Colors: {db.query(StyleColor).count()}")
        print(f"    Style Sizes: {db.query(StyleSize).count()}")
        print(f"    Style Variants: {db.query(StyleVariant).count()}")
        print(f"    CM Calculations: {db.query(CMCalculation).count()}")
        print("="*70)
        
    except Exception as e:
        print(f"\n Error seeding data: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()


