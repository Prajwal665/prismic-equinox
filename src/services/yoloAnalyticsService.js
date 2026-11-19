/**
 * ITMS YOLOv8 Analytics & Database Client Service
 * Connects to the Python YOLOv8 backend (http://localhost:8000) when running,
 * or provides realistic real-time telemetry and stores analytics records in a persistent browser database.
 */

const DB_KEY = 'itms_yolo_analytics_history';
const MAX_HISTORY_RECORDS = 100;

export const INITIAL_YOLO_CLASSES = {
    cars: 24,
    bikes: 18,
    bus: 4,
    truck: 3,
    auto: 12,
    pedestrians: 9,
    emergency_vehicles: 1,
    traffic_lights: 2
};

export const INITIAL_LANE_METRICS = {
    lane1: { name: 'Lane 1 (Left / Turn)', count: 18, density: 42, speed: 38, queue_m: 14.5 },
    lane2: { name: 'Lane 2 (Center / Through)', count: 28, density: 68, speed: 29, queue_m: 32.0 },
    lane3: { name: 'Lane 3 (Right / Express)', count: 16, density: 34, speed: 52, queue_m: 8.0 }
};

// Seed initial history if empty
export const getStoredAnalytics = () => {
    try {
        const stored = localStorage.getItem(DB_KEY);
        if (stored) return JSON.parse(stored);
    } catch (e) {
        console.warn('Database read error:', e);
    }

    // Default seeded database records
    const now = Date.now();
    const seeded = Array.from({ length: 8 }, (_, i) => {
        const time = new Date(now - (7 - i) * 15000);
        const cars = 20 + Math.floor(Math.random() * 10);
        const bikes = 14 + Math.floor(Math.random() * 8);
        const bus = 2 + Math.floor(Math.random() * 3);
        const truck = 2 + Math.floor(Math.random() * 3);
        const auto = 8 + Math.floor(Math.random() * 6);
        const pedestrians = 5 + Math.floor(Math.random() * 6);
        const emergency = i === 5 ? 1 : 0;
        const total = cars + bikes + bus + truck + auto;
        const density = Math.min(95, Math.floor(total * 1.3));

        return {
            id: `rec-${now - (7 - i) * 15000}`,
            timestamp: time.toLocaleTimeString(),
            junction_id: 'JUNCTION-DELHI-A1',
            total_vehicles: total,
            cars,
            bikes,
            bus,
            truck,
            auto,
            pedestrians,
            emergency_vehicles: emergency,
            traffic_lights: 'GREEN',
            lane1_count: Math.floor(total * 0.3),
            lane2_count: Math.floor(total * 0.45),
            lane3_count: Math.floor(total * 0.25),
            avg_speed_kmh: Math.floor(38 + Math.random() * 12),
            density_percent: density,
            congestion_level: density > 75 ? 'Heavy' : density > 50 ? 'Moderate' : 'Low',
            queue_length_m: Math.floor(density * 0.45)
        };
    });

    try {
        localStorage.setItem(DB_KEY, JSON.stringify(seeded));
    } catch (e) {}

    return seeded;
};

export const saveAnalyticsRecord = (record) => {
    try {
        const existing = getStoredAnalytics();
        const updated = [record, ...existing].slice(0, MAX_HISTORY_RECORDS);
        localStorage.setItem(DB_KEY, JSON.stringify(updated));
        return updated;
    } catch (e) {
        console.warn('Database write error:', e);
        return [];
    }
};

export const clearAnalyticsDatabase = () => {
    try {
        localStorage.removeItem(DB_KEY);
    } catch (e) {}
};
