# 2. Project Objectives
## Agriculture Resource and Farm Management System (AgriPulse)

---

### Primary Objectives
1. **Centralized Farm & Field Topology Management:**
   - Model multi-tier ownership structures (Farmers -> Farms -> Fields) with explicit geo-attributes, soil classification, and irrigation categorization.

2. **End-to-End Crop Lifecycle Tracking:**
   - Supervise crop cycles from nursery preparation, sowing, vegetative development, and pest management through final harvest and market consignment.

3. **Atomic Resource & Inventory Control (ACID Transactions):**
   - Provide real-time stock monitoring with automated database triggers that deduct available inventory upon fertilizer and chemical application, ensuring stock consistency.

4. **Transparent Financial Ledger & Profitability Analytics:**
   - Link all operational expenditures (seeds, labor, fuel, machinery rental, chemicals) directly to specific farm units and crop cycles. Compute automatic gross revenue and net profit upon harvest registration.

5. **Integrated Agronomic Knowledge Base & Dynamic Observation Engine (NoSQL):**
   - Store polymorphic farmer observations with crop-specific dynamic attributes (e.g. leaf chlorosis, water depth, pest counts) and provide symptom-based advisory retrieval via MongoDB document modeling.

6. **Demonstration of Advanced DBMS Level 3 Competencies:**
   - Implement real database constraints (PK, FK, UNIQUE, NOT NULL, CHECK), composite indexes, database triggers, analytical views, atomic multi-statement transactions, and MongoDB aggregation pipelines.
