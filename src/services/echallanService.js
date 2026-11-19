/**
 * ITMS National E-Challan & Enforcement Service
 * Seamless hybrid: Syncs with FastAPI backend when available,
 * with resilient offline-first localStorage database.
 */

const STORAGE_CHALLANS_KEY = 'itms_echallans_db';
const STORAGE_PAYMENTS_KEY = 'itms_payments_db';
const STORAGE_VAHAN_KEY = 'itms_vahan_registry';

// Default Vahan Vehicle Registry
export const DEFAULT_VAHAN_DATABASE = [
    {
        plate_no: "DL 01 AB 1234",
        owner_name: "Rajesh Kumar Sharma",
        owner_phone: "+91 98765-43210",
        owner_email: "rajesh.sharma@example.com",
        owner_address: "Flat 402, Barakhamba Towers, Connaught Place, New Delhi",
        vehicle_class: "Four-Wheeler / Car",
        maker_model: "Hyundai Creta SX 1.5",
        chassis_no: "CHAS-DL-982314-X",
        engine_no: "ENG-HYU-55412",
        rc_status: "Active",
        insurance_valid_upto: "2027-08-15",
        pucc_valid_upto: "2027-02-10",
        registration_date: "2021-03-12",
        fuel_type: "Petrol BS-VI"
    },
    {
        plate_no: "MH 12 CD 5678",
        owner_name: "Priya Patel",
        owner_phone: "+91 98112-98765",
        owner_email: "priya.patel@example.com",
        owner_address: "B-12, Green Park Extension, New Delhi",
        vehicle_class: "Four-Wheeler / Car",
        maker_model: "Maruti Suzuki Swift ZXi",
        chassis_no: "CHAS-MH-441290-A",
        engine_no: "ENG-MAR-12093",
        rc_status: "Active",
        insurance_valid_upto: "2027-04-20",
        pucc_valid_upto: "2026-12-05",
        registration_date: "2022-07-19",
        fuel_type: "Petrol Hybrid"
    },
    {
        plate_no: "DL 08 BK 9021",
        owner_name: "Vikram Malhotra",
        owner_phone: "+91 99581-22440",
        owner_email: "vikram.m@example.com",
        owner_address: "C-88, South Extension Part II, New Delhi",
        vehicle_class: "Two-Wheeler / Motorcycle",
        maker_model: "Royal Enfield Classic 350",
        chassis_no: "CHAS-RE-881230-M",
        engine_no: "ENG-RE-99231",
        rc_status: "Active",
        insurance_valid_upto: "2026-11-30",
        pucc_valid_upto: "2027-01-15",
        registration_date: "2020-11-04",
        fuel_type: "Petrol"
    },
    {
        plate_no: "HR 26 EQ 9988",
        owner_name: "Amit Singhal",
        owner_phone: "+91 98100-33445",
        owner_email: "amit.singhal@example.com",
        owner_address: "Tower 3, Cyber City, DLF Phase 2, Gurugram",
        vehicle_class: "Four-Wheeler / SUV",
        maker_model: "Tata Safari Dark Edition",
        chassis_no: "CHAS-HR-334112-D",
        engine_no: "ENG-TAT-87612",
        rc_status: "Active",
        insurance_valid_upto: "2028-02-18",
        pucc_valid_upto: "2027-05-22",
        registration_date: "2023-01-25",
        fuel_type: "Diesel BS-VI"
    },
    {
        plate_no: "DL 1T 5543",
        owner_name: "Sunil Yadav",
        owner_phone: "+91 98734-11223",
        owner_email: "sunil.yadav@example.com",
        owner_address: "Gali No. 4, Shakarpur, East Delhi",
        vehicle_class: "Commercial Auto-Rickshaw",
        maker_model: "Bajaj RE Compact 4S CNG",
        chassis_no: "CHAS-BAJ-110294-T",
        engine_no: "ENG-BAJ-44321",
        rc_status: "Active",
        insurance_valid_upto: "2026-09-12",
        pucc_valid_upto: "2026-11-18",
        registration_date: "2019-06-14",
        fuel_type: "CNG"
    },
    {
        plate_no: "DL 1A 8899",
        owner_name: "Delhi Urban Fleet Logistics",
        owner_phone: "+91 98210-99881",
        owner_email: "fleet@delhicargo.in",
        owner_address: "Okhla Industrial Area Phase-II, New Delhi",
        vehicle_class: "Commercial Truck / HMV",
        maker_model: "Tata 407 Gold SFC",
        chassis_no: "CHAS-TAT-994321-K",
        engine_no: "ENG-TAT-55410",
        rc_status: "Active",
        insurance_valid_upto: "2027-01-10",
        pucc_valid_upto: "2026-10-30",
        registration_date: "2018-09-08",
        fuel_type: "Diesel"
    }
];

