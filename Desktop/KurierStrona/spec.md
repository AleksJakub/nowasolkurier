NowaSolKurier – Full Stack Specification (MVP)
Project Overview

NowaSolKurier is a web platform that allows local businesses in Nowa Sól to generate parcel shipping labels using multiple courier providers.
Users log in, create shipments, view live courier options, select a courier, and download the label.
They then drop the parcel at the NowaSolKurier facility.
No payment is collected from the user — the system records the shipment and the chosen courier for later invoicing.

Tech Stack

Frontend: React + TypeScript + Axios + React Router

Backend: NestJS + TypeORM + PostgreSQL + Passport (JWT)

Database: PostgreSQL

Job Queue: BullMQ / Redis (future)

Deployment: Docker + Nginx

Backend (NestJS)
Modules

AuthModule

UsersModule

CouriersModule

ShipmentsModule

Entities

User (id, email, password_hash, created_at)

Courier (id, name, api_base_url, api_key)

Shipment (id, user_id, courier_id, recipient_name, recipient_address, parcel_weight, parcel_length, parcel_width, parcel_height, label_url, tracking_number, price, dropoff_status, created_at)

Endpoints
Method	Path	Description
POST	/auth/register	Register user (email, password)
POST	/auth/login	Login (email, password) → JWT
GET	/couriers	List available couriers
POST	/shipments/quotes	Return courier price quotes (body: recipient info + parcel dimensions)
POST	/shipments	Create shipment + generate label via selected courier (body includes courier_id)
GET	/shipments	Get user's shipment history
GET	/shipments/:id	Get specific shipment