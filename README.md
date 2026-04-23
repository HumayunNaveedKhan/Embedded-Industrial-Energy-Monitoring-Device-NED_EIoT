# NED-EIoT — Industrial Energy & Equipment Health Monitor

> Patented industrial IoT system for real-time energy monitoring 
> and equipment health diagnostics — commercially deployed at 
> J&P Coats (MNC), Karachi, Pakistan.

---

## Overview

NED-EIoT is an indigenously designed and developed Industrial 
IoT device that provides real-time visibility into energy 
consumption and equipment health across factory production lines.

Developed at the Haptics, Human-Robotics & Condition Monitoring Lab (HHRCM), 
NCRA-NEDUET under the mentorship of Prof. Dr. Riaz Uddin (Professor, Director NCRA & Director ORIC, NEDUET).

**Status:** Live and operational at J&P Coats (MNC), Karachi  
**Patent:** Filed — IPO Pakistan Application No. **967/2025**  

---

## Problem It Solves

Industrial facilities largely lack real-time visibility into equipment-level energy consumption. Maintenance teams rely on 
manual meter readings and reactive fault response — leading to 
energy waste, unplanned downtime, and zero audit trail.

NED-EIoT replaces manual monitoring with automated, 
cloud-connected, real-time energy intelligence.

---

## System Architecture

<img width="1536" height="1024" alt="NED-EIOT" src="https://github.com/user-attachments/assets/e99e7453-3be3-4c6d-aae9-0d706bf2c510" />
---

## Key Features

- **Real-time energy monitoring** — voltage, current, power 
  factor, active/reactive power per equipment
- **Equipment health diagnostics** — anomaly detection with 
  automated threshold alerts
- **Cloud dashboard** — live Power BI + Google Sheets 
  integration with audit-ready logs
- **OTA firmware updates** — remote configuration without 
  physical access
- **Multi-device support** — scalable across production lines
- **Low-cost indigenous hardware** — designed and manufactured 
  in Pakistan

---

## Hardware Stack

| Component | Details |
|---|---|
| Microcontroller | ESP32 / ESP8266 |
| Current sensing | CT sensors (100A to 1000A / 50mA split-core) |
| Communication | RS-485, Modbus RTU/TCP, HTTPS |
| Connectivity | WiFi, MQTT over TLS |
| Power supply | 5V Type-C or Industrial 24V DC |

---

## Software & Communication Stack

| Layer | Technology |
|---|---|
| Firmware | Embedded C (FreeRTOS), C++ and AppScript |
| Protocol | Modbus RTU/TCP, MQTT, HTTPS |
| Cloud | Google Cloud Platform (GCP) |
| Dashboard | Power BI, Google Sheets API |
| Automation | IFTTT, Zapier, Node-RED |
| OTA | ESP OTA over WiFi |

---

## Source Code

| File | Description |
|---|---|
| [`src/NED-EIoT-main_v1.3.4.ino`](src/NED-EIoT-main_v1.3.4.ino) | ESP8266 firmware — CT sensing, EmonLib, HTTPS push, OTA, captive portal |
| [`src/NED-EIoT-AppScript_v1.4.2.gs`](src/NED-EIoT-AppScript_v1.4.2.gs) | Google Apps Script — data logging, dashboard, day/night analytics |

> ⚠️ Replace `defaultSSID`, `defaultPassword`, `GAS_ID`, and `sheetId` 
> with your own credentials before deployment.  
> PCB design files and calibration constants are protected under 
> IPO Pakistan Patent Application No. 967/2025.

## Deployment

**Client:** J&P Coats (MNC) — Karachi, Pakistan  
**Environment:** Active industrial production facility  
**Status:** Operational  
**Outcome:** Replaced manual energy audits with real-time 
equipment-level cloud visibility across multiple production lines


<img width="1280" height="862" alt="NED-EIoT-Hardware" src="https://github.com/user-attachments/assets/27598ab1-fa13-4170-a3a5-2decde0a8569" />

<img width="3120" height="4160" alt="EIOT-deployment" src="https://github.com/user-attachments/assets/d3617c96-ba9a-4980-8dc7-887dc3de5278" />

<img width="779" height="749" alt="EIOT-deployment-2" src="https://github.com/user-attachments/assets/9efa2d3d-5f91-4aae-bd5b-c1782554026b" />

<img width="1848" height="862" alt="NED-EIoT-GoogleSheets-Dashboard" src="https://github.com/user-attachments/assets/d41c6c28-a6d7-44aa-8f58-8a5b89a74292" />

<img width="660" height="823" alt="NED-EIoT-Device-with-CT-Sensor" src="https://github.com/user-attachments/assets/11c480af-a5d3-4750-9be0-38c01370ad85" />

<img width="1842" height="819" alt="NED-EIoT-Lab-Testing-Data" src="https://github.com/user-attachments/assets/0d1b47ee-0d82-4a93-b3ad-a19198084a8d" />

---
> 📌 Dashboard screenshots and real-time data shown in this 
> repository are from lab testing at HHRCM Lab, NCRA-NEDUET. 
> Production data from J&P Coats deployment is confidential 
> and not included in this repository.

## Patent & IP

**Patent filed with IPO Pakistan**  
Application No. 967/2025  
Status: Under Review  

<img width="1006" height="719" alt="Patent Receipt-EIoT-967-2025" src="https://github.com/user-attachments/assets/eb02beaf-3a0f-4799-a93e-412b169843e4" />


> Note: Firmware source code and PCB design files are 
> proprietary and protected under the filed patent. 
> They are not included in this repository.

---

## Related Products (Same Lab)

- [NED-SILL](https://github.com/HumayunNaveedKhan/Smart-Industrial-Liquid-Level) 
  — Smart Industrial Liquid Level Monitor (also deployed at 
  J&P Coats)

---

## Publications

H. Khan & R. Uddin, "Preliminary Results of the Optimized 
Network Interface for Long Distance Haptic Teleoperation," 
*Eng. Proc.*, MDPI, 2023.  
DOI: [10.3390/engproc2023032009](https://doi.org/10.3390/engproc2023032009)

---

## Author

**Humayun Khan**  
Team Lead, HHRCM Lab, NCRA-NEDUET  
Co-Founder, Haptronica (incubated in BIC NEDUET) & RobAutoStem (incubated in BIC NEDUET, NIC Karachi-Cohort 12)  

📧 humayunnaveedkhan@gmail.com  
🔗 [LinkedIn](https://linkedin.com/in/humayunnaveedkhan)  
🌐 [Portfolio](https://humayunnaveedkhan.github.io/portfolio)  

---

## License

© 2025 Humayun Khan, HHRCM Lab NCRA-NEDUET.  
Patent pending. All rights reserved.  
No part of this repository may be reproduced or used 
commercially without written permission.