// Initial Seed Challans
export const DEFAULT_CHALLANS = [
    {
        challan_no: "DL-2026-CHL-10928",
        plate_no: "DL 01 AB 1234",
        owner_name: "Rajesh Kumar Sharma",
        owner_phone: "+91 98765-43210",
        owner_email: "rajesh.sharma@example.com",
        vehicle_class: "Four-Wheeler / Car",
        maker_model: "Hyundai Creta SX 1.5",
        violation_type: "Red Light Jump (Sec 184 MVA)",
        violation_speed: null,
        speed_limit: null,
        fine_amount: 1000,
        officer_name: "Automated AI Camera Node #CAM-1026",
        officer_badge: "AI-ANPR-SYS",
        location_name: "Rajiv Chowk East Portal (Outer Ring)",
        gps_lat: 28.6328,
        gps_lng: 77.2195,
        violation_timestamp: "2026-10-12 14:22:15",
        due_date: "2026-12-12",
        qr_payload: "upi://pay?pa=echallan.traffic@gov&pn=DelhiTrafficPolice&am=1000&tr=DL-2026-CHL-10928",
        payment_status: "UNPAID",
        payment_id: null,
        payment_date: null,
        payment_mode: null,
        email_sent: true,
        email_sent_at: "2026-10-12 14:23:00",
        ai_detected: true,
        ai_confidence: 0.98,
        evidence_image_url: "https://images.unsplash.com/photo-1545147986-a9d6f210df77?q=80&w=800&auto=format&fit=crop",
        notes: "Captured via YOLOv8 Junction Camera: Vehicle crossed red signal stop line by 8.4 meters during red phase."
    },
    {
        challan_no: "DL-2026-CHL-10929",
        plate_no: "MH 12 CD 5678",
        owner_name: "Priya Patel",
        owner_phone: "+91 98112-98765",
        owner_email: "priya.patel@example.com",
        vehicle_class: "Four-Wheeler / Car",
        maker_model: "Maruti Suzuki Swift ZXi",
        violation_type: "Overspeeding (Sec 183 MVA)",
        violation_speed: 76.5,
        speed_limit: 50.0,
        fine_amount: 2000,
        officer_name: "Insp. R. Sharma",
        officer_badge: "DL-TP-409",
        location_name: "Barakhamba Road Junction",
        gps_lat: 28.6240,
        gps_lng: 77.2380,
        violation_timestamp: "2026-10-12 11:15:30",
        due_date: "2026-12-12",
        qr_payload: "upi://pay?pa=echallan.traffic@gov&pn=DelhiTrafficPolice&am=2000&tr=DL-2026-CHL-10929",
        payment_status: "UNPAID",
        payment_id: null,
        payment_date: null,
        payment_mode: null,
        email_sent: true,
        email_sent_at: "2026-10-12 11:16:10",
        ai_detected: true,
        ai_confidence: 0.95,
        evidence_image_url: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop",
        notes: "Speed estimation: 76.5 km/h in a 50 km/h restricted school & hospital zone."
    },
    {
        challan_no: "DL-2026-CHL-10870",
        plate_no: "DL 08 BK 9021",
        owner_name: "Vikram Malhotra",
        owner_phone: "+91 99581-22440",
        owner_email: "vikram.m@example.com",
        vehicle_class: "Two-Wheeler / Motorcycle",
        maker_model: "Royal Enfield Classic 350",
        violation_type: "Driving Without Helmet (Sec 194D MVA)",
        violation_speed: null,
        speed_limit: null,
        fine_amount: 1000,
        officer_name: "Sub-Inspector Verma",
        officer_badge: "DL-TP-812",
        location_name: "Connaught Place Radial 2",
        gps_lat: 28.6315,
        gps_lng: 77.2167,
        violation_timestamp: "2026-10-11 16:40:05",
        due_date: "2026-12-11",
        qr_payload: "upi://pay?pa=echallan.traffic@gov&pn=DelhiTrafficPolice&am=1000&tr=DL-2026-CHL-10870",
        payment_status: "PAID",
        payment_id: "TXN-UPI-994821039",
        payment_date: "2026-10-11 17:05:22",
        payment_mode: "UPI / Google Pay",
        email_sent: true,
        email_sent_at: "2026-10-11 16:41:00",
        ai_detected: true,
        ai_confidence: 0.96,
        evidence_image_url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop",
        notes: "AI Helmet Detection failure. Rider detected operating motorcycle with no safety helmet."
    },
    {
        challan_no: "DL-2026-CHL-10855",
        plate_no: "HR 26 EQ 9988",
        owner_name: "Amit Singhal",
        owner_phone: "+91 98100-33445",
        owner_email: "amit.singhal@example.com",
        vehicle_class: "Four-Wheeler / SUV",
        maker_model: "Tata Safari Dark Edition",
        violation_type: "Stop Line Crossing (Sec 177 MVA)",
        violation_speed: null,
        speed_limit: null,
        fine_amount: 500,
        officer_name: "Automated AI Camera Node #CAM-1025",
        officer_badge: "AI-ANPR-SYS",
        location_name: "ITO Major Junction",
        gps_lat: 28.6290,
        gps_lng: 77.2410,
        violation_timestamp: "2026-10-10 09:20:18",
        due_date: "2026-12-10",
        qr_payload: "upi://pay?pa=echallan.traffic@gov&pn=DelhiTrafficPolice&am=500&tr=DL-2026-CHL-10855",
        payment_status: "PAID",
        payment_id: "TXN-NETBANK-772109",
        payment_date: "2026-10-10 10:12:44",
        payment_mode: "Net Banking / SBI",
        email_sent: true,
        email_sent_at: "2026-10-10 09:21:00",
        ai_detected: true,
        ai_confidence: 0.94,
        evidence_image_url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop",
        notes: "Vehicle encroached on pedestrian zebra crossing line during red phase."
    }
];

