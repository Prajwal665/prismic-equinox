"""
ITMS Database Module for YOLOv8 Analytics Storage
Stores real-time vehicle detections, lane metrics, speeds, density, and queue lengths into SQLite.
"""

import sqlite3
import datetime
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "itms_traffic_analytics.db")

class TrafficDatabase:
    def __init__(self, db_path=DB_PATH):
        self.db_path = db_path
        self.init_db()

    def get_connection(self):
        conn = sqlite3.connect(self.db_path, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

    def init_db(self):
        """Creates the required tables if they don't already exist."""
        with self.get_connection() as conn:
            cursor = conn.cursor()

            # 1. Aggregated Traffic Analytics Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS traffic_analytics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                junction_id TEXT NOT NULL,
                total_vehicles INTEGER NOT NULL,
                cars INTEGER DEFAULT 0,
                bikes INTEGER DEFAULT 0,
                bus INTEGER DEFAULT 0,
                truck INTEGER DEFAULT 0,
                auto INTEGER DEFAULT 0,
                pedestrians INTEGER DEFAULT 0,
                emergency_vehicles INTEGER DEFAULT 0,
                traffic_lights TEXT DEFAULT 'GREEN',
                lane1_count INTEGER DEFAULT 0,
                lane2_count INTEGER DEFAULT 0,
                lane3_count INTEGER DEFAULT 0,
                avg_speed_kmh REAL DEFAULT 0.0,
                density_percent REAL DEFAULT 0.0,
                congestion_level TEXT DEFAULT 'Low',
                queue_length_meters REAL DEFAULT 0.0
            );
            """)

            # 2. Individual Vehicle Track Records Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS vehicle_detections (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                track_id INTEGER NOT NULL,
                class_name TEXT NOT NULL,
                confidence REAL NOT NULL,
                speed_kmh REAL DEFAULT 0.0,
                lane_id INTEGER DEFAULT 1,
                bbox_json TEXT
            );
            """)

            # 3. Emergency Incidents & Priority Logs
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS emergency_incidents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                junction_id TEXT NOT NULL,
                vehicle_type TEXT NOT NULL,
                action_taken TEXT NOT NULL
            );
            """)

            # 4. National Vahan Vehicle Registry Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS vehicle_registry (
                plate_no TEXT PRIMARY KEY,
                owner_name TEXT NOT NULL,
                owner_phone TEXT NOT NULL,
                owner_email TEXT NOT NULL,
                owner_address TEXT NOT NULL,
                vehicle_class TEXT NOT NULL,
                maker_model TEXT NOT NULL,
                chassis_no TEXT NOT NULL,
                engine_no TEXT NOT NULL,
                rc_status TEXT DEFAULT 'Active',
                insurance_valid_upto TEXT NOT NULL,
                pucc_valid_upto TEXT NOT NULL,
                registration_date TEXT NOT NULL
            );
            """)

            # 5. E-Challan Records Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS echallans (
                challan_no TEXT PRIMARY KEY,
                plate_no TEXT NOT NULL,
                owner_name TEXT NOT NULL,
                vehicle_class TEXT NOT NULL,
                maker_model TEXT,
                violation_type TEXT NOT NULL,
                violation_speed REAL DEFAULT NULL,
                speed_limit REAL DEFAULT NULL,
                fine_amount INTEGER NOT NULL,
                officer_name TEXT NOT NULL,
                officer_badge TEXT,
                location_name TEXT NOT NULL,
                gps_lat REAL NOT NULL,
                gps_lng REAL NOT NULL,
                violation_timestamp TEXT NOT NULL,
                due_date TEXT NOT NULL,
                qr_payload TEXT NOT NULL,
                payment_status TEXT DEFAULT 'UNPAID',
                payment_id TEXT,
                payment_date TEXT,
                payment_mode TEXT,
                email_sent INTEGER DEFAULT 0,
                email_sent_at TEXT,
                ai_detected INTEGER DEFAULT 1,
                ai_confidence REAL DEFAULT 0.95,
                evidence_image_url TEXT,
                notes TEXT,
                FOREIGN KEY (plate_no) REFERENCES vehicle_registry (plate_no)
            );
            """)

            # 6. Challan Payment History Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS payment_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                challan_no TEXT NOT NULL,
                transaction_id TEXT NOT NULL UNIQUE,
                amount INTEGER NOT NULL,
                payment_method TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                payer_name TEXT NOT NULL,
                status TEXT DEFAULT 'SUCCESS',
                gateway_ref TEXT NOT NULL,
                receipt_no TEXT NOT NULL,
                FOREIGN KEY (challan_no) REFERENCES echallans (challan_no)
            );
            """)

            # 7. Central Notification History Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS notifications (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                notif_id TEXT NOT NULL UNIQUE,
                type TEXT NOT NULL,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                priority TEXT NOT NULL,
                channels_json TEXT NOT NULL,
                is_read INTEGER DEFAULT 0,
                timestamp TEXT NOT NULL,
                metadata_json TEXT
            );
            """)

            # 8. Notification Channel Settings Table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS notification_settings (
                key TEXT PRIMARY KEY,
                value_json TEXT NOT NULL
            );
            """)

            conn.commit()
            self._seed_initial_data(conn)

    def log_traffic_metrics(self, metrics: dict):
        """Inserts aggregated traffic telemetry into SQLite."""
        timestamp = metrics.get("timestamp", datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO traffic_analytics (
                timestamp, junction_id, total_vehicles, cars, bikes, bus, truck,
                auto, pedestrians, emergency_vehicles, traffic_lights,
                lane1_count, lane2_count, lane3_count, avg_speed_kmh,
                density_percent, congestion_level, queue_length_meters
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                timestamp,
                metrics.get("junction_id", "JUNCTION-DELHI-A1"),
                metrics.get("total_vehicles", 0),
                metrics.get("cars", 0),
                metrics.get("bikes", 0),
                metrics.get("bus", 0),
                metrics.get("truck", 0),
                metrics.get("auto", 0),
                metrics.get("pedestrians", 0),
                metrics.get("emergency_vehicles", 0),
                metrics.get("traffic_lights", "GREEN"),
                metrics.get("lane1_count", 0),
                metrics.get("lane2_count", 0),
                metrics.get("lane3_count", 0),
                round(float(metrics.get("avg_speed_kmh", 0.0)), 1),
                round(float(metrics.get("density_percent", 0.0)), 1),
                metrics.get("congestion_level", "Low"),
                round(float(metrics.get("queue_length_meters", 0.0)), 1)
            ))
            conn.commit()

    def log_vehicle_detection(self, track_id: int, class_name: str, confidence: float, speed_kmh: float, lane_id: int, bbox: list):
        """Logs an individual vehicle detection record."""
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO vehicle_detections (
                timestamp, track_id, class_name, confidence, speed_kmh, lane_id, bbox_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?);
            """, (
                timestamp, track_id, class_name, round(confidence, 3), round(speed_kmh, 1), lane_id, json.dumps(bbox)
            ))
            conn.commit()

    def get_latest_metrics(self):
        """Returns the most recent traffic analytics record."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM traffic_analytics ORDER BY id DESC LIMIT 1;")
            row = cursor.fetchone()
            return dict(row) if row else None

    def get_history(self, limit=50):
        """Returns the recent history of analytics records."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM traffic_analytics ORDER BY id DESC LIMIT ?;", (limit,))
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def _seed_initial_data(self, conn):
        """Seeds vehicle registry and initial sample e-challans if empty."""
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM vehicle_registry;")
        if cursor.fetchone()[0] == 0:
            sample_vehicles = [
                ("DL 01 AB 1234", "Rajesh Kumar Sharma", "+91 98765-43210", "rajesh.sharma@example.com", "Flat 402, Barakhamba Towers, Connaught Place, New Delhi", "Four-Wheeler / Car", "Hyundai Creta SX 1.5", "CHAS-DL-982314-X", "ENG-HYU-55412", "Active", "2027-08-15", "2027-02-10", "2021-03-12"),
                ("MH 12 CD 5678", "Priya Patel", "+91 98112-98765", "priya.patel@example.com", "B-12, Green Park Extension, New Delhi", "Four-Wheeler / Car", "Maruti Suzuki Swift ZXi", "CHAS-MH-441290-A", "ENG-MAR-12093", "Active", "2027-04-20", "2026-12-05", "2022-07-19"),
                ("DL 08 BK 9021", "Vikram Malhotra", "+91 99581-22440", "vikram.m@example.com", "C-88, South Extension Part II, New Delhi", "Two-Wheeler / Motorcycle", "Royal Enfield Classic 350", "CHAS-RE-881230-M", "ENG-RE-99231", "Active", "2026-11-30", "2027-01-15", "2020-11-04"),
                ("HR 26 EQ 9988", "Amit Singhal", "+91 98100-33445", "amit.singhal@example.com", "Tower 3, Cyber City, Gurugram, Haryana", "Four-Wheeler / SUV", "Tata Safari Dark Edition", "CHAS-HR-334112-D", "ENG-TAT-87612", "Active", "2028-02-18", "2027-05-22", "2023-01-25"),
                ("DL 1T 5543", "Sunil Yadav", "+91 98734-11223", "sunil.yadav@example.com", "Gali No. 4, Shakarpur, East Delhi", "Commercial Auto", "Bajaj RE Compact 4S Auto", "CHAS-BAJ-110294-T", "ENG-BAJ-44321", "Active", "2026-09-12", "2026-11-18", "2019-06-14"),
                ("DL 1A 8899", "Delhi Urban Fleet Logistics", "+91 98210-99881", "fleet@delhicargo.in", "Okhla Industrial Area Phase-II, New Delhi", "Commercial Truck / HMV", "Tata 407 Gold SFC", "CHAS-TAT-994321-K", "ENG-TAT-55410", "Active", "2027-01-10", "2026-10-30", "2018-09-08")
            ]
            cursor.executemany("""
            INSERT INTO vehicle_registry (
                plate_no, owner_name, owner_phone, owner_email, owner_address,
                vehicle_class, maker_model, chassis_no, engine_no, rc_status,
                insurance_valid_upto, pucc_valid_upto, registration_date
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, sample_vehicles)

        cursor.execute("SELECT COUNT(*) FROM echallans;")
        if cursor.fetchone()[0] == 0:
            sample_challans = [
                (
                    "DL-2026-CHL-10928", "DL 01 AB 1234", "Rajesh Kumar Sharma", "Four-Wheeler / Car", "Hyundai Creta SX 1.5",
                    "Red Light Jump (Violation of Sec 184 MVA)", None, None, 1000,
                    "Automated AI Camera Node #CAM-1026", "AI-ANPR-SYS",
                    "Rajiv Chowk East Portal (Outer Ring)", 28.6328, 77.2195,
                    "2026-10-12 14:22:15", "2026-12-12",
                    "upi://pay?pa=echallan.traffic@gov&pn=DelhiTrafficPolice&am=1000&tr=DL-2026-CHL-10928",
                    "UNPAID", None, None, None, 1, "2026-10-12 14:23:00", 1, 0.98,
                    "https://images.unsplash.com/photo-1545147986-a9d6f210df77?q=80&w=800&auto=format&fit=crop",
                    "Captured via YOLOv8 Junction Camera: Vehicle crossed red signal stop line by 8.4 meters during red phase."
                ),
                (
                    "DL-2026-CHL-10929", "MH 12 CD 5678", "Priya Patel", "Four-Wheeler / Car", "Maruti Suzuki Swift ZXi",
                    "Overspeeding (Sec 183 MVA)", 76.5, 50.0, 2000,
                    "Insp. R. Sharma", "DL-TP-409",
                    "Barakhamba Road Junction", 28.6240, 77.2380,
                    "2026-10-12 11:15:30", "2026-12-12",
                    "upi://pay?pa=echallan.traffic@gov&pn=DelhiTrafficPolice&am=2000&tr=DL-2026-CHL-10929",
                    "UNPAID", None, None, None, 1, "2026-10-12 11:16:10", 1, 0.95,
                    "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop",
                    "Speed estimation: 76.5 km/h in a 50 km/h restricted school zone."
                ),
                (
                    "DL-2026-CHL-10870", "DL 08 BK 9021", "Vikram Malhotra", "Two-Wheeler / Motorcycle", "Royal Enfield Classic 350",
                    "Driving Without Helmet (Sec 194D MVA)", None, None, 1000,
                    "Sub-Inspector Verma", "DL-TP-812",
                    "Connaught Place Radial 2", 28.6315, 77.2167,
                    "2026-10-11 16:40:05", "2026-12-11",
                    "upi://pay?pa=echallan.traffic@gov&pn=DelhiTrafficPolice&am=1000&tr=DL-2026-CHL-10870",
                    "PAID", "TXN-UPI-994821039", "2026-10-11 17:05:22", "UPI / Google Pay", 1, "2026-10-11 16:41:00", 1, 0.96,
                    "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop",
                    "AI Helmet Detection failure. Rider detected with no safety headgear."
                ),
                (
                    "DL-2026-CHL-10855", "HR 26 EQ 9988", "Amit Singhal", "Four-Wheeler / SUV", "Tata Safari Dark Edition",
                    "Stop Line Crossing (Sec 177 MVA)", None, None, 500,
                    "Automated AI Camera Node #CAM-1025", "AI-ANPR-SYS",
                    "ITO Major Junction", 28.6290, 77.2410,
                    "2026-10-10 09:20:18", "2026-12-10",
                    "upi://pay?pa=echallan.traffic@gov&pn=DelhiTrafficPolice&am=500&tr=DL-2026-CHL-10855",
                    "PAID", "TXN-NETBANK-772109", "2026-10-10 10:12:44", "Net Banking / SBI", 1, "2026-10-10 09:21:00", 1, 0.94,
                    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop",
                    "Vehicle encroached on pedestrian zebra crossing during red light phase."
                )
            ]
            cursor.executemany("""
            INSERT INTO echallans (
                challan_no, plate_no, owner_name, vehicle_class, maker_model,
                violation_type, violation_speed, speed_limit, fine_amount,
                officer_name, officer_badge, location_name, gps_lat, gps_lng,
                violation_timestamp, due_date, qr_payload, payment_status,
                payment_id, payment_date, payment_mode, email_sent, email_sent_at,
                ai_detected, ai_confidence, evidence_image_url, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, sample_challans)

            # Sample payment history
            cursor.execute("""
            INSERT INTO payment_history (
                challan_no, transaction_id, amount, payment_method, timestamp, payer_name, status, gateway_ref, receipt_no
            ) VALUES 
            ('DL-2026-CHL-10870', 'TXN-UPI-994821039', 1000, 'UPI / Google Pay', '2026-10-11 17:05:22', 'Vikram Malhotra', 'SUCCESS', 'RAZORPAY_SANDBOX_01', 'RCPT-2026-8812'),
            ('DL-2026-CHL-10855', 'TXN-NETBANK-772109', 500, 'Net Banking / SBI', '2026-10-10 10:12:44', 'Amit Singhal', 'SUCCESS', 'SBI_EPAY_GATEWAY_09', 'RCPT-2026-8801');
            """)

        cursor.execute("SELECT COUNT(*) FROM notifications;")
        if cursor.fetchone()[0] == 0:
            sample_notifs = [
                (
                    "NOTIF-EMG-01", "emergency", "🚨 Green Corridor Preemption Active",
                    "Ambulance #AMB-108 departing AIIMS Trauma Center en route to Rajiv Chowk. Signals preempted to Green Wave.",
                    "CRITICAL", json.dumps(["email", "sms", "browser", "push"]), 0, "2026-10-12 18:45:10",
                    json.dumps({"ambulance_id": "AMB-108", "eta_mins": 4, "corridor": "AIIMS -> Ring Road -> CP"})
                ),
                (
                    "NOTIF-CAM-02", "camera_offline", "📷 CCTV Camera Stream Offline",
                    "Node CAM-1027 (Yamuna Expressway Toll 09) lost ping response. Stream degraded to 0 FPS.",
                    "HIGH", json.dumps(["email", "push"]), 0, "2026-10-12 18:30:22",
                    json.dumps({"camera_id": "CAM-1027", "ip": "192.168.1.127", "port": 554})
                ),
                (
                    "NOTIF-TRAF-03", "traffic", "⚠️ Severe Traffic Congestion Alert",
                    "ITO Major Junction congestion level reached 92% density with a 45.2m estimated vehicle queue.",
                    "HIGH", json.dumps(["sms", "browser", "push"]), 0, "2026-10-12 18:15:00",
                    json.dumps({"junction_id": "JUNCTION-ITO-01", "density": 92.0, "queue_m": 45.2})
                ),
                (
                    "NOTIF-VIOL-04", "violation", "🛑 ANPR Red Light Jump Detected",
                    "Vehicle DL 01 AB 1234 jumped red light at Rajiv Chowk East Portal. E-Challan #DL-2026-CHL-10928 auto-issued (₹1,000).",
                    "MEDIUM", json.dumps(["email", "sms", "push"]), 1, "2026-10-12 14:23:00",
                    json.dumps({"plate_no": "DL 01 AB 1234", "challan_no": "DL-2026-CHL-10928", "fine": 1000})
                ),
                (
                    "NOTIF-SYS-05", "system", "⚡ YOLOv8 Neural Engine Heartbeat",
                    "YOLOv8 vision inference operating nominally at 30 FPS. SQLite analytics persistence verified.",
                    "LOW", json.dumps(["browser"]), 1, "2026-10-12 14:00:00",
                    json.dumps({"engine": "YOLOv8n", "fps": 30, "db_sync": "OK"})
                )
            ]
            cursor.executemany("""
            INSERT INTO notifications (
                notif_id, type, title, message, priority, channels_json, is_read, timestamp, metadata_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, sample_notifs)

        cursor.execute("SELECT COUNT(*) FROM notification_settings;")
        if cursor.fetchone()[0] == 0:
            default_settings = {
                "channels": {
                    "email": True,
                    "sms": True,
                    "browser": True,
                    "push": True
                },
                "categories": {
                    "emergency": True,
                    "camera_offline": True,
                    "traffic": True,
                    "violation": True,
                    "system": True
                },
                "recipients": {
                    "email": "controlroom@itms.gov.in, officer.traffic@delhipolice.gov.in",
                    "phone": "+91 98712-00409, +91 98112-98765"
                },
                "sound_enabled": True,
                "browser_notifications_permission": "granted"
            }
            cursor.execute("""
            INSERT INTO notification_settings (key, value_json)
            VALUES ('config', ?);
            """, (json.dumps(default_settings),))

    # -----------------------------------------------------------------------
    # E-Challan & Vehicle Registry Methods
    # -----------------------------------------------------------------------
    def get_vehicle_details(self, plate_no: str):
        """Looks up vehicle specifications and registered owner in Vahan DB."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM vehicle_registry WHERE UPPER(REPLACE(plate_no, ' ', '')) = UPPER(REPLACE(?, ' ', ''));", (plate_no,))
            row = cursor.fetchone()
            if row:
                return dict(row)
            return None

    def get_challans(self, search_query="", status="", violation_type=""):
        """Fetches challan list with optional filtering and search."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            query = "SELECT * FROM echallans WHERE 1=1"
            params = []

            if status and status.upper() != "ALL":
                query += " AND payment_status = ?"
                params.append(status.upper())

            if violation_type and violation_type.upper() != "ALL":
                query += " AND violation_type LIKE ?"
                params.append(f"%{violation_type}%")

            if search_query:
                query += " AND (challan_no LIKE ? OR plate_no LIKE ? OR owner_name LIKE ? OR location_name LIKE ?)"
                q = f"%{search_query}%"
                params.extend([q, q, q, q])

            query += " ORDER BY violation_timestamp DESC;"
            cursor.execute(query, params)
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def get_challan_by_no(self, challan_no: str):
        """Retrieves a single challan with vehicle details."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM echallans WHERE challan_no = ?;", (challan_no,))
            row = cursor.fetchone()
            if not row:
                return None
            data = dict(row)
            # Fetch vehicle info
            vehicle = self.get_vehicle_details(data["plate_no"])
            data["vehicle_details"] = vehicle
            return data

    def create_challan(self, data: dict):
        """Issues a new e-challan and stores it in the database."""
        challan_no = data.get("challan_no") or f"DL-2026-CHL-{int(time.time() % 100000):05d}"
        now_str = data.get("violation_timestamp") or datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        due_str = data.get("due_date") or (datetime.datetime.now() + datetime.timedelta(days=60)).strftime("%Y-%m-%d")
        qr_payload = data.get("qr_payload") or f"upi://pay?pa=echallan.traffic@gov&pn=DelhiTrafficPolice&am={data.get('fine_amount', 1000)}&tr={challan_no}"

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO echallans (
                challan_no, plate_no, owner_name, vehicle_class, maker_model,
                violation_type, violation_speed, speed_limit, fine_amount,
                officer_name, officer_badge, location_name, gps_lat, gps_lng,
                violation_timestamp, due_date, qr_payload, payment_status,
                ai_detected, ai_confidence, evidence_image_url, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'UNPAID', ?, ?, ?, ?);
            """, (
                challan_no,
                data.get("plate_no", "DL 01 UNKNOWN"),
                data.get("owner_name", "Registered Owner"),
                data.get("vehicle_class", "Four-Wheeler / Car"),
                data.get("maker_model", "Motor Vehicle"),
                data.get("violation_type", "Traffic Rule Violation"),
                data.get("violation_speed"),
                data.get("speed_limit"),
                data.get("fine_amount", 1000),
                data.get("officer_name", "Automated AI ANPR Camera Node"),
                data.get("officer_badge", "AI-ANPR-SYS"),
                data.get("location_name", "Connaught Place Central Grid"),
                data.get("gps_lat", 28.6315),
                data.get("gps_lng", 77.2167),
                now_str,
                due_str,
                qr_payload,
                1 if data.get("ai_detected", True) else 0,
                data.get("ai_confidence", 0.95),
                data.get("evidence_image_url", "https://images.unsplash.com/photo-1545147986-a9d6f210df77?q=80&w=800&auto=format&fit=crop"),
                data.get("notes", "Auto-generated upon AI neural detection.")
            ))
            conn.commit()

        return self.get_challan_by_no(challan_no)

    def record_challan_payment(self, challan_no: str, payment_mode="UPI / Net Banking", payer_name="Owner"):
        """Marks a challan as paid and logs the transaction record."""
        txn_id = f"TXN-ITMS-{int(time.time()*1000)}"
        rcpt_no = f"RCPT-{datetime.datetime.now().strftime('%Y%m')}-{int(time.time() % 10000):04d}"
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        with self.get_connection() as conn:
            cursor = conn.cursor()
            # Fetch fine amount
            cursor.execute("SELECT fine_amount, owner_name FROM echallans WHERE challan_no = ?;", (challan_no,))
            row = cursor.fetchone()
            if not row:
                return None
            fine_amount = row[0]
            owner = payer_name if payer_name != "Owner" else row[1]

            cursor.execute("""
            UPDATE echallans
            SET payment_status = 'PAID', payment_id = ?, payment_date = ?, payment_mode = ?
            WHERE challan_no = ?;
            """, (txn_id, now_str, payment_mode, challan_no))

            cursor.execute("""
            INSERT INTO payment_history (
                challan_no, transaction_id, amount, payment_method, timestamp, payer_name, status, gateway_ref, receipt_no
            ) VALUES (?, ?, ?, ?, ?, ?, 'SUCCESS', 'ITMS_PAYMENT_GATEWAY', ?);
            """, (challan_no, txn_id, fine_amount, payment_mode, now_str, owner, rcpt_no))

            conn.commit()

        return {
            "status": "SUCCESS",
            "challan_no": challan_no,
            "transaction_id": txn_id,
            "receipt_no": rcpt_no,
            "amount": fine_amount,
            "payment_date": now_str,
            "payment_mode": payment_mode
        }

    def mark_email_sent(self, challan_no: str, email_to: str):
        """Logs that an e-challan notice email was successfully dispatched."""
        now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            UPDATE echallans
            SET email_sent = 1, email_sent_at = ?
            WHERE challan_no = ?;
            """, (now_str, challan_no))
            conn.commit()
        return {"status": "DISPATCHED", "challan_no": challan_no, "email": email_to, "timestamp": now_str}

    def get_payment_history(self, limit=50):
        """Returns cleared payment transactions."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM payment_history ORDER BY id DESC LIMIT ?;", (limit,))
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def get_enforcement_reports(self):
        """Aggregates enforcement KPIs, violation categories, and revenue collections."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*), COALESCE(SUM(fine_amount), 0) FROM echallans;")
            total_count, total_levied = cursor.fetchone()

            cursor.execute("SELECT COUNT(*), COALESCE(SUM(fine_amount), 0) FROM echallans WHERE payment_status = 'PAID';")
            paid_count, total_collected = cursor.fetchone()

            cursor.execute("SELECT COUNT(*), COALESCE(SUM(fine_amount), 0) FROM echallans WHERE payment_status = 'UNPAID';")
            unpaid_count, pending_penalties = cursor.fetchone()

            cursor.execute("""
            SELECT violation_type, COUNT(*) as count, SUM(fine_amount) as total_fine
            FROM echallans
            GROUP BY violation_type
            ORDER BY count DESC;
            """)
            violation_breakdown = [dict(r) for r in cursor.fetchall()]

            cursor.execute("""
            SELECT location_name, COUNT(*) as incident_count
            FROM echallans
            GROUP BY location_name
            ORDER BY incident_count DESC
            LIMIT 5;
            """)
            hotspots = [dict(r) for r in cursor.fetchall()]

            return {
                "total_challans": total_count,
                "total_levied_amount": total_levied,
                "total_collected_amount": total_collected,
                "pending_amount": pending_penalties,
                "paid_challans": paid_count,
                "unpaid_challans": unpaid_count,
                "violation_breakdown": violation_breakdown,
                "hotspots": hotspots
            }

    # -----------------------------------------------------------------------
    # Notification Center Methods
    # -----------------------------------------------------------------------
    def log_notification(self, data: dict):
        """Inserts a new notification alert into SQLite."""
        notif_id = data.get("notif_id") or f"NOTIF-{int(time.time()*1000)}"
        timestamp = data.get("timestamp") or datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        channels = data.get("channels") or ["browser", "push"]

        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT OR REPLACE INTO notifications (
                notif_id, type, title, message, priority, channels_json, is_read, timestamp, metadata_json
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);
            """, (
                notif_id,
                data.get("type", "system"),
                data.get("title", "ITMS System Notification"),
                data.get("message", ""),
                data.get("priority", "MEDIUM"),
                json.dumps(channels),
                1 if data.get("is_read", False) else 0,
                timestamp,
                json.dumps(data.get("metadata", {}))
            ))
            conn.commit()

        return self.get_notification_by_id(notif_id)

    def get_notification_by_id(self, notif_id: str):
        """Retrieves single notification by ID."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM notifications WHERE notif_id = ?;", (notif_id,))
            row = cursor.fetchone()
            if not row:
                return None
            res = dict(row)
            res["channels"] = json.loads(res.get("channels_json") or "[]")
            res["metadata"] = json.loads(res.get("metadata_json") or "{}")
            return res

    def get_notifications(self, limit=100, type_filter=None, unread_only=False, channel=None, search=None):
        """Fetches notification history with filtering."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            query = "SELECT * FROM notifications WHERE 1=1"
            params = []

            if type_filter and type_filter.upper() != "ALL":
                query += " AND type = ?"
                params.append(type_filter.lower())

            if unread_only:
                query += " AND is_read = 0"

            if channel and channel.upper() != "ALL":
                query += " AND channels_json LIKE ?"
                params.append(f"%{channel.lower()}%")

            if search:
                query += " AND (title LIKE ? OR message LIKE ?)"
                q = f"%{search}%"
                params.extend([q, q])

            query += " ORDER BY id DESC LIMIT ?;"
            params.append(limit)

            cursor.execute(query, params)
            rows = cursor.fetchall()

            res = []
            for r in rows:
                item = dict(r)
                item["channels"] = json.loads(item.get("channels_json") or "[]")
                item["metadata"] = json.loads(item.get("metadata_json") or "{}")
                res.append(item)
            return res

    def mark_notification_read(self, notif_id: str):
        """Marks a notification as read."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE notifications SET is_read = 1 WHERE notif_id = ?;", (notif_id,))
            conn.commit()
            return True

    def mark_all_notifications_read(self):
        """Marks all notifications as read."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("UPDATE notifications SET is_read = 1;")
            conn.commit()
            return True

    def clear_all_notifications(self):
        """Deletes all notification records."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM notifications;")
            conn.commit()
            return True

    def get_unread_notification_count(self):
        """Returns total unread count."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM notifications WHERE is_read = 0;")
            return cursor.fetchone()[0]

    def get_notification_settings(self):
        """Returns notification preferences and channel configurations."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT value_json FROM notification_settings WHERE key = 'config';")
            row = cursor.fetchone()
            if row:
                return json.loads(row[0])
            return {}

    def update_notification_settings(self, new_settings: dict):
        """Updates notification preferences and channel configurations."""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT OR REPLACE INTO notification_settings (key, value_json)
            VALUES ('config', ?);
            """, (json.dumps(new_settings),))
            conn.commit()
            return new_settings

if __name__ == "__main__":
    db = TrafficDatabase()
    print("Database initialized successfully at:", db.db_path)
    print("Seeded Challans:", len(db.get_challans()))
    print("Seeded Notifications:", len(db.get_notifications()))
    print("Unread Notifications:", db.get_unread_notification_count())
