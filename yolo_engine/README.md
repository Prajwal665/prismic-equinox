# ITMS YOLOv8 Neural Traffic Engine

Optimized real-time computer vision engine for the Intelligent Traffic Management System (`itms.gov.in`).

## Features
- **Object Detection (8 Target Classes)**:
  - 🚗 Cars
  - 🏍️ Bikes (Motorcycles & Bicycles)
  - 🚌 Buses
  - 🚛 Trucks
  - 🛺 Autos (Auto-Rickshaws with geometry & color heuristics)
  - 🚶 Pedestrians
  - 🚨 Emergency Vehicles (Ambulances, Fire, Police with livery detection)
  - 🚦 Traffic Lights (with HSV state: Red / Yellow / Green)
- **Computer Vision Metrics**:
  - Bounding Boxes & Confidence Scores
  - Active & Cumulative Vehicle Counts
  - Lane Count Allocation (Lane 1, Lane 2, Lane 3 polygon ROIs)
  - Traffic Density Percentage (`0 - 100%`)
  - Congestion Level (`Low`, `Moderate`, `Heavy`, `Severe Gridlock`)
  - Queue Length (`meters` behind the stop line)
  - Centroid Displacement Speed Estimation (`km/h`)
- **Database Storage**:
  - Automatically logs every interval to SQLite database (`itms_traffic_analytics.db`).
- **Dashboard Telemetry API**:
  - Built-in FastAPI server streaming metrics directly to the React ITMS web dashboard.

## Installation
```bash
cd yolo_engine
pip install -r requirements.txt
```

## Running the Engine

### 1. Run on Webcam (Live Hardware Sensor):
```bash
python yolov8_traffic_engine.py --source 0 --server
```

### 2. Run on Traffic Video File:
```bash
python yolov8_traffic_engine.py --source path/to/traffic_video.mp4 --server
```

### 3. Run in Headless Mode (Background Server):
```bash
python yolov8_traffic_engine.py --source 0 --server --no-display
```