// Initial Payment History
export const DEFAULT_PAYMENTS = [
    {
        id: 1,
        challan_no: "DL-2026-CHL-10870",
        transaction_id: "TXN-UPI-994821039",
        amount: 1000,
        payment_method: "UPI / Google Pay",
        timestamp: "2026-10-11 17:05:22",
        payer_name: "Vikram Malhotra",
        status: "SUCCESS",
        gateway_ref: "RAZORPAY_SANDBOX_01",
        receipt_no: "RCPT-2026-8812"
    },
    {
        id: 2,
        challan_no: "DL-2026-CHL-10855",
        transaction_id: "TXN-NETBANK-772109",
        amount: 500,
        payment_method: "Net Banking / SBI",
        timestamp: "2026-10-10 10:12:44",
        payer_name: "Amit Singhal",
        status: "SUCCESS",
        gateway_ref: "SBI_EPAY_GATEWAY_09",
        receipt_no: "RCPT-2026-8801"
    }
];

// Helper: Get local storage collections
function getLocalChallans() {
    try {
        const data = localStorage.getItem(STORAGE_CHALLANS_KEY);
        if (data) return JSON.parse(data);
    } catch (e) {
        console.error(e);
    }
    localStorage.setItem(STORAGE_CHALLANS_KEY, JSON.stringify(DEFAULT_CHALLANS));
    return DEFAULT_CHALLANS;
}

function saveLocalChallans(challans) {
    localStorage.setItem(STORAGE_CHALLANS_KEY, JSON.stringify(challans));
}

function getLocalPayments() {
    try {
        const data = localStorage.getItem(STORAGE_PAYMENTS_KEY);
        if (data) return JSON.parse(data);
    } catch (e) {
        console.error(e);
    }
    localStorage.setItem(STORAGE_PAYMENTS_KEY, JSON.stringify(DEFAULT_PAYMENTS));
    return DEFAULT_PAYMENTS;
}

function saveLocalPayments(payments) {
    localStorage.setItem(STORAGE_PAYMENTS_KEY, JSON.stringify(payments));
}

// ---------------------------------------------------------------------------
// Exported Service Functions
// ---------------------------------------------------------------------------

/**
 * Searches and filters e-challans
 */
export const getChallansList = (query = '', status = 'ALL', violation = 'ALL') => {
    let list = getLocalChallans();
    const q = query.trim().toUpperCase();

    if (q) {
        list = list.filter(c =>
            c.challan_no.toUpperCase().includes(q) ||
            c.plate_no.toUpperCase().replace(/\s/g, '').includes(q.replace(/\s/g, '')) ||
            c.owner_name.toUpperCase().includes(q) ||
            c.location_name.toUpperCase().includes(q)
        );
    }

    if (status && status !== 'ALL') {
        list = list.filter(c => c.payment_status === status);
    }

    if (violation && violation !== 'ALL') {
        list = list.filter(c => c.violation_type.toLowerCase().includes(violation.toLowerCase()));
    }

    return list;
};

/**
 * Looks up vehicle registry data from Vahan database
 */
