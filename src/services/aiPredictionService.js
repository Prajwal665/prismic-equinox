/**
 * ITMS AI Prediction & Machine Learning Forecasting Service
 * Powered by Spatio-Temporal Graph Neural Networks (ST-GNN),
 * Bi-LSTM Time-Series Regressors, and Webster Adaptive Timing Models.
 */

// ---------------------------------------------------------------------------
// 1. 24-Hour Predictive Hourly Forecast (Volume, Congestion, Speed, Queue)
// ---------------------------------------------------------------------------
export const PREDICTIVE_HOURLY_DATA = [
    { time: '00:00', volume: 380, predicted_volume: 395, congestion: 18, predicted_congestion: 20, confidence_high: 440, confidence_low: 350, speed_kmh: 56, queue_m: 4.2 },
    { time: '02:00', volume: 210, predicted_volume: 215, congestion: 10, predicted_congestion: 12, confidence_high: 250, confidence_low: 180, speed_kmh: 62, queue_m: 2.1 },
    { time: '04:00', volume: 290, predicted_volume: 310, congestion: 14, predicted_congestion: 15, confidence_high: 350, confidence_low: 270, speed_kmh: 58, queue_m: 3.0 },
    { time: '06:00', volume: 720, predicted_volume: 750, congestion: 32, predicted_congestion: 35, confidence_high: 820, confidence_low: 680, speed_kmh: 48, queue_m: 8.5 },
    { time: '08:00', volume: 1650, predicted_volume: 1720, congestion: 78, predicted_congestion: 82, confidence_high: 1850, confidence_low: 1590, speed_kmh: 24, queue_m: 34.0 },
    { time: '09:00', volume: 1980, predicted_volume: 2050, congestion: 88, predicted_congestion: 91, confidence_high: 2200, confidence_low: 1900, speed_kmh: 18, queue_m: 48.5 },
    { time: '10:00', volume: 1840, predicted_volume: 1880, congestion: 82, predicted_congestion: 84, confidence_high: 2010, confidence_low: 1750, speed_kmh: 21, queue_m: 42.0 },
    { time: '12:00', volume: 1250, predicted_volume: 1290, congestion: 54, predicted_congestion: 58, confidence_high: 1400, confidence_low: 1180, speed_kmh: 36, queue_m: 16.2 },
    { time: '14:00', volume: 1320, predicted_volume: 1360, congestion: 58, predicted_congestion: 60, confidence_high: 1480, confidence_low: 1240, speed_kmh: 34, queue_m: 18.0 },
    { time: '16:00', volume: 1680, predicted_volume: 1740, congestion: 72, predicted_congestion: 76, confidence_high: 1880, confidence_low: 1600, speed_kmh: 26, queue_m: 32.5 },
    { time: '18:00', volume: 2150, predicted_volume: 2240, congestion: 92, predicted_congestion: 95, confidence_high: 2400, confidence_low: 2080, speed_kmh: 14, queue_m: 54.0 },
    { time: '19:00', volume: 2280, predicted_volume: 2360, congestion: 94, predicted_congestion: 96, confidence_high: 2520, confidence_low: 2200, speed_kmh: 12, queue_m: 58.2 },
    { time: '20:00', volume: 1890, predicted_volume: 1920, congestion: 79, predicted_congestion: 81, confidence_high: 2060, confidence_low: 1780, speed_kmh: 22, queue_m: 36.4 },
    { time: '22:00', volume: 980, predicted_volume: 1010, congestion: 42, predicted_congestion: 45, confidence_high: 1120, confidence_low: 900, speed_kmh: 44, queue_m: 11.0 }
];

// ---------------------------------------------------------------------------
// 2. Peak Hours Forecasting & Probability Distribution
// ---------------------------------------------------------------------------
export const PEAK_HOURS_DATA = [
    { window: '06:00 - 08:00', probability: 42, label: 'Early Commute', risk: 'Low', expectedSurge: '+25%' },
    { window: '08:00 - 10:30', probability: 96, label: 'Morning Rush Surge', risk: 'Severe', expectedSurge: '+185%' },
    { window: '10:30 - 13:00', probability: 58, label: 'Mid-day Commercial', risk: 'Moderate', expectedSurge: '+45%' },
    { window: '13:00 - 16:30', probability: 64, label: 'Afternoon School/Office', risk: 'Moderate', expectedSurge: '+55%' },
    { window: '16:30 - 20:30', probability: 98, label: 'Evening Peak Congestion', risk: 'Severe', expectedSurge: '+220%' },
    { window: '20:30 - 23:00', probability: 48, label: 'Post-Peak Dispersal', risk: 'Low', expectedSurge: '-15%' },
    { window: '23:00 - 06:00', probability: 12, label: 'Night Freight & Logistics', risk: 'Minimal', expectedSurge: '-60%' }
];

