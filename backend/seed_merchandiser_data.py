"""
Seed Sample Data for Merchandiser Department
Creates 1-2 sample records in each table
"""
from core.database import SessionLocalMerchandiser
from modules.merchandiser.models import (
    YarnDetail, FabricDetail, TrimsDetail, AccessoriesDetail,
    FinishedGoodDetail, PackingGoodDetail, SizeChart,
    SamplePrimaryInfo, SampleTNAColorWise, SampleStatus,
    StyleCreation, StyleBasicInfo, StyleMaterialLink,
    StyleColor, StyleSize, StyleVariant, CMCalculation
)
from datetime import datetime


def seed_data():
    """Seed sample data for all merchandiser tables"""
    db = SessionLocalMerchandiser()
    
    try:
        print("🌱 Seeding Merchandiser Sample Data...\n")
        
        # ============================================================================
        # 1. YARN DETAILS
        # ============================================================================
        print("📦 Adding Yarn Details...")
        yarn1 = YarnDetail(
            yarn_id="YRN-001",
            yarn_name="Cotton 30s Ring Spun",
            yarn_composition="100% Cotton",
            blend_ratio="100/0",
            yarn_count="30",
            count_system="Ne",
            yarn_type="Ring Spun",
            yarn_form="Cone",
            tpi="20",
            yarn_finish="Mercerized",
            color="Raw White",
            dye_type="Reactive",
            uom="kg",
            remarks="High quality cotton for premium garments"
        )
        
        yarn2 = YarnDetail(
            yarn_id="YRN-002",
            yarn_name="Polyester 40s",
            yarn_composition="100% Polyester",
            blend_ratio="100/0",
            yarn_count="40",
            count_system="Ne",
            yarn_type="Open End",
            yarn_form="Cone",
            tpi="18",
            yarn_finish="Standard",
            color="Optical White",
            dye_type="Disperse",
            uom="kg",
            remarks="Durable polyester for activewear"
        )
        
        db.add_all([yarn1, yarn2])
        print("   ✓ Added 2 yarn records")
        
        # ============================================================================
        # 2. FABRIC DETAILS
        # ============================================================================
        print("📦 Adding Fabric Details...")
        fabric1 = FabricDetail(
            fabric_id="FAB-001",
            fabric_name="Single Jersey 160 GSM",
            category="Knit",
            type="Single Jersey",
            construction="1x1",
            weave_knit="Plain Knit",
            gsm=160,
            gauge_epi="24",
            width="72 inches",
            stretch="20%",
            shrink="5%",
            finish="Enzyme Wash",
            composition="100% Cotton",
            handfeel="Soft and Smooth",
            uom="kg",
            remarks="Popular for T-shirts"
        )
        
        fabric2 = FabricDetail(
            fabric_id="FAB-002",
            fabric_name="French Terry 280 GSM",
            category="Knit",
            type="French Terry",
            construction="Loop Back",
            weave_knit="Terry Knit",
            gsm=280,
            gauge_epi="20",
            width="72 inches",
            stretch="15%",
            shrink="3%",
            finish="Brushed Inside",
            composition="80% Cotton, 20% Polyester",
            handfeel="Thick and Soft",
            uom="kg",
            remarks="Ideal for hoodies and sweatshirts"
        )
        
        db.add_all([fabric1, fabric2])
        print("   ✓ Added 2 fabric records")
        
        # ============================================================================
        # 3. TRIMS DETAILS
        # ============================================================================
        print("📦 Adding Trims Details...")
        trims1 = TrimsDetail(
            product_id="TRM-001",
            product_name="Plastic Button 4-Hole",
            category="Button",
            sub_category="Shirt Button",
            uom="piece",
            consumable_flag=True,
            remarks="Standard 15mm button"
        )
        
        trims2 = TrimsDetail(
            product_id="TRM-002",
            product_name="Metal Zipper 18 inch",
            category="Zipper",
            sub_category="Closed End",
            uom="piece",
            consumable_flag=True,
            remarks="YKK quality zipper"
        )
        
        db.add_all([trims1, trims2])
        print("   ✓ Added 2 trims records")
        
        # ============================================================================
        # 4. ACCESSORIES DETAILS
        # ============================================================================
        print("📦 Adding Accessories Details...")
        acc1 = AccessoriesDetail(
            product_id="ACC-001",
            product_name="Hang Tag - Woven Label",
            category="Label",
            sub_category="Hang Tag",
            uom="piece",
            consumable_flag=True,
            remarks="Brand woven label"
        )
        
        acc2 = AccessoriesDetail(
            product_id="ACC-002",
            product_name="Care Label - Printed",
            category="Label",
            sub_category="Care Label",
            uom="piece",
            consumable_flag=True,
            remarks="Washing instructions label"
        )
        
        db.add_all([acc1, acc2])
        print("   ✓ Added 2 accessories records")
        
        # ============================================================================
        # 5. FINISHED GOOD DETAILS
        # ============================================================================
        print("📦 Adding Finished Good Details...")
        fg1 = FinishedGoodDetail(
            product_id="FG-001",
            product_name="Men's Basic T-Shirt",
            category="Apparel",
            sub_category="T-Shirt",
            uom="piece",
            consumable_flag=False,
            remarks="Standard crew neck t-shirt"
        )
        
        db.add(fg1)
        print("   ✓ Added 1 finished good record")
        
        # ============================================================================
        # 6. PACKING GOOD DETAILS
        # ============================================================================
        print("📦 Adding Packing Good Details...")
        pack1 = PackingGoodDetail(
            product_id="PACK-001",
            product_name="Poly Bag 12x16 inch",
            category="Poly Bag",
            sub_category="Individual Packing",
            uom="piece",
            consumable_flag=True,
            remarks="Transparent poly bag with seal"
        )
        
        pack2 = PackingGoodDetail(
            product_id="PACK-002",
            product_name="Export Carton 24x18x12",
            category="Carton",
            sub_category="Export Carton",
            uom="piece",
            consumable_flag=True,
            remarks="5-ply corrugated carton"
        )
        
        db.add_all([pack1, pack2])
        print("   ✓ Added 2 packing good records")
        
        # ============================================================================
        # 7. SIZE CHART
        # ============================================================================
        print("📦 Adding Size Chart...")
        size1 = SizeChart(
            size_id="SIZE-001",
            size_name="Medium",
            garment_type="T-Shirt",
            gender="Male",
            age_group="Adult",
            chest=38.0,
            waist=32.0,
            hip=40.0,
            sleeve_length=8.0,
            body_length=28.0,
            shoulder_width=17.0,
            inseam=None,
            uom="inch",
            remarks="Standard Medium size"
        )
        
        size2 = SizeChart(
            size_id="SIZE-002",
            size_name="Large",
            garment_type="T-Shirt",
            gender="Male",
            age_group="Adult",
            chest=40.0,
            waist=34.0,
            hip=42.0,
            sleeve_length=8.5,
            body_length=29.0,
            shoulder_width=18.0,
            inseam=None,
            uom="inch",
            remarks="Standard Large size"
        )
        
        db.add_all([size1, size2])
        print("   ✓ Added 2 size chart records")
        
        # ============================================================================
        # 8. SAMPLE PRIMARY INFO
        # ============================================================================
        print("📦 Adding Sample Primary Info...")
        sample1 = SamplePrimaryInfo(
            sample_id="SMP-001",
            sample_name="Basic T-Shirt Sample",
            buyer_id=1,  # Assumes buyer exists in clients DB
            yarn_ids=["YRN-001"],
            component_yarn="Cotton Yarn",
            count="30s",
            trims_ids=["TRM-001"],
            decorative_part="Screen Print",
            gauge="24",
            ply="Single",
            color_id="COL-001",
            color_name="Navy Blue",
            size_id="SIZE-001",
            size_name="Medium"
        )
        
        db.add(sample1)
        print("   ✓ Added 1 sample primary info record")
        
        # ============================================================================
        # 9. SAMPLE TNA
        # ============================================================================
        print("📦 Adding Sample TNA...")
        tna1 = SampleTNAColorWise(
            sample_id="SMP-001",
            sample_name="Basic T-Shirt Sample",
            worksheet_received_date=datetime(2025, 1, 1),
            worksheet_handover_date=datetime(2025, 1, 2),
            yarn_handover_date=datetime(2025, 1, 5),
            trims_handover_date=datetime(2025, 1, 6),
            required_date=datetime(2025, 1, 15),
            item="T-Shirt",
            request_pcs=5,
            sample_category="Proto Sample",
            size="M",
            additional_instruction="Use mercerized cotton",
            techpack_attachment=None
        )
        
        db.add(tna1)
        print("   ✓ Added 1 sample TNA record")
        
        # ============================================================================
        # 10. SAMPLE STATUS
        # ============================================================================
        print("📦 Adding Sample Status...")
        status1 = SampleStatus(
            sample_id="SMP-001",
            status_from_sample="In Progress",
            status_from_buyer="Pending Review",
            status_by_merchandiser="Approved for Production",
            note="Sample looks good, waiting for buyer feedback"
        )
        
        db.add(status1)
        print("   ✓ Added 1 sample status record")
        
        # ============================================================================
        # 11. STYLE CREATION
        # ============================================================================
        print("📦 Adding Style Creation...")
        style1 = StyleCreation(
            style_id="STY-001",
            style_name="Classic Crew Neck Tee",
            sample_id="SMP-001",
            buyer_id=1
        )
        
        db.add(style1)
        print("   ✓ Added 1 style creation record")
        
        # ============================================================================
        # 12. STYLE BASIC INFO
        # ============================================================================
        print("📦 Adding Style Basic Info...")
        style_info1 = StyleBasicInfo(
            style_id="STY-001",
            gauge="24",
            gender="Male",
            age_group="Adult",
            product_type="T-Shirt",
            product_category="Casual Wear",
            specific_name="Crew Neck T-Shirt"
        )
        
        db.add(style_info1)
        print("   ✓ Added 1 style basic info record")
        
        # ============================================================================
        # 13. STYLE MATERIAL LINK
        # ============================================================================
        print("📦 Adding Style Material Links...")
        mat1 = StyleMaterialLink(
            style_material_id="STYM-001",
            style_id="STY-001",
            material_type="YARN",
            material_id="YRN-001",
            required_quantity=0.25,
            uom="kg",
            price_per_unit=5.50,
            amount=1.38,
            amendment_no="01"
        )
        
        mat2 = StyleMaterialLink(
            style_material_id="STYM-002",
            style_id="STY-001",
            material_type="TRIMS",
            material_id="TRM-001",
            required_quantity=4.0,
            uom="piece",
            price_per_unit=0.05,
            amount=0.20,
            amendment_no="01"
        )
        
        db.add_all([mat1, mat2])
        print("   ✓ Added 2 style material link records")
        
        # ============================================================================
        # 14. STYLE COLOR
        # ============================================================================
        print("📦 Adding Style Colors...")
        color1 = StyleColor(
            style_id="STY-001",
            color_id="COL-001",
            color_code_type="Hex",
            color_code="#000080",
            color_name="Navy Blue"
        )
        
        color2 = StyleColor(
            style_id="STY-001",
            color_id="COL-002",
            color_code_type="Hex",
            color_code="#FFFFFF",
            color_name="White"
        )
        
        db.add_all([color1, color2])
        print("   ✓ Added 2 style color records")
        
        # ============================================================================
        # 15. STYLE SIZE
        # ============================================================================
        print("📦 Adding Style Sizes...")
        style_size1 = StyleSize(
            style_id="STY-001",
            size_id="SIZE-001",
            size_name="Medium"
        )
        
        style_size2 = StyleSize(
            style_id="STY-001",
            size_id="SIZE-002",
            size_name="Large"
        )
        
        db.add_all([style_size1, style_size2])
        print("   ✓ Added 2 style size records")
        
        # ============================================================================
        # 16. STYLE VARIANTS (Auto-generated from colors × sizes)
        # ============================================================================
        print("📦 Adding Style Variants...")
        variant1 = StyleVariant(
            style_variant_id="STY-001-COL-001-SIZE-001",
            style_id="STY-001",
            color_id="COL-001",
            size_id="SIZE-001",
            color_name="Navy Blue",
            size_name="Medium",
            variant_name="Navy Blue / Medium",
            is_active=True
        )
        
        variant2 = StyleVariant(
            style_variant_id="STY-001-COL-001-SIZE-002",
            style_id="STY-001",
            color_id="COL-001",
            size_id="SIZE-002",
            color_name="Navy Blue",
            size_name="Large",
            variant_name="Navy Blue / Large",
            is_active=True
        )
        
        variant3 = StyleVariant(
            style_variant_id="STY-001-COL-002-SIZE-001",
            style_id="STY-001",
            color_id="COL-002",
            size_id="SIZE-001",
            color_name="White",
            size_name="Medium",
            variant_name="White / Medium",
            is_active=True
        )
        
        variant4 = StyleVariant(
            style_variant_id="STY-001-COL-002-SIZE-002",
            style_id="STY-001",
            color_id="COL-002",
            size_id="SIZE-002",
            color_name="White",
            size_name="Large",
            variant_name="White / Large",
            is_active=True
        )
        
        db.add_all([variant1, variant2, variant3, variant4])
        print("   ✓ Added 4 style variant records (2 colors × 2 sizes)")
        
        # ============================================================================
        # 17. CM CALCULATION
        # ============================================================================
        print("📦 Adding CM Calculation...")
        cm1 = CMCalculation(
            cm_id="CM-001",
            style_id="STY-001",
            style_material_id="STYM-001",
            total_material_cost=1.58,  # Sum of material amounts
            average_knitting_minute=5.5,  # SMV
            per_minute_value=0.30,  # Labor rate per minute
            production_cost=1.65,  # 5.5 × 0.30
            overhead_cost=0.50,
            testing_cost=0.15,
            commercial_cost=0.25,
            total_cm=4.13,  # Sum of all costs
            amendment_no="01"
        )
        
        db.add(cm1)
        print("   ✓ Added 1 CM calculation record")
        
        # Commit all changes
        db.commit()
        
        print("\n✅ Sample data seeded successfully!")
        print("\n📊 Summary:")
        print("   - 2 Yarns")
        print("   - 2 Fabrics")
        print("   - 2 Trims")
        print("   - 2 Accessories")
        print("   - 1 Finished Good")
        print("   - 2 Packing Goods")
        print("   - 2 Size Charts")
        print("   - 1 Sample with TNA and Status")
        print("   - 1 Style with Materials, Colors, Sizes")
        print("   - 4 Style Variants (auto-combination)")
        print("   - 1 CM Calculation")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error seeding data: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