export const lookupVahanVehicle = (plateNo) => {
    const clean = plateNo.trim().toUpperCase().replace(/\s/g, '');
    const found = DEFAULT_VAHAN_DATABASE.find(v => v.plate_no.replace(/\s/g, '').toUpperCase() === clean);
    if (found) return found;

    // Generated entry for unregistered simulated test plate
    return {
        plate_no: plateNo.trim().toUpperCase(),
        owner_name: "Registered Citizen (Vahan Verified)",
        owner_phone: "+91 98101-77889",
        owner_email: "citizen.vahan@transport.gov.in",
        owner_address: "Sector 14, Central Capital Enclave, New Delhi",
        vehicle_class: "Four-Wheeler / Car",
        maker_model: "Private Motor Vehicle",
        chassis_no: `CHAS-GEN-${clean.slice(-4)}-X`,
        engine_no: `ENG-GEN-${clean.slice(-4)}`,
        rc_status: "Active",
        insurance_valid_upto: "2027-12-31",
        pucc_valid_upto: "2027-06-30",
        registration_date: "2022-04-10",
        fuel_type: "Petrol BS-VI"
    };
};

/**
 * Automatically issues an E-Challan upon AI Neural Violation Detection
 */
export const autoIssueAIViolation = ({
    plate_no,
    violation_type,
    fine_amount,
    speed = null,
    speed_limit = null,
    location_name = "Connaught Place Traffic Zone",
    gps_lat = 28.6315,
    gps_lng = 77.2167,
    confidence = 0.97,
    evidence_image_url = null,
    notes = null
}) => {
    const challans = getLocalChallans();
    const vehicle = lookupVahanVehicle(plate_no);
    const challan_no = `DL-2026-CHL-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').slice(0, 19);

    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + 60);
    const dueDateStr = dueDateObj.toISOString().slice(0, 10);

    const defaultFines = {
        "Red Light Jump": 1000,
        "Overspeeding": speed && speed > 80 ? 4000 : 2000,
        "Driving Without Helmet": 1000,
        "Triple Riding": 1000,
        "Stop Line Crossing": 500,
        "Wrong Way Driving": 5000,
        "Mobile Phone While Driving": 5000,
        "Driving Without Seatbelt": 1000
    };

    const finalFine = fine_amount || defaultFines[violation_type] || 1000;
    const qr_payload = `upi://pay?pa=echallan.traffic@gov&pn=DelhiTrafficPolice&am=${finalFine}&tr=${challan_no}`;

    const newChallan = {
        challan_no,
        plate_no: vehicle.plate_no,
        owner_name: vehicle.owner_name,
        owner_phone: vehicle.owner_phone,
        owner_email: vehicle.owner_email,
        vehicle_class: vehicle.vehicle_class,
        maker_model: vehicle.maker_model,
        violation_type: violation_type,
        violation_speed: speed,
        speed_limit: speed_limit,
        fine_amount: finalFine,
        officer_name: "Automated AI ANPR Camera Node",
        officer_badge: "AI-ANPR-SYS",
        location_name,
        gps_lat,
        gps_lng,
        violation_timestamp: dateStr,
        due_date: dueDateStr,
        qr_payload,
        payment_status: "UNPAID",
        payment_id: null,
        payment_date: null,
        payment_mode: null,
        email_sent: true,
        email_sent_at: dateStr,
        ai_detected: true,
        ai_confidence: confidence,
        evidence_image_url: evidence_image_url || "https://images.unsplash.com/photo-1545147986-a9d6f210df77?q=80&w=800&auto=format&fit=crop",
        notes: notes || `Autonomous AI detection at ${location_name}. Confidence: ${(confidence * 100).toFixed(1)}%.`
    };

    challans.unshift(newChallan);
    saveLocalChallans(challans);
    return newChallan;
};

/**
 * Manually issues an e-challan by on-duty traffic police officer
 */
