from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from db.database import get_db
from db import models
from uuid import UUID
from datetime import datetime

# Define the router
router = APIRouter(prefix="/public", tags=["Public SEO Pages"])

# 1. DYNAMIC SITEMAP (The Map for Bots)
@router.get("/sitemap.xml", response_class=Response)
def generate_sitemap(request: Request, db: Session = Depends(get_db)):
    # Base URL for the public endpoints
    # Uses the request's base URL to ensure it works on localhost AND Render automatically
    base_url = str(request.base_url).rstrip("/") + "/public/business"
    
    # Fetch all published businesses
    businesses = db.query(models.BusinessProfile).all()
    
    xml_content = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml_content.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    # Add Directory Hub
    xml_content.append(f"""
    <url>
        <loc>{str(request.base_url).rstrip("/")}/public/directory</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    """)
    
    # Add Every Business
    for b in businesses:
        xml_content.append(f"""
        <url>
            <loc>{base_url}/{b.business_id}</loc>
            <lastmod>{datetime.utcnow().strftime('%Y-%m-%d')}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>0.8</priority>
        </url>
        """)
    
    xml_content.append('</urlset>')
    return Response(content="".join(xml_content), media_type="application/xml")

# 2. STATIC DIRECTORY (The Hub for Bots)
@router.get("/directory", response_class=HTMLResponse)
def get_public_directory(request: Request, db: Session = Depends(get_db)):
    businesses = db.query(models.BusinessProfile).all()
    
    list_items = []
    for b in businesses:
        link = f"/public/business/{b.business_id}"
        # Truncate description safely
        desc = (b.description[:100] + "...") if (b.description and len(b.description) > 100) else (b.description or "No description")
        
        list_items.append(f"""
            <li style="margin-bottom: 20px; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                <a href="{link}" style="font-size: 1.2em; font-weight: bold; text-decoration: none; color: #007bff;">{b.name}</a>
                <div style="color: #666; font-size: 0.9em;">{b.business_type} • {b.address or 'Online'}</div>
                <p style="margin: 5px 0 0 0; color: #333;">{desc}</p>
            </li>
        """)
    
    html = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>AiVault Business Directory</title>
        <meta name="description" content="Browse local businesses optimized for AI visibility on AiVault.">
    </head>
    <body style="font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1>AiVault Directory</h1>
        <p>Index of all registered businesses.</p>
        <ul style="list-style: none; padding: 0;">
            {"".join(list_items)}
        </ul>
    </body>
    </html>
    """
    return HTMLResponse(content=html)

# 3. INDIVIDUAL BUSINESS MIRROR (The Page Bots Read)
@router.get("/business/{business_id}", response_class=HTMLResponse)
def get_business_seo_page(business_id: UUID, db: Session = Depends(get_db)):
    business = db.query(models.BusinessProfile).filter_by(business_id=business_id).first()
    if not business:
        return HTMLResponse(content="<h1>Business not found</h1>", status_code=404)

    services = db.query(models.Service).filter_by(business_id=business_id).all()
    media = db.query(models.MediaAsset).filter_by(business_id=business_id).all()
    json_feed = db.query(models.JsonLDFeed).filter_by(business_id=business_id).first()
    
    # Prepare Data
    title = f"{business.name} - {business.business_type} in {business.address or 'Local Area'}"
    desc = business.description or f"Visit {business.name} on AiVault."
    image_url = next((m.url for m in media if m.media_type == "image"), "")
    
    # Generate Service HTML
    services_html = "".join([
        f"<li><strong>{s.name}</strong> (${s.price}): {s.description}</li>" 
        for s in services
    ])

    # JSON-LD Injection
    json_ld_script = json_feed.jsonld_data if json_feed else "{}"

    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{title}</title>
        <meta name="description" content="{desc}">
        
        <meta property="og:title" content="{title}">
        <meta property="og:description" content="{desc}">
        <meta property="og:image" content="{image_url}">
        <meta property="og:type" content="business.business">
        
        <script type="application/ld+json">
        {json_ld_script}
        </script>

        <style>
            body {{ font-family: system-ui, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; color: #333; }}
            header {{ border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }}
            h1 {{ margin: 0 0 10px 0; color: #111; }}
            .tag {{ background: #eee; padding: 3px 8px; border-radius: 4px; font-size: 0.8em; }}
            .cta {{ display: inline-block; background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }}
        </style>
    </head>
    <body>
        <header>
            <h1>{business.name}</h1>
            <div><span class="tag">{business.business_type}</span> <span class="tag">{business.address or 'Location N/A'}</span></div>
            <p>{desc}</p>
            {f'<img src="{image_url}" style="max-width:100%; border-radius:8px; margin-top:10px;">' if image_url else ''}
        </header>

        <main>
            <h2>Services</h2>
            <ul>
                {services_html if services else '<li>No specific services listed.</li>'}
            </ul>
            
            <h2>Contact Information</h2>
            <p><strong>Phone:</strong> {business.phone or 'N/A'}</p>
            <p><strong>Website:</strong> <a href="{business.website}">{business.website}</a></p>

            <a href="https://aivault-frontend.onrender.com/directory" class="cta">
                View Interactive Profile
            </a>
        </main>
    </body>
    </html>
    """
    
    return HTMLResponse(content=html_content, status_code=200)