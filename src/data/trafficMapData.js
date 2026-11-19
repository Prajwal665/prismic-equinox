// Geospatial ITMS Initial Entities & Telemetry Dataset
export const INITIAL_MAP_DATA = {
    signals: [
        { id: 'SIG-101', name: 'Connaught Place Circle', lat: 28.6315, lng: 77.2167, state: 'GREEN', timeLeft: 28, cycle: 90, density: '45%' },
        { id: 'SIG-102', name: 'Rajiv Chowk Outer Intersection', lat: 28.6280, lng: 77.2220, state: 'RED', timeLeft: 42, cycle: 110, density: '68%' },
        { id: 'SIG-103', name: 'ITO Major Junction', lat: 28.6290, lng: 77.2410, state: 'GREEN', timeLeft: 15, cycle: 120, density: '74%' },
        { id: 'SIG-104', name: 'AIIMS Ring Road Flyover', lat: 28.5672, lng: 77.2100, state: 'YELLOW', timeLeft: 4, cycle: 85, density: '55%' },
        { id: 'SIG-105', name: 'Dhaula Kuan Interchange', lat: 28.5912, lng: 77.1610, state: 'GREEN', timeLeft: 48, cycle: 100, density: '38%' }
    ],
    cameras: [
        { id: 'CAM-1025', name: 'Sector 12 North Feeder', lat: 28.5780, lng: 77.0600, status: 'Active (30 FPS)', link: 'Wi-Fi 5GHz', vehicles: 42 },
        { id: 'CAM-1026', name: 'Rajiv Chowk East Portal', lat: 28.6328, lng: 77.2195, status: 'Active (30 FPS)', link: 'BLE 5.3', vehicles: 68 },
        { id: 'CAM-1027', name: 'Yamuna Expressway Toll 09', lat: 28.5420, lng: 77.3320, status: 'Active (30 FPS)', link: 'Wi-Fi 5GHz', vehicles: 28 },
        { id: 'CAM-1028', name: 'Connaught Place Market', lat: 28.6300, lng: 77.2180, status: 'Active (30 FPS)', link: 'Wi-Fi 5GHz', vehicles: 55 },
        { id: 'CAM-LOCAL', name: 'Integrated Laptop Camera (Node)', lat: 28.6139, lng: 77.2090, status: 'Live Hardware', link: 'Direct UVC', vehicles: 1 }
    ],
    officers: [
        { id: 'OFF-01', name: 'Inspector Sharma', badge: 'DL-TP-409', lat: 28.6220, lng: 77.2150, unit: 'Interceptor Van #04', status: 'Mobile Patrol', phone: '+91 98712-00409' },
        { id: 'OFF-02', name: 'Sub-Inspector Verma', badge: 'DL-TP-812', lat: 28.6350, lng: 77.2280, unit: 'Quick Response Bike #12', status: 'Patrolling', phone: '+91 98712-00812' },
        { id: 'OFF-03', name: 'Officer Rao', badge: 'DL-TP-155', lat: 28.6180, lng: 77.2340, unit: 'Command Dispatch #01', status: 'Incident Response', phone: '+91 98712-00155' }
    ],
    emergencies: [
        { id: 'AMB-108', name: 'Ambulance #AMB-108', type: 'Critical Medical Evac', lat: 28.6050, lng: 77.2150, speed: '64 km/h', greenWave: true, destination: 'AIIMS Trauma Center' },
        { id: 'FT-04', name: 'Fire Engine #FT-04', type: 'Fire Brigade Unit', lat: 28.6380, lng: 77.2200, speed: '52 km/h', greenWave: false, destination: 'Connaught Place Block B' }
    ],
    accidents: [
        { id: 'ACC-01', location: 'Barakhamba Road Junction', lat: 28.6240, lng: 77.2380, severity: 'High', description: 'Two-car collision blocking 2 lanes', responseStatus: 'Officer & Tow Crane On Site' }
    ],
    closures: [
        { id: 'CLO-01', location: 'Mandi House Metro Diversion', lat: 28.6190, lng: 77.2230, reason: 'Metro Line Underground Infrastructure', detour: 'Route via Sikandra Road', ends: '22:00' },
        { id: 'CLO-02', location: 'Rajpath Ceremonial Axis', lat: 28.6110, lng: 77.2020, reason: 'VIP Convoy Movement Protocol', detour: 'Route via Janpath', ends: '15 mins' }
    ],
    heatspots: [
        { lat: 28.6315, lng: 77.2167, intensity: 'High (84% Density)', radius: 600, color: '#ef4444' },
        { lat: 28.6290, lng: 77.2410, intensity: 'Severe (92% Density)', radius: 750, color: '#dc2626' },
        { lat: 28.5672, lng: 77.2100, intensity: 'Moderate (62% Density)', radius: 500, color: '#f59e0b' },
        { lat: 28.5912, lng: 77.1610, intensity: 'Low (34% Density)', radius: 450, color: '#10b981' }
    ]
};