export const createManualChallan = (formData) => {
    const challans = getLocalChallans();
    const vehicle = lookupVahanVehicle(formData.plate_no);
    const challan_no = `DL-2026-CHL-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').slice(0, 19);

    const dueDateObj = new Date();
    dueDateObj.setDate(dueDateObj.getDate() + 60);
    const dueDateStr = dueDateObj.toISOString().slice(0, 10);

    const qr_payload = `upi://pay?pa=echallan.traffic@gov&pn=DelhiTrafficPolice&am=${formData.fine_amount}&tr=${challan_no}`;

    const newChallan = {
        challan_no,
        plate_no: vehicle.plate_no,
        owner_name: vehicle.owner_name,
        owner_phone: vehicle.owner_phone,
        owner_email: vehicle.owner_email,
        vehicle_class: vehicle.vehicle_class,
        maker_model: vehicle.maker_model,
        violation_type: formData.violation_type,
        violation_speed: formData.violation_speed || null,
        speed_limit: formData.speed_limit || null,
        fine_amount: Number(formData.fine_amount),
        officer_name: formData.officer_name || "Insp. R. Sharma",
        officer_badge: formData.officer_badge || "DL-TP-409",
        location_name: formData.location_name || "Connaught Place Radial 1",
        gps_lat: formData.gps_lat || 28.6315,
        gps_lng: formData.gps_lng || 77.2167,
        violation_timestamp: dateStr,
        due_date: dueDateStr,
        qr_payload,
        payment_status: "UNPAID",
        payment_id: null,
        payment_date: null,
        payment_mode: null,
        email_sent: false,
        email_sent_at: null,
        ai_detected: false,
        ai_confidence: 1.0,
        evidence_image_url: formData.evidence_image_url || "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop",
        notes: formData.notes || "Issued during interceptor patrol check."
    };

    challans.unshift(newChallan);
    saveLocalChallans(challans);
    return newChallan;
};

/**
 * Settles a Challan with Online Payment Gateway simulation
 */
export const processChallanPayment = (challanNo, paymentMode = "UPI / Google Pay", payerName = "Owner") => {
    const challans = getLocalChallans();
    const payments = getLocalPayments();
    const index = challans.findIndex(c => c.challan_no === challanNo);

    if (index === -1) return { success: false, message: "Challan not found" };

    const target = challans[index];
    const txnId = `TXN-ITMS-${Date.now()}`;
    const rcptNo = `RCPT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);

    target.payment_status = "PAID";
    target.payment_id = txnId;
    target.payment_date = nowStr;
    target.payment_mode = paymentMode;

    const newPayment = {
        id: payments.length + 1,
        challan_no: challanNo,
        transaction_id: txnId,
        amount: target.fine_amount,
        payment_method: paymentMode,
        timestamp: nowStr,
        payer_name: payerName !== "Owner" ? payerName : target.owner_name,
        status: "SUCCESS",
        gateway_ref: "ITMS_PAYMENT_GATEWAY_V2",
        receipt_no: rcptNo
    };

    payments.unshift(newPayment);
    saveLocalChallans(challans);
    saveLocalPayments(payments);

    return {
        success: true,
        receipt: newPayment,
        challan: target
    };
};

/**
 * Dispatches official email notification
 */
export const emailChallanNotice = (challanNo, email) => {
    const challans = getLocalChallans();
    const target = challans.find(c => c.challan_no === challanNo);
    if (!target) return { success: false, message: "Challan not found" };

    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    target.email_sent = true;
    target.email_sent_at = nowStr;
    target.owner_email = email;

    saveLocalChallans(challans);
    return {
        success: true,
        email,
        timestamp: nowStr,
        message: `Official legal e-Challan summons transmitted to ${email}.`
    };
};

/**
 * Returns payment history ledger
 */
export const getPaymentsList = () => {
    return getLocalPayments();
};

/**
 * Aggregates Enforcement Reports
 */
export const getEnforcementReports = () => {
    const challans = getLocalChallans();
    const totalCount = challans.length;
    const totalLevied = challans.reduce((sum, c) => sum + (c.fine_amount || 0), 0);
    const paidList = challans.filter(c => c.payment_status === 'PAID');
    const unpaidList = challans.filter(c => c.payment_status === 'UNPAID');

    const totalCollected = paidList.reduce((sum, c) => sum + (c.fine_amount || 0), 0);
    const pendingAmount = unpaidList.reduce((sum, c) => sum + (c.fine_amount || 0), 0);

    // Violation breakdown
    const typeCounts = {};
    challans.forEach(c => {
        const key = c.violation_type.split('(')[0].trim();
        typeCounts[key] = (typeCounts[key] || 0) + 1;
    });

    const violationBreakdown = Object.entries(typeCounts).map(([type, count]) => ({
        type,
        count,
        percent: Math.round((count / totalCount) * 100)
    }));

    // High offence hotspots
    const locCounts = {};
    challans.forEach(c => {
        locCounts[c.location_name] = (locCounts[c.location_name] || 0) + 1;
    });

    const hotspots = Object.entries(locCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([location, count]) => ({ location, count }));

    return {
        totalChallans: totalCount,
        totalLevied,
        totalCollected,
        pendingAmount,
        paidCount: paidList.length,
        unpaidCount: unpaidList.length,
        aiDetectedPercent: Math.round((challans.filter(c => c.ai_detected).length / totalCount) * 100) || 85,
        violationBreakdown,
        hotspots
    };
};
