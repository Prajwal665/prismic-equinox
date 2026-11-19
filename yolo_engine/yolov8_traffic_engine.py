"""
=============================================================================
ITMS Intelligent Traffic Management System - YOLOv8 Neural Engine
Powered by Ultralytics YOLOv8 + OpenCV + SQLite + FastAPI
=============================================================================
Detects:
  - Cars, Bikes (Motorcycles & Bicycles), Bus, Truck, Auto (Auto-Rickshaws),
    Pedestrians, Emergency Vehicles (Ambulance/Police/Fire), Traffic Lights
Calculates:
  - Bounding Boxes & Confidence Scores
  - Active & Total Vehicle Count
  - Per-Class Breakdown
  - Lane Count & Polygon ROI Allocation (Lane 1, Lane 2, Lane 3)
  - Traffic Density (%) & Congestion Level Classification
  - Queue Length (meters)
  - Frame-to-Frame Centroid Speed Estimation (km/h)
Stores:
  - Analytics periodically stored in SQLite database (itms_traffic_analytics.db)
Exposes:
  - FastAPI endpoints for real-time React dashboard integration
=============================================================================
"""

import cv2
import numpy as np
import time
import math
import argparse
import threading
import json
import os
from collections import defaultdict, deque

try:
    from ultralytics import YOLO
    ULTRALYTICS_AVAILABLE = True
except ImportError:
    ULTRALYTICS_AVAILABLE = False
    print("Warning: ultralytics package not found. Running with high-fidelity vision simulation fallback.")

try:
    from fastapi import FastAPI
    from fastapi.middleware.cors import CORSMiddleware
    import uvicorn
    FASTAPI_AVAILABLE = True
except ImportError:
    FASTAPI_AVAILABLE = False

from database import TrafficDatabase

# ---------------------------------------------------------------------------
# Constants & Class Mappings
# ---------------------------------------------------------------------------
# Standard COCO classes mapped into ITMS Urban Categories:
# 0: person, 1: bicycle, 2: car, 3: motorcycle, 5: bus, 7: truck, 9: traffic light
COCO_CLASS_MAP = {
    0: "pedestrian",
    1: "bike",
    2: "car",
    3: "bike",
    5: "bus",
    7: "truck",
    9: "traffic_light"
}

CLASS_COLORS = {
    "car": (255, 120, 0),          # Sky Blue (BGR)
    "bike": (0, 215, 255),         # Yellow / Gold
    "bus": (255, 0, 128),          # Purple
    "truck": (0, 140, 255),        # Orange
    "auto": (0, 255, 255),         # Bright Yellow
    "pedestrian": (0, 255, 0),     # Bright Green
    "emergency": (0, 0, 255),      # Bright Red (Pulsing)
    "traffic_light": (200, 200, 0) # Cyan
}

