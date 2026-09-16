--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: Amenity; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Amenity" (id, name, slug, icon, active) FROM stdin;
cmttrjwax000mv0t8ot48vv34	Gym	gym	\N	t
cmttrjwb2000wv0t8tsydhk32	Visitor Parking	visitor-parking	\N	t
cmttrjwax000rv0t8e0u3la2r	Power Backup	power-backup	\N	t
cmttrjwax000lv0t8zp7ctq3f	Parking	parking	\N	t
cmttrjwb2000uv0t8hvlku4xa	Servant Room	servant-room	\N	t
cmttrjwax000nv0t8qzx7hi35	Clubhouse	clubhouse	\N	t
cmttrjwax000pv0t8l7rappnq	Security	security	\N	t
cmttrjwb2000vv0t83ybuemlr	Air Conditioning	air-conditioning	\N	t
cmttrjwax000ov0t8lqsyrsnw	Swimming Pool	swimming-pool	\N	t
cmttrjwax000qv0t8xdpaiczg	Lift	lift	\N	t
cmttrjwax000sv0t89iquibkq	Park	park	\N	t
cmttrjwax000tv0t8unie37ec	Modular Kitchen	modular-kitchen	\N	t
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, email, "passwordHash", name, phone, "profilePhotoUrl", "socialLinks", role, active, "createdAt", "updatedAt") FROM stdin;
cmttrjvwh0000v0t8zoahv654	superadmin@tricitynest.com	$2b$10$pGX92FAocdltDOlRbCd.LuvfLyViObwCn7E5atAHFxdMqyZM6kpcS	Aarav Mehta	\N	\N	\N	SUPER_ADMIN	t	2026-09-09 07:14:54.401	2026-09-09 07:14:54.401
cmttrjvy70001v0t82svqpya7	admin@tricitynest.com	$2b$10$o/a8MxwPuN9rdmljn47Ngu7GT0QKgPoVy2W1vlRuglpu64LYrxbAO	Priya Sharma	\N	\N	\N	ADMIN	t	2026-09-09 07:14:54.464	2026-09-09 07:14:54.464
cmttrjw350002v0t8xnnn2g86	admin2@tricitynest.com	$2b$10$TOXfD2S74TEuaFg83bSiMu4AIsXGaLXS.qdo92NwMca4I/kTPCJzW	Rohit Gill	\N	\N	\N	ADMIN	t	2026-09-09 07:14:54.642	2026-09-09 07:14:54.642
cmttrjw350003v0t8a3t2egja	admin3@tricitynest.com	$2b$10$YuE./NEClzV4EF19lP6Mxuk9DKbfhLo/RcTtqOvpD/vLAixgItCcO	Simran Kaur	\N	\N	\N	ADMIN	t	2026-09-09 07:14:54.642	2026-09-09 07:14:54.642
cmttrjw350004v0t8z5ze3qfb	user@tricitynest.com	$2b$10$KVoXX3QOxkK1YhwX4.NBOeJcsPwv65EJgTpP7KyOY.zdMLhpsM1nS	Guest Buyer	\N	\N	\N	USER	t	2026-09-09 07:14:54.642	2026-09-09 07:14:54.642
cmu2l7dnn0001v058jmmgxhqi	sahiba1@yopmail.com	$2b$10$MTya9pUsT0tNONBXa2H92.74C2tDbWrCGoI/pzlO0eIh3Hv3VgCqa	test	8018149393	\N	\N	USER	t	2026-09-15 11:27:08.771	2026-09-15 11:27:20.881
cmu2l8lz20006v0584prmuhej	testparassdffd@gmail.com	$2b$10$tU/pfCUXvdxIy9TlcrlaCu7786iuCoqioLcBNZJ6aVDmeE7K.0Vo2	testparas sdffd	+919115864584	https://lh3.googleusercontent.com/a/ACg8ocLO1jXbv21e_mof5ucBgJq5NspZrc29D7oIcsHYXdHVbhIOnA=s96-c	\N	USER	t	2026-09-15 11:28:06.207	2026-09-15 11:31:28.146
cmu2lo60f0000v030292j8ed4	superadmin@tricityinvestment.com	$2b$10$5jOgaNbM3sn6VVykeABWwu4doZXqvmv7ylBZ.kI88flxPZL/oDlaS	Aarav Mehta	\N	\N	\N	SUPER_ADMIN	t	2026-09-15 11:40:12.015	2026-09-15 11:40:12.015
cmu2lo63r0001v030ihrul3ci	admin@tricityinvestment.com	$2b$10$tp2ZL.024LkJrq5iS5Xw4OyFUPgWdA5WnKDG5Nui4r0SHbLGF0AIW	Priya Sharma	\N	\N	\N	ADMIN	t	2026-09-15 11:40:12.135	2026-09-15 11:40:12.135
\.