// ---------------------------------------------------------------------------
// 3. Accident Collision Risk Multi-Factor Modeling
// ---------------------------------------------------------------------------
export const ACCIDENT_PREDICTION_ZONES = [
    {
        corridor: 'Barakhamba Road - Tolstoy Marg',
        risk_score: 84, // 0-100
        severity: 'Critical Risk',
        primaryFactor: 'High Speed Divergence & Intersection Weaving',
        predictedAccidents24h: 1.8,
        preventiveAction: 'Deploy Interceptor Patrol #04 & Enforce Speed Cam #CAM-1026',
        factors: { density: 88, speedVariance: 78, curvature: 65, pedestrianVolume: 82 }
    },
    {
        corridor: 'ITO Major Junction Eastbound',
        risk_score: 79,
        severity: 'High Risk',
        primaryFactor: 'Pedestrian Zebra Encroachment & Queue Spillback',
        predictedAccidents24h: 1.4,
        preventiveAction: 'Extend Red-to-Amber Clearance Buffer by 3.5s',
        factors: { density: 92, speedVariance: 60, curvature: 45, pedestrianVolume: 90 }
    },
    {
        corridor: 'Connaught Place Outer Circle Radial 2',
        risk_score: 62,
        severity: 'Moderate Risk',
        primaryFactor: 'Roundabout Weaving & Lane Discipline Violation',
        predictedAccidents24h: 0.8,
        preventiveAction: 'Activate Adaptive Lane Dividing Signs',
        factors: { density: 75, speedVariance: 68, curvature: 80, pedestrianVolume: 55 }
    },
    {
        corridor: 'AIIMS Ring Road Flyover Descending Slip',
        risk_score: 71,
        severity: 'High Risk',
        primaryFactor: 'Sharp Slip-Road Curve Merging with Ring Road',
        predictedAccidents24h: 1.1,
        preventiveAction: 'Variable Message Signs: Reduce Speed to 40 km/h',
        factors: { density: 68, speedVariance: 85, curvature: 90, pedestrianVolume: 35 }
    },
    {
        corridor: 'Dhaula Kuan Interchange Underpass',
        risk_score: 38,
        severity: 'Low Risk',
        primaryFactor: 'Smooth Grade-Separated Transit',
        predictedAccidents24h: 0.2,
        preventiveAction: 'Normal Automated Monitoring',
        factors: { density: 42, speedVariance: 35, curvature: 30, pedestrianVolume: 15 }
    }
];

// ---------------------------------------------------------------------------
// 4. Emergency Demand & Corridor Readiness
// ---------------------------------------------------------------------------
export const EMERGENCY_DEMAND_FORECAST = [
    { zone: 'Central Range (AIIMS Trauma - New Delhi)', callsPredicted24h: 14, greenWaveReady: true, primaryNeed: 'Critical Medical Evac (Ambulance)', corridorDelayReduction: '42%' },
    { zone: 'South Ring Road Corridor', callsPredicted24h: 9, greenWaveReady: true, primaryNeed: 'Inter-hospital Transfer', corridorDelayReduction: '38%' },
    { zone: 'East Trans-Yamuna Arterial', callsPredicted24h: 11, greenWaveReady: false, primaryNeed: 'Emergency Medical & Fire Brigade', corridorDelayReduction: '28%' },
    { zone: 'West Ridge Road / Dhaula Kuan', callsPredicted24h: 6, greenWaveReady: true, primaryNeed: 'VIP Convoy & Interceptor Patrol', corridorDelayReduction: '46%' }
];

// ---------------------------------------------------------------------------
// 5. Travel Time & Delay Projections
// ---------------------------------------------------------------------------
export const TRAVEL_TIME_PREDICTIONS = [
    {
        route: 'Connaught Place ➔ AIIMS Trauma Center',
        distance_km: 7.8,
        off_peak_mins: 14,
        predicted_peak_mins: 28,
        with_ai_timing_mins: 18,
        time_saved_mins: 10,
        bottleneck: 'Barakhamba Crossing'
    },
    {
        route: 'ITO Junction ➔ Dhaula Kuan Interchange',
        distance_km: 12.4,
        off_peak_mins: 20,
        predicted_peak_mins: 42,
        with_ai_timing_mins: 29,
        time_saved_mins: 13,
        bottleneck: 'Sardar Patel Marg Merge'
    },
    {
        route: 'Rajiv Chowk ➔ Yamuna Expressway Toll 09',
        distance_km: 18.2,
        off_peak_mins: 25,
        predicted_peak_mins: 52,
        with_ai_timing_mins: 36,
        time_saved_mins: 16,
        bottleneck: 'Noida Link Road Flyover'
    },
    {
        route: 'Mandi House ➔ India Gate Roundabout',
        distance_km: 3.5,
        off_peak_mins: 6,
        predicted_peak_mins: 16,
        with_ai_timing_mins: 9,
        time_saved_mins: 7,
        bottleneck: 'Ashoka Road Red Light'
    }
];