# ---------------------------------------------------------------------------
# YOLOv8 Traffic Engine Class
# ---------------------------------------------------------------------------
class YOLOTrafficEngine:
    def __init__(self, model_weight="yolov8n.pt", source=0, meters_per_pixel=0.05, fps=30):
        self.source = source
        self.meters_per_pixel = meters_per_pixel
        self.fps = fps
        self.db = TrafficDatabase()

        # Load YOLO model
        if ULTRALYTICS_AVAILABLE:
            print(f"[YOLOv8 Engine] Loading model weights: {model_weight}")
            self.model = YOLO(model_weight)
        else:
            self.model = None

        # Tracking state
        self.track_history = defaultdict(lambda: deque(maxlen=30))
        self.speed_history = defaultdict(lambda: deque(maxlen=5))
        self.cumulative_vehicles = set()

        # Metrics state (Thread-safe)
        self.lock = threading.Lock()
        self.current_metrics = {
            "timestamp": time.strftime("%H:%M:%S"),
            "junction_id": "JUNCTION-DELHI-A1",
            "total_vehicles": 0,
            "cars": 0,
            "bikes": 0,
            "bus": 0,
            "truck": 0,
            "auto": 0,
            "pedestrians": 0,
            "emergency_vehicles": 0,
            "traffic_lights": "GREEN",
            "lane1_count": 0,
            "lane2_count": 0,
            "lane3_count": 0,
            "avg_speed_kmh": 42.0,
            "density_percent": 38.0,
            "congestion_level": "Moderate",
            "queue_length_meters": 14.5,
            "detections": []
        }

        # Multi-Lane Polygon Regions of Interest (Normalized 0.0 - 1.0)
        self.lane_polygons_norm = {
            1: np.array([[0.05, 0.95], [0.35, 0.95], [0.42, 0.40], [0.25, 0.40]], np.float32), # Lane 1
            2: np.array([[0.36, 0.95], [0.65, 0.95], [0.58, 0.40], [0.43, 0.40]], np.float32), # Lane 2
            3: np.array([[0.66, 0.95], [0.95, 0.95], [0.75, 0.40], [0.59, 0.40]], np.float32)  # Lane 3
        }

        self.last_db_log_time = time.time()
        self.is_running = False

    def classify_detected_object(self, cls_id: int, bbox: list, frame: np.ndarray) -> str:
        """
        Classifies object into one of the 8 target classes:
        Cars, Bikes, Bus, Truck, Auto, Pedestrians, Emergency Vehicles, Traffic Lights.
        Incorporates aspect ratio and color heuristics for Indian Auto-rickshaws and Emergency Vehicles.
        """
        x1, y1, x2, y2 = bbox
        w = max(1, x2 - x1)
        h = max(1, y2 - y1)
        aspect_ratio = float(w) / float(h)

        base_class = COCO_CLASS_MAP.get(cls_id, "car")

        # 1. Emergency Vehicle Heuristic (Check for flashing red/blue beacon on roof)
        if base_class in ["car", "bus", "truck"]:
            try:
                roof_crop = frame[max(0, y1):min(frame.shape[0], y1 + int(h * 0.25)), max(0, x1):min(frame.shape[1], x2)]
                if roof_crop.size > 0:
                    hsv = cv2.cvtColor(roof_crop, cv2.COLOR_BGR2HSV)
                    red_mask = cv2.inRange(hsv, (0, 100, 100), (10, 255, 255))
                    blue_mask = cv2.inRange(hsv, (100, 150, 100), (130, 255, 255))
                    emergency_pixels = cv2.countNonZero(red_mask) + cv2.countNonZero(blue_mask)
                    if emergency_pixels > (roof_crop.shape[0] * roof_crop.shape[1] * 0.15):
                        return "emergency"
            except Exception:
                pass

        # 2. Auto-Rickshaw (Three-Wheeler) Heuristic:
        # Smaller than car, compact aspect ratio (approx 0.8 - 1.1), yellow/green body
        if base_class == "car" and (0.75 < aspect_ratio < 1.15) and (w * h < 45000):
            try:
                crop = frame[max(0, y1):min(frame.shape[0], y2), max(0, x1):min(frame.shape[1], x2)]
                if crop.size > 0:
                    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
                    yellow_mask = cv2.inRange(hsv, (20, 100, 100), (35, 255, 255))
                    green_mask = cv2.inRange(hsv, (35, 80, 80), (85, 255, 255))
                    auto_pixels = cv2.countNonZero(yellow_mask) + cv2.countNonZero(green_mask)
                    if auto_pixels > (crop.shape[0] * crop.shape[1] * 0.12):
                        return "auto"
            except Exception:
                pass

        return base_class

    def detect_traffic_light_state(self, bbox: list, frame: np.ndarray) -> str:
        """Determines whether a traffic light is RED, YELLOW, or GREEN."""
        x1, y1, x2, y2 = bbox
        crop = frame[max(0, y1):min(frame.shape[0], y2), max(0, x1):min(frame.shape[1], x2)]
        if crop.size == 0:
            return "GREEN"

        hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
        red_mask1 = cv2.inRange(hsv, (0, 70, 50), (10, 255, 255))
        red_mask2 = cv2.inRange(hsv, (170, 70, 50), (180, 255, 255))
        red_pixels = cv2.countNonZero(red_mask1) + cv2.countNonZero(red_mask2)

        yellow_pixels = cv2.countNonZero(cv2.inRange(hsv, (15, 70, 50), (35, 255, 255)))
        green_pixels = cv2.countNonZero(cv2.inRange(hsv, (40, 70, 50), (90, 255, 255)))

        if red_pixels > yellow_pixels and red_pixels > green_pixels:
            return "RED"
        elif yellow_pixels > green_pixels:
            return "YELLOW"
        return "GREEN"

    def assign_lane(self, centroid: tuple, frame_shape: tuple) -> int:
        """Assigns a vehicle centroid to Lane 1, Lane 2, or Lane 3."""
        h, w = frame_shape[:2]
        cx, cy = centroid

        for lane_id, norm_poly in self.lane_polygons_norm.items():
            poly_pixels = np.array([[int(p[0] * w), int(p[1] * h)] for p in norm_poly], np.int32)
            if cv2.pointPolygonTest(poly_pixels, (float(cx), float(cy)), False) >= 0:
                return lane_id

        # Fallback based on X coordinate
        if cx < w * 0.35:
            return 1
        elif cx < w * 0.65:
            return 2
        return 3

    def estimate_speed(self, track_id: int, current_pos: tuple) -> float:
        """Calculates instantaneous vehicle speed in km/h using centroid displacement."""
        history = self.track_history[track_id]
        if len(history) < 2:
            return 35.0  # Initial baseline default speed

        prev_pos, prev_time = history[-2]
        curr_pos, curr_time = history[-1]

        dt = max(0.001, curr_time - prev_time)
        dx = (curr_pos[0] - prev_pos[0]) * self.meters_per_pixel
        dy = (curr_pos[1] - prev_pos[1]) * self.meters_per_pixel
        distance_meters = math.sqrt(dx * dx + dy * dy)

        speed_kmh = (distance_meters / dt) * 3.6

        # Cap within realistic urban boundaries
        speed_kmh = max(0.0, min(120.0, speed_kmh))

        # Exponential moving average filter
        speeds = self.speed_history[track_id]
        speeds.append(speed_kmh)
        return float(np.mean(speeds))

    def process_frame(self, frame: np.ndarray) -> np.ndarray:
        """Main inference and processing pipeline for each video frame."""
        h, w = frame.shape[:2]
        current_time = time.time()

        class_counts = {
            "cars": 0, "bikes": 0, "bus": 0, "truck": 0,
            "auto": 0, "pedestrians": 0, "emergency_vehicles": 0, "traffic_lights": "GREEN"
        }
        lane_counts = {1: 0, 2: 0, 3: 0}
        speeds_list = []
        stationary_distances = []
        bounding_box_detections = []

        # Draw Lanes on Screen
        for lane_id, norm_poly in self.lane_polygons_norm.items():
            pts = np.array([[int(p[0] * w), int(p[1] * h)] for p in norm_poly], np.int32)
            cv2.polylines(frame, [pts], isClosed=True, color=(100, 100, 255), thickness=1)
            cv2.putText(frame, f"LANE {lane_id}", (pts[0][0] + 10, pts[0][1] - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (100, 200, 255), 1)

        # Stop line for queue calculation (e.g. at 85% height)
        stop_line_y = int(h * 0.85)
        cv2.line(frame, (0, stop_line_y), (w, stop_line_y), (0, 0, 255), 2)
        cv2.putText(frame, "STOP LINE", (10, stop_line_y - 8), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (0, 0, 255), 1)

        if self.model and ULTRALYTICS_AVAILABLE:
            # Run YOLOv8 Tracking with ByteTrack
            results = self.model.track(
                frame,
                persist=True,
                tracker="bytetrack.yaml",
                classes=[0, 1, 2, 3, 5, 7, 9],  # Relevant traffic classes
                verbose=False
            )

            if results and len(results) > 0 and results[0].boxes is not None:
                boxes = results[0].boxes
                for box in boxes:
                    cls_id = int(box.cls[0].cpu().numpy())
                    conf = float(box.conf[0].cpu().numpy())
                    track_id = int(box.id[0].cpu().numpy()) if box.id is not None else 0

                    if conf < 0.25:
                        continue

                    xyxy = box.xyxy[0].cpu().numpy().astype(int)
                    x1, y1, x2, y2 = xyxy
                    centroid = (int((x1 + x2) / 2), int((y1 + y2) / 2))

                    # Classify into specific ITMS classes
                    class_name = self.classify_detected_object(cls_id, [x1, y1, x2, y2], frame)

                    # Update counts
                    if class_name == "car": class_counts["cars"] += 1
                    elif class_name == "bike": class_counts["bikes"] += 1
                    elif class_name == "bus": class_counts["bus"] += 1
                    elif class_name == "truck": class_counts["truck"] += 1
                    elif class_name == "auto": class_counts["auto"] += 1
                    elif class_name == "pedestrian": class_counts["pedestrians"] += 1
                    elif class_name == "emergency": class_counts["emergency_vehicles"] += 1
                    elif class_name == "traffic_light":
                        light_state = self.detect_traffic_light_state([x1, y1, x2, y2], frame)
                        class_counts["traffic_lights"] = light_state

                    # Lane Assignment
                    lane_id = self.assign_lane(centroid, frame.shape)
                    lane_counts[lane_id] += 1

                    # Speed Calculation
                    if track_id > 0:
                        self.cumulative_vehicles.add(track_id)
                        self.track_history[track_id].append((centroid, current_time))
                        speed = self.estimate_speed(track_id, centroid)
                    else:
                        speed = 35.0

                    speeds_list.append(speed)

                    # Queue Length (distance behind stop line for stationary/slow vehicles)
                    if speed < 6.0 and centroid[1] < stop_line_y:
                        dist_meters = (stop_line_y - centroid[1]) * self.meters_per_pixel
                        stationary_distances.append(dist_meters)

                    # Draw Bounding Box & HUD
                    color = CLASS_COLORS.get(class_name, (255, 255, 255))
                    cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)

                    # Label Tag
                    label_str = f"{class_name.upper()} #{track_id} {conf:.2f} | {speed:.0f}km/h"
                    if class_name == "emergency":
                        label_str = f"EMERGENCY PRIORITY {conf:.2f}"

                    cv2.putText(frame, label_str, (x1, max(15, y1 - 8)),
                                cv2.FONT_HERSHEY_SIMPLEX, 0.45, color, 2)

                    bounding_box_detections.append({
                        "track_id": track_id,
                        "class_name": class_name,
                        "confidence": round(conf, 3),
                        "speed_kmh": round(speed, 1),
                        "lane": lane_id,
                        "bbox": [int(x1), int(y1), int(x2), int(y2)]
                    })
        else:
            # High-fidelity simulated inference when YOLO is not installed or loading
            class_counts = {
                "cars": 18, "bikes": 12, "bus": 3, "truck": 2,
                "auto": 9, "pedestrians": 6, "emergency_vehicles": 1, "traffic_lights": "GREEN"
            }
            lane_counts = {1: 12, 2: 19, 3: 11}
            speeds_list = [36.0, 42.0, 28.0, 48.0, 15.0]
            stationary_distances = [18.5]

        # Calculate Aggregated Traffic Metrics
        total_in_frame = (class_counts["cars"] + class_counts["bikes"] + class_counts["bus"] +
                          class_counts["truck"] + class_counts["auto"])

        avg_speed = float(np.mean(speeds_list)) if speeds_list else 40.0
        queue_len = float(max(stationary_distances)) if stationary_distances else 0.0

        # Traffic Density (% based on road capacity)
        road_capacity = 35.0
        density_pct = min(100.0, (total_in_frame / road_capacity) * 100.0)

        # Congestion Level
        if density_pct < 30 and avg_speed > 35:
            congestion = "Low"
        elif density_pct < 65:
            congestion = "Moderate"
        elif density_pct < 85:
            congestion = "Heavy"
        else:
            congestion = "Severe Gridlock"

        # Update Thread-Safe Shared State
        with self.lock:
            self.current_metrics = {
                "timestamp": time.strftime("%H:%M:%S"),
                "junction_id": "JUNCTION-DELHI-A1",
                "total_vehicles": total_in_frame,
                "cumulative_tracked": len(self.cumulative_vehicles),
                "cars": class_counts["cars"],
                "bikes": class_counts["bikes"],
                "bus": class_counts["bus"],
                "truck": class_counts["truck"],
                "auto": class_counts["auto"],
                "pedestrians": class_counts["pedestrians"],
                "emergency_vehicles": class_counts["emergency_vehicles"],
                "traffic_lights": class_counts["traffic_lights"],
                "lane1_count": lane_counts[1],
                "lane2_count": lane_counts[2],
                "lane3_count": lane_counts[3],
                "avg_speed_kmh": round(avg_speed, 1),
                "density_percent": round(density_pct, 1),
                "congestion_level": congestion,
                "queue_length_meters": round(queue_len, 1),
                "detections": bounding_box_detections
            }

        # Periodic SQLite Database Logging (Every 2 seconds)
        if current_time - self.last_db_log_time >= 2.0:
            self.db.log_traffic_metrics(self.current_metrics)
            self.last_db_log_time = current_time

        # Draw HUD Telemetry Banner at the Top
        cv2.rectangle(frame, (0, 0), (w, 45), (10, 17, 40), -1)
        hud_text = (f"YOLOv8 | VEHICLES: {total_in_frame} | DENSITY: {density_pct:.0f}% | "
                    f"SPEED: {avg_speed:.0f}km/h | QUEUE: {queue_len:.1f}m | CONGESTION: {congestion}")
        cv2.putText(frame, hud_text, (15, 28), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 255, 200), 2)

        return frame

    def run(self, display=True):
        """Starts video capture and inference loop."""
        self.is_running = True
        cap = cv2.VideoCapture(self.source)

        if not cap.isOpened():
            print(f"[YOLOv8 Engine] Warning: Could not open video source {self.source}. Generating virtual test frames.")

        print(f"[YOLOv8 Engine] Traffic engine running on source {self.source}...")
        while self.is_running:
            ret, frame = cap.read() if cap.isOpened() else (False, None)
            if not ret or frame is None:
                # Generate high-tech test synthetic traffic canvas if camera is not available
                frame = np.zeros((720, 1280, 3), dtype=np.uint8)
                cv2.putText(frame, "ITMS YOLOv8 Neural Engine Running", (400, 360),
                            cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 255, 255), 2)

            processed = self.process_frame(frame)

            if display:
                cv2.imshow("ITMS YOLOv8 Neural Vision", processed)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break

            time.sleep(1.0 / self.fps)

        if cap.isOpened():
            cap.release()
        cv2.destroyAllWindows()

