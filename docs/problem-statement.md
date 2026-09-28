# 1. Problem Statement
## Agriculture Resource and Farm Management System (AgriPulse)
**DBMS Level 3 Experiential Learning Project**

---

### Context & Domain Background
Agriculture remains the backbone of the global economy, yet modern farming faces acute management fragmentation. Small-to-medium farm operators and agricultural enterprises routinely struggle with:
1. **Disconnected Record-Keeping:** Information concerning seed inventories, fertilizer dosages, irrigation cycles, and labor expenditures is scattered across manual paper logs, informal messaging groups, and memory.
2. **Financial Opacity:** Farmers often cannot determine real-time cost-of-production per crop or per acre. Without atomic financial logging linked directly to farm activities and harvests, accurate profit-and-loss calculation is impossible.
3. **Resource Wastage:** Over-application of synthetic fertilizers (Urea, DAP) and inefficient water allocation (flood vs. drip) degrade soil health and inflate overheads due to lack of inventory threshold monitoring.
4. **Data Heterogeneity Dilemma in Agricultural Information Systems:**
   - On one hand, core farm operations (ownership, land parcels, inventory batches, financial ledger lines, and harvests) require **strict relational ACID compliance, foreign key integrity, check constraints, and transactional consistency**.
   - On the other hand, agronomic observations (disease symptoms, foliar morphology, pest trap counts, weather anomalies) and advisory repositories vary drastically from one crop to another (e.g., Tomato leaf chlorosis vs. Rice flood submergence depth). Forcing flexible biological observations into static SQL tables leads to empty columns, rigid schemas, or slow joins.

---

### Problem Formulation
There is a critical need for a **Dual-Database Architecture Agricultural Management System** that bridges:
- **PostgreSQL** for strict relational modeling, transactional integrity (e.g., atomic fertilizer usage and inventory deduction), audit triggers, materialized views, and complex analytical reporting.
- **MongoDB** for flexible, polymorphic agronomic observations, unstructured crop notes, dynamic symptom taxonomy, and multi-criteria advisory retrieval.

AgriPulse solves this problem by delivering a unified, role-based platform that empowers farmers, agricultural officers, and administrators with data-driven agricultural intelligence.