--
-- Data for Name: AuditLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."AuditLog" (id, "actorId", action, "entityType", "entityId", metadata, ip, "createdAt") FROM stdin;
cmttrjwl4003wv0t8lm7ikpgf	cmttrjvwh0000v0t8zoahv654	SEED	System	\N	{"properties":15,"lead":"cmttrjwkt003pv0t8b8rq2uat"}	\N	2026-09-09 07:14:55.288
cmu2l7do00003v058zu9k5rt9	cmu2l7dnn0001v058jmmgxhqi	USER_SIGNED_UP	User	cmu2l7dnn0001v058jmmgxhqi	{"email":"sahiba1@yopmail.com"}	127.0.0.1	2026-09-15 11:27:08.785
cmu2l7n050005v058n24bif89	cmu2l7dnn0001v058jmmgxhqi	USER_PROFILE_UPDATED	User	cmu2l7dnn0001v058jmmgxhqi	{"changedFields":["name","phone","profilePhotoUrl","socialLinks"]}	\N	2026-09-15 11:27:20.886
cmu2l8lz70008v058h7zaxeao	cmu2l8lz20006v0584prmuhej	GOOGLE_USER_CREATED	User	cmu2l8lz20006v0584prmuhej	{"email":"testparassdffd@gmail.com"}	\N	2026-09-15 11:28:06.211
cmu2l900f000av058mw9im7sx	cmu2l8lz20006v0584prmuhej	USER_PROFILE_UPDATED	User	cmu2l8lz20006v0584prmuhej	{"changedFields":["name","phone","profilePhotoUrl","socialLinks"]}	\N	2026-09-15 11:28:24.4
cmu2lcxsk000cv0586hbisb0m	cmu2l8lz20006v0584prmuhej	USER_PROFILE_UPDATED	User	cmu2l8lz20006v0584prmuhej	{"changedFields":["name","phone","profilePhotoUrl","socialLinks"]}	\N	2026-09-15 11:31:28.149
cmu2lfda1000ev058eu5c85o3	cmu2l8lz20006v0584prmuhej	LOGOUT	User	cmu2l8lz20006v0584prmuhej	\N	\N	2026-09-15 11:33:21.529
cmu2lobu5000jv058rcdidorl	cmu2lo60f0000v030292j8ed4	LOGIN	User	cmu2lo60f0000v030292j8ed4	\N	127.0.0.1	2026-09-15 11:40:19.566
cmu2lqmvr000mv058xy33wwpq	cmu2lo60f0000v030292j8ed4	LOGIN	User	cmu2lo60f0000v030292j8ed4	\N	127.0.0.1	2026-09-15 11:42:07.192
cmu2ly50m000qv058ebp2sr25	cmu2lo60f0000v030292j8ed4	PROPERTY_UPDATED	Property	cmttrjwit0026v0t82k7n3odg	{"propertyTitle":"2 BHK Independent House in Zirakpur,faizan","changedFields":["title","shortDescription","description","category","propertyTypeId","transactionType","status","featured","price","priceMax","negotiable","bedrooms","bathrooms","balconies","area","areaUnit","carpetArea","locality","locationId","city","postalCode","latitude","longitude","furnishing","possession","possessionDate","reraNumber","floor","totalFloors","facing","parking","tagline","builderId"],"imagesAdded":0,"imagesRemoved":0,"amenitiesUpdated":true,"featuresUpdated":true}	\N	2026-09-15 11:47:57.287
cmu2lz8c4000uv0582p1g4odn	cmu2lo60f0000v030292j8ed4	PROPERTY_UPDATED	Property	cmttrjwit0026v0t82k7n3odg	{"propertyTitle":"2 BHK Independent House in Zirakpur","changedFields":["title","shortDescription","description","category","propertyTypeId","transactionType","status","featured","price","priceMax","negotiable","bedrooms","bathrooms","balconies","area","areaUnit","carpetArea","locality","locationId","city","postalCode","latitude","longitude","furnishing","possession","possessionDate","reraNumber","floor","totalFloors","facing","parking","tagline","builderId"],"imagesAdded":0,"imagesRemoved":0,"amenitiesUpdated":true,"featuresUpdated":true}	\N	2026-09-15 11:48:48.245
cmu2njzwy000xv0589p56bfs7	cmu2lo60f0000v030292j8ed4	PROPERTY_CREATED	Property	ecc43251-354d-4fca-b83f-a47cc8fd5022	{"slug":"testparas-sdffd","propertyTitle":"testparas sdffd","imageCount":1}	\N	2026-09-15 12:32:56.723
cmu3o1b3o0002v0loxagpuuh7	cmu2lo60f0000v030292j8ed4	LOGIN	User	cmu2lo60f0000v030292j8ed4	\N	127.0.0.1	2026-09-16 05:34:10.549
cmu3o2hfa0005v0los0594q6t	cmu2lo60f0000v030292j8ed4	PROPERTY_UPDATED	Property	ecc43251-354d-4fca-b83f-a47cc8fd5022	{"propertyTitle":"testparas sdffd","changedFields":["title","shortDescription","description","category","propertyTypeId","transactionType","status","featured","price","priceMax","negotiable","bedrooms","bathrooms","balconies","area","areaUnit","carpetArea","locality","locationId","city","postalCode","latitude","longitude","furnishing","possession","possessionDate","reraNumber","floor","totalFloors","facing","parking","tagline","builderId"],"imagesAdded":1,"imagesRemoved":1,"amenitiesUpdated":true,"featuresUpdated":true}	\N	2026-09-16 05:35:05.399
cmu3o390a0007v0lor5pi2zt2	cmu2lo60f0000v030292j8ed4	PROPERTY_UPDATED	Property	ecc43251-354d-4fca-b83f-a47cc8fd5022	{"propertyTitle":"testparas sdffd","changedFields":["title","shortDescription","description","category","propertyTypeId","transactionType","status","featured","price","priceMax","negotiable","bedrooms","bathrooms","balconies","area","areaUnit","carpetArea","locality","locationId","city","postalCode","latitude","longitude","furnishing","possession","possessionDate","reraNumber","floor","totalFloors","facing","parking","tagline","builderId"],"imagesAdded":0,"imagesRemoved":0,"amenitiesUpdated":true,"featuresUpdated":true}	\N	2026-09-16 05:35:41.147
cmu3o4gag0009v0lodmnngr91	cmu2lo60f0000v030292j8ed4	PROPERTY_PUBLISHED	Property	ecc43251-354d-4fca-b83f-a47cc8fd5022	{"propertyTitle":"testparas sdffd","changedFields":["title","shortDescription","description","category","propertyTypeId","transactionType","status","featured","price","priceMax","negotiable","bedrooms","bathrooms","balconies","area","areaUnit","carpetArea","locality","locationId","city","postalCode","latitude","longitude","furnishing","possession","possessionDate","reraNumber","floor","totalFloors","facing","parking","tagline","builderId"],"imagesAdded":0,"imagesRemoved":0,"amenitiesUpdated":true,"featuresUpdated":true}	\N	2026-09-16 05:36:37.241
cmu3p4ig60002v008xq5xhkhj	cmu2lo60f0000v030292j8ed4	PROPERTY_UPDATED	Property	ecc43251-354d-4fca-b83f-a47cc8fd5022	{"propertyTitle":"testparas sdffd","changedFields":["title","shortDescription","description","category","propertyTypeId","transactionType","status","featured","price","priceMax","negotiable","bedrooms","bathrooms","balconies","area","areaUnit","carpetArea","locality","locationId","city","postalCode","latitude","longitude","furnishing","possession","possessionDate","reraNumber","floor","totalFloors","facing","parking","tagline","builderId"],"imagesAdded":1,"imagesRemoved":1,"amenitiesUpdated":true,"featuresUpdated":true}	\N	2026-09-16 06:04:39.654
\.


--
-- Data for Name: Builder; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Builder" (id, name, slug, "logoUrl", description) FROM stdin;
cmttrjwgj000xv0t893fwdkle	Aurelia Homes	aurelia-homes	\N	Residential communities across the Mohali corridor.
cmttrjwgj000zv0t8so0ozvpt	Cedar & Co.	cedar-co	\N	Boutique villas and independent floors.
cmttrjwgj000yv0t8b0ghdwgi	Northgate Developers	northgate-developers	\N	Plotted and mixed-use projects in Zirakpur and Banur.
\.


--
-- Data for Name: ContactMessage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ContactMessage" (id, name, email, phone, topic, message, status, "createdAt") FROM stdin;
\.


