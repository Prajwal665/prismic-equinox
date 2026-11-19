"""
=============================================================================
ITMS Intelligent Traffic Management System - E-Challan Backend Microservice
Powered by FastAPI + SQLite + Vahan Database Integration
=============================================================================
Provides REST APIs for:
  - Automatic AI Violation Ingestion & Instant Challan Generation
  - National Vahan Vehicle Registry Lookups
  - Dynamic QR Code & Payment Processing
  - Payment History & Audit Ledger
  - Email Notification Dispatch
  - PDF Notice Metadata & Search / Reports
=============================================================================
"""

import os
import sys
import time
import datetime
from typing import Optional, List
from fastapi import FastAPI, HTTPException, Query, Body, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure yolo_engine directory is on sys.path
sys.path.append(os.path.dirname(__file__))
from database import TrafficDatabase

app = FastAPI(
    title="ITMS National E-Challan & Enforcement API",
    description="Automated violation detection, e-challan issuance, Vahan vehicle database integration, and payment processing.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = TrafficDatabase()

# Standard Fine Rates under Motor Vehicles Amendment Act
VIOLATION_FINE_CATALOG = {
    "Red Light Jump": {"fine": 1000, "section": "Sec 184 MVA"},
    "Overspeeding": {"fine": 2000, "section": "Sec 183 MVA"},
    "Driving Without Helmet": {"fine": 1000, "section": "Sec 194D MVA"},
    "Triple Riding": {"fine": 1000, "section": "Sec 194C MVA"},
    "Stop Line Crossing": {"fine": 500, "section": "Sec 177 MVA"},
    "Wrong Way Driving": {"fine": 5000, "section": "Sec 184(f) MVA"},
    "Mobile Phone While Driving": {"fine": 5000, "section": "Sec 184(c) MVA"},
    "Driving Without Seatbelt": {"fine": 1000, "section": "Sec 194B MVA"}
}

# ---------------------------------------------------------------------------
# Pydantic Schemas
# ---------------------------------------------------------------------------
class AIViolationPayload(BaseModel):
    plate_no: str
    violation_type: str
    detected_speed: Optional[float] = None
    speed_limit: Optional[float] = 50.0
    camera_id: Optional[str] = "CAM-1026"
    location_name: Optional[str] = "Rajiv Chowk Outer Intersection"
    gps_lat: Optional[float] = 28.6280
    gps_lng: Optional[float] = 77.2220
    confidence: Optional[float] = 0.96
    evidence_image_url: Optional[str] = None
    officer_name: Optional[str] = "Automated AI ANPR Camera Node"

class ManualChallanPayload(BaseModel):
    plate_no: str
    violation_type: str
    fine_amount: int
    officer_name: str
    officer_badge: Optional[str] = "DL-TP-OFF"
    location_name: str
    gps_lat: float
    gps_lng: float
    notes: Optional[str] = "Manually issued during interceptor patrol"

class PaymentPayload(BaseModel):
    payment_mode: str = "UPI / Google Pay"
    payer_name: Optional[str] = "Vehicle Owner"

class EmailPayload(BaseModel):
    email: str
    subject: Optional[str] = "Official Traffic E-Challan Notice - Transport Dept"

# ---------------------------------------------------------------------------
# API Routes
# ---------------------------------------------------------------------------
@app.get("/")
def api_root():
    return {
        "system": "ITMS National E-Challan Enforcement Service",
        "status": "ONLINE",
        "timestamp": datetime.datetime.now().isoformat(),
        "endpoints": [
            "/api/challans",
            "/api/challans/{challan_no}",
            "/api/vehicles/lookup/{plate_no}",
            "/api/challans/ai-detect-violation",
            "/api/challans/payment-history",
            "/api/challans/reports"
        ]
    }

@app.get("/api/challans")
def list_challans(
    search: Optional[str] = Query(None, description="Search by plate, owner, location, or challan number"),
    status: Optional[str] = Query("ALL", description="Payment status filter: ALL, UNPAID, PAID, DISPUTED"),
    violation: Optional[str] = Query("ALL", description="Filter by violation type")
):
    """Fetches list of e-challans with search and status filters."""
    results = db.get_challans(search_query=search or "", status=status, violation_type=violation)
    return {
        "count": len(results),
        "challans": results
    }

@app.get("/api/challans/{challan_no}")
def get_challan_detail(challan_no: str):
    """Retrieves full details of a specific challan including vehicle RC data."""
    challan = db.get_challan_by_no(challan_no)
    if not challan:
        raise HTTPException(status_code=404, detail=f"Challan {challan_no} not found")
    return challan

@app.get("/api/vehicles/lookup/{plate_no}")
def lookup_vahan_vehicle(plate_no: str):
    """Looks up vehicle specifications, owner, insurance, and RC validity in Vahan registry."""
    vehicle = db.get_vehicle_details(plate_no)
    if not vehicle:
        # Fallback dynamic registration generator if plate is unknown
        clean_plate = plate_no.strip().upper()
        return {
            "plate_no": clean_plate,
            "owner_name": "Registered Citizen",
            "owner_phone": "+91 98XXX-XXXXX",
            "owner_email": "owner.vehicle@transport.gov.in",
            "owner_address": "Sector 14, Central Capital Enclave, New Delhi",
            "vehicle_class": "Four-Wheeler / Car",
            "maker_model": "Private Motor Vehicle",
            "chassis_no": f"CHAS-GEN-{clean_plate[-4:]}-X",
            "engine_no": f"ENG-GEN-{clean_plate[-4:]}",
            "rc_status": "Active",
            "insurance_valid_upto": "2027-12-31",
            "pucc_valid_upto": "2027-06-30",
            "registration_date": "2022-04-10",
            "is_simulated": True
        }
    return vehicle

@app.post("/api/challans/ai-detect-violation")
def ai_detect_violation(payload: AIViolationPayload):
    """
    Webhook triggered automatically after AI computer vision or YOLOv8 detects a violation.
    Queries the Vahan registry, calculates the fine based on Motor Vehicles Act,
    and automatically issues the official e-challan with dynamic UPI QR code.
    """
    # 1. Look up vehicle in Vahan Database
    vehicle = lookup_vahan_vehicle(payload.plate_no)

    # 2. Determine fine and section
    catalog = VIOLATION_FINE_CATALOG.get(payload.violation_type, {"fine": 1000, "section": "Sec 177 MVA"})
    fine_amount = catalog["fine"]

    # Overspeeding tier adjustment
    if payload.violation_type == "Overspeeding" and payload.detected_speed:
        excess = payload.detected_speed - (payload.speed_limit or 50.0)
        if excess > 30:
            fine_amount = 4000  # Extreme overspeeding

    # 3. Create challan payload
    challan_no = f"DL-2026-CHL-{int(time.time() * 1000 % 1000000):06d}"
    notes = f"AI Autonomous Detection by {payload.camera_id} (Confidence: {payload.confidence*100:.1f}%)."
    if payload.detected_speed:
        notes += f" Recorded speed: {payload.detected_speed:.1f} km/h (Limit: {payload.speed_limit:.0f} km/h)."

    evidence_url = payload.evidence_image_url or "https://images.unsplash.com/photo-1545147986-a9d6f210df77?q=80&w=800&auto=format&fit=crop"

    new_challan_data = {
        "challan_no": challan_no,
        "plate_no": payload.plate_no,
        "owner_name": vehicle["owner_name"],
        "vehicle_class": vehicle["vehicle_class"],
        "maker_model": vehicle["maker_model"],
        "violation_type": f"{payload.violation_type} ({catalog['section']})",
        "violation_speed": payload.detected_speed,
        "speed_limit": payload.speed_limit,
        "fine_amount": fine_amount,
        "officer_name": payload.officer_name,
        "officer_badge": "AI-ANPR-SYS",
        "location_name": payload.location_name,
        "gps_lat": payload.gps_lat,
        "gps_lng": payload.gps_lng,
        "ai_detected": True,
        "ai_confidence": payload.confidence,
        "evidence_image_url": evidence_url,
        "notes": notes
    }

    created = db.create_challan(new_challan_data)
    return {
        "status": "ISSUED",
        "message": f"E-Challan {challan_no} successfully auto-generated via AI detection.",
        "challan": created
    }

@app.post("/api/challans")
def create_manual_challan(payload: ManualChallanPayload):
    """Manually issues an e-challan by an on-ground officer or command center."""
    vehicle = lookup_vahan_vehicle(payload.plate_no)
    challan_no = f"DL-2026-CHL-{int(time.time() * 1000 % 1000000):06d}"

    new_challan_data = {
        "challan_no": challan_no,
        "plate_no": payload.plate_no,
        "owner_name": vehicle["owner_name"],
        "vehicle_class": vehicle["vehicle_class"],
        "maker_model": vehicle["maker_model"],
        "violation_type": payload.violation_type,
        "fine_amount": payload.fine_amount,
        "officer_name": payload.officer_name,
        "officer_badge": payload.officer_badge,
        "location_name": payload.location_name,
        "gps_lat": payload.gps_lat,
        "gps_lng": payload.gps_lng,
        "ai_detected": False,
        "notes": payload.notes
    }

    created = db.create_challan(new_challan_data)
    return created

@app.post("/api/challans/{challan_no}/pay")
def pay_challan(challan_no: str, payload: PaymentPayload):
    """Processes online payment for an e-challan and marks it as settled."""
    result = db.record_challan_payment(
        challan_no=challan_no,
        payment_mode=payload.payment_mode,
        payer_name=payload.payer_name
    )
    if not result:
        raise HTTPException(status_code=404, detail="Challan not found or already settled.")
    return result

@app.post("/api/challans/{challan_no}/email")
def dispatch_email_challan(challan_no: str, payload: EmailPayload):
    """Simulates sending official e-challan legal summons via email with delivery receipt."""
    challan = db.get_challan_by_no(challan_no)
    if not challan:
        raise HTTPException(status_code=404, detail="Challan not found")

    receipt = db.mark_email_sent(challan_no, payload.email)
    return {
        "status": "SENT",
        "message": f"Legal E-Challan summons successfully transmitted to {payload.email}.",
        "receipt": receipt
    }

@app.get("/api/challans/payment-history")
def list_payment_history(limit: int = 50):
    """Returns payment audit ledger of all settled challans."""
    return db.get_payment_history(limit)

@app.get("/api/challans/reports")
def get_enforcement_reports():
    """Returns aggregated analytics on challans, fines collected, and high-frequency locations."""
    return db.get_enforcement_reports()

# ---------------------------------------------------------------------------
# Real-Time WebSocket Connection Manager & Notification Center
# ---------------------------------------------------------------------------
class NotificationConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

ws_manager = NotificationConnectionManager()

class NotificationBroadcastPayload(BaseModel):
    type: str  # emergency, camera_offline, traffic, violation, system
    title: str
    message: str
    priority: Optional[str] = "MEDIUM"
    channels: Optional[List[str]] = ["browser", "push"]
    metadata: Optional[dict] = None

class NotificationSettingsPayload(BaseModel):
    channels: dict
    categories: dict
    recipients: dict
    sound_enabled: Optional[bool] = True
    browser_notifications_permission: Optional[str] = "granted"

@app.websocket("/ws/notifications")
async def websocket_notifications_endpoint(websocket: WebSocket):
    """
    Real-time duplex WebSocket stream for high-priority emergency alerts,
    camera dropouts, congestion alerts, and AI ANPR violation notices.
    """
    await ws_manager.connect(websocket)
    # Send initial greeting & unread count
    unread_count = db.get_unread_notification_count()
    await websocket.send_json({
        "event": "connected",
        "unread_count": unread_count,
        "timestamp": datetime.datetime.now().isoformat()
    })
    try:
        while True:
            data = await websocket.receive_text()
            if data == "ping":
                await websocket.send_text("pong")
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)

