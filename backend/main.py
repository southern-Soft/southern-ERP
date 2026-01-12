"""
Southern Apparels ERP System - Main Application Entry Point
Modular FastAPI Backend
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from core import settings, init_db, setup_logging
import traceback

# Configure logging
logger = setup_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS - Allow all origins for internal ERP
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler for unhandled exceptions
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(
        f"Unhandled exception: {type(exc).__name__}: {str(exc)}\n"
        f"Request: {request.method} {request.url}\n"
        f"Traceback: {traceback.format_exc()}"
    )
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error. Please try again later.",
            "error_type": type(exc).__name__
        }
    )


@app.on_event("startup")
async def startup_event():
    """Initialize all databases on startup"""
    logger.info("Initializing all databases...")
    init_db()
    logger.info("All databases initialized successfully!")
    
    # Run migrations
    try:
        from migrations.add_buyer_name_to_sample_primary_info import add_buyer_name_column
        add_buyer_name_column()
        
        from migrations.add_uom_new_columns import run_migration
        run_migration()
        
        from migrations.seed_workflow_templates import seed_workflow_templates
        seed_workflow_templates()
        
        from migrations.create_color_master import create_color_master
        create_color_master()
        
        from migrations.create_size_chart_system import create_size_chart_system
        create_size_chart_system()
        
        from migrations.create_uom_conversion_system import create_uom_conversion_system
        create_uom_conversion_system()
        
        logger.info("Migrations completed successfully")
    except ImportError as e:
        logger.warning(f"Could not import migration (may be expected): {str(e)}")
    except Exception as e:
        logger.warning(f"Migration warning (may already be applied): {str(e)}")

    # Initialize sample data in users database
    from core.database import SessionLocalUsers
    from init_data import init_sample_data
    db = SessionLocalUsers()
    try:
        init_sample_data(db)
    finally:
        db.close()


@app.get("/")
async def root():
    return {
        "message": "Welcome to Southern Apparels and Holdings ERP API",
        "version": settings.VERSION,
        "docs": "/docs"
    }


# Import routers from modules
from modules.auth import auth_router
from modules.clients import buyers_router, suppliers_router, contacts_router, shipping_router, banking_router
from modules.samples import samples_router, colors_router, size_charts_router
from modules.operations import operations_router
from modules.orders import orders_router
from modules.materials import materials_router
from modules.users import users_router
from modules.health import health_router
from modules.master_data import master_data_router
from modules.merchandiser import merchandiser_router
from modules.settings import settings_router
from modules.notifications import router as notifications_router
from modules.workflows import workflow_router

# Register routers
app.include_router(auth_router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(buyers_router, prefix=f"{settings.API_V1_STR}/buyers", tags=["buyers"])
app.include_router(suppliers_router, prefix=f"{settings.API_V1_STR}/suppliers", tags=["suppliers"])
app.include_router(contacts_router, prefix=f"{settings.API_V1_STR}/contacts", tags=["contacts"])
app.include_router(shipping_router, prefix=f"{settings.API_V1_STR}/shipping", tags=["shipping"])
app.include_router(banking_router, prefix=f"{settings.API_V1_STR}/banking", tags=["banking"])
app.include_router(samples_router, prefix=f"{settings.API_V1_STR}/samples", tags=["samples"])
app.include_router(colors_router, prefix=f"{settings.API_V1_STR}/color-master", tags=["color-master"])
app.include_router(size_charts_router, prefix=f"{settings.API_V1_STR}/size-charts", tags=["size-charts"])
app.include_router(operations_router, prefix=f"{settings.API_V1_STR}/operations", tags=["operations"])
app.include_router(orders_router, prefix=f"{settings.API_V1_STR}/orders", tags=["orders"])
app.include_router(materials_router, prefix=f"{settings.API_V1_STR}", tags=["materials"])
app.include_router(users_router, prefix=f"{settings.API_V1_STR}/users", tags=["users"])
app.include_router(health_router, prefix=f"{settings.API_V1_STR}", tags=["health"])
app.include_router(master_data_router, prefix=f"{settings.API_V1_STR}/master", tags=["master-data"])
app.include_router(merchandiser_router, prefix=f"{settings.API_V1_STR}/merchandiser", tags=["merchandiser"])
app.include_router(settings_router, prefix=f"{settings.API_V1_STR}/settings", tags=["settings"])
app.include_router(notifications_router, prefix=f"{settings.API_V1_STR}/notifications", tags=["notifications"])
app.include_router(workflow_router, prefix=f"{settings.API_V1_STR}", tags=["workflows"])