--
-- Data for Name: Location; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Location" (id, name, slug, city, state, "imageUrl", "sortOrder", active, "createdAt") FROM stdin;
cmttrjw3a0005v0t8li2qn6ia	Mohali	mohali	Mohali	Punjab	https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80	1	t	2026-09-09 07:14:54.646
cmttrjw3c0008v0t8hl99g2za	Derabassi	derabassi	Derabassi	Punjab	https://images.unsplash.com/photo-1600047509807-ba8d526a4c35?auto=format&fit=crop&w=1200&q=80	6	t	2026-09-09 07:14:54.647
cmttrjw3b0006v0t8djw6jg4n	Chandigarh	chandigarh	Chandigarh	Chandigarh	https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=1200&q=80	2	t	2026-09-09 07:14:54.646
cmttrjw3c0007v0t8kh7risfz	Banur	banur	Banur	Punjab	https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80	7	t	2026-09-09 07:14:54.647
cmttrjw3c0009v0t8zlfq1xo6	Kharar	kharar	Kharar	Punjab	https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80	4	t	2026-09-09 07:14:54.647
cmttrjw3c000av0t83qz8228k	New Chandigarh	new-chandigarh	New Chandigarh	Punjab	https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80	5	t	2026-09-09 07:14:54.647
cmttrjw3c000bv0t81zomyz4y	Zirakpur	zirakpur	Zirakpur	Punjab	https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80	3	t	2026-09-09 07:14:54.647
\.


--
-- Data for Name: PropertyType; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PropertyType" (id, name, slug, category, active, "sortOrder") FROM stdin;
cmttrjw6m000fv0t8mteidy0i	Villa	villa	RESIDENTIAL	t	3
cmttrjw6m000hv0t86kxuvyah	Shop	shop	COMMERCIAL	t	6
cmttrjw6m000ev0t8sv90k0nv	Builder Floor	builder-floor	RESIDENTIAL	t	2
cmttrjw6o000kv0t84hnue32p	Commercial Plot	commercial-plot	COMMERCIAL	t	9
cmttrjw6m000dv0t8epvuphf7	Apartment	apartment	RESIDENTIAL	t	1
cmttrjw6o000jv0t889nwgai0	Office	office	COMMERCIAL	t	8
cmttrjw6m000gv0t8vqde8zje	SCO	sco	COMMERCIAL	t	5
cmttrjw6m000cv0t8kh38z21o	Plot	plot	RESIDENTIAL	t	4
cmttrjw6m000iv0t8c3fxh2j7	Showroom	showroom	COMMERCIAL	t	7
\.