@app.get("/api/notifications")
def get_notifications_list(
    limit: int = 100,
    type: Optional[str] = Query("ALL", description="Filter by type: emergency, camera_offline, traffic, violation, system, ALL"),
    unread_only: bool = False,
    channel: Optional[str] = Query("ALL", description="Filter by channel: email, sms, browser, push, ALL"),
    search: Optional[str] = Query(None, description="Search keyword in title or message")
):
    """Fetches historical notifications with filters."""
    items = db.get_notifications(limit=limit, type_filter=type, unread_only=unread_only, channel=channel, search=search)
    unread_count = db.get_unread_notification_count()
    return {
        "count": len(items),
        "unread_count": unread_count,
        "notifications": items
    }

@app.post("/api/notifications")
async def create_and_broadcast_notification(payload: NotificationBroadcastPayload):
    """
    Broadcasts an alert across WebSockets to all connected clients,
    logs to the database, and simulates external Email, SMS, and Push dispatches.
    """
    notif_id = f"NOTIF-{int(time.time()*1000)}"
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    record_data = {
        "notif_id": notif_id,
        "type": payload.type,
        "title": payload.title,
        "message": payload.message,
        "priority": payload.priority,
        "channels": payload.channels or ["browser", "push"],
        "is_read": False,
        "timestamp": now_str,
        "metadata": payload.metadata or {}
    }

    created = db.log_notification(record_data)

    # Broadcast via WebSocket in real time
    await ws_manager.broadcast({
        "event": "new_notification",
        "notification": created
    })

    return {
        "status": "DISPATCHED",
        "notification": created,
        "active_ws_subscribers": len(ws_manager.active_connections)
    }