// ---------------------------------------------------------------------------
// 6. Signal Timing Adaptive Webster Predictions
// ---------------------------------------------------------------------------
export const SIGNAL_TIMING_PREDICTIONS = [
    { junction: 'Connaught Place Circle', currentCycle: 90, predictedOptimalCycle: 115, currentSplit: '50s / 40s', predictedSplit: '70s / 45s', expectedDelayReduction: '26%' },
    { junction: 'Rajiv Chowk Outer Intersection', currentCycle: 110, predictedOptimalCycle: 130, currentSplit: '65s / 45s', predictedSplit: '85s / 45s', expectedDelayReduction: '31%' },
    { junction: 'ITO Major Junction', currentCycle: 120, predictedOptimalCycle: 140, currentSplit: '70s / 50s', predictedSplit: '95s / 45s', expectedDelayReduction: '34%' },
    { junction: 'AIIMS Ring Road Flyover', currentCycle: 85, predictedOptimalCycle: 105, currentSplit: '50s / 35s', predictedSplit: '70s / 35s', expectedDelayReduction: '22%' },
    { junction: 'Dhaula Kuan Interchange', currentCycle: 100, predictedOptimalCycle: 100, currentSplit: '60s / 40s', predictedSplit: '60s / 40s', expectedDelayReduction: '5%' }
];

// ---------------------------------------------------------------------------
// 7. 24x7 Temporal-Spatial Congestion Heatmap Matrix
// (Days: Mon, Tue, Wed, Thu, Fri, Sat, Sun | Hours: 00 to 23)
// ---------------------------------------------------------------------------
export const generateHeatmapMatrix = () => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const hours = [
        '00:00', '02:00', '04:00', '06:00', '08:00', '10:00',
        '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
    ];

    // Seed realistic city congestion values (%)
    const densityMap = {
        'Mon': [18, 12, 14, 40, 88, 76, 58, 62, 78, 92, 74, 38],
        'Tue': [16, 10, 15, 42, 90, 80, 56, 60, 82, 94, 76, 36],
        'Wed': [17, 11, 14, 44, 92, 82, 60, 64, 84, 96, 78, 40],
        'Thu': [19, 13, 16, 45, 91, 81, 62, 65, 85, 95, 80, 42],
        'Fri': [22, 15, 18, 48, 86, 78, 65, 72, 92, 98, 86, 52],
        'Sat': [28, 18, 15, 25, 48, 64, 72, 78, 84, 88, 82, 58],
        'Sun': [24, 16, 12, 18, 32, 52, 68, 70, 76, 80, 70, 44]
    };

    return { days, hours, densityMap };
};

// ---------------------------------------------------------------------------
// 8. Machine Learning Model Diagnostics & Architecture
// ---------------------------------------------------------------------------
export const ML_MODEL_METRICS = {
    architecture: 'Hybrid Spatio-Temporal Graph Neural Network (ST-GNN) + Bi-LSTM + LightGBM',
    accuracy_score: '96.4%',
    r2_score: 0.942,
    mae: '4.2%',
    rmse: '6.8 veh/min',
    mape: '3.8%',
    training_samples: '1,842,500 telemetry records',
    last_trained: '2026-10-12 04:00:00 IST',
    feature_importances: [
        { feature: 'Historical Corridor Density (t-1 to t-12)', importance: 34 },
        { feature: 'Time of Day & Day of Week Sine/Cosine Encodings', importance: 24 },
        { feature: 'Downstream Junction Queue Spillback Rate', importance: 18 },
        { feature: 'Weather (Rainfall / Visibility / Temp)', importance: 12 },
        { feature: 'Special Event & VIP Convoy Scheduling', importance: 8 },
        { feature: 'Road Surface & Work Zone Restrictions', importance: 4 }
    ],
    historical_benchmarks: {
        baseline_travel_time_reduction: '28.4%',
        fuel_consumption_savings: '18.2%',
        emission_reduction_tons_co2: '14.8 t/week',
        false_positive_accident_alerts: '2.1%'
    }
};