--
-- Data for Name: Property; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Property" (id, slug, title, "shortDescription", description, category, "propertyTypeId", "transactionType", status, featured, price, "priceMax", negotiable, bedrooms, bathrooms, balconies, area, "areaUnit", "carpetArea", address, locality, "locationId", city, state, "postalCode", latitude, longitude, furnishing, facing, possession, "possessionDate", "reraNumber", floor, "totalFloors", parking, "builderId", tagline, views, "createdById", "updatedById", "publishedAt", "deletedAt", "createdAt", "updatedAt") FROM stdin;
cmttrjwhd0011v0t8dbsd83eq	2-bhk-apartment-sector-115-mohali	2 BHK Apartment in Sector 115	Sunlit 2 BHK with a park-facing living room in a gated Mohali community.	A carefully planned 2 BHK with cross ventilation, modular kitchen and two covered parking slots. Minutes from the airport road and IT City.	RESIDENTIAL	cmttrjw6m000dv0t8epvuphf7	BUY	PUBLISHED	t	3800000	4300000	t	2	2	2	1120	sqft	\N	Sector 115, Mohali	Sector 115	cmttrjw3a0005v0t8li2qn6ia	Mohali	Punjab	\N	\N	\N	SEMI_FURNISHED	\N	UNDER_CONSTRUCTION	\N	PBRERA-SAS79-PR1101	\N	\N	f	cmttrjwgj000xv0t893fwdkle	Park facing · IT City	412	cmttrjvy70001v0t82svqpya7	\N	2026-09-09 07:14:55.151	\N	2026-09-09 07:14:55.153	2026-09-09 07:14:55.153
cmttrjwhp0018v0t8zz2kworv	3-bhk-builder-floor-sector-70-mohali	3 BHK Builder Floor in Sector 70	Independent floor with private terrace and 1750 sqft of usable space.	A north-facing builder floor with three bedrooms, a study nook and a private terrace. Walking distance to Sector 70 market.	RESIDENTIAL	cmttrjw6m000ev0t8sv90k0nv	BUY	PUBLISHED	t	7800000	8500000	t	3	3	2	1750	sqft	\N	Sector 70, Mohali	Sector 70	cmttrjw3a0005v0t8li2qn6ia	Mohali	Punjab	\N	\N	\N	UNFURNISHED	\N	NEW_LAUNCH	\N	PBRERA-SAS79-PR1106	\N	\N	f	cmttrjwgj000zv0t8so0ozvpt	Private terrace	288	cmttrjvy70001v0t82svqpya7	\N	2026-09-09 07:14:55.164	\N	2026-09-09 07:14:55.165	2026-09-09 07:14:55.165
cmttrjwhw001fv0t87ef2wbkz	4-bhk-villa-sector-82-mohali	4 BHK Villa in Sector 82	Corner villa with lawn, double-height living and a pool club nearby.	A 4 BHK independent house on a 12-marla plot. Double-height living, four-car parking and a landscaped lawn.	RESIDENTIAL	cmttrjw6m000fv0t8mteidy0i	BUY	PUBLISHED	t	18500000	21000000	t	4	5	3	3200	sqft	\N	Sector 82, Mohali	Sector 82	cmttrjw3a0005v0t8li2qn6ia	Mohali	Punjab	\N	\N	\N	SEMI_FURNISHED	\N	READY	\N	PBRERA-SAS79-PR1104	\N	\N	f	cmttrjwgj000zv0t8so0ozvpt	Ready to move	641	cmttrjvy70001v0t82svqpya7	\N	2026-09-09 07:14:55.172	\N	2026-09-09 07:14:55.173	2026-09-09 10:10:11.363
cmttrjwi5001mv0t8kphpum3k	3-bhk-apartment-sunny-enclave-kharar	3 BHK Apartment in Sunny Enclave	Family 3 BHK on Kharar–Landran road with clubhouse access.	High-floor 3 BHK with two balconies, covered parking and a dedicated kids' play area. Easy commute to Mohali IT parks.	RESIDENTIAL	cmttrjw6m000dv0t8epvuphf7	BUY	PUBLISHED	t	5450000	\N	t	3	3	2	1480	sqft	\N	Sunny Enclave, Kharar	Sunny Enclave	cmttrjw3c0009v0t8zlfq1xo6	Kharar	Punjab	\N	\N	\N	SEMI_FURNISHED	\N	READY	\N	PBRERA-SAS79-PR1110	\N	\N	f	cmttrjwgj000xv0t893fwdkle	\N	191	cmttrjvy70001v0t82svqpya7	\N	2026-09-09 07:14:55.18	\N	2026-09-09 07:14:55.181	2026-09-09 10:09:21.096
cmttrjwid001tv0t82qb82xy3	2-bhk-resale-sector-63-chandigarh	2 BHK Resale Flat in Sector 63	Quiet Chandigarh society flat with park view and covered parking.	A well-kept 2 BHK in a low-rise Chandigarh society. Ideal for professionals working in Sector 17 and IT Park.	RESIDENTIAL	cmttrjw6m000dv0t8epvuphf7	BUY	PUBLISHED	f	7200000	\N	t	2	2	1	1050	sqft	\N	Sector 63, Chandigarh	Sector 63	cmttrjw3b0006v0t8djw6jg4n	Chandigarh	Chandigarh	\N	\N	\N	FURNISHED	\N	READY	\N	\N	\N	\N	f	\N	\N	235	cmttrjvy70001v0t82svqpya7	\N	2026-09-09 07:14:55.189	\N	2026-09-09 07:14:55.19	2026-09-10 12:34:03.477
cmttrjwil0020v0t81ey06nn0	residential-plot-sector-109-mohali	Residential Plot in Sector 109	200 sqyd plotted pocket with 40 ft road and clear title.	A rectangular 200 sqyd plot in a developing Mohali sector. Ideal for a custom home with east-facing frontage.	RESIDENTIAL	cmttrjw6m000cv0t8kh38z21o	BUY	PUBLISHED	t	6200000	\N	t	\N	\N	\N	1800	sqft	\N	Sector 109, Mohali	Sector 109	cmttrjw3a0005v0t8li2qn6ia	Mohali	Punjab	\N	\N	\N	UNFURNISHED	\N	READY	\N	PBRERA-SAS79-PR1120	\N	\N	f	cmttrjwgj000yv0t8b0ghdwgi	40 ft road	41	cmttrjvy70001v0t82svqpya7	\N	2026-09-09 07:14:55.196	\N	2026-09-09 07:14:55.197	2026-09-09 10:10:51.267
cmttrjwit0026v0t82k7n3odg	2-bhk-independent-house-zirakpur	2 BHK Independent House in Zirakpur	Compact independent house near VIP Road with private courtyard.	A freshly painted 2 BHK kothi with courtyard parking, suitable for a small family or as a rental investment.	RESIDENTIAL	cmttrjw6m000fv0t8mteidy0i	BUY	PUBLISHED	f	4950000	\N	t	2	2	1	980	sqft	\N	VIP Road, Zirakpur	VIP Road	cmttrjw3c000bv0t81zomyz4y	Zirakpur	Punjab	\N	\N	\N	UNFURNISHED	\N	READY	\N	\N	\N	\N	f	\N	\N	42	cmttrjvy70001v0t82svqpya7	cmu2lo60f0000v030292j8ed4	2026-09-09 07:14:55.204	\N	2026-09-09 07:14:55.205	2026-09-15 11:48:48.241
cmttrjwj8002jv0t8k1oilm7u	4-bhk-villa-new-chandigarh	4 BHK Villa in New Chandigarh	Hill-facing villa community with club and walking trails.	A 4 BHK villa with private lawn, servant room and club membership. Quiet New Chandigarh address with easy airport access.	RESIDENTIAL	cmttrjw6m000fv0t8mteidy0i	BUY	PUBLISHED	t	24500000	\N	t	4	4	3	3600	sqft	\N	Mullanpur, New Chandigarh	Mullanpur	cmttrjw3c000av0t83qz8228k	New Chandigarh	Punjab	\N	\N	\N	UNFURNISHED	\N	UNDER_CONSTRUCTION	\N	PBRERA-SAS79-PR1133	\N	\N	f	cmttrjwgj000zv0t8so0ozvpt	\N	42	cmttrjvy70001v0t82svqpya7	\N	2026-09-09 07:14:55.219	\N	2026-09-09 07:14:55.22	2026-09-15 06:24:05.436
cmttrjwjg002qv0t81bzfbkn3	2-bhk-rent-sector-70-mohali	2 BHK for Rent in Sector 70	Furnished rental near Phase 7 with immediate possession.	Fully furnished 2 BHK available for professionals. Includes appliances, covered parking and 24x7 security.	RESIDENTIAL	cmttrjw6m000dv0t8epvuphf7	RENT	PUBLISHED	f	28000	\N	t	2	2	1	1100	sqft	\N	Sector 70, Mohali	Sector 70	cmttrjw3a0005v0t8li2qn6ia	Mohali	Punjab	\N	\N	\N	FURNISHED	\N	READY	\N	\N	\N	\N	f	\N	\N	42	cmttrjvy70001v0t82svqpya7	\N	2026-09-09 07:14:55.228	\N	2026-09-09 07:14:55.229	2026-09-15 07:51:27.832
cmttrjwjo002wv0t85jwbofoi	sco-plot-airport-road-zirakpur	SCO Plot on Airport Road	Corner SCO with 80 ft frontage on the airport arterial.	A high-visibility SCO plot suited for a showroom or restaurant. Clear title and approved building norms.	COMMERCIAL	cmttrjw6m000gv0t8vqde8zje	BUY	PUBLISHED	t	18500000	\N	t	\N	\N	\N	1500	sqft	\N	Airport Road, Zirakpur	Airport Road	cmttrjw3c000bv0t81zomyz4y	Zirakpur	Punjab	\N	\N	\N	UNFURNISHED	\N	READY	\N	PBRERA-SAS79-PR1140	\N	\N	f	cmttrjwgj000yv0t8b0ghdwgi	80 ft frontage	40	cmttrjvy70001v0t82svqpya7	\N	2026-09-09 07:14:55.235	\N	2026-09-09 07:14:55.236	2026-09-09 07:14:55.236
cmttrjwjw0032v0t8yisrnihw	commercial-showroom-vip-road-zirakpur	Commercial Showroom on VIP Road	Ground-floor showroom with mezzanine and dedicated parking bay.	A 2200 sqft showroom on VIP Road with high footfall. Suitable for automobile, apparel or electronics.	COMMERCIAL	cmttrjw6m000iv0t8c3fxh2j7	BUY	PUBLISHED	f	12800000	\N	t	\N	\N	\N	2200	sqft	\N	VIP Road, Zirakpur	VIP Road	cmttrjw3c000bv0t81zomyz4y	Zirakpur	Punjab	\N	\N	\N	UNFURNISHED	\N	READY	\N	\N	\N	\N	f	\N	\N	40	cmttrjvy70001v0t82svqpya7	\N	2026-09-09 07:14:55.243	\N	2026-09-09 07:14:55.244	2026-09-09 07:14:55.244
cmttrjwk30038v0t8nj40rm7z	office-space-it-city-mohali	Office Space in IT City Mohali	Fitted office floor with meeting rooms and 8 car parks.	A plug-and-play office of 1800 sqft in IT City. Raised flooring, two meeting rooms and 24x7 access.	COMMERCIAL	cmttrjw6o000jv0t889nwgai0	RENT	PUBLISHED	f	85000	\N	t	\N	\N	\N	1800	sqft	\N	IT City, Mohali	IT City	cmttrjw3a0005v0t8li2qn6ia	Mohali	Punjab	\N	\N	\N	FURNISHED	\N	READY	\N	\N	\N	\N	f	\N	\N	41	cmttrjvy70001v0t82svqpya7	\N	2026-09-09 07:14:55.25	\N	2026-09-09 07:14:55.251	2026-09-09 10:28:32.369
cmttrjwkd003ev0t8afnmyenn	shop-derabassi-gt-road	Retail Shop on GT Road Derabassi	Street-facing shop on GT Road with steady highway traffic.	A 450 sqft shop with shutter frontage, storage loft and shared parking. Suitable for grocery or services.	COMMERCIAL	cmttrjw6m000hv0t86kxuvyah	BUY	PUBLISHED	f	3200000	\N	t	\N	\N	\N	450	sqft	\N	GT Road, Derabassi	GT Road	cmttrjw3c0008v0t8hl99g2za	Derabassi	Punjab	\N	\N	\N	UNFURNISHED	\N	READY	\N	\N	\N	\N	f	\N	\N	49	cmttrjvy70001v0t82svqpya7	\N	2026-09-09 07:14:55.26	\N	2026-09-09 07:14:55.261	2026-09-09 09:52:14.967
cmttrjwkl003kv0t8q6paoirq	commercial-plot-banur-road	Commercial Plot on Banur Road	Half-acre commercial pocket between Banur and Rajpura.	An investment plot on Banur Road with highway visibility. Suitable for warehouse, school or mixed-use later.	COMMERCIAL	cmttrjw6o000kv0t84hnue32p	INVEST	PUBLISHED	t	9800000	\N	t	\N	\N	\N	21780	sqft	\N	Banur Road, Banur	Banur Road	cmttrjw3c0007v0t8kh7risfz	Banur	Punjab	\N	\N	\N	UNFURNISHED	\N	READY	\N	\N	\N	\N	f	cmttrjwgj000yv0t8b0ghdwgi	Highway facing	41	cmttrjvy70001v0t82svqpya7	\N	2026-09-09 07:14:55.268	\N	2026-09-09 07:14:55.269	2026-09-09 07:57:25.84
cmttrjwiz002cv0t8tsgv0sz7	3-bhk-resale-sector-125-mohali	3 BHK Resale in Sector 125	Corner 3 BHK with extra ventilation and two car parks.	Resale apartment in a completed project. Vastu-compliant layout, modular kitchen and a balcony overlooking the internal greens.	RESIDENTIAL	cmttrjw6m000dv0t8epvuphf7	BUY	PUBLISHED	f	8900000	\N	t	3	3	2	1650	sqft	\N	Sector 125, Mohali	Sector 125	cmttrjw3a0005v0t8li2qn6ia	Mohali	Punjab	\N	\N	\N	SEMI_FURNISHED	\N	READY	\N	\N	\N	\N	f	cmttrjwgj000xv0t893fwdkle	\N	42	cmttrjvy70001v0t82svqpya7	\N	2026-09-09 07:14:55.211	\N	2026-09-09 07:14:55.212	2026-09-16 06:05:59.13
ecc43251-354d-4fca-b83f-a47cc8fd5022	testparas-sdffd	testparas sdffd	Street-facing shop on GT Road with steady highway traffic.	Street-facing shop on GT Road with steady highway traffic.Street-facing shop on GT Road with steady highway traffic.Street-facing shop on GT Road with steady highway traffic.Street-facing shop on GT Road with steady highway traffic.	RESIDENTIAL	cmttrjw6m000dv0t8epvuphf7	BUY	PUBLISHED	t	4980000	5889999	t	4	4	4	9800	sqft	2500	Sahibzada Ajit Singh Nagar, Mohali	Sahibzada Ajit Singh Nagar	cmttrjw3a0005v0t8li2qn6ia	Mohali	Punjab	160055	\N	\N	UNFURNISHED	north	READY	\N	\N	5	8	t	\N	\N	1	cmu2lo60f0000v030292j8ed4	cmu2lo60f0000v030292j8ed4	2026-09-16 05:36:37.236	\N	2026-09-15 12:32:56.716	2026-09-16 06:06:11.788
\.