@app.patch("/api/notifications/{notif_id}/read")
async def mark_notification_as_read(notif_id: str):
    """Marks a single notification as read."""
    success = db.mark_notification_read(notif_id)
    unread_count = db.get_unread_notification_count()
    await ws_manager.broadcast({
        "event": "unread_count_updated",
        "unread_count": unread_count
    })
    return {"status": "SUCCESS", "notif_id": notif_id, "unread_count": unread_count}

@app.post("/api/notifications/mark-all-read")
async def mark_all_notifications_as_read():
    """Marks all notifications as read."""
    db.mark_all_notifications_read()
    await ws_manager.broadcast({
        "event": "unread_count_updated",
        "unread_count": 0
    })
    return {"status": "SUCCESS", "unread_count": 0}

@app.delete("/api/notifications/clear")
async def clear_notifications():
    """Clears all notification history."""
    db.clear_all_notifications()
    await ws_manager.broadcast({
        "event": "unread_count_updated",
        "unread_count": 0
    })
    return {"status": "CLEARED"}

@app.get("/api/notifications/settings")
def get_notification_settings():
    """Returns granular delivery settings for Email, SMS, Push, and Browser channels."""
    return db.get_notification_settings()

@app.post("/api/notifications/settings")
def update_notification_settings(payload: NotificationSettingsPayload):
    """Updates notification channel preferences."""
    saved = db.update_notification_settings(payload.dict())
    return {"status": "UPDATED", "settings": saved}

if __name__ == "__main__":
    import uvicorn
    print("[ITMS E-Challan & Notification API] Starting server on http://localhost:8001 ...")
    uvicorn.run(app, host="0.0.0.0", port=8001)