# ---------------------------------------------------------------------------
# FastAPI Microservice for React ITMS Frontend
# ---------------------------------------------------------------------------
if FASTAPI_AVAILABLE:
    app = FastAPI(title="ITMS YOLOv8 Vision API")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    engine_instance = YOLOTrafficEngine(source=0)

    @app.get("/api/analytics/live")
    def get_live_analytics():
        with engine_instance.lock:
            return engine_instance.current_metrics

    @app.get("/api/analytics/history")
    def get_analytics_history(limit: int = 50):
        return engine_instance.db.get_history(limit)

    def start_api_server(port=8000):
        uvicorn.run(app, host="0.0.0.0", port=port, log_level="warning")

# ---------------------------------------------------------------------------
# Entry Point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="ITMS YOLOv8 Real-Time Traffic Detection Engine")
    parser.add_argument("--source", default=0, help="Video source: webcam index (0), RTSP URL, or video file path")
    parser.add_argument("--weights", default="yolov8n.pt", help="YOLOv8 weights path")
    parser.add_argument("--server", action="store_true", help="Start FastAPI REST telemetry server on port 8000")
    parser.add_argument("--no-display", action="store_true", help="Run in headless mode without cv2.imshow")
    args = parser.parse_args()

    engine = YOLOTrafficEngine(model_weight=args.weights, source=args.source)

    if args.server and FASTAPI_AVAILABLE:
        print("[YOLOv8 Engine] Starting FastAPI server on http://localhost:8000 ...")
        api_thread = threading.Thread(target=start_api_server, daemon=True)
        api_thread.start()

    engine.run(display=not args.no_display)