--
-- Data for Name: Enquiry; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Enquiry" (id, "propertyId", name, phone, email, message, status, "createdAt") FROM stdin;
cmttrjwkx003rv0t8364i3oiy	\N	Vikram Singh	9815012345	vikram@example.com	Please share floor plans for Sector 82 villa.	NEW	2026-09-09 07:14:55.281
\.


--
-- Data for Name: Favourite; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Favourite" (id, "userId", "propertyId", "createdAt") FROM stdin;
\.


--
-- Data for Name: FloorPlan; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FloorPlan" (id, "propertyId", title, "imageUrl", area) FROM stdin;
\.


--
-- Data for Name: Lead; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Lead" (id, name, phone, email, whatsapp, consent, status, source, "createdAt", "updatedAt") FROM stdin;
cmttrjwkt003pv0t8b8rq2uat	Neha Kapoor	9876501234	neha@example.com	\N	t	NEW	matcher	2026-09-09 07:14:55.278	2026-09-09 07:14:55.278
cmttt22ql0001v0bwirwo6c33	Codex Test Lead	9876543210	codex-price-unlock@example.com	9876543210	t	NEW	PRICE_UNLOCK	2026-09-09 07:57:02.685	2026-09-09 07:57:02.685
cmttwyxwp0004v0bw3x3347t4	testparas sdffd	8018149393	testparassdffd@gmail.com	8018149393	t	NEW	MATCHER	2026-09-09 09:46:34.922	2026-09-15 07:51:19.041
\.


--
-- Data for Name: LeadNote; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."LeadNote" (id, "leadId", "authorId", body, "createdAt") FROM stdin;
\.


--
-- Data for Name: Newsletter; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Newsletter" (id, email, "createdAt") FROM stdin;
\.


--
-- Data for Name: PropertyAmenity; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PropertyAmenity" ("propertyId", "amenityId") FROM stdin;
cmttrjwhd0011v0t8dbsd83eq	cmttrjwax000lv0t8zp7ctq3f
cmttrjwhd0011v0t8dbsd83eq	cmttrjwax000mv0t8ot48vv34
cmttrjwhd0011v0t8dbsd83eq	cmttrjwax000pv0t8l7rappnq
cmttrjwhd0011v0t8dbsd83eq	cmttrjwax000rv0t8e0u3la2r
cmttrjwhd0011v0t8dbsd83eq	cmttrjwax000qv0t8xdpaiczg
cmttrjwhd0011v0t8dbsd83eq	cmttrjwax000sv0t89iquibkq
cmttrjwhp0018v0t8zz2kworv	cmttrjwax000lv0t8zp7ctq3f
cmttrjwhp0018v0t8zz2kworv	cmttrjwax000pv0t8l7rappnq
cmttrjwhp0018v0t8zz2kworv	cmttrjwax000rv0t8e0u3la2r
cmttrjwhp0018v0t8zz2kworv	cmttrjwax000tv0t8unie37ec
cmttrjwhw001fv0t87ef2wbkz	cmttrjwax000lv0t8zp7ctq3f
cmttrjwhw001fv0t87ef2wbkz	cmttrjwax000ov0t8lqsyrsnw
cmttrjwhw001fv0t87ef2wbkz	cmttrjwax000nv0t8qzx7hi35
cmttrjwhw001fv0t87ef2wbkz	cmttrjwax000pv0t8l7rappnq
cmttrjwhw001fv0t87ef2wbkz	cmttrjwax000sv0t89iquibkq
cmttrjwi5001mv0t8kphpum3k	cmttrjwax000lv0t8zp7ctq3f
cmttrjwi5001mv0t8kphpum3k	cmttrjwax000mv0t8ot48vv34
cmttrjwi5001mv0t8kphpum3k	cmttrjwax000nv0t8qzx7hi35
cmttrjwi5001mv0t8kphpum3k	cmttrjwax000pv0t8l7rappnq
cmttrjwi5001mv0t8kphpum3k	cmttrjwax000qv0t8xdpaiczg
cmttrjwi5001mv0t8kphpum3k	cmttrjwax000sv0t89iquibkq
cmttrjwid001tv0t82qb82xy3	cmttrjwax000lv0t8zp7ctq3f
cmttrjwid001tv0t82qb82xy3	cmttrjwax000pv0t8l7rappnq
cmttrjwid001tv0t82qb82xy3	cmttrjwax000qv0t8xdpaiczg
cmttrjwid001tv0t82qb82xy3	cmttrjwax000sv0t89iquibkq
cmttrjwil0020v0t81ey06nn0	cmttrjwax000pv0t8l7rappnq
cmttrjwil0020v0t81ey06nn0	cmttrjwax000sv0t89iquibkq
cmttrjwiz002cv0t8tsgv0sz7	cmttrjwax000lv0t8zp7ctq3f
cmttrjwiz002cv0t8tsgv0sz7	cmttrjwax000mv0t8ot48vv34
cmttrjwiz002cv0t8tsgv0sz7	cmttrjwax000ov0t8lqsyrsnw
cmttrjwiz002cv0t8tsgv0sz7	cmttrjwax000nv0t8qzx7hi35
cmttrjwiz002cv0t8tsgv0sz7	cmttrjwax000qv0t8xdpaiczg
cmttrjwj8002jv0t8k1oilm7u	cmttrjwax000lv0t8zp7ctq3f
cmttrjwj8002jv0t8k1oilm7u	cmttrjwax000ov0t8lqsyrsnw
cmttrjwj8002jv0t8k1oilm7u	cmttrjwax000nv0t8qzx7hi35
cmttrjwj8002jv0t8k1oilm7u	cmttrjwax000pv0t8l7rappnq
cmttrjwj8002jv0t8k1oilm7u	cmttrjwax000sv0t89iquibkq
cmttrjwj8002jv0t8k1oilm7u	cmttrjwb2000uv0t8hvlku4xa
cmttrjwjg002qv0t81bzfbkn3	cmttrjwax000lv0t8zp7ctq3f
cmttrjwjg002qv0t81bzfbkn3	cmttrjwax000pv0t8l7rappnq
cmttrjwjg002qv0t81bzfbkn3	cmttrjwax000qv0t8xdpaiczg
cmttrjwjg002qv0t81bzfbkn3	cmttrjwb2000vv0t83ybuemlr
cmttrjwjo002wv0t85jwbofoi	cmttrjwax000lv0t8zp7ctq3f
cmttrjwjo002wv0t85jwbofoi	cmttrjwax000pv0t8l7rappnq
cmttrjwjw0032v0t8yisrnihw	cmttrjwax000lv0t8zp7ctq3f
cmttrjwjw0032v0t8yisrnihw	cmttrjwax000pv0t8l7rappnq
cmttrjwjw0032v0t8yisrnihw	cmttrjwax000rv0t8e0u3la2r
cmttrjwk30038v0t8nj40rm7z	cmttrjwax000lv0t8zp7ctq3f
cmttrjwk30038v0t8nj40rm7z	cmttrjwax000pv0t8l7rappnq
cmttrjwk30038v0t8nj40rm7z	cmttrjwax000rv0t8e0u3la2r
cmttrjwk30038v0t8nj40rm7z	cmttrjwax000qv0t8xdpaiczg
cmttrjwk30038v0t8nj40rm7z	cmttrjwb2000vv0t83ybuemlr
cmttrjwkd003ev0t8afnmyenn	cmttrjwax000lv0t8zp7ctq3f
cmttrjwkl003kv0t8q6paoirq	cmttrjwax000lv0t8zp7ctq3f
cmttrjwit0026v0t82k7n3odg	cmttrjwax000lv0t8zp7ctq3f
cmttrjwit0026v0t82k7n3odg	cmttrjwax000pv0t8l7rappnq
ecc43251-354d-4fca-b83f-a47cc8fd5022	cmttrjwax000nv0t8qzx7hi35
ecc43251-354d-4fca-b83f-a47cc8fd5022	cmttrjwax000qv0t8xdpaiczg
ecc43251-354d-4fca-b83f-a47cc8fd5022	cmttrjwax000tv0t8unie37ec
ecc43251-354d-4fca-b83f-a47cc8fd5022	cmttrjwax000sv0t89iquibkq
ecc43251-354d-4fca-b83f-a47cc8fd5022	cmttrjwax000lv0t8zp7ctq3f
ecc43251-354d-4fca-b83f-a47cc8fd5022	cmttrjwax000rv0t8e0u3la2r
ecc43251-354d-4fca-b83f-a47cc8fd5022	cmttrjwax000pv0t8l7rappnq
ecc43251-354d-4fca-b83f-a47cc8fd5022	cmttrjwax000ov0t8lqsyrsnw
\.


--
-- Data for Name: PropertyDeletionRequest; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PropertyDeletionRequest" (id, "propertyId", "requestedById", reason, notes, status, "requestedAt", "reviewedById", "reviewedAt", "reviewNotes") FROM stdin;
\.


--
-- Data for Name: PropertyFeature; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PropertyFeature" (id, "propertyId", label) FROM stdin;
cmttrjwhd0015v0t8m0p34td4	cmttrjwhd0011v0t8dbsd83eq	Clear title
cmttrjwhd0016v0t8md97axdy	cmttrjwhd0011v0t8dbsd83eq	Site visit on request
cmttrjwhp001cv0t8uhhx4n8u	cmttrjwhp0018v0t8zz2kworv	Clear title
cmttrjwhp001dv0t8r4c44z6r	cmttrjwhp0018v0t8zz2kworv	Site visit on request
cmttrjwhx001jv0t83yxzctwt	cmttrjwhw001fv0t87ef2wbkz	Clear title
cmttrjwhx001kv0t84s0zuqpg	cmttrjwhw001fv0t87ef2wbkz	Site visit on request
cmttrjwi5001qv0t8f7063drc	cmttrjwi5001mv0t8kphpum3k	Clear title
cmttrjwi5001rv0t8umng6nhl	cmttrjwi5001mv0t8kphpum3k	Site visit on request
cmttrjwid001xv0t8jyki1wxa	cmttrjwid001tv0t82qb82xy3	Clear title
cmttrjwid001yv0t8dghit73w	cmttrjwid001tv0t82qb82xy3	Site visit on request
cmttrjwil0023v0t8565ltg50	cmttrjwil0020v0t81ey06nn0	Clear title
cmttrjwil0024v0t8q4ferfqd	cmttrjwil0020v0t81ey06nn0	Site visit on request
cmttrjwj0002gv0t8cfi9ntxs	cmttrjwiz002cv0t8tsgv0sz7	Clear title
cmttrjwj0002hv0t8fktk3ruj	cmttrjwiz002cv0t8tsgv0sz7	Site visit on request
cmttrjwj8002nv0t8c54loz37	cmttrjwj8002jv0t8k1oilm7u	Clear title
cmttrjwj8002ov0t8yw1w0kaz	cmttrjwj8002jv0t8k1oilm7u	Site visit on request
cmttrjwjg002tv0t89ol2h5em	cmttrjwjg002qv0t81bzfbkn3	Clear title
cmttrjwjg002uv0t864hx6k5r	cmttrjwjg002qv0t81bzfbkn3	Site visit on request
cmttrjwjo002zv0t83l348os2	cmttrjwjo002wv0t85jwbofoi	Clear title
cmttrjwjo0030v0t8xnbyweej	cmttrjwjo002wv0t85jwbofoi	Site visit on request
cmttrjwjw0035v0t8ydoq7tpb	cmttrjwjw0032v0t8yisrnihw	Clear title
cmttrjwjw0036v0t8cxu4jj7u	cmttrjwjw0032v0t8yisrnihw	Site visit on request
cmttrjwk3003bv0t8at15o6hi	cmttrjwk30038v0t8nj40rm7z	Clear title
cmttrjwk3003cv0t85ayrwh4c	cmttrjwk30038v0t8nj40rm7z	Site visit on request
cmttrjwkd003hv0t8d5g61t03	cmttrjwkd003ev0t8afnmyenn	Clear title
cmttrjwkd003iv0t8kjlf6sgp	cmttrjwkd003ev0t8afnmyenn	Site visit on request
cmttrjwkl003nv0t83ac02ulg	cmttrjwkl003kv0t8q6paoirq	Clear title
cmttrjwkl003ov0t88ribttmc	cmttrjwkl003kv0t8q6paoirq	Site visit on request
cmu2lz8c0000rv058lpkr58xz	cmttrjwit0026v0t82k7n3odg	Clear title
cmu2lz8c0000sv05817at0rp9	cmttrjwit0026v0t82k7n3odg	Site visit on request
\.


--
-- Data for Name: PropertyImage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PropertyImage" (id, "propertyId", url, "publicId", alt, "sortOrder", "isCover") FROM stdin;
cmttrjwhd0012v0t8sczk921v	cmttrjwhd0011v0t8dbsd83eq	https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80	\N	2 BHK Apartment in Sector 115	0	t
cmttrjwhd0013v0t8baduhxwu	cmttrjwhd0011v0t8dbsd83eq	https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80	\N	2 BHK Apartment in Sector 115	1	f
cmttrjwhd0014v0t8jug8fwj8	cmttrjwhd0011v0t8dbsd83eq	https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1600&q=80	\N	2 BHK Apartment in Sector 115	2	f
cmttrjwhp0019v0t8ojd9z5qm	cmttrjwhp0018v0t8zz2kworv	https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80	\N	3 BHK Builder Floor in Sector 70	0	t
cmttrjwhp001av0t891lr26j4	cmttrjwhp0018v0t8zz2kworv	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80	\N	3 BHK Builder Floor in Sector 70	1	f
cmttrjwhp001bv0t84i41la4a	cmttrjwhp0018v0t8zz2kworv	https://images.unsplash.com/photo-1600047509807-ba8d526a4c35?auto=format&fit=crop&w=1600&q=80	\N	3 BHK Builder Floor in Sector 70	2	f
cmttrjwhx001gv0t8nbrzxopb	cmttrjwhw001fv0t87ef2wbkz	https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80	\N	4 BHK Villa in Sector 82	0	t
cmttrjwhx001hv0t8zwcjgu3j	cmttrjwhw001fv0t87ef2wbkz	https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80	\N	4 BHK Villa in Sector 82	1	f
cmttrjwhx001iv0t8rkkbscsv	cmttrjwhw001fv0t87ef2wbkz	https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80	\N	4 BHK Villa in Sector 82	2	f
cmttrjwi5001nv0t8b4sixp3o	cmttrjwi5001mv0t8kphpum3k	https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80	\N	3 BHK Apartment in Sunny Enclave	0	t
cmttrjwi5001ov0t8nyk46w7r	cmttrjwi5001mv0t8kphpum3k	https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1600&q=80	\N	3 BHK Apartment in Sunny Enclave	1	f
cmttrjwi5001pv0t8i3nv4b3z	cmttrjwi5001mv0t8kphpum3k	https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80	\N	3 BHK Apartment in Sunny Enclave	2	f
cmttrjwid001uv0t8z391axzw	cmttrjwid001tv0t82qb82xy3	https://images.unsplash.com/photo-1600047509807-ba8d526a4c35?auto=format&fit=crop&w=1600&q=80	\N	2 BHK Resale Flat in Sector 63	0	t
cmttrjwid001vv0t84my5jvj2	cmttrjwid001tv0t82qb82xy3	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80	\N	2 BHK Resale Flat in Sector 63	1	f
cmttrjwid001wv0t867gnla3v	cmttrjwid001tv0t82qb82xy3	https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80	\N	2 BHK Resale Flat in Sector 63	2	f
cmttrjwil0021v0t846e8qpag	cmttrjwil0020v0t81ey06nn0	https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80	\N	Residential Plot in Sector 109	0	t
cmttrjwil0022v0t8qsaftzk2	cmttrjwil0020v0t81ey06nn0	https://images.unsplash.com/photo-1628624747186-a941c476b7ef?auto=format&fit=crop&w=1600&q=80	\N	Residential Plot in Sector 109	1	f
cmttrjwit0027v0t8o4rh76q3	cmttrjwit0026v0t82k7n3odg	https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1600&q=80	\N	2 BHK Independent House in Zirakpur	0	t
cmttrjwit0028v0t8tswwvqgp	cmttrjwit0026v0t82k7n3odg	https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1600&q=80	\N	2 BHK Independent House in Zirakpur	1	f
cmttrjwj0002dv0t81ujog2xn	cmttrjwiz002cv0t8tsgv0sz7	https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80	\N	3 BHK Resale in Sector 125	0	t
cmttrjwj0002ev0t8c64z2sea	cmttrjwiz002cv0t8tsgv0sz7	https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80	\N	3 BHK Resale in Sector 125	1	f
cmttrjwj0002fv0t8yolec23v	cmttrjwiz002cv0t8tsgv0sz7	https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=80	\N	3 BHK Resale in Sector 125	2	f
cmttrjwj8002kv0t8me09qy01	cmttrjwj8002jv0t8k1oilm7u	https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80	\N	4 BHK Villa in New Chandigarh	0	t
cmttrjwj8002lv0t8fkm2xsxu	cmttrjwj8002jv0t8k1oilm7u	https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=80	\N	4 BHK Villa in New Chandigarh	1	f
cmttrjwj8002mv0t877hz5n0o	cmttrjwj8002jv0t8k1oilm7u	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80	\N	4 BHK Villa in New Chandigarh	2	f
cmttrjwjg002rv0t8hd7azqrm	cmttrjwjg002qv0t81bzfbkn3	https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=80	\N	2 BHK for Rent in Sector 70	0	t
cmttrjwjg002sv0t8t796lydk	cmttrjwjg002qv0t81bzfbkn3	https://images.unsplash.com/photo-1600047509807-ba8d526a4c35?auto=format&fit=crop&w=1600&q=80	\N	2 BHK for Rent in Sector 70	1	f
cmttrjwjo002xv0t8fk82lx00	cmttrjwjo002wv0t85jwbofoi	https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80	\N	SCO Plot on Airport Road	0	t
cmttrjwjo002yv0t89mhwaysy	cmttrjwjo002wv0t85jwbofoi	https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80	\N	SCO Plot on Airport Road	1	f
cmttrjwjw0033v0t8kvnb46qc	cmttrjwjw0032v0t8yisrnihw	https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80	\N	Commercial Showroom on VIP Road	0	t
cmttrjwjw0034v0t8c1nkhrlj	cmttrjwjw0032v0t8yisrnihw	https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80	\N	Commercial Showroom on VIP Road	1	f
cmttrjwk30039v0t8v4kf6hte	cmttrjwk30038v0t8nj40rm7z	https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=80	\N	Office Space in IT City Mohali	0	t
cmttrjwk3003av0t8e6zvumb9	cmttrjwk30038v0t8nj40rm7z	https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80	\N	Office Space in IT City Mohali	1	f
cmttrjwkd003fv0t8n5lkueb1	cmttrjwkd003ev0t8afnmyenn	https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80	\N	Retail Shop on GT Road Derabassi	0	t
cmttrjwkd003gv0t8kumzb304	cmttrjwkd003ev0t8afnmyenn	https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80	\N	Retail Shop on GT Road Derabassi	1	f
cmttrjwkl003lv0t8u0ysi7lh	cmttrjwkl003kv0t8q6paoirq	https://images.unsplash.com/photo-1628624747186-a941c476b7ef?auto=format&fit=crop&w=1600&q=80	\N	Commercial Plot on Banur Road	0	t
cmttrjwkl003mv0t8o9dpmbx7	cmttrjwkl003kv0t8q6paoirq	https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80	\N	Commercial Plot on Banur Road	1	f
cmu3p4i7e0000v0084xuz2fgg	ecc43251-354d-4fca-b83f-a47cc8fd5022	https://tricity-investment-storage.s3.amazonaws.com/properties/ecc43251-354d-4fca-b83f-a47cc8fd5022/7a7fb200-e19c-4393-af73-a0b96d4eb087.webp	properties/ecc43251-354d-4fca-b83f-a47cc8fd5022/7a7fb200-e19c-4393-af73-a0b96d4eb087.webp	testparas sdffd	0	t
\.


--
-- Data for Name: PropertyMatch; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PropertyMatch" (id, "leadId", "propertyId", score, "createdAt") FROM stdin;
\.


--
-- Data for Name: PropertyPreference; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."PropertyPreference" (id, "leadId", categories, "propertyTypes", "transactionType", "locationSlugs", "minBudget", "maxBudget", bedrooms, "minArea", "maxArea", timeline, "createdAt") FROM stdin;
cmttrjwkt003qv0t8klno319z	cmttrjwkt003pv0t8b8rq2uat	RESIDENTIAL	apartment,builder-floor	BUY	mohali,kharar	3500000	8000000	2,3	\N	\N	1-3 months	2026-09-09 07:14:55.278
cmttwyxwp0005v0bwtcuvt899	cmttwyxwp0004v0bw3x3347t4	RESIDENTIAL	apartment	BUY	chandigarh	1000000	100000000	3	\N	\N	Within 1 month	2026-09-09 09:46:34.922
\.


--
-- Data for Name: RateLimitHit; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RateLimitHit" (id, key, "createdAt") FROM stdin;
cmu3o1b1b0000v0lo9x3h8dsu	login:127.0.0.1	2026-09-16 05:34:10.463
\.


--
-- Data for Name: SellLead; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."SellLead" (id, name, phone, email, city, "propertyType", "expectedPrice", message, "createdAt") FROM stdin;
\.


--
-- Data for Name: Setting; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Setting" (id, key, value) FROM stdin;
cmttrjwl0003sv0t8pedngabn	phone	+91 172 500 4400
cmttrjwl0003tv0t8rn2lopdp	whatsapp	91725004400
cmttrjwl0003uv0t8vba7c6mw	email	hello@tricitynest.com
\.


--
-- PostgreSQL database dump complete
--

